@echo off
echo ========================================
echo   MONITOR DE GASTOS PARLAMENTARES v2.0
echo   Analise Avancada com IA
echo ========================================
echo.

echo [1/3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha na instalacao das dependencias
        pause
        exit /b 1
    )
) else (
    echo Dependencias ja instaladas ✓
)

echo.
echo [2/3] Verificando arquivos de dados...
if not exist "public\dados-exemplo.csv" (
    echo AVISO: Arquivo dados-exemplo.csv nao encontrado
) else (
    echo Dados de exemplo disponivel ✓
)

if not exist "public\dados-completos.csv" (
    echo AVISO: Arquivo dados-completos.csv nao encontrado
) else (
    echo Dataset completo disponivel ✓
)

echo.
echo [3/3] Iniciando servidor de desenvolvimento...
echo.
echo IMPORTANTE:
echo - O projeto sera aberto em http://localhost:5173
echo - Para testar a Analise Avancada, va para aba "Analise IA"
echo - Use "Dados de Exemplo" para um teste rapido
echo - Ou faca upload de um CSV da Camara dos Deputados
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

start "" http://localhost:5173
call npm run dev

pause
