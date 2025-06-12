@echo off
echo ===================================
echo Build de Producao
echo ===================================
echo.

echo Verificando se as dependencias estao instaladas...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

echo.
echo Criando build de producao...
call npm run build

if %errorlevel% neq 0 (
    echo ERRO: Falha ao criar build!
    pause
    exit /b 1
)

echo.
echo Build criado com sucesso em ./dist
echo.
echo Para visualizar a build, execute:
echo   npm run preview
echo.

pause
