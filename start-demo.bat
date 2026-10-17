@echo off
echo ========================================
echo Starting AI-Driven Auto-Scaler Demo
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    pause
    exit /b 1
)
echo.

REM Check Python
echo Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed!
    pause
    exit /b 1
)
echo.

echo Installing Dependencies...
echo.

REM Install backend dependencies
echo [1/3] Installing Backend Dependencies...
cd backend
if not exist node_modules (
    call npm install
)
cd ..
echo.

REM Install frontend dependencies
echo [2/3] Installing Frontend Dependencies...
cd frontend
if not exist node_modules (
    call npm install
)
cd ..
echo.

REM Install ML service dependencies
echo [3/3] Installing ML Service Dependencies...
cd ml-service
pip install -r requirements.txt
cd ..
echo.

echo ========================================
echo All Dependencies Installed!
echo ========================================
echo.
echo Starting Services...
echo.
echo Opening 3 terminals:
echo - Terminal 1: Backend API (Port 4000)
echo - Terminal 2: ML Service (Port 5000)
echo - Terminal 3: Frontend (Port 3000)
echo.

REM Start Backend
start "Backend API" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

REM Start ML Service
start "ML Service" cmd /k "cd ml-service && python app.py"
timeout /t 3 /nobreak >nul

REM Start Frontend
start "Frontend" cmd /k "cd frontend && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Services Starting...
echo ========================================
echo.
echo Wait for all services to start (30-60 seconds)
echo.
echo Access the application at:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:4000
echo   ML Service: http://localhost:5000
echo.
echo Press Ctrl+C in each terminal window to stop services
echo.
pause
