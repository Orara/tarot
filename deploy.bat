@echo off
echo ==========================================
echo 아르카나 인사이트 원클릭 배포 스크립트
echo ==========================================
echo.
echo 1. 이전 쓰레기 파일(사진 등) 청소 중...
if exist "public\hero.png" del /q "public\hero.png"
echo.
echo 2. 최신 코드로 완제품 만드는 중 (빌드)...
call npm run build
echo.
echo 3. 클라우드플레어 서버에 올리는 중 (배포)...
call npx wrangler pages deploy dist --project-name tarot
echo.
echo ==========================================
echo 배포가 완료되었습니다!
echo 브라우저 캐시(기억) 때문에 옛날 화면이 보일 수 있습니다.
echo 반드시 '시크릿 창(새 InPrivate 창)'을 열어서 접속해 주세요!
echo (단축키: Ctrl + Shift + N)
echo ==========================================
pause
