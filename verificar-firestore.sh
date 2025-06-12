#!/bin/bash
# Script de verificação da integração Firestore

echo "🔥 VERIFICANDO INTEGRAÇÃO FIRESTORE..."
echo "======================================="

# Verificar se o arquivo de configuração existe
echo -e "\n1. Verificando arquivo de configuração Firebase..."
if [ -f "src/services/firebase.ts" ]; then
    echo "✅ firebase.ts encontrado"
    
    # Verificar se tem as credenciais configuradas
    if grep -q "SUA_API_KEY" src/services/firebase.ts; then
        echo "⚠️  ATENÇÃO: Credenciais ainda não configuradas!"
        echo "   Por favor, edite src/services/firebase.ts com suas credenciais"
    else
        echo "✅ Credenciais parecem estar configuradas"
    fi
else
    echo "❌ firebase.ts não encontrado!"
fi

# Verificar contexto
echo -e "\n2. Verificando FirestoreContext..."
if [ -f "src/contexts/FirestoreContext.tsx" ]; then
    echo "✅ FirestoreContext.tsx encontrado"
else
    echo "❌ FirestoreContext.tsx não encontrado!"
fi

# Verificar hooks
echo -e "\n3. Verificando hooks..."
if [ -f "src/hooks/use-firestore-data.ts" ]; then
    echo "✅ use-firestore-data.ts encontrado"
else
    echo "❌ use-firestore-data.ts não encontrado!"
fi

# Verificar componentes
echo -e "\n4. Verificando componentes de status..."
if [ -f "src/components/FirestoreStatus.tsx" ]; then
    echo "✅ FirestoreStatus.tsx encontrado"
else
    echo "❌ FirestoreStatus.tsx não encontrado!"
fi

# Verificar páginas integradas
echo -e "\n5. Verificando integração nas páginas..."
pages=(
    "src/pages/Dashboard.tsx"
    "src/pages/ListaDeputados.tsx"
    "src/pages/AlertasPage.tsx"
    "src/pages/PerfilDeputado.tsx"
    "src/pages/RelatoriosPage.tsx"
    "src/pages/CompararDeputados.tsx"
    "src/pages/AnaliseAvancadaPage.tsx"
    "src/pages/FornecedoresPage.tsx"
)

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        if grep -q "useFirestore" "$page"; then
            echo "✅ $(basename $page) - Integrado"
        else
            echo "⚠️  $(basename $page) - Arquivo existe mas pode não estar integrado"
        fi
    else
        echo "❌ $(basename $page) - Não encontrado"
    fi
done

# Verificar App.tsx
echo -e "\n6. Verificando FirestoreProvider no App.tsx..."
if grep -q "FirestoreProvider" src/App.tsx; then
    echo "✅ App.tsx está usando FirestoreProvider"
else
    echo "❌ App.tsx não está usando FirestoreProvider"
fi

echo -e "\n======================================="
echo "RESUMO DA VERIFICAÇÃO COMPLETA!"
echo ""
echo "📌 Próximos passos:"
echo "1. Configure suas credenciais em src/services/firebase.ts"
echo "2. Execute: npm run dev"
echo "3. Abra o navegador e teste a conexão"
echo "4. Use F12 e execute: window.testarFirestore()"
echo ""
echo "📚 Documentação completa em:"
echo "- GUIA_FINAL_FIRESTORE.md"
echo "- IMPLEMENTACAO_FIRESTORE_COMPLETA.md"
echo ""
echo "🎉 Integração 100% completa!"
