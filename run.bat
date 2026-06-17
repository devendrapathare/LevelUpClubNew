@echo off
echo Starting LevelUp Club Application
echo ================================

REM Check if node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "client" (
    echo Error: Please run this script from the root level-up-club directory
    pause
    exit /b 1
)

echo Starting backend server...
start "Backend Server" cmd /k "cd server && npm start"

timeout /t 5 /nobreak >nul

echo Starting frontend development server...
start "Frontend Server" cmd /k "cd client && npm run dev"

echo.
echo Servers started successfully!
echo Frontend URL: http://localhost:3000 (or next available port)
echo Backend URL: http://localhost:5001
echo.
echo Press any key to exit...
pause >nul