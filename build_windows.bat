@echo off
setlocal enabledelayedexpansion

:: ========================================
:: CONFIGURATION
:: ========================================
set VERSION=0.8.0
set ARCHIVE_DIR=archive
set TIMESTAMP=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo ========================================
echo   AudioLivreur - Build Script (v%VERSION%)
echo ========================================

:: 1. Archivage des versions précédentes
if exist dist (
    echo Archivage des fichiers dans dist...
    if not exist %ARCHIVE_DIR% mkdir %ARCHIVE_DIR%
    
    :: Créer un sous-dossier pour cette archive
    set CURRENT_ARCHIVE=%ARCHIVE_DIR%\v%VERSION%_%TIMESTAMP%
    mkdir "!CURRENT_ARCHIVE!"
    
    move dist\*.exe "!CURRENT_ARCHIVE!" >nul 2>&1
    echo Anciens executables deplacés vers !CURRENT_ARCHIVE!
)

echo Nettoyage des dossiers de build...
if exist build rd /s /q build
if exist dist rd /s /q dist

echo.
echo 1. Build FULL (Standalone with FFmpeg)
echo 2. Build LIGHT (External FFmpeg required)
echo 3. Build BOTH
echo.
set /p choice="Enter choice (1/2/3): "

if "%choice%"=="1" goto build_full
if "%choice%"=="2" goto build_light
if "%choice%"=="3" goto build_both
goto end

:build_full
echo.
echo [BUILDING FULL VERSION...]
pyinstaller build_full.spec
echo.
echo Done. Check dist/AudioLivreur-v%VERSION%-Full.exe
goto end

:build_light
echo.
echo [BUILDING LIGHT VERSION...]
pyinstaller build_light.spec
echo.
echo Done. Check dist/AudioLivreur-v%VERSION%-Light.exe
goto end

:build_both
echo.
echo [BUILDING FULL VERSION...]
pyinstaller build_full.spec
echo.
echo [BUILDING LIGHT VERSION...]
pyinstaller build_light.spec
echo.
echo Both versions are ready in dist/
goto end

:end
echo.
pause
