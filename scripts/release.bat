@echo off
REM ============================================================
REM  TRIADE ERP - RELEASE em uma tacada:
REM    1) bump de versao + build do front + gera a APK  (via app-apk.bat)
REM    2) git add + commit + push  (sobe site/API e a versao nova)
REM    3) cria o GitHub Release com o app-debug.apk
REM       (automatico se o GitHub CLI 'gh' estiver instalado e logado;
REM        senao, mostra o passo a passo p/ criar o Release na mao)
REM  Uso: scripts\release.bat
REM ============================================================
setlocal
cd /d "%~dp0\.."

echo === [1/3] Gerando a versao (bump + build do front + APK)...
call scripts\app-apk.bat
if errorlevel 1 goto erro

REM --- Le a versao nova do apps/web/package.json ---
set "VER="
for /f "usebackq delims=" %%v in (`node -p "require('./apps/web/package.json').version"`) do set "VER=%%v"
if not defined VER ( echo *** Nao consegui ler a versao do package.json. *** & goto erro )
echo Versao: v%VER%

echo.
echo === [2/3] Commit + push (site, API e versao nova)...
git add -A
git commit -m "Release v%VER%"
git push
if errorlevel 1 goto erro

echo.
echo === [3/3] Publicando o GitHub Release v%VER%...
set "APK=apps\web\android\app\build\outputs\apk\debug\app-debug.apk"
where gh >nul 2>nul
if errorlevel 1 (
  echo.
  echo  GitHub CLI 'gh' nao encontrado. Crie o Release na mao:
  echo    1^) Abra: https://github.com/guilhermediaslucas/triade-erp/releases/new
  echo    2^) Tag: v%VER%   ^|  Titulo: Triade ERP v%VER%
  echo    3^) Anexe o arquivo: %CD%\%APK%
  echo    4^) Publique ^(marque como Latest^).
  echo  (Dica: instale o 'gh' [https://cli.github.com] p/ isso ficar automatico.)
  goto fim
)
gh release create v%VER% "%APK%" --title "Triade ERP v%VER%" --notes "Release v%VER%" --latest
if errorlevel 1 (
  echo.
  echo  *** Nao consegui criar o Release pelo 'gh' ^(logado? 'gh auth login'^). ***
  echo  Crie na mao e anexe: %CD%\%APK%
  goto fim
)
echo  Release v%VER% publicado com o app-debug.apk.
goto fim

:erro
echo.
echo *** ERRO na etapa acima. Nada foi publicado. Leia a mensagem acima. ***
echo.
pause
endlocal
exit /b 1

:fim
echo.
echo ============================================================
echo  RELEASE v%VER% CONCLUIDO.
echo   - Site: avisa "Recarregar agora" sozinho no proximo deploy.
echo   - App:  avisa "Baixar nova versao" (compara o /version com a instalada).
echo ============================================================
pause
endlocal
