# 🎯 INSTRUÇÕES PARA TESTE E EXECUÇÃO

## 🚀 Como Executar o Projeto

### 1. Instalação e Execução
```bash
cd C:\Users\Kast Berhartes\projetos-web-berhartes\gastosdeputados
npm install
npm run dev
```

### 2. Acesso
- **URL**: http://localhost:5173
- **Porta**: 5173 (padrão do Vite)

## 🧪 Como Testar as Novas Funcionalidades

### 1. Análise Avançada com IA
1. Vá para a aba **"Análise IA"** no menu principal
2. Clique em **"Usar Dados de Exemplo"** para carregar dados de teste
3. Aguarde o processamento (barra de progresso)
4. Explore as diferentes abas:
   - **Visão Geral**: Métricas e gráficos principais
   - **Deputados**: Lista ordenada por score de suspeição
   - **Fornecedores**: Empresas com padrões suspeitos
   - **Padrões**: Detecção automática de irregularidades

### 2. Processamento de Dados CSV Reais
1. Na aba **"Análise IA"**
2. Clique em **"Selecionar Arquivo"**
3. Faça upload de um arquivo CSV da Câmara dos Deputados
4. Clique em **"Processar e Analisar Dados"**
5. Aguarde o processamento
6. Exporte os resultados (JSON ou relatório MD)

### 3. Página de Fornecedores
1. Vá para a aba **"Fornecedores"** no menu
2. Use os filtros para buscar por:
   - Nome ou CNPJ do fornecedor
   - Score de suspeição (Alto/Médio/Baixo)
3. Visualize gráficos de:
   - Top 10 fornecedores por volume
   - Distribuição por categoria
4. Exporte dados em JSON

## 📊 Funcionalidades Testadas

### ✅ Sistema de Análise
- [x] Processamento de CSV da Câmara
- [x] Detecção de superfaturamento
- [x] Identificação de fornecedores suspeitos
- [x] Cálculo de score de suspeição
- [x] Geração de relatórios

### ✅ Interface Avançada
- [x] Dashboard com gráficos interativos
- [x] Navegação entre diferentes análises
- [x] Filtros e busca em tempo real
- [x] Exportação de dados
- [x] Sistema de notificações

### ✅ Visualizações
- [x] Gráficos de barras (gastos por partido/UF)
- [x] Scatter plot (score vs gastos)
- [x] Gráfico de pizza (categorias)
- [x] Gráficos horizontais (ranking)

## 🎯 Casos de Teste Específicos

### Teste 1: Detecção de Superfaturamento
- **Arquivo**: dados-completos.csv
- **Caso**: Dilvanda Faro - R$ 75.000 em combustível
- **Esperado**: Score alto (>70) e alertas de superfaturamento

### Teste 2: Fornecedor Exclusivo
- **Fornecedor**: FORNECEDOR EXCLUSIVO LTDA
- **Caso**: Atende apenas 3 deputados
- **Esperado**: Score alto e alerta de exclusividade

### Teste 3: Valores Repetidos
- **Deputado**: Pedro Santos Jr
- **Caso**: 3 gastos de R$ 5.000 exatos
- **Esperado**: Alerta de valores repetidos

## 🔧 Troubleshooting

### Problema: Erro ao carregar CSV
**Solução**: Verificar se o arquivo tem:
- Separador `;` (ponto e vírgula)
- Encoding UTF-8
- Headers com nomes corretos da Câmara

### Problema: Gráficos não carregam
**Solução**: 
1. Aguardar processamento completo
2. Verificar console do navegador (F12)
3. Reprocessar dados se necessário

### Problema: Dados não aparecem
**Solução**:
1. Limpar localStorage: `localStorage.clear()`
2. Recarregar página
3. Usar "Dados de Exemplo" primeiro

## 📁 Estrutura de Arquivos Novos

```
src/
├── services/
│   └── processador-dados-camara.ts     # Processamento CSV oficial
├── components/
│   └── ProcessadorDadosCamara.tsx      # UI de upload e análise
├── pages/
│   ├── AnaliseAvancadaPage.tsx         # Página principal de análise
│   └── FornecedoresPage.tsx            # Página de fornecedores
└── public/
    ├── dados-exemplo.csv               # Dados de teste básicos
    └── dados-completos.csv             # Dataset mais completo
```

## 📈 Métricas de Performance

- **Processamento**: ~2-5 segundos para 50 registros
- **Carregamento**: <1 segundo para dados em cache
- **Gráficos**: Renderização instantânea após dados carregados

## 🎨 Recursos Visuais

### Cores por Score de Suspeição:
- **Verde/Outline**: Score < 40 (Baixo)
- **Amarelo/Secondary**: Score 40-69 (Médio)  
- **Vermelho/Destructive**: Score ≥ 70 (Alto)

### Ícones Utilizados:
- 🧠 Brain: Análise com IA
- 🏢 Building2: Fornecedores
- ⚠️ AlertTriangle: Alertas
- 📊 BarChart3: Gráficos
- 👥 Users: Deputados

## 🔄 Fluxo de Teste Completo

1. **Iniciar**: `npm run dev`
2. **Upload**: Ir para "Análise IA" → "Usar Dados de Exemplo"
3. **Aguardar**: Processamento com barra de progresso
4. **Explorar**: Navegar pelas abas (Visão Geral, Deputados, etc.)
5. **Filtrar**: Usar busca e filtros na página de Fornecedores
6. **Exportar**: Baixar relatórios e dados JSON
7. **Testar**: Upload de arquivo CSV personalizado

## ✨ Novidades Implementadas

### 🆕 Última Atualização (11/06/2025)
- ✅ Processador completo de dados da Câmara
- ✅ Página de Análise Avançada com IA
- ✅ Página dedicada de Fornecedores Suspeitos
- ✅ Gráficos interativos avançados
- ✅ Sistema de exportação de dados
- ✅ Detecção automática de padrões suspeitos
- ✅ Interface responsiva e moderna

---

**Status**: ✅ PROJETO COMPLETO E FUNCIONAL
**Versão**: 2.0.0 - Análise Avançada
**Última Atualização**: 11/06/2025
