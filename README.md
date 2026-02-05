# Call Me Reminder

A premium reminder application that calls you when it's time.

## Project Structure

- `frontend/`: Next.js 14 Web Application
- `backend/`: FastAPI Python Backend
- `docker-compose.yml`: (Optional) Orchestration

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- Vapi API Key
- Twilio Account SID & Auth Token (for Vapi phone number usage)

### Quick Start (Local)

1. **Backend**
   ```bash
   cd backend
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   # source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables
See `.env.example` in both directories.
