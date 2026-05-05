@echo off
echo ==========================================
echo Arcana Insight One-Click Deploy
echo ==========================================
echo.
echo 1. Cleaning up old files...
if exist "public\hero.png" del /q "public\hero.png"
echo.
echo 2. Building the latest code...
call npm run build
echo.
echo 3. Deploying to Cloudflare...
call npx wrangler pages deploy dist --project-name tarot
echo.
echo ==========================================
echo Deployment Complete!
echo You MUST open an Incognito Window (Ctrl+Shift+N)
echo to see the new changes due to browser cache.
echo ==========================================
pause
