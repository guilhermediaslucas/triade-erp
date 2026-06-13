@echo off
REM ============================================================
REM  TRIADE ERP - gerar o icone e a splash do app (Android)
REM  Le as imagens de apps\web\assets\ e gera todos os tamanhos.
REM  Rode DEPOIS de ja ter o projeto android (app-android.bat).
REM ============================================================
setlocal
cd /d "%~dp0\..\apps\web"

if not exist "assets\icon.png" (
  echo *** Faltando: apps\web\assets\icon.png ***
  echo Coloque a logo quadrada 1024x1024 px nesse caminho e rode de novo.
  echo Veja apps\web\assets\LEIA-ME.txt para os detalhes.
  exit /b 1
)

echo === Gerando icones e splash a partir de assets\ ...
call npx @capacitor/assets generate --android
if errorlevel 1 goto erro

echo.
echo === Sincronizando com o projeto Android ...
call npx cap sync android
if errorlevel 1 goto erro

echo.
echo ============================================================
echo  PRONTO. Abra no Android Studio e aperte Run para ver o
echo  novo icone no celular:  scripts\app-android-open.bat
echo ============================================================
goto fim

:erro
echo.
echo *** ERRO na etapa acima. Verifique a mensagem. ***
exit /b 1

:fim
endlocal
