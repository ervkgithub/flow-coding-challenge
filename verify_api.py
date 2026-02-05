import httpx
import asyncio
from datetime import datetime, timedelta

API_URL = "http://localhost:8000"

async def test_api():
    async with httpx.AsyncClient() as client:
        # 1. Create Reminder
        future_time = datetime.utcnow() + timedelta(minutes=5)
        payload = {
            "title": "API Verification",
            "message": "This is a test from python script",
            "phone_number": "+15551234567",
            "scheduled_time": future_time.isoformat(),
            "timezone": "UTC"
        }
        
        print("Creating reminder...")
        resp = await client.post(f"{API_URL}/reminders/", json=payload)
        if resp.status_code == 200:
            print("Creation Success:", resp.json())
            reminder_id = resp.json()["id"]
        else:
            print("Creation Failed:", resp.text)
            return

        # 2. List Reminders
        print("Listing reminders...")
        resp = await client.get(f"{API_URL}/reminders/")
        if resp.status_code == 200:
            reminders = resp.json()
            print(f"Found {len(reminders)} reminders.")
            # Verify our reminder is there
            found = any(r["id"] == reminder_id for r in reminders)
            print(f"Reminder {reminder_id} found in list: {found}")
        else:
            print("List Failed:", resp.text)

        # 3. Delete Reminder
        print(f"Deleting reminder {reminder_id}...")
        resp = await client.delete(f"{API_URL}/reminders/{reminder_id}")
        if resp.status_code == 200:
            print("Delete Success")
        else:
            print("Delete Failed:", resp.text)

if __name__ == "__main__":
    asyncio.run(test_api())
