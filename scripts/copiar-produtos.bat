@echo off
REM ============================================================
REM  TRIADE ERP - Copiar o cadastro de PRODUTOS entre empresas.
REM  Pede a connection string do banco (Neon/producao, onde estao
REM  as empresas), roda em SIMULACAO e so grava se voce confirmar.
REM
REM  Ajuste os nomes abaixo se as empresas tiverem outro nome/codigo.
REM ============================================================
setlocal
cd /d "%~dp0\.."

set ORIGEM=teste
set DESTINO1=Maid
set DESTINO2=Iskins

echo == Pasta do projeto: %CD%
echo.
echo Cole a connection string do Neon (branch production), a MESMA do db-setup-prod.
echo IMPORTANTE: remova o trecho "&channel_binding=require" se existir.
echo (Deixe em branco para usar a DB_URL do arquivo .env, se houver.)
echo.
set /p DB_URL=Connection string do banco:
if not "%DB_URL%"=="" set DB_SSL=true

echo.
echo == Garantindo dependencias (npm install)...
call npm install >nul 2>&1

echo.
echo == SIMULACAO (nada sera gravado):
node scripts\copiar-produtos.mjs "%ORIGEM%" "%DESTINO1%" "%DESTINO2%"
if errorlevel 1 ( echo. & echo *** Verifique a mensagem de erro acima. & pause & exit /b 1 )

echo.
set /p CONFIRMA=Aplicar de verdade agora? Digite S para confirmar:
if /I not "%CONFIRMA%"=="S" ( echo Cancelado. Nada foi gravado. & pause & exit /b 0 )

echo.
echo == APLICANDO...
node scripts\copiar-produtos.mjs "%ORIGEM%" "%DESTINO1%" "%DESTINO2%" --aplicar
echo.
pause
endlocal
