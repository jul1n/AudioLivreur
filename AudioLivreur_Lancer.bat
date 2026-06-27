@echo off
chcp 65001 >nul
title AudioLivreur - Serveur Local
color 0B

echo =======================================================
echo          AUDIOLIVREUR - LANCEMENT DU SERVEUR
echo =======================================================
echo.
echo Verification de Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Python n'est pas installe ou n'est pas dans le PATH.
    echo Veuillez installer Python depuis le Microsoft Store ou python.org
    pause
    exit
)

echo.
echo Verification des dependances (fastapi, uvicorn, edge-tts)...
pip install fastapi uvicorn edge-tts >nul 2>&1

echo.
echo Lancement du serveur local...
echo Ne fermez pas cette fenetre noire pendant que vous utilisez l'application.
echo.

start http://localhost:8000
python server.py

pause
