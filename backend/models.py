from __future__ import annotations

from sqlalchemy import func
from extensions import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    display_name = db.Column(db.String(120), nullable=False)
    timezone = db.Column(db.String(64), default="America/New_York")
    auth_provider = db.Column(db.String(32), default="alien")
    alien_subject = db.Column(db.String(128), nullable=True)
    capabilities = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, server_default=func.now())


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(32), default="pending")
    priority = db.Column(db.String(16), default="medium")
    source = db.Column(db.String(64), default="WhatsApp")
    scheduled_for = db.Column(db.String(64), default="Unscheduled")
    created_at = db.Column(db.DateTime, server_default=func.now())
    tags = db.Column(db.JSON, default=list)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    text = db.Column(db.Text, nullable=False)
    sender = db.Column(db.String(16), nullable=False)
    status = db.Column(db.String(16), nullable=True)
    task_created = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, server_default=func.now())


class Workflow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    schedule = db.Column(db.String(120), nullable=False)
    last_run = db.Column(db.String(64), nullable=True)
    next_run = db.Column(db.String(64), nullable=True)
    active = db.Column(db.Boolean, default=True)
    total_runs = db.Column(db.Integer, default=0)
    success_rate = db.Column(db.Integer, default=100)
    steps = db.Column(db.JSON, default=list)


class UserSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)
    whatsapp_connected = db.Column(db.Boolean, default=True)
    phone_number = db.Column(db.String(32), default="+1 (555) 123-4567")
    auto_execute = db.Column(db.Boolean, default=True)
    confirm_before = db.Column(db.Boolean, default=False)
    quiet_hours_enabled = db.Column(db.Boolean, default=True)
    quiet_start = db.Column(db.String(8), default="22:00")
    quiet_end = db.Column(db.String(8), default="07:00")
    notifications = db.Column(db.JSON, default=list)


class BillingAccount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)
    plan = db.Column(db.String(32), default="pro")
    usage = db.Column(db.JSON, default=dict)
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())


class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    invoice_id = db.Column(db.String(64), nullable=False)
    date = db.Column(db.String(32), nullable=False)
    amount = db.Column(db.String(16), nullable=False)
    status = db.Column(db.String(16), nullable=False)


class VerifyRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    intent = db.Column(db.String(32), nullable=False)
    statements_confirmed = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, server_default=func.now())

