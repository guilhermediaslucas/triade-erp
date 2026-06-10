@echo off
REM ============================================================
REM  TRIADE ERP - Setup inicial do Git + primeiro push
REM  Rode este arquivo a partir da pasta do projeto (duplo-clique
REM  ou: cd %USERPROFILE%\Desktop\ERP_TRIADE  e  scripts\setup-git.bat)
REM  Pre-requisitos: Git for Windows instalado.
REM ============================================================
setlocal
cd /d "%~dp0\.."

echo == Pasta do projeto: %CD%

REM --- Remove qualquer .git quebrado de tentativa anterior ---
if exist ".git" (
  echo == Removendo .git existente...
  rmdir /s /q ".git"
)

REM --- Identidade (ajuste se quiser outro nome/email) ---
git config --global user.name  "Guilherme Dias Lucas"
git config --global user.email "guilherme.dias.lucas@gmail.com"

REM --- Inicializa o repositorio ---
git init -b main
if errorlevel 1 ( echo ERRO no git init & pause & exit /b 1 )

REM --- Primeiro commit ---
git add -A
git commit -m "Estado inicial: planejamento + mockup TRIADE ERP"
if errorlevel 1 ( echo ERRO no commit & pause & exit /b 1 )

REM --- Conecta ao repositorio remoto do GitHub ---
git remote add origin https://github.com/guilhermediaslucas/triade-erp.git

REM --- Envia (vai pedir login/token do GitHub na primeira vez) ---
git push -u origin main
if errorlevel 1 (
  echo.
  echo ====================================================
  echo  O push falhou. Causas comuns:
  echo   - Repositorio remoto nao existe ainda: crie um repo
  echo     VAZIO em github.com/new com o nome "triade-erp"
  echo     ^(sem README/.gitignore para nao dar conflito^).
  echo   - Autenticacao: use seu usuario + Personal Access
  echo     Token ^(GitHub nao aceita mais senha^).
  echo ====================================================
  pause
  exit /b 1
)

echo.
echo == Pronto! Codigo enviado para o GitHub.
pause
