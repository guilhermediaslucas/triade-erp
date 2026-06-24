@echo off
REM ============================================================
REM  TRIADE ERP - RELEASE (igual ao FinPessoais): sobe a versao e da push.
REM  O resto e AUTOMATICO no GitHub:
REM    - Cloudflare Pages builda e publica o SITE (com a versao nova)
REM    - GitHub Action (.github/workflows/apk.yml) builda o APK na nuvem e
REM      publica/atualiza a Release "vX.Y.Z" com o app-debug.apk (vira a Latest);
REM      o link "Baixar app" do site e o aviso "Baixar nova versao" do app
REM      sempre apontam p/ essa Release.
REM  Uso: scripts\release.bat
REM ============================================================
setlocal
cd /d "%~dp0\.."

echo === [1/2] Subindo a versao (patch +1) nos package.json...
call node scripts\bump-versao.mjs
if errorlevel 1 goto erro
set "VER="
for /f "usebackq delims=" %%v in (`node -p "require('./apps/web/package.json').version"`) do set "VER=%%v"

echo === [2/2] Commit + push...
git add -A
git commit -m "Release v%VER%"
git push
if errorlevel 1 goto erro

echo.
echo ============================================================
echo  RELEASE v%VER% enviado. Agora o GitHub faz o resto:
echo   - SITE: Cloudflare builda e publica sozinho.
echo   - APK:  o Action builda e publica a Release v%VER% com o app-debug.apk.
echo           Acompanhe: https://github.com/guilhermediaslucas/triade-erp/actions
echo  Em ~3-5 min o link "Baixar app" do site ja serve a v%VER%.
echo ============================================================
pause
endlocal
goto :eof

:erro
echo.
echo *** ERRO. Nada foi enviado. Leia a mensagem acima. ***
echo.
pause
endlocal
exit /b 1
