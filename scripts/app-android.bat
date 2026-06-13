@echo off
REM ============================================================
REM  TRIADE ERP - gerar/atualizar o app Android (Capacitor)
REM  Roda na sua maquina Windows (precisa do Android Studio/SDK).
REM  Uso: dar duplo-clique ou rodar "scripts\app-android.bat" na raiz.
REM ============================================================
setlocal
cd /d "%~dp0\.."

echo.
echo === [1/5] Instalando dependencias (raiz, linka workspace + plugins nativos)...
call npm install
if errorlevel 1 goto erro

echo.
echo === [2/5] Build do front (com a API de producao embutida)...
call npm run build -w @triade/web
if errorlevel 1 goto erro

echo.
echo === [3/5] Gerando/garantindo o projeto Android nativo...
if not exist "apps\web\android" (
  pushd apps\web
  call npx cap add android
  popd
  if errorlevel 1 goto erro
) else (
  echo     android/ ja existe - pulando "cap add".
)

echo.
echo === [4/5] Ajustando permissoes (camera p/ leitor de codigo de barras)...
call node scripts\cap-fix-android.mjs
if errorlevel 1 goto erro

echo.
echo === [5/5] Sincronizando o build com o projeto nativo...
pushd apps\web
call npx cap sync android
popd
if errorlevel 1 goto erro

echo.
echo ============================================================
echo  PRONTO. Para abrir no Android Studio e rodar (Run):
echo     cd apps\web ^&^& npx cap open android
echo  (ou rode: scripts\app-android-open.bat)
echo ============================================================
goto fim

:erro
echo.
echo *** ERRO na etapa acima. Verifique a mensagem e tente de novo. ***
exit /b 1

:fim
endlocal
