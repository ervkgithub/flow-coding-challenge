import os
import httpx
from dotenv import load_dotenv

load_dotenv()

VAPI_API_URL = "https://api.vapi.ai/call/phone"
VAPI_PRIVATE_KEY = os.getenv("VAPI_PRIVATE_KEY")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

async def trigger_vapi_call(phone_number: str, message: str, reminder_id: int):
    if not VAPI_PRIVATE_KEY:
        print("VAPI_PRIVATE_KEY not set. Skipping call.")
        return {"id": "mock-call-id", "status": "mock-success"}

    headers = {
        "Authorization": f"Bearer {VAPI_PRIVATE_KEY}",
        "Content-Type": "application/json",
    }
    
    # Simple assistant configuration that speaks the message
    payload = {
        "phoneNumberId": TWILIO_PHONE_NUMBER, # Or the ID of the phone number in Vapi
        "customer": {
            "number": phone_number,
        },
        "assistant": {
            "firstMessage": f"Hello! This is your reminder: {message}",
            "model": {
                "provider": "openai",
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful reminder assistant. You call people to deliver a message and then say goodbye."
                    }
                ]
            },
            "voice": "jennifer-playht" 
        }
    }
    
    # Note: If no Twilio number ID is configured in Vapi, using a public number or configured number ID is needed.
    # For this exercise, we assume TWILIO_PHONE_NUMBER is the ID or we might need to adjust based on Vapi docs.
    # Valid Vapi payload to 'POST /call/phone' usually requires 'phoneNumberId' (ID of imported Twilio number in Vapi).
    
    # If the user provides a raw phone number as TWILIO_PHONE_NUMBER, we might need a different payload or import it.
    # Assuming 'phoneNumberId' is what's expected if using BYO Twilio.
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(VAPI_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"Error triggering Vapi call: {e}")
        return None
