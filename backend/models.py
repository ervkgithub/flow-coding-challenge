from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class ReminderBase(SQLModel):
    title: str
    message: str
    phone_number: str
    scheduled_time: datetime
    timezone: Optional[str] = "UTC"

class Reminder(ReminderBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str = Field(default="scheduled")  # scheduled, completed, failed
    call_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReminderCreate(ReminderBase):
    pass

class ReminderRead(ReminderBase):
    id: int
    status: str
    created_at: datetime

class ReminderUpdate(SQLModel):
    title: Optional[str] = None
    message: Optional[str] = None
    phone_number: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    status: Optional[str] = None
