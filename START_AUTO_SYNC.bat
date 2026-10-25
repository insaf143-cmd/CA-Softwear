@echo off
title CA Practice Suite - Automatic Reflection Watcher
color 0A
echo ================================================================
echo   CA PRACTICE MANAGEMENT SYSTEM - AUTOMATIC REFLECTION ENGINE
echo ================================================================
echo.
echo Watching for file changes in: %~dp0
echo Any modification to Code.gs, Index.html, etc., will be:
echo   1. Automatically committed to Git
echo   2. Automatically pushed to GitHub (origin/office-management-suite)
echo   3. Automatically pushed to Google Apps Script if clasp is configured
echo.
echo Press Ctrl+C at any time to stop the watcher.
echo ================================================================
echo.
cd /d "%~dp0"
node auto-sync.js
pause
