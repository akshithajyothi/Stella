# AI Stylist Integration - Complete Setup

## Overview
The AI Stylist chatbot is now fully integrated with your ReStyle frontend. It can work in two modes:
1. **Demo Mode** - Shows helpful messages when backend is offline
2. **Live Mode** - Connects to Python backend for real AI fashion advice

## Current Status

✅ **Frontend Updated** - AIStylistChat component now connects to backend  
✅ **API Client Created** - `src/lib/api/aiStylist.ts` handles all backend calls  
✅ **Graceful Fallback** - Works without backend, shows setup instructions  
✅ **Error Handling** - User-friendly messages when backend is unavailable  

## How It Works

### Without Backend (Demo Mode)
1. User opens AI Stylist Chat page
2. System checks if Python backend is available
3. If not available, shows demo mode message
4. User can still see the interface
5. Messages explain how to enable real AI

### With Backend (Live Mode)
1. User types fashion question
2. Frontend calls `POST /ai-stylist/chat`
3. Python backend uses Groq AI (Qwen 3.6 27B)
4. AI generates fashion advice
5. Response appears in chat

## Setup Instructions

### Prerequisites Checklist
- [ ] Python 3.13 installed
- [ ] MySQL Server installed
- [ ] Groq API key obtained
- [ ] Backend dependencies installed
- [ ] Database created

### Quick Start Guide

**Step 1: Navigate to Backend Folder**
```bash
cd "ReStyle-project-main/chatbot-backend zip/chatbot-backend"
```

**Step 2: Create Virtual Environment**
```bash
python -m venv venv
```

**Step 3: Activate Virtual Environment**

Windows PowerShell:
```powershell
.\venv\Scripts\Activate.ps1
```

Windows CMD:
```cmd
venv\Scripts\activate
```

Mac/Linux:
```bash
source venv/bin/activate
```

**Step 4: Install Dependencies**
```bash
pip install -r requirements.txt
pip install pymysql
```

**Step 5: Create MySQL Database**
```sql
CREATE DATABASE restyle;
```

**Step 6: Create `.env` File**

Create `chatbot-backend/.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/restyle
```

**Step 7: Start Backend Server**
```bash
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Step 8: Test the API**
Open http://127.0.0.1:8000/docs

Try the `/ai-stylist/chat` endpoint with:
```json
{
  "user_id": 1,
  "message": "What should I wear to a college party?"
}
```

**Step 9: Test Frontend**
1. Open http://localhost:5173
2. Navigate to AI Stylist Chat
3. Type a fashion question
4. You should get real AI responses!

## API Endpoints Used

### POST /ai-stylist/chat
**Frontend calls this to send user messages**

Request:
```json
{
  "user_id": 1,
  "message": "What colors go well with navy blue?"
}
```

Response:
```json
{
  "status": "success",
  "reply": "Navy blue pairs beautifully with white, beige, mustard yellow, burgundy, and olive green...",
  "model": "qwen/qwen3.6-27b"
}
```

### GET /ai-stylist/history/{user_id}
**Get chat history (for future feature)**

Response:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "user_message": "What should I wear?",
    "ai_reply": "Here are some suggestions...",
    "timestamp": "2024-01-01T12:00:00"
  }
]
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│                   http://localhost:5173                  │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AIStylistChat.tsx                               │   │
│  │  - User interface                                 │   │
│  │  - Message handling                               │   │
│  │  - Demo mode fallback                             │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     │                                     │
│                     │ Uses                                │
│                     ▼                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  src/lib/api/aiStylist.ts                        │   │
│  │  - API client functions                           │   │
│  │  - Error handling                                 │   │
│  │  - Backend availability check                     │   │
│  └──────────────────┬───────────────────────────────┘   │
└────────────────────┼─────────────────────────────────────┘
                     │
                     │ HTTP POST
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             Python Backend (FastAPI)                     │
│              http://127.0.0.1:8000                       │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ai_stylist.py                                    │   │
│  │  - POST /ai-stylist/chat                          │   │
│  │  - Chat history endpoints                         │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     │                                     │
│                     │ Calls                               │
│                     ▼                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Groq AI SDK                                      │   │
│  │  - Model: qwen/qwen3.6-27b                        │   │
│  │  - Temperature: 0.7                               │   │
│  │  - Max tokens: 250                                │   │
│  └──────────────────┬───────────────────────────────┘   │
└────────────────────┼─────────────────────────────────────┘
                     │
                     │ API Request
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Groq Cloud API                              │
│         (Qwen 3.6 27B Language Model)                    │
└─────────────────────────────────────────────────────────┘

                     ▼
┌─────────────────────────────────────────────────────────┐
│              MySQL Database                              │
│           (Chat History Storage)                         │
│                                                           │
│  Tables:                                                  │
│  - users                                                  │
│  - ai_stylist_chats                                      │
└─────────────────────────────────────────────────────────┘
```

