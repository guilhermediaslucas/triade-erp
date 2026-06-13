@echo off
REM ============================================================
REM  TRIADE ERP - gerar um APK de teste (sem abrir o Android Studio)
REM  Gera o arquivo .apk que voce instala direto no celular
REM  (ou compartilha por WhatsApp/Drive/e-mail).
REM  Pre-requisito: ja ter rodado scripts\app-android.bat uma vez.
REM ============================================================
setlocal
cd /d "%~dp0\.."

if not exist "apps\web\android\gradlew.bat" (
  echo *** Projeto Android nao encontrado. Rode antes: scripts\app-android.bat ***
  exit /b 1
)

echo === [1/2] Atualizando o build do front no projeto nativo...
pushd apps\web
call npx cap sync android
popd
if errorlevel 1 goto erro

echo.
echo === [2/2] Compilando o APK de teste (debug)... pode demorar alguns minutos
pushd apps\web\android
call gradlew.bat assembleDebug
popd
if errorlevel 1 goto erro

set "APK=apps\web\android\app\build\outputs\apk\debug\app-debug.apk"
echo.
echo ============================================================
echo  APK GERADO:
echo     %CD%\%APK%
echo.
echo  Como instalar no celular:
echo   - Mande esse arquivo .apk pro celular (WhatsApp, Drive, e-mail
echo     ou pelo cabo USB copiando pra pasta Downloads).
echo   - No celular, toque no arquivo e confirme a instalacao
echo     (a 1a vez o Android pede para "permitir fontes desconhecidas").
echo ============================================================
goto fim

:erro
echo.
echo *** ERRO na etapa acima. Verifique a mensagem. ***
exit /b 1

:fim
endlocal
