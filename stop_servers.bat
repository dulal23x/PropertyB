@echo off
echo Stopping Backend Server (Port 8090)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8090') do taskkill /f /pid %%a 2>nul

echo Stopping Frontend Server (Port 3010)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3010') do taskkill /f /pid %%a 2>nul

echo.
echo All specified servers have been stopped.
pause