@echo off
echo Building AudioLivreur...
echo Output directories: ../dist and ../build

pyinstaller --distpath ../dist --workpath ../build --noconfirm build.spec

echo.
echo Build complete. Executable is in ../dist/AudioLivreur/
pause
