from fastapi import FastAPI, Depends, HTTPException
from contextlib import asynccontextmanager
from sqlmodel import Session, select
from typing import List
from database import create_db_and_tables, get_session
from models import Reminder, ReminderCreate, ReminderRead, ReminderUpdate
from services.scheduler import start_scheduler
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    start_scheduler()
    yield

app = FastAPI(lifespan=lifespan)

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/reminders/", response_model=ReminderRead)
def create_reminder(reminder: ReminderCreate, session: Session = Depends(get_session)):
    db_reminder = Reminder.model_validate(reminder)
    session.add(db_reminder)
    session.commit()
    session.refresh(db_reminder)
    return db_reminder

@app.get("/reminders/", response_model=List[ReminderRead])
def read_reminders(
    offset: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    reminders = session.exec(select(Reminder).offset(offset).limit(limit).order_by(Reminder.scheduled_time)).all()
    return reminders

@app.patch("/reminders/{reminder_id}", response_model=ReminderRead)
def update_reminder(reminder_id: int, reminder: ReminderUpdate, session: Session = Depends(get_session)):
    db_reminder = session.get(Reminder, reminder_id)
    if not db_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder_data = reminder.model_dump(exclude_unset=True)
    for key, value in reminder_data.items():
        setattr(db_reminder, key, value)
        
    session.add(db_reminder)
    session.commit()
    session.refresh(db_reminder)
    return db_reminder

@app.delete("/reminders/{reminder_id}")
def delete_reminder(reminder_id: int, session: Session = Depends(get_session)):
    reminder = session.get(Reminder, reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    session.delete(reminder)
    session.commit()
    return {"ok": True}
