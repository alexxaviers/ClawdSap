from __future__ import annotations

import hashlib
import hmac
import os
from typing import Any

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from extensions import db, migrate
from models import (
    BillingAccount,
    Invoice,
    Message,
    Task,
    User,
    UserSettings,
    VerifyRecord,
    Workflow,
)
from seed import seed_demo_data


def _normalize_database_url(raw_url: str) -> str:
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg2://", 1)
    return raw_url


def create_app() -> Flask:
    load_dotenv()
    app = Flask(__name__)

    database_url = (
        os.getenv("SUPABASE_DATABASE_URL")
        or os.getenv("DATABASE_URL")
        or "sqlite:///clodsapp.db"
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = _normalize_database_url(database_url)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        db.create_all()
        seed_demo_data()

    @app.route("/api/health")
    def health() -> Any:
        return jsonify({"status": "ok"})

    def get_current_user() -> User:
        header_user_id = request.headers.get("X-User-Id")
        if header_user_id and header_user_id.isdigit():
            user = User.query.get(int(header_user_id))
            if user:
                return user
        user = User.query.first()
        if not user:
            user = User(email="demo@clodsapp.com", display_name="Demo User")
            db.session.add(user)
            db.session.commit()
        return user

    def serialize_user(user: User) -> dict[str, Any]:
        return {
            "id": user.id,
            "email": user.email,
            "displayName": user.display_name,
            "timezone": user.timezone,
            "capabilities": user.capabilities or [],
            "authProvider": user.auth_provider,
        }

    def serialize_task(task: Task) -> dict[str, Any]:
        return {
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "priority": task.priority,
            "source": task.source,
            "scheduledFor": task.scheduled_for,
            "createdAt": task.created_at.isoformat() if task.created_at else None,
            "tags": task.tags or [],
        }

    def serialize_message(message: Message) -> dict[str, Any]:
        timestamp = "Just now"
        if message.created_at:
            timestamp = message.created_at.strftime("%b %d, %I:%M %p")
        return {
            "id": message.id,
            "text": message.text,
            "sender": message.sender,
            "timestamp": timestamp,
            "status": message.status,
            "taskCreated": message.task_created,
        }

    def serialize_workflow(workflow: Workflow) -> dict[str, Any]:
        return {
            "id": workflow.id,
            "name": workflow.name,
            "description": workflow.description,
            "schedule": workflow.schedule,
            "lastRun": workflow.last_run,
            "nextRun": workflow.next_run,
            "active": workflow.active,
            "totalRuns": workflow.total_runs,
            "successRate": workflow.success_rate,
            "steps": workflow.steps or [],
        }

    def serialize_settings(settings: UserSettings) -> dict[str, Any]:
        return {
            "whatsapp": {
                "connected": settings.whatsapp_connected,
                "phoneNumber": settings.phone_number,
                "autoExecute": settings.auto_execute,
                "confirmBefore": settings.confirm_before,
                "quietHoursEnabled": settings.quiet_hours_enabled,
                "quietStart": settings.quiet_start,
                "quietEnd": settings.quiet_end,
            },
            "notifications": settings.notifications or [],
            "security": {
                "apiKey": "clods_sk_demo_xxxxxxxxxxxxxxxxx",
                "sessions": [
                    {"device": "Chrome on macOS", "location": "New York, US", "lastActive": "Active now", "current": True},
                    {"device": "ClodsApp WhatsApp Bot", "location": "Cloud", "lastActive": "Active now", "current": False},
                    {"device": "Safari on iPhone", "location": "New York, US", "lastActive": "2 hours ago", "current": False},
                ],
            },
        }

    def _whatsapp_env_ready() -> bool:
        return all(
            os.getenv("WHATSAPP_ACCESS_TOKEN"),
            os.getenv("WHATSAPP_PHONE_NUMBER_ID"),
        )

    def send_whatsapp_message(to_number: str, body: str) -> None:
        access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
        phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        if not access_token or not phone_number_id:
            return
        url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "text",
            "text": {"body": body},
        }
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=10,
        )
        response.raise_for_status()

    def verify_whatsapp_signature(signature: str, raw_body: bytes, app_secret: str) -> bool:
        if not signature or not signature.startswith("sha256="):
            return False
        expected = hmac.new(app_secret.encode(), raw_body, hashlib.sha256).hexdigest()
        provided = signature.split("sha256=")[-1]
        return hmac.compare_digest(expected, provided)

    def serialize_billing(account: BillingAccount) -> dict[str, Any]:
        invoices = Invoice.query.filter_by(user_id=account.user_id).all()
        return {
            "plan": account.plan,
            "usage": account.usage or {},
            "invoices": [
                {
                    "id": inv.invoice_id,
                    "date": inv.date,
                    "amount": inv.amount,
                    "status": inv.status,
                }
                for inv in invoices
            ],
        }

    @app.post("/api/auth/login")
    def login() -> Any:
        payload = request.get_json(silent=True) or {}
        email = payload.get("email", "demo@clodsapp.com")
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(email=email, display_name=email.split("@")[0].title())
            db.session.add(user)
            db.session.commit()
        return jsonify({"token": "dev-token", "user": serialize_user(user)})

    @app.post("/api/auth/signup")
    def signup() -> Any:
        payload = request.get_json(silent=True) or {}
        email = payload.get("email", "demo@clodsapp.com")
        display_name = payload.get("displayName") or email.split("@")[0].title()
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(email=email, display_name=display_name)
            db.session.add(user)
            db.session.commit()
        return jsonify({"token": "dev-token", "user": serialize_user(user)})

    @app.get("/api/auth/alien/start")
    def alien_start() -> Any:
        return jsonify({
            "authorizeUrl": os.getenv("ALIEN_AUTH_AUTHORIZE_URL", "https://alien.org/oauth/authorize"),
            "clientId": os.getenv("ALIEN_AUTH_CLIENT_ID", "placeholder"),
            "redirectUri": os.getenv("ALIEN_AUTH_REDIRECT_URI", "http://localhost:5000/api/auth/alien/callback"),
        })

    @app.get("/api/auth/alien/callback")
    def alien_callback() -> Any:
        return jsonify({"token": "alien-dev-token", "status": "pending_deployment"})

    @app.post("/api/verify")
    def verify() -> Any:
        user = get_current_user()
        payload = request.get_json(silent=True) or {}
        record = VerifyRecord(
            user_id=user.id,
            intent=payload.get("intent", "personal"),
            statements_confirmed=payload.get("statementsConfirmed", []),
        )
        db.session.add(record)
        db.session.commit()
        return jsonify({"status": "verified"})

    @app.post("/api/onboarding/connect-whatsapp")
    def connect_whatsapp() -> Any:
        user = get_current_user()
        settings = UserSettings.query.filter_by(user_id=user.id).first()
        if not settings:
            settings = UserSettings(user_id=user.id)
            db.session.add(settings)
        settings.whatsapp_connected = True
        db.session.commit()
        return jsonify({"connected": True})

    @app.put("/api/onboarding/capabilities")
    def update_capabilities() -> Any:
        user = get_current_user()
        payload = request.get_json(silent=True) or {}
        user.capabilities = payload.get("capabilities", [])
        db.session.commit()
        return jsonify({"capabilities": user.capabilities})

    @app.post("/api/onboarding/first-message")
    def onboarding_message() -> Any:
        user = get_current_user()
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "")
        if text:
            msg = Message(user_id=user.id, text=text, sender="user")
            db.session.add(msg)
        db.session.commit()
        return jsonify({"status": "received"})

    @app.get("/api/dashboard")
    def dashboard() -> Any:
        user = get_current_user()
        tasks = Task.query.filter_by(user_id=user.id).order_by(Task.id.desc()).limit(5).all()
        workflows = Workflow.query.filter_by(user_id=user.id).order_by(Workflow.id.desc()).limit(3).all()
        messages = Message.query.filter_by(user_id=user.id).order_by(Message.id.desc()).limit(3).all()
        stats = {
            "tasksToday": len(tasks),
            "executionsThisWeek": 34,
            "activeWorkflows": Workflow.query.filter_by(user_id=user.id, active=True).count(),
            "messagesProcessed": Message.query.filter_by(user_id=user.id).count(),
        }
        return jsonify({
            "stats": stats,
            "tasks": [serialize_task(t) for t in tasks],
            "workflows": [serialize_workflow(w) for w in workflows],
            "messages": [serialize_message(m) for m in messages],
        })

    @app.get("/api/tasks")
    def list_tasks() -> Any:
        user = get_current_user()
        tasks = Task.query.filter_by(user_id=user.id).order_by(Task.id.desc()).all()
        return jsonify({"tasks": [serialize_task(t) for t in tasks]})

    @app.post("/api/tasks")
    def create_task() -> Any:
        user = get_current_user()
        payload = request.get_json(silent=True) or {}
        task = Task(
            user_id=user.id,
            title=payload.get("title", "Untitled task"),
            status=payload.get("status", "pending"),
            priority=payload.get("priority", "medium"),
            source=payload.get("source", "Manual"),
            scheduled_for=payload.get("scheduledFor", "Unscheduled"),
            tags=payload.get("tags", []),
        )
        db.session.add(task)
        db.session.commit()
        return jsonify({"task": serialize_task(task)}), 201

    @app.patch("/api/tasks/<int:task_id>")
    def update_task(task_id: int) -> Any:
        user = get_current_user()
        task = Task.query.filter_by(user_id=user.id, id=task_id).first_or_404()
        payload = request.get_json(silent=True) or {}
        for field, attr in {
            "title": "title",
            "status": "status",
            "priority": "priority",
            "source": "source",
            "scheduledFor": "scheduled_for",
            "tags": "tags",
        }.items():
            if field in payload:
                setattr(task, attr, payload[field])
        db.session.commit()
        return jsonify({"task": serialize_task(task)})

    @app.delete("/api/tasks/<int:task_id>")
    def delete_task(task_id: int) -> Any:
        user = get_current_user()
        task = Task.query.filter_by(user_id=user.id, id=task_id).first_or_404()
        db.session.delete(task)
        db.session.commit()
        return jsonify({"status": "deleted"})

    @app.get("/api/messages")
    def list_messages() -> Any:
        user = get_current_user()
        messages = Message.query.filter_by(user_id=user.id).order_by(Message.id.asc()).all()
        return jsonify({"messages": [serialize_message(m) for m in messages]})

    @app.post("/api/messages")
    def create_message() -> Any:
        user = get_current_user()
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "")
        if not text:
            return jsonify({"error": "Message text required"}), 400
        user_msg = Message(user_id=user.id, text=text, sender="user")
        bot_msg = Message(
            user_id=user.id,
            text=f"Understood. Processing: \"{text}\". I'll handle this and update you when it's done.",
            sender="clods",
            status="pending",
        )
        db.session.add_all([user_msg, bot_msg])
        db.session.commit()

        settings = UserSettings.query.filter_by(user_id=user.id).first()
        if settings and settings.phone_number:
            try:
                send_whatsapp_message(settings.phone_number, text)
            except Exception:
                pass
        return jsonify({
            "userMessage": serialize_message(user_msg),
            "botMessage": serialize_message(bot_msg),
        }), 201

    @app.get("/api/workflows")
    def list_workflows() -> Any:
        user = get_current_user()
        workflows = Workflow.query.filter_by(user_id=user.id).order_by(Workflow.id.desc()).all()
        return jsonify({"workflows": [serialize_workflow(w) for w in workflows]})

    @app.post("/api/workflows")
    def create_workflow() -> Any:
        user = get_current_user()
        payload = request.get_json(silent=True) or {}
        workflow = Workflow(
            user_id=user.id,
            name=payload.get("name", "New workflow"),
            description=payload.get("description"),
            schedule=payload.get("schedule", "Custom"),
            last_run=payload.get("lastRun"),
            next_run=payload.get("nextRun"),
            active=payload.get("active", True),
            total_runs=payload.get("totalRuns", 0),
            success_rate=payload.get("successRate", 100),
            steps=payload.get("steps", []),
        )
        db.session.add(workflow)
        db.session.commit()
        return jsonify({"workflow": serialize_workflow(workflow)}), 201

    @app.patch("/api/workflows/<int:workflow_id>")
    def update_workflow(workflow_id: int) -> Any:
        user = get_current_user()
        workflow = Workflow.query.filter_by(user_id=user.id, id=workflow_id).first_or_404()
        payload = request.get_json(silent=True) or {}
        for field, attr in {
            "name": "name",
            "description": "description",
            "schedule": "schedule",
            "lastRun": "last_run",
            "nextRun": "next_run",
            "active": "active",
            "totalRuns": "total_runs",
            "successRate": "success_rate",
            "steps": "steps",
        }.items():
            if field in payload:
                setattr(workflow, attr, payload[field])
        db.session.commit()
        return jsonify({"workflow": serialize_workflow(workflow)})

    @app.delete("/api/workflows/<int:workflow_id>")
    def delete_workflow(workflow_id: int) -> Any:
        user = get_current_user()
        workflow = Workflow.query.filter_by(user_id=user.id, id=workflow_id).first_or_404()
        db.session.delete(workflow)
        db.session.commit()
        return jsonify({"status": "deleted"})

    @app.get("/api/settings")
    def get_settings() -> Any:
        user = get_current_user()
        settings = UserSettings.query.filter_by(user_id=user.id).first()
        if not settings:
            settings = UserSettings(user_id=user.id)
            db.session.add(settings)
            db.session.commit()
        return jsonify({
            "profile": serialize_user(user),
            **serialize_settings(settings),
        })

    @app.put("/api/settings")
    def update_settings() -> Any:
        user = get_current_user()
        payload = request.get_json(silent=True) or {}
        user.display_name = payload.get("displayName", user.display_name)
        user.email = payload.get("email", user.email)
        user.timezone = payload.get("timezone", user.timezone)

        settings = UserSettings.query.filter_by(user_id=user.id).first()
        if not settings:
            settings = UserSettings(user_id=user.id)
            db.session.add(settings)

        whatsapp = payload.get("whatsapp", {})
        if whatsapp:
            settings.whatsapp_connected = whatsapp.get("connected", settings.whatsapp_connected)
            settings.phone_number = whatsapp.get("phoneNumber", settings.phone_number)
            settings.auto_execute = whatsapp.get("autoExecute", settings.auto_execute)
            settings.confirm_before = whatsapp.get("confirmBefore", settings.confirm_before)
            settings.quiet_hours_enabled = whatsapp.get("quietHoursEnabled", settings.quiet_hours_enabled)
            settings.quiet_start = whatsapp.get("quietStart", settings.quiet_start)
            settings.quiet_end = whatsapp.get("quietEnd", settings.quiet_end)

        if "notifications" in payload:
            settings.notifications = payload.get("notifications") or []

        db.session.commit()
        return jsonify({
            "profile": serialize_user(user),
            **serialize_settings(settings),
        })

    @app.get("/api/billing")
    def get_billing() -> Any:
        user = get_current_user()
        account = BillingAccount.query.filter_by(user_id=user.id).first()
        if not account:
            account = BillingAccount(user_id=user.id, plan="starter", usage={})
            db.session.add(account)
            db.session.commit()
        return jsonify(serialize_billing(account))

    @app.post("/api/openclaw/webhook")
    def openclaw_webhook() -> Any:
        return jsonify({"status": "received"})

    @app.get("/api/openclaw/status")
    def openclaw_status() -> Any:
        return jsonify({"status": "mock", "message": "OpenClaw integration pending"})

    @app.get("/api/whatsapp/webhook")
    def whatsapp_webhook_verify() -> Any:
        mode = request.args.get("hub.mode")
        token = request.args.get("hub.verify_token")
        challenge = request.args.get("hub.challenge")
        verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN")
        if mode == "subscribe" and verify_token and token == verify_token:
            return challenge or "", 200
        return "Forbidden", 403

    @app.post("/api/whatsapp/webhook")
    def whatsapp_webhook_receive() -> Any:
        raw_body = request.get_data(cache=True) or b""
        app_secret = os.getenv("META_APP_SECRET")
        signature = request.headers.get("x-hub-signature-256", "")
        if app_secret:
            if not verify_whatsapp_signature(signature, raw_body, app_secret):
                return "Unauthorized", 401

        payload = request.get_json(silent=True) or {}
        change = payload.get("entry", [{}])[0].get("changes", [{}])[0]
        value = change.get("value", {})
        inbound = (value.get("messages") or [{}])[0]
        if not inbound:
            return "OK", 200

        from_number = inbound.get("from")
        text = (inbound.get("text") or {}).get("body", "")
        if not from_number or not text:
            return "OK", 200

        settings = UserSettings.query.filter_by(phone_number=from_number).first()
        if settings:
            user = User.query.get(settings.user_id)
        else:
            user = get_current_user()

        user_msg = Message(user_id=user.id, text=text, sender="user", status=None)
        db.session.add(user_msg)
        db.session.commit()

        reply_text = f"You said: {text}"
        try:
            send_whatsapp_message(from_number, reply_text)
            bot_msg = Message(user_id=user.id, text=reply_text, sender="clods", status="executed")
            db.session.add(bot_msg)
            db.session.commit()
        except Exception:
            pass

        return "OK", 200

    @app.post("/api/whatsapp/send")
    def whatsapp_manual_send() -> Any:
        payload = request.get_json(silent=True) or {}
        to_number = payload.get("to")
        body = payload.get("body")
        if not to_number or not body:
            return jsonify({"error": "to and body are required"}), 400
        if not _whatsapp_env_ready():
            return jsonify({"error": "WhatsApp env not configured"}), 400
        try:
            send_whatsapp_message(to_number, body)
        except Exception as exc:
            return jsonify({"error": str(exc)}), 502
        return jsonify({"status": "sent"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
