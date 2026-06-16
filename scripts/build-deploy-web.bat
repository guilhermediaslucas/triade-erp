@echo off
REM Build do front + commit + push, em sequencia segura (so commita se o build passar).
REM Uso: scripts\build-deploy-web.bat "mensagem do commit"
setlocal
cd /d "%~dp0.."

if "%~1"=="" (
  set "MSG=CRM: importar clientes/leads CSV-XLSX, conversao de lead, orcamento e alertas adaptativos (migration 056)"
) else (
  set "MSG=%~1"
)

echo === 1/3  npm run build -w @triade/web ===
call npm run build -w @triade/web
if errorlevel 1 (
  echo.
  echo *** BUILD FALHOU - nada foi commitado. Corrija os erros acima. ***
  exit /b 1
)

echo.
echo === 2/3  git add + commit ===
git add -A
git commit -m "%MSG%"

echo.
echo === 3/3  git push ===
git push

echo.
echo === Pronto. O Render aplica a migration 056 no boot (AUTO_MIGRATE). ===
endlocal
