@echo off
echo Starting Real Estate Project Servers...

REM Start Backend in a new window
echo Starting Backend (Port 8090)...
start "Backend Server" cmd /c "cd /d app\backend && set DATABASE_URL=sqlite+aiosqlite:///C:/realestatesite/app/backend/realestate_mvp_v1.db&& set EMAIL_PROVIDER=console&& set REAL_ESTATE_PUBLIC_PHONE=+8801712345678&& python -m uvicorn app.main:app --host 127.0.0.1 --port 8090"

REM Start Frontend in a new window
echo Starting Frontend (Port 3010)...
start "Frontend Server" cmd /c "cd /d nextjs-frontend && set NEXT_PUBLIC_API_URL=http://127.0.0.1:8090&& npm run dev -- --port 3010"

echo.
echo Servers are starting in separate windows.
echo Use stop_servers.bat to shut them down.