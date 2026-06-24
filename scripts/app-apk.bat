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
  pause
  exit /b 1
)

REM --- Capacitor 8 exige JDK 21 p/ COMPILAR: o Gradle precisa RODAR sobre o JDK 21 ---
REM (com Java 17 da o erro "invalid source release: 21").
set "JH21="
REM 1) JDK 21 instalado (Temurin/Oracle/Microsoft)
for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do if exist "%%d\bin\java.exe" set "JH21=%%d"
for /d %%d in ("C:\Program Files\Java\jdk-21*") do if exist "%%d\bin\java.exe" set "JH21=%%d"
for /d %%d in ("C:\Program Files\Microsoft\jdk-21*") do if exist "%%d\bin\java.exe" set "JH21=%%d"
REM 2) JDK 21 baixado automaticamente pelo Gradle (Foojay), em %USERPROFILE%\.gradle\jdks
if not defined JH21 for /d %%d in ("%USERPROFILE%\.gradle\jdks\*21*") do (
  if exist "%%d\bin\java.exe" set "JH21=%%d"
  for /d %%e in ("%%d\jdk-21*") do if exist "%%e\bin\java.exe" set "JH21=%%e"
)
if defined JH21 set "JAVA_HOME=%JH21%" & goto java_ok

REM 3) Sem JDK 21: tenta o JAVA_HOME atual / o jbr do Android Studio (se for Java 17, vai falhar)
if exist "%JAVA_HOME%\bin\java.exe" goto java_ok
if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr" & goto java_ok
if exist "%LOCALAPPDATA%\Programs\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=%LOCALAPPDATA%\Programs\Android Studio\jbr" & goto java_ok
if exist "%ProgramFiles%\Android\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr" & goto java_ok
echo *** Nao encontrei um JDK 21. Instale o Temurin JDK 21 (https://adoptium.net) e rode de novo. ***
:java_ok
echo Java: %JAVA_HOME%

echo === [1/3] Recompilando o front (pega as mudancas de codigo)...
call npm run build -w @triade/web
if errorlevel 1 goto erro

echo.
echo === [2/3] Sincronizando o build com o projeto nativo...
pushd apps\web
call npx cap sync android
popd
if errorlevel 1 goto erro

echo.
echo === [3/3] Compilando o APK de teste (debug)... pode demorar alguns minutos
pushd apps\web\android
call gradlew.bat assembleDebug
popd
if errorlevel 1 goto erro

set "APK=apps\web\android\app\build\outputs\apk\debug\app-debug.apk"

REM --- Publica a APK no site: copia p/ apps\web\public\triade.apk ---
REM Assim o arquivo vai no Git e o site o serve em /triade.apk (link "Baixar app").
copy /Y "%APK%" "apps\web\public\triade.apk" >nul
if errorlevel 1 (echo *** Aviso: nao consegui copiar a APK p/ apps\web\public\triade.apk ***) else (echo APK publicada em apps\web\public\triade.apk - vai pro Git e e servida pelo site no proximo deploy.)

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

echo.
pause
goto fim

:erro
echo.
echo *** ERRO na etapa acima. Leia a mensagem em vermelho/amarelo acima. ***
echo.
pause
endlocal
exit /b 1

:fim
endlocal
