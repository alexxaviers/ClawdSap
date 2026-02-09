from extensions import db
from models import User, Task, Message, Workflow, UserSettings, BillingAccount, Invoice


def seed_demo_data() -> None:
    if User.query.first():
        return

    user = User(
        email="alex@example.com",
        display_name="Alex Morgan",
        timezone="America/New_York",
        capabilities=["create_tasks", "schedule_events", "run_workflows", "set_reminders"],
    )
    db.session.add(user)
    db.session.flush()

    tasks = [
        Task(user_id=user.id, title="Call the bank about mortgage", status="pending", priority="high", source="WhatsApp", scheduled_for="Today, 5:00 PM", tags=["finance"]),
        Task(user_id=user.id, title="Send weekly report to team", status="running", priority="medium", source="Workflow", scheduled_for="Today, 6:00 PM", tags=["work"]),
        Task(user_id=user.id, title="Book dentist appointment", status="done", priority="medium", source="WhatsApp", scheduled_for="Today, 2:00 PM", tags=["health"]),
        Task(user_id=user.id, title="Prepare meeting notes for Sam", status="done", priority="high", source="WhatsApp", scheduled_for="Today, 11:30 AM", tags=["work"]),
        Task(user_id=user.id, title="Order groceries for the week", status="pending", priority="low", source="WhatsApp", scheduled_for="Tomorrow, 9:00 AM", tags=["personal"]),
    ]
    db.session.add_all(tasks)

    messages = [
        Message(user_id=user.id, text="remind me to call Sam at 5pm", sender="user"),
        Message(user_id=user.id, text="Done. Reminder set for 5:00 PM today: \"Call Sam\". I'll text you 5 minutes before.", sender="clods", status="executed", task_created="Call Sam"),
        Message(user_id=user.id, text="what's on my schedule tomorrow", sender="user"),
        Message(user_id=user.id, text="Tomorrow you have:\n- 9:00 AM: Team standup\n- 11:30 AM: 1:1 with Sarah\n- 2:00 PM: Dentist (rescheduled)\n- 4:00 PM: Open slot\n\nWant me to block time for anything?", sender="clods", status="executed"),
        Message(user_id=user.id, text="add groceries to my list", sender="user"),
        Message(user_id=user.id, text="Added to your shopping list. You now have 7 items. Want me to order them through Instacart when you're ready?", sender="clods", status="executed", task_created="Grocery shopping"),
    ]
    db.session.add_all(messages)

    workflows = [
        Workflow(
            user_id=user.id,
            name="Weekly summary",
            description="Aggregates all completed tasks from the week and sends a formatted summary to your WhatsApp every Monday morning.",
            schedule="Every Monday, 9:00 AM",
            last_run="2 days ago",
            next_run="In 5 days",
            active=True,
            total_runs=24,
            success_rate=100,
            steps=[
                {"label": "Trigger: Monday 9 AM", "type": "trigger"},
                {"label": "Fetch completed tasks", "type": "action"},
                {"label": "Format summary", "type": "action"},
                {"label": "Send via WhatsApp", "type": "action"},
            ],
        ),
        Workflow(
            user_id=user.id,
            name="Daily standup prep",
            description="Pulls your calendar, pending tasks, and yesterday's completed items into a standup-ready message before your first meeting.",
            schedule="Every weekday, 8:30 AM",
            last_run="12 hours ago",
            next_run="Tomorrow, 8:30 AM",
            active=True,
            total_runs=112,
            success_rate=98,
            steps=[
                {"label": "Trigger: Weekday 8:30 AM", "type": "trigger"},
                {"label": "Check calendar events", "type": "action"},
                {"label": "List pending tasks", "type": "action"},
                {"label": "If > 3 items, prioritize", "type": "condition"},
                {"label": "Send standup brief", "type": "action"},
            ],
        ),
    ]
    db.session.add_all(workflows)

    settings = UserSettings(
        user_id=user.id,
        notifications=[
            {"id": "task-complete", "label": "Task completed", "description": "Get notified when a task finishes executing.", "enabled": True},
            {"id": "task-failed", "label": "Task failed", "description": "Get alerted when a task fails and needs attention.", "enabled": True},
            {"id": "workflow-run", "label": "Workflow executed", "description": "Notification after each scheduled workflow run.", "enabled": False},
            {"id": "weekly-digest", "label": "Weekly digest", "description": "A weekly summary of your activity and stats.", "enabled": True},
            {"id": "product-updates", "label": "Product updates", "description": "New features, improvements, and tips.", "enabled": False},
        ],
    )
    db.session.add(settings)

    billing = BillingAccount(
        user_id=user.id,
        plan="pro",
        usage={
            "executions": {"used": 247, "total": "Unlimited", "pct": 100},
            "workflows": {"used": 2, "total": 10, "pct": 20},
            "messages": {"used": 89, "total": "Unlimited", "pct": 100},
        },
    )
    db.session.add(billing)

    invoices = [
        Invoice(user_id=user.id, invoice_id="INV-2026-001", date="Jan 1, 2026", amount="$29.00", status="Paid"),
        Invoice(user_id=user.id, invoice_id="INV-2025-012", date="Dec 1, 2025", amount="$29.00", status="Paid"),
        Invoice(user_id=user.id, invoice_id="INV-2025-011", date="Nov 1, 2025", amount="$29.00", status="Paid"),
        Invoice(user_id=user.id, invoice_id="INV-2025-010", date="Oct 1, 2025", amount="$0.00", status="Free tier"),
    ]
    db.session.add_all(invoices)

    db.session.commit()
