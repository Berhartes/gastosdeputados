@echo off
echo ===============================================
echo   CONFIGURACAO DO FIREBASE - GASTOS DEPUTADOS
echo ===============================================
echo.

if exist "src\services\firebase.ts" (
    echo [AVISO] O arquivo firebase.ts ja existe!
    echo.
    set /p resposta=Deseja sobrescrever? [S/N]: 
    if /i not "%resposta%"=="S" (
        echo Operacao cancelada.
        pause
        exit /b
    )
)

echo Copiando arquivo de exemplo...
copy "src\services\firebase.ts.example" "src\services\firebase.ts" >nul

if errorlevel 1 (
    echo [ERRO] Nao foi possivel copiar o arquivo de exemplo.
    echo Verifique se o arquivo firebase.ts.example existe.
    pause
    exit /b 1
)

echo.
echo ✅ Arquivo firebase.ts criado com sucesso!
echo.
echo ===============================================
echo   PROXIMOS PASSOS:
echo ===============================================
echo.
echo 1. Abra o arquivo: src\services\firebase.ts
echo.
echo 2. Obtenha suas credenciais em:
echo    https://console.firebase.google.com
echo.
echo 3. Substitua os valores YOUR_* pelas suas credenciais:
echo    - apiKey
echo    - authDomain  
echo    - projectId
echo    - storageBucket
echo    - messagingSenderId
echo    - appId
echo.
echo 4. Salve o arquivo e execute o sistema:
echo    npm run dev
echo.
echo ===============================================
echo.
echo [INFO] O arquivo firebase.ts esta no .gitignore
echo       Suas credenciais NAO serao commitadas!
echo.
pause
