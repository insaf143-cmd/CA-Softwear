@echo off
title TAXBAY - Create Desktop Icon
color 0E

echo ========================================================
echo   TAXBAY - PC DESKTOP INSTALLATION ^& SHORTCUT CREATOR
echo ========================================================
echo.

set DESKTOP_PATH=%USERPROFILE%\Desktop
set SHORTCUT_FILE=%DESKTOP_PATH%\TAXBAY - CA Suite.url

echo [..] Creating Desktop Shortcut at:
echo      "%SHORTCUT_FILE%"
echo.

(
echo [InternetShortcut]
echo URL=https://ca-softwear-lt6s.vercel.app/
echo IconIndex=0
echo IconFile=C:\Windows\System32\shell32.dll
) > "%SHORTCUT_FILE%"

echo [OK] Success! TAXBAY Desktop Shortcut has been created on your Desktop!
echo.
echo ========================================================
echo   PERMANENT LINKS:
echo ========================================================
echo   Cloud Web Link : https://ca-softwear-lt6s.vercel.app/
echo   Local PC Link  : http://localhost:5173/
echo ========================================================
echo.
echo Press any key to open TAXBAY now...
pause >nul
start https://ca-softwear-lt6s.vercel.app/
exit
