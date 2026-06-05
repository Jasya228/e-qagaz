@echo off
echo =======================================================
echo Starting the ORIGINAL e-qagaz project
echo =======================================================

echo Starting Backend Server (Port 4000)...
start "Old Backend Server" cmd /c "cd backend && npm run start:dev"

echo Starting Frontend Server (Port 3000)...
start "Old Frontend Server" cmd /c "cd frontend && npm run dev"

echo.
echo =======================================================
echo Servers are launching in separate windows!
echo Once they are ready, the site will be available at:
echo http://localhost:3000
echo =======================================================
pause
