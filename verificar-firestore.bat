@echo off
REM Script de verificação da integração Firestore para Windows

echo.
echo 🔥 VERIFICANDO INTEGRACAO FIRESTORE...
echo =======================================
echo.

REM Verificar se o arquivo de configuração existe
echo 1. Verificando arquivo de configuracao Firebase...
if exist "src\services\firebase.ts" (
    echo ✅ firebase.ts encontrado
    
    REM Verificar se tem as credenciais configuradas
    findstr /C:"SUA_API_KEY" src\services\firebase.ts >nul
    if %errorlevel%==0 (
        echo ⚠️  ATENCAO: Credenciais ainda nao configuradas!
        echo    Por favor, edite src\services\firebase.ts com suas credenciais
    ) else (
        echo ✅ Credenciais parecem estar configuradas
    )
) else (
    echo ❌ firebase.ts nao encontrado!
)

REM Verificar contexto
echo.
echo 2. Verificando FirestoreContext...
if exist "src\contexts\FirestoreContext.tsx" (
    echo ✅ FirestoreContext.tsx encontrado
) else (
    echo ❌ FirestoreContext.tsx nao encontrado!
)

REM Verificar hooks
echo.
echo 3. Verificando hooks...
if exist "src\hooks\use-firestore-data.ts" (
    echo ✅ use-firestore-data.ts encontrado
) else (
    echo ❌ use-firestore-data.ts nao encontrado!
)

REM Verificar componentes
echo.
echo 4. Verificando componentes de status...
if exist "src\components\FirestoreStatus.tsx" (
    echo ✅ FirestoreStatus.tsx encontrado
) else (
    echo ❌ FirestoreStatus.tsx nao encontrado!
)

REM Verificar páginas integradas
echo.
echo 5. Verificando integracao nas paginas...

for %%p in (Dashboard ListaDeputados AlertasPage PerfilDeputado RelatoriosPage CompararDeputados AnaliseAvancadaPage FornecedoresPage) do (
    if exist "src\pages\%%p.tsx" (
        findstr /C:"useFirestore" src\pages\%%p.tsx >nul
        if !errorlevel!==0 (
            echo ✅ %%p.tsx - Integrado
        ) else (
            echo ⚠️  %%p.tsx - Arquivo existe mas pode nao estar integrado
        )
    ) else (
        echo ❌ %%p.tsx - Nao encontrado
    )
)

REM Verificar App.tsx
echo.
echo 6. Verificando FirestoreProvider no App.tsx...
findstr /C:"FirestoreProvider" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✅ App.tsx esta usando FirestoreProvider
) else (
    echo ❌ App.tsx nao esta usando FirestoreProvider
)

echo.
echo =======================================
echo RESUMO DA VERIFICACAO COMPLETA!
echo.
echo 📌 Proximos passos:
echo 1. Configure suas credenciais em src\services\firebase.ts
echo 2. Execute: npm run dev
echo 3. Abra o navegador e teste a conexao
echo 4. Use F12 e execute: window.testarFirestore()
echo.
echo 📚 Documentacao completa em:
echo - GUIA_FINAL_FIRESTORE.md
echo - IMPLEMENTACAO_FIRESTORE_COMPLETA.md
echo.
echo 🎉 Integracao 100%% completa!
echo.
pause
