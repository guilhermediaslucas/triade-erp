@echo off
REM ============================================================
REM  TRIADE ERP - Prepara o banco de PRODUCAO (Neon)
REM  Aplica migrations + seed no banco da nuvem.
REM  Use quando subir uma versao com migration/permissao nova.
REM
REM  Rode: scripts\db-setup-prod.bat
REM  (ou de um duplo-clique no arquivo)
REM ============================================================
setlocal
cd /d "%~dp0\.."

echo == Pasta do projeto: %CD%
echo.
echo Cole abaixo a connection string do Neon (branch production).
echo IMPORTANTE: remova o trecho "&channel_binding=require" se existir.
echo Exemplo: postgresql://USUARIO:SENHA@HOST/neondb?sslmode=require
echo.
set /p DB_URL=Connection string do Neon:

if "%DB_URL%"=="" ( echo Nenhuma string informada. Abortando. & pause & exit /b 1 )

set DB_SSL=true
set NODE_ENV=production

echo.
echo == Garantindo dependencias ^(npm install^)...
call npm install
if errorlevel 1 ( echo ERRO no npm install & pause & exit /b 1 )

echo == Aplicando migrations no banco de PRODUCAO...
call npm run db:migrate --workspace @triade/api
if errorlevel 1 ( echo ERRO nas migrations & pause & exit /b 1 )

echo == Sincronizando empresa/usuario demo e permissoes...
call npm run db:seed --workspace @triade/api
if errorlevel 1 ( echo ERRO no seed & pause & exit /b 1 )

echo.
echo == Banco de PRODUCAO atualizado!
echo    As permissoes novas foram sincronizadas no perfil Administrador.
echo    Faca LOGOUT e LOGIN no site para o menu atualizar.
echo.
pause
