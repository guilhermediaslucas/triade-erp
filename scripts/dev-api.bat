@echo off
REM ============================================================
REM  TRIADE ERP - Sobe a API em modo desenvolvimento
REM  Duplo-clique ou rode: scripts\dev-api.bat
REM  Pre-requisito: Node.js instalado (node --version deve responder).
REM ============================================================
setlocal
cd /d "%~dp0\.."

echo == Pasta do projeto: %CD%

REM Instala dependencias se ainda nao foram instaladas
if not exist "node_modules" (
  echo == Primeira execucao: instalando dependencias ^(npm install^)...
  call npm install
  if errorlevel 1 ( echo ERRO no npm install & pause & exit /b 1 )
)

echo == Subindo a API... abra http://localhost:3333/health no navegador
echo == ^(Para parar: feche esta janela ou pressione Ctrl+C^)
call npm run dev:api

pause
