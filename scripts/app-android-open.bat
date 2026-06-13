@echo off
REM Abre o projeto Android no Android Studio (depois rode o botao Run).
setlocal
cd /d "%~dp0\..\apps\web"
call npx cap open android
endlocal
