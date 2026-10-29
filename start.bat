@echo off
chcp 65001 >nul
title CampusBus AI - Dev Server
cd /d "%~dp0"
echo ===================================================
echo   CampusBus AI - Smart College Bus Tracking System
echo ===================================================
echo [1/2] Checking and installing Python dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pip install failed. Please ensure Python is added to PATH.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Launching CampusBus AI Application...
echo Browser opening at: http://127.0.0.1:8000
start "" "http://127.0.0.1:8000"
python run.py
pause
