# AI Stylist Backend Setup Guide

## Overview
The AI Stylist chatbot backend is a Python FastAPI server that provides fashion advice using Groq AI (Qwen 3.6 27B model).

## Prerequisites
1. **Python 3.13** (or Python 3.10+)
2. **MySQL Server** (for chat history storage)
3. **Groq API Key** (free at https://console.groq.com/)

## Installation Steps

### 1. Extract the Backend

The chatbot backend is already in your project at:
```
ReStyle-project-main/chatbot-backend zip/chatbot-backend/
```

### 2. Install Python

Download Python 3.13 from: https://www.python.org/downloads/

During installation:
- ✅ Check "Add Python to PATH"
- ✅ Check "Install pip"

Verify installation:
```bash
python --version
pip --version
```

### 3. Install MySQL

**Option A: MySQL Community Server** (Recommended)
- Download: https://dev.mysql.com/downloads/mysql/
- Install with default settings
- Remember your root password

**Option B: XAMPP** (Easier for beginners)
- Download: https://www.apachefriends.org/
- Install and start MySQL from control panel

### 4. Create MySQL Database

Open MySQL command line or phpMyAdmin and run:
```sql
CREATE DATABASE restyle;
```

### 5. Set Up Backend Environment

Open PowerShell/Terminal in the chatbot-backend folder:
```bash
cd "ReStyle-project-main/chatbot-backend zip/chatbot-backend"
```

Create virtual environment:
```bash
python -m venv venv
```

Activate virtual environment:

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows CMD:**
```cmd
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` in your prompt.

### 6. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI - Web framework
- SQLAlchemy - Database ORM
- Groq - AI model SDK
- Uvicorn - ASGI server
- Python-dotenv - Environment variables
- And more...

### 7. Get Groq API Key

1. Go to https://console.groq.com/
2. Sign up for free account
3. Navigate to API Keys section
4. Create new API key
5. Copy the key (starts with `gsk_...`)

### 8. Configure Environment Variables

Create `.env` file in `chatbot-backend` folder:

```env
# Groq AI Configuration
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

# MySQL Database Configuration
DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/restyle

# Server Configuration
HOST=127.0.0.1
PORT=8000
```

**Database URL Format:**
```
mysql+pymysql://username:password@host:port/database_name
```

Examples:
```
# If your MySQL root password is "password123"
DATABASE_URL=mysql+pymysql://root:password123@localhost:3306/restyle

# If no password (not recommended for production)
DATABASE_URL=mysql+pymysql://root:@localhost:3306/restyle

# If using custom user
DATABASE_URL=mysql+pymysql://restyle_user:mypass@localhost:3306/restyle
```

### 9. Install Missing Dependency

The requirements.txt is missing `pymysql`. Install it:
```bash
pip install pymysql
```

### 10. Start the Backend Server

```bash
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 11. Test the Backend

**Option A: Swagger UI (Recommended)**
1. Open http://127.0.0.1:8000/docs in browser
2. Expand `POST /ai-stylist/chat`
3. Click "Try it out"
4. Enter test data:
```json
{
  "user_id": 1,
  "message": "What should I wear to a college party?"
}
```
5. Click "Execute"
6. Check response

**Option B: Test Database Connection**
Open http://127.0.0.1:8000/test-db

Should return:
```json
{"message": "Database Connected Successfully"}
```

## API Endpoints

### AI Stylist Endpoints

**POST /ai-stylist/chat**
- Send message to AI stylist
- Request body:
```json
{
  "user_id": 1,
  "message": "Your fashion question here"
}
```
- Response:
```json
{
  "status": "success",
  "reply": "AI stylist's response",
  "model": "qwen/qwen3.6-27b"
}
```

**GET /ai-stylist/history/{user_id}**
- Get chat history for a user

**DELETE /ai-stylist/history/{user_id}**
- Delete all chat history for a user

### Other Endpoints

**GET /**
- Health check endpoint
- Returns: `{"message": "ReStyle Backend Running"}`

**POST /signup**
- Create new user account

**POST /login**
- User authentication

**GET /profile/{email}**
- Get user profile

**PUT /profile/{email}**
- Update user profile

## Troubleshooting

### Port Already in Use
If port 8000 is busy, use different port:
```bash
uvicorn main:app --reload --port 8001
```

### MySQL Connection Error
```
sqlalchemy.exc.OperationalError: (2003, "Can't connect to MySQL")
```
**Fix:**
- Ensure MySQL is running
- Check username/password in DATABASE_URL
- Verify database 'restyle' exists
- Check MySQL port (default 3306)

### Groq API Error
```
groq.APIError: Invalid API key
```
**Fix:**
- Verify GROQ_API_KEY in .env file
- Ensure no extra spaces
- Get new key from https://console.groq.com/

### Import Error
```
ModuleNotFoundError: No module named 'pymysql'
```
**Fix:**
```bash
pip install pymysql
```

### Virtual Environment Not Activated
If you see `(venv)` in prompt, it's active.
If not, activate again:
```bash
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

## Frontend Integration

The AI Stylist chatbot page needs to connect to this backend. Current status:

**Current:** Frontend AI Stylist page likely uses mock data or different API

**Needed:** Update frontend to call `http://127.0.0.1:8000/ai-stylist/chat`

See `AI_STYLIST_FRONTEND_INTEGRATION.md` for integration steps.

## Running Both Backends

You now have TWO backend servers:

1. **Node.js Backend** (Port 4000) - Escrow orders, payments
   ```bash
   cd ReStyle-project-main/backend
   npm run dev
   ```

2. **Python Backend** (Port 8000) - AI Stylist, Virtual Try-On
   ```bash
   cd "ReStyle-project-main/chatbot-backend zip/chatbot-backend"
   uvicorn main:app --reload
   ```

3. **Frontend** (Port 5173) - React website
   ```bash
   cd ReStyle-project-main
   npm run dev
   ```

All three need to run simultaneously for full functionality.

## Database Schema

The backend automatically creates these tables:

- `users` - User accounts
- `ai_stylist_chats` - Chat history
- `virtual_tryon_history` - Try-on history
- `wardrobe_items` - Saved wardrobe items

## Security Notes

- Never commit `.env` file with real credentials
- Use strong MySQL passwords
- Groq API has rate limits (free tier)
- Enable chat history saving by uncommenting lines in `ai_stylist.py`

## Next Steps

1. ✅ Install Python & MySQL
2. ✅ Create database
3. ✅ Get Groq API key
4. ✅ Configure .env file
5. ✅ Start backend server
6. ✅ Test in Swagger UI
7. 🔜 Connect frontend to backend (see integration guide)

## Support

- **Groq Documentation**: https://console.groq.com/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **MySQL Documentation**: https://dev.mysql.com/doc/

## License

Private project
