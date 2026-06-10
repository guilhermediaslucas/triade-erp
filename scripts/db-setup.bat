@echo off
REM ============================================================
REM  TRIADE ERP - Prepara o banco (uma vez)
REM  Cria as tabelas (migrations) e o usuario demo (seed).
REM  Rode: scripts\db-setup.bat
REM ============================================================
setlocal
cd /d "%~dp0\.."

echo == Pasta do projeto: %CD%

echo == Garantindo dependencias ^(npm install^)...
call npm install
if errorlevel 1 ( echo ERRO no npm install & pause & exit /b 1 )

echo == Aplicando migrations no banco...
call npm run db:migrate --workspace @triade/api
if errorlevel 1 ( echo ERRO nas migrations & pause & exit /b 1 )

echo == Criando empresa e usuario demo...
call npm run db:seed --workspace @triade/api
if errorlevel 1 ( echo ERRO no seed & pause & exit /b 1 )

echo.
echo == Banco pronto! Dados de acesso para o login:
echo    Empresa (codigo): belle
echo    E-mail:           admin@belle.com.br
echo    Senha:            admin123
echo.
pause
