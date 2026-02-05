from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlmodel import Session, select
from datetime import datetime
from database import engine
from models import Reminder
from services.vapi_service import trigger_vapi_call
import asyncio

scheduler = AsyncIOScheduler()

async def check_for_due_reminders():
    # We open a new session for the job
    with Session(engine) as session:
        now = datetime.utcnow()
        # Find reminders that are scheduled, in the past/now, and not yet processed
        statement = select(Reminder).where(Reminder.status == "scheduled").where(Reminder.scheduled_time <= now)
        due_reminders = session.exec(statement).all()
        
        for reminder in due_reminders:
            print(f"Triggering reminder: {reminder.id} - {reminder.title}")
            
            # Start the call
            result = await trigger_vapi_call(reminder.phone_number, reminder.message, reminder.id)
            
            if result:
                reminder.status = "completed"
                reminder.call_id = result.get("id")
            else:
                reminder.status = "failed"
            
            session.add(reminder)
        
        if due_reminders:
            session.commit()

def start_scheduler():
    scheduler.add_job(check_for_due_reminders, 'interval', seconds=30)
    scheduler.start()
