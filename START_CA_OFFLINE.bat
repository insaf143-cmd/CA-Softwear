@echo off
title CA Practice Management Suite - Local Server
color 0A

echo ========================================================
echo   CA PRACTICE MANAGEMENT SUITE - LOCAL OFFLINE SERVER
echo ========================================================
echo.

cd /d "C:\Users\DELL\Documents\Softwear"

:: Check if server is already running on port 5173
netstat -ano | findstr 5173 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Local server is ALREADY running on port 5173.
) else (
    echo [..] Starting local background server...
    start /min "CA Server Background" cmd /c "npm run dev"
    timeout /t 3 /nobreak >nul
)

:: Find current local IPv4
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192.168."') do (
    set LOCAL_IP=%%a
)
set LOCAL_IP=%LOCAL_IP: =%

echo.
echo ========================================================
echo   HOW TO OPEN THE SOFTWARE:
echo ========================================================
echo   1. ON THIS LAPTOP (100%% Offline, No Internet Needed):
echo      http://localhost:5173
echo.
echo   2. ON OTHER OFFICE PCs (Connected to same Wi-Fi):
echo      Option A (Never breaks with IP changes):
echo      http://DESKTOP-3HK3NUD:5173
echo.
if defined LOCAL_IP (
echo      Option B (Current Wi-Fi IP):
echo      http://%LOCAL_IP%:5173
)
echo ========================================================
echo.
echo Opening software in your default browser...
start http://localhost:5173

timeout /t 5 >nul
exit