## Running All Services

You need to run **3 separate servers** simultaneously:

### Terminal 1: Frontend (React)
```bash
cd ReStyle-project-main
npm run dev
```
**URL:** http://localhost:5173

### Terminal 2: Python Backend (AI Stylist)
```bash
cd "ReStyle-project-main/chatbot-backend zip/chatbot-backend"
.\venv\Scripts\activate  # Windows
uvicorn main:app --reload
```
**URL:** http://127.0.0.1:8000

### Terminal 3: Node.js Backend (Orders/Payments) - Optional
```bash
cd ReStyle-project-main/backend
npm run dev
```
**URL:** http://localhost:4000

## Testing the Integration

### Test 1: Backend Availability Check
1. Open browser console (F12)
2. Navigate to AI Stylist Chat
3. Check console for logs
4. Should see backend connection status

### Test 2: Send Test Message
Ask these questions to test AI:
- "What should I wear to a job interview?"
- "Colors that go with black jeans?"
- "Summer outfit ideas for college"
- "How to style a denim jacket?"

### Test 3: Demo Mode
1. Stop Python backend (Ctrl+C)
2. Refresh AI Stylist Chat page
3. Try sending a message
4. Should see demo mode message with setup instructions

### Test 4: Error Recovery
1. Start with backend running
2. Send a message (should work)
3. Stop backend
4. Send another message (should show error gracefully)
5. Restart backend
6. Refresh page and try again (should work)

## Features

### Current Features ✅
- Real-time AI fashion advice via Groq
- Graceful demo mode when backend is offline
- Loading states and animations
- Error handling with helpful messages
- Keyboard support (Enter to send)
- Chat history UI (display only)

### Future Enhancements 🔜
- Save chat history to database
- Load previous conversations
- Clear chat history button
- Image upload for outfit advice
- User authentication integration
- Typing indicators
- Message timestamps
- Export chat as PDF

## Troubleshooting

### "AI Stylist backend is not running"
**Cause:** Python backend not started or wrong port  
**Fix:**
1. Check backend is running: http://127.0.0.1:8000
2. Verify port 8000 is not blocked
3. Check `.env` file exists with GROQ_API_KEY

### "Invalid API key" Error
**Cause:** Groq API key is wrong or missing  
**Fix:**
1. Get new key from https://console.groq.com/
2. Update `.env` file
3. Restart backend server

### Backend Starts But Crashes
**Cause:** Missing database or dependencies  
**Fix:**
```bash
# Reinstall dependencies
pip install -r requirements.txt
pip install pymysql

# Check database exists
mysql -u root -p
> SHOW DATABASES;
> USE restyle;
```

### CORS Error in Browser
**Cause:** Frontend not allowed by backend  
**Fix:** Backend already allows `http://localhost:5173` in `main.py`
- Verify frontend runs on port 5173
- Check browser console for exact error

### Virtual Environment Not Working
**Cause:** Not activated or wrong path  
**Fix:**
```bash
# Windows
.\venv\Scripts\activate

# If that fails, try:
python -m venv venv --clear
.\venv\Scripts\activate
pip install -r requirements.txt
```

## Chat History (Optional Feature)

To enable chat history saving:

1. Uncomment these lines in `ai_stylist.py`:
```python
crud.save_chat(
    db=db,
    user_id=request.user_id,
    user_message=request.message,
    ai_reply=reply
)
```

2. Make sure MySQL is running

3. Chat history will be saved automatically

4. View history at: `GET /ai-stylist/history/{user_id}`

## Security Notes

⚠️ **Important for Production:**
- Never expose GROQ_API_KEY in frontend code
- Always make AI calls from backend
- Implement rate limiting (Groq free tier has limits)
- Add user authentication before enabling history
- Sanitize user inputs to prevent injection
- Use environment variables for all secrets

## API Rate Limits

Groq Free Tier:
- **Requests:** Limited per minute
- **Tokens:** Limited per day
- **Model:** Qwen 3.6 27B (fast and capable)

If you hit limits, the backend will return an error and frontend will show it gracefully.

## Next Steps

1. ✅ Follow setup guide above
2. ✅ Start Python backend
3. ✅ Test AI responses
4. 🔜 Add user authentication
5. 🔜 Enable chat history
6. 🔜 Add image upload for outfit analysis
7. 🔜 Deploy to production

## Summary

Your AI Stylist is now a **real AI chatbot** powered by Groq's Qwen 3.6 27B model! It:
- ✅ Works without backend (shows helpful demo messages)
- ✅ Connects to Python backend when available
- ✅ Provides real fashion advice via AI
- ✅ Handles errors gracefully
- ✅ Has great UX with loading states

**Refresh your browser** and start chatting with your AI stylist! 🎨👗
