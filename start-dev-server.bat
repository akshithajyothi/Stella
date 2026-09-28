@echo off
echo Starting ReStyle Development Server...
echo.
echo Server will be available at: http://localhost:5173/
echo.
echo Keep this window open to keep the server running.
echo Press Ctrl+C to stop the server.
echo.
cd /d "%~dp0"
npm run dev
pause
