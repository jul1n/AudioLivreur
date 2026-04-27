@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   AudioLivreur - Build Script (v0.5.0)
echo ========================================

echo Nettoyage manuel des anciens builds...
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
echo Done. Check dist/AudioLivreur-Full.exe
goto end

:build_light
echo.
echo [BUILDING LIGHT VERSION...]
pyinstaller build_light.spec
echo Done. Check dist/AudioLivreur-Light.exe
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
pause
