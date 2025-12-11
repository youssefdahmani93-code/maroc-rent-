@echo off
echo Starting RentMaroc Application...

:: Start Backend
echo Starting Backend...
start "RentMaroc Backend" /min cmd /k "cd backend && npm run dev"

:: Start Frontend
echo Starting Frontend...
start "RentMaroc Frontend" /min cmd /k "cd frontend && npm run dev"

:: Wait a few seconds for servers to initialize
timeout /t 5 /nobreak >nul

:: Open Browser
echo Opening Application...
start http://localhost:5173

echo Done! You can minimize this window.
