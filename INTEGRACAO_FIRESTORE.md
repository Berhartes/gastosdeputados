# Integração com Firebase/Firestore - Sistema de Gastos de Deputados

## 📊 Visão Geral

O sistema agora suporta busca de dados diretamente do Firebase Firestore, permitindo acesso a dados em tempo real dos gastos parlamentares.

## 🔧 Configuração

### 1. Credenciais do Firebase

Antes de usar a integração com o Firestore, você precisa configurar suas credenciais:

1. Abra o arquivo `src/services/firebase.ts`
2. Substitua os valores de configuração pelos seus:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "a-republica-brasileira.firebaseapp.com",
  projectId: "a-republica-brasileira",
  storageBucket: "a-republica-brasileira.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 2. Estrutura de Dados no Firestore

O sistema espera a seguinte estrutura no Firestore:

```
congressoNacional/
├── camaraDeputados/
│   ├── legislatura/
│   │   └── 57/
│   │       └── deputados/
│   │           └── {deputadoId}/
│   │               ├── nome
│   │               ├── nomeCivil
│   │               ├── siglaPartido
│   │               ├── siglaUf
│   │               └── urlFoto
│   └── perfilComplementar/
│       └── {deputadoId}/
│           └── despesas/
│               └── {ano}/
│                   └── {mes}/
│                       └── all_despesas/
│                           └── despesas: []
```

## 🚀 Funcionalidades Implementadas

### 1. **FirestoreDataFetcher**
Componente para buscar dados completos do Firestore com filtros:
- Ano e mês
- Estado (UF)
- Partido
- Limite de deputados

### 2. **RankingFirestore**
Componente visual que mostra o ranking de deputados por gastos:
- Filtros dinâmicos
- Visualização em tempo real
- Cálculo automático de scores de suspeição
- Interface responsiva com medalhas para os primeiros colocados

### 3. **FirestoreService**
Serviço principal que gerencia a comunicação com o Firestore:
- `buscarDeputados()`: Lista deputados com filtros
- `buscarDespesasDeputado()`: Busca despesas de um deputado específico
- `buscarDadosCompletos()`: Busca e processa dados completos
- `buscarRankingDespesas()`: Gera ranking de gastos

## 📍 Onde Encontrar

### Componentes de UI:
- **Upload de Dados**: Página inicial com 3 opções:
  1. Upload de arquivo CSV
  2. Processar dados de exemplo
  3. **Buscar do Firestore (novo!)**

- **Dashboard**: Agora inclui:
  - Cards de estatísticas
  - Gráficos de análise
  - **Ranking Firestore em tempo real**

### Arquivos Criados:
```
src/
├── services/
│   ├── firebase.ts              # Configuração do Firebase
│   └── firestore-service.ts     # Serviço de comunicação
└── components/
    └── firestore/
        ├── FirestoreDataFetcher.tsx  # Componente de busca
        └── RankingFirestore.tsx      # Componente de ranking
```

## 🔍 Como Usar

### 1. Via Interface (Upload Page):

1. Acesse a página de Upload
2. Role até o card "Buscar Dados do Firestore"
3. Configure os filtros desejados:
   - Ano (últimos 5 anos disponíveis)
   - Mês (específico ou todos)
   - Estado (opcional)
   - Partido (opcional)
   - Limite de deputados
4. Clique em "Buscar Dados do Firestore"
5. Aguarde o processamento
6. Sistema redirecionará para o Dashboard com os dados

### 2. Via Dashboard:

O Dashboard agora exibe automaticamente:
- Ranking em tempo real do Firestore
- Opção de buscar novos dados
- Integração com análises existentes

## 📈 Vantagens da Integração

1. **Dados em Tempo Real**: Acesso direto ao banco de dados oficial
2. **Filtros Avançados**: Busque exatamente o que precisa
3. **Performance**: Limites configuráveis para evitar sobrecarga
4. **Análise Automática**: Dados são processados pelo sistema de alertas
5. **Compatibilidade**: Funciona junto com uploads CSV e API

## ⚠️ Considerações Importantes

1. **Limite de Dados**: Use limites apropriados para evitar sobrecarga
2. **Credenciais**: Mantenha suas credenciais Firebase seguras
3. **Custos**: Considere os custos de leitura do Firestore
4. **Cache**: Dados são salvos no localStorage após busca

## 🔄 Fluxo de Dados

```
Firestore → FirestoreService → Conversão para GastoParlamentar → 
AnalisadorGastos → Análise Completa → Dashboard/Visualizações
```

## 🛠️ Troubleshooting

### Erro de Autenticação:
- Verifique as credenciais em `firebase.ts`
- Confirme permissões no console do Firebase

### Dados não Aparecem:
- Verifique a estrutura de dados no Firestore
- Confirme que existem dados para o período selecionado
- Verifique o console do navegador para erros

### Performance Lenta:
- Reduza o limite de deputados
- Selecione períodos menores (mês específico)
- Use filtros de estado/partido

## 📋 Próximos Passos

1. Implementar cache inteligente
2. Adicionar paginação para grandes volumes
3. Criar modo offline
4. Implementar atualizações em tempo real (listeners)
5. Dashboard específico para dados do Firestore

---

**Versão**: 1.0.0  
**Data**: 12/06/2025  
**Status**: ✅ Operacional com configuração de credenciais
