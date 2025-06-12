@echo off
echo ===================================
echo Monitor de Gastos Parlamentares
echo ===================================
echo.

echo Verificando se o Node.js esta instalado...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js em https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado!
echo.

echo Instalando dependencias...
call npm install

if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas com sucesso!
echo.

echo Iniciando o servidor de desenvolvimento...
echo.
echo O sistema estara disponivel em: http://localhost:5173
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm run dev

pause
