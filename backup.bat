@echo off
echo ==========================================
echo Git Backup Script
echo ==========================================
echo.
echo 1. Checking git status...
git status
echo.
echo 2. Adding all changes...
git add .
echo.
echo 3. Committing changes...
set /p msg="Enter commit message (default: 'latest updates'): "
if "%msg%"=="" set msg=latest updates
git commit -m "%msg%"
echo.
echo 4. Pushing to GitHub...
git push origin main
echo.
echo ==========================================
echo Backup complete!
echo ==========================================
pause
