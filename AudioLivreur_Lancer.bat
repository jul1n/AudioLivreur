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
    echo [ERREUR] Python n'est pas installe sur votre ordinateur.
    echo L'application AudioLivreur a besoin de Python pour fonctionner en local.
    echo.
    set /p dl="Voulez-vous ouvrir la page de telechargement de Python (O/N) ? "
    if /I "%dl%"=="O" (
        start https://www.python.org/downloads/
        echo.
        echo [INFO] Lors de l'installation, n'oubliez pas de cocher la case "Add Python to PATH" !
        echo [INFO] Une fois Python installe, fermez cette fenetre et relancez ce script.
    ) else (
        echo Veuillez installer Python manuellement depuis le Microsoft Store ou python.org.
    )
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
cd dependance
python server.py

pause
