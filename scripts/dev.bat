@echo off
REM ============================================================
REM  TRIADE ERP - Sobe API + Web em desenvolvimento
REM  Abre duas janelas (API e Web). Rode: scripts\dev.bat
REM  Pre-requisito: ja ter rodado scripts\db-setup.bat uma vez.
REM ============================================================
setlocal
cd /d "%~dp0\.."

echo == Garantindo dependencias ^(npm install^)...
call npm install
if errorlevel 1 ( echo ERRO no npm install & pause & exit /b 1 )

echo == Abrindo a API em uma janela (http://localhost:3333)...
start "TRIADE API" cmd /k "npm run dev:api"

echo == Abrindo o Web em outra janela (http://localhost:5173)...
start "TRIADE WEB" cmd /k "npm run dev:web"

echo.
echo == Pronto! Em alguns segundos abra no navegador:
echo    http://localhost:5173
echo.
echo == Login demo:  empresa "belle" / admin@belle.com.br / admin123
echo == (Para parar, feche as duas janelas que abriram.)
pause
