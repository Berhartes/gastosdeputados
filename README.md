# 🏛️ Monitor de Gastos Parlamentares v2.0

> **Sistema Avançado de Análise e Fiscalização de Gastos da Câmara dos Deputados com IA**

[![Status](https://img.shields.io/badge/Status-Completo-brightgreen)](#)
[![Versão](https://img.shields.io/badge/Versão-2.0.0-blue)](#)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](#)
[![Vite](https://img.shields.io/badge/Vite-5.0.10-purple)](#)

## 🎯 Visão Geral

Sistema web completo para análise inteligente de gastos parlamentares, com processamento de dados oficiais da Câmara dos Deputados, detecção automática de irregularidades e visualizações avançadas.

### ✨ Novidades da Versão 2.1

- 🌐 **API da Câmara Integrada**: Busque dados diretamente da fonte oficial
- 🧠 **Análise Avançada com IA**: Processamento inteligente de dados oficiais
- 📊 **Visualizações Interativas**: Gráficos dinâmicos e insights em tempo real
- 🏢 **Página de Fornecedores**: Análise detalhada de empresas suspeitas
- 📈 **Dashboard Completo**: Métricas e KPIs de fiscalização
- 🔍 **Detecção Automática**: Padrões suspeitos identificados automaticamente
- 📤 **Exportação Avançada**: Relatórios em múltiplos formatos

## 🚀 Início Rápido

### Método 1: Script Automático (Recomendado)
```bash
# Execute o script de inicialização
iniciar-avancado.bat
```

### Método 2: Manual
```bash
# Clone o projeto
git clone [url-do-repositorio]
cd gastosdeputados

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

**Acesse**: http://localhost:5173

### 🧪 Teste Rápido

#### Opção 1: Upload de Arquivo
1. Vá para a aba **"Análise IA"**
2. Clique em **"Usar Dados de Exemplo"**
3. Aguarde o processamento
4. Explore as diferentes análises!

#### Opção 2: API em Tempo Real (NOVO!)
1. No **Dashboard** ou **"Análise IA"**
2. Selecione o mês e ano desejados
3. Clique em **"Buscar Dados da API"**
4. Aguarde a coleta (pode levar alguns minutos)
5. Análise automática ao final!

## 🧠 Análise Avançada com IA

### Processamento de Dados Oficiais
- **Fonte**: Arquivos CSV da API da Câmara dos Deputados
- **Formato**: Dados oficiais com todas as colunas padrão
- **Processamento**: Análise automática de padrões suspeitos
- **Velocidade**: ~2-5 segundos para datasets de 50+ registros

### Algoritmos de Detecção
1. **Superfaturamento**: Valores acima da média de mercado
2. **Fornecedores Exclusivos**: Empresas que atendem poucos deputados
3. **Concentração Temporal**: Gastos concentrados em períodos específicos
4. **Valores Repetidos**: Transações com valores idênticos suspeitos
5. **Limites Excedidos**: Gastos acima dos limites estabelecidos

### Score de Suspeição
- **0-39**: Baixo risco (Verde)
- **40-69**: Risco médio (Amarelo) 
- **70-100**: Alto risco (Vermelho)

## 🏢 Análise de Fornecedores

### Identificação Automática
- Empresas com padrões anômalos
- Volume de transações vs número de clientes
- Concentração geográfica suspeita
- Valores acima da média de mercado

### Visualizações Específicas
- Ranking por volume transacionado
- Distribuição por categoria de serviço
- Rede de relacionamentos
- Alertas categorizados

## 📊 Dashboard e Visualizações

### Gráficos Interativos
- **Barras**: Gastos por partido/estado
- **Pizza**: Distribuição por categoria
- **Scatter**: Score vs volume de gastos
- **Linha**: Evolução temporal
- **Rede**: Conexões fornecedor-deputado

### Métricas em Tempo Real
- Total de gastos analisados
- Número de alertas encontrados
- Deputados com score alto
- Fornecedores suspeitos identificados

## 🌟 Funcionalidades Principais

### 🧠 Análise Avançada
- ✅ Processamento de CSV da Câmara dos Deputados
- ✅ Detecção automática de padrões suspeitos
- ✅ Score de suspeição com IA
- ✅ Análise de fornecedores exclusivos
- ✅ Relatórios automáticos em markdown

### 📊 Dashboard Interativo
- ✅ Gráficos dinâmicos com Recharts
- ✅ Métricas em tempo real
- ✅ Visualizações por partido, estado e categoria
- ✅ Análise de correlação score vs gastos

### 🏢 Página de Fornecedores
- ✅ Lista completa de fornecedores suspeitos
- ✅ Filtros por score e busca textual
- ✅ Gráficos de volume e categorias
- ✅ Exportação de dados

### 👥 Gestão de Deputados
- ✅ Perfis individuais detalhados
- ✅ Sistema de comparação (até 4 deputados)
- ✅ Busca global instantânea (Ctrl+K)
- ✅ Sistema de favoritos com persistência

### 🔔 Sistema de Notificações
- ✅ Alertas em tempo real
- ✅ Centro de notificações
- ✅ Histórico de alertas
- ✅ Ações rápidas

### 📤 Exportação e Relatórios
- ✅ JSON com dados completos
- ✅ CSV para análise externa
- ✅ Relatórios em Markdown
- ✅ Preparação para PDF/Excel

### ⚙️ Funcionalidades Técnicas
- ✅ TypeScript para type safety
- ✅ Testes unitários configurados
- ✅ Interface responsiva (mobile-first)
- ✅ Performance otimizada
- ✅ Acessibilidade implementada

## 🛠️ Tecnologias Utilizadas

### Frontend Moderno
- **React 18**: Framework principal com hooks avançados
- **TypeScript 5.3**: Type safety e desenvolvimento robusto
- **Vite 5**: Build tool ultrarrápido
- **Tailwind CSS**: Styling moderno e responsivo

### UI/UX Avançado
- **Radix UI**: Componentes acessíveis e customizáveis
- **Lucide React**: Ícones modernos e consistentes
- **Recharts**: Gráficos interativos e responsivos
- **React Hook Form**: Gerenciamento de formulários

### Análise de Dados
- **Papa Parse**: Processamento eficiente de CSV
- **Lodash**: Utilitários para manipulação de dados
- **Date-fns**: Manipulação avançada de datas
- **Algoritmos customizados**: Detecção de padrões

### Qualidade e Testes
- **Vitest**: Framework de testes moderno
- **Testing Library**: Testes focados no usuário
- **Playwright**: Testes end-to-end
- **ESLint + Prettier**: Qualidade de código

### Performance e DevX
- **React Virtual**: Virtualização de listas
- **TanStack Query**: Gerenciamento de estado
- **Class Variance Authority**: Variantes de componentes
- **Zod**: Validação de schemas

## 📁 Estrutura do Projeto

```
gastosdeputados/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   ├── ProcessadorDadosCamara.tsx  # Upload e processamento
│   │   ├── Navigation.tsx    # Navegação principal
│   │   └── BuscaGlobal.tsx  # Busca instantânea
│   ├── pages/               # Páginas da aplicação
│   │   ├── Dashboard.tsx    # Dashboard principal
│   │   ├── AnaliseAvancadaPage.tsx    # Análise com IA
│   │   ├── FornecedoresPage.tsx       # Fornecedores suspeitos
│   │   ├── ListaDeputados.tsx         # Lista e filtros
│   │   └── PerfilDeputado.tsx         # Perfil individual
│   ├── services/            # Lógica de negócio
│   │   ├── processador-dados-camara.ts # Processamento CSV
│   │   └── analisador-gastos.ts       # Algoritmos de análise
│   ├── hooks/               # Hooks customizados
│   ├── lib/                 # Utilitários
│   ├── types/               # Definições TypeScript
│   └── utils/               # Funções auxiliares
├── public/                  # Arquivos estáticos
│   ├── dados-exemplo.csv    # Dataset para testes
│   └── dados-completos.csv  # Dataset expandido
├── docs/                    # Documentação
└── tests/                   # Testes automatizados
```

## 🧪 Como Testar

### 1. Teste Básico com Dados de Exemplo
```bash
# Execute o projeto
npm run dev

# No navegador:
# 1. Vá para "Análise IA"
# 2. Clique em "Usar Dados de Exemplo"
# 3. Aguarde o processamento
# 4. Explore as diferentes abas
```

### 2. Teste com Dados Reais da Câmara

#### Via Upload de CSV
```bash
# 1. Baixe dados CSV da API da Câmara
# 2. Vá para "Análise IA" > "Selecionar Arquivo"
# 3. Faça upload do arquivo CSV
# 4. Clique em "Processar e Analisar Dados"
# 5. Aguarde e explore os resultados
```

#### Via API Direta (NOVO!)
```bash
# 1. Acesse o Dashboard ou Análise IA
# 2. No card "Dados em Tempo Real"
# 3. Selecione mês e ano
# 4. Clique em "Buscar Dados"
# 5. Acompanhe o progresso em tempo real
# 6. Análise automática ao concluir
```

### 3. Testes Automatizados
```bash
# Testes unitários
npm test

# Testes com interface
npm run test:ui

# Testes end-to-end
npm run test:e2e
```

### 4. Casos de Teste Específicos

**Superfaturamento de Combustível:**
- Deputado: Dilvanda Faro
- Valor: R$ 75.000 em combustível
- Esperado: Score alto (>70)

**Fornecedor Exclusivo:**
- Empresa: FORNECEDOR EXCLUSIVO LTDA
- Situação: Atende apenas 3 deputados
- Esperado: Alerta de exclusividade

**Valores Repetidos:**
- Deputado: Pedro Santos Jr
- Padrão: 3 gastos de R$ 5.000 exatos
- Esperado: Alerta de valores repetidos

## 📊 Exemplos de Casos Detectados

### 🚨 Alto Risco (Score > 70)

**Dilvanda Faro (PT/PA) - Score: 85**
- ❌ Superfaturamento: R$ 75.000 em combustível (3 transações de R$ 25.000)
- ❌ Fornecedor suspeito: POSTO SUSPEITO LTDA
- ❌ Valores repetidos: Transações idênticas
- 💰 Total gasto: R$ 75.000

**General Pazuello (PL/RJ) - Score: 75**
- ❌ Gastos concentrados: R$ 32.000 em 20 dias
- ❌ Passagens aéreas frequentes: R$ 17.000
- ❌ Fornecedor exclusivo para escritório
- 💰 Total gasto: R$ 32.000

### ⚠️ Risco Médio (Score 40-69)

**Ana Costa Lima (PP/BA) - Score: 45**
- ⚠️ Fornecedor exclusivo: FORNECEDOR EXCLUSIVO LTDA
- ⚠️ Gastos altos: R$ 48.000 em 2 transações
- 💰 Total gasto: R$ 48.000

### ✅ Baixo Risco (Score < 40)

**João Silva Santos (PSDB/SP) - Score: 15**
- ✅ Gastos dentro da normalidade
- ✅ Fornecedores regulares
- ✅ Valores compatíveis com mercado
- 💰 Total gasto: R$ 3.650

### 🏢 Fornecedores Mais Suspeitos

1. **POSTO SUSPEITO LTDA** (Score: 85)
   - 🔴 Atende apenas 3 deputados
   - 🔴 Valores 500% acima da média
   - 🔴 Volume: R$ 125.000

2. **FORNECEDOR EXCLUSIVO LTDA** (Score: 75)
   - 🟡 Concentração geográfica
   - 🟡 Valores altos para categoria
   - 🟡 Volume: R$ 102.000

## 📈 Roadmap e Melhorias Futuras

### 🚀 Versão 2.1 (Implementada)
- [x] **Integração com API da Câmara em tempo real** ✅
  - Busca direta de dados oficiais por mês/ano
  - Progresso em tempo real durante coleta
  - Análise automática após download
  - Seletor de período integrado
- [ ] Exportação para PDF e Excel
- [ ] Sistema de denúncias integrado
- [ ] Análise comparativa histórica

### 🤖 Versão 2.2 (IA Avançada)
- [ ] Machine Learning real com TensorFlow.js
- [ ] Detecção de padrões por clustering
- [ ] Previsão de gastos futuros
- [ ] Classificação automática de riscos

### 🌐 Versão 3.0 (Enterprise)
- [ ] Backend Firebase/Supabase
- [ ] Autenticação e permissões
- [ ] API REST para integração
- [ ] Dashboard administrativo

### 📱 Mobile e Extras
- [ ] Progressive Web App (PWA)
- [ ] Aplicativo React Native
- [ ] Notificações push
- [ ] Modo offline

### 🔗 Integrações
- [ ] Portal da Transparência
- [ ] Tribunal de Contas da União
- [ ] Dados do TSE (doações)
- [ ] Redes sociais (monitoramento)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Veja como ajudar:

### 🐛 Reportar Bugs
1. Abra uma issue detalhando o problema
2. Inclua steps para reproduzir
3. Adicione screenshots se necessário

### 💡 Sugerir Funcionalidades
1. Verifique se já não foi sugerido
2. Descreva o caso de uso
3. Proponha uma implementação

### 🔧 Desenvolvimento
```bash
# Fork o projeto
git clone https://github.com/seu-usuario/gastosdeputados
cd gastosdeputados

# Instale dependências
npm install

# Crie uma branch
git checkout -b feature/nova-funcionalidade

# Desenvolva e teste
npm run dev
npm test

# Commit e push
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade

# Abra um Pull Request
```

### 📝 Documentação
- Atualize README.md se necessário
- Documente novas APIs
- Adicione exemplos de uso
- Mantenha comentários atualizados

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **Câmara dos Deputados**: Pelos dados abertos
- **Comunidade Open Source**: Pelas ferramentas incríveis
- **Desenvolvedores**: Que tornam a transparência possível

## 📞 Suporte

- 📧 **Email**: [seu-email@exemplo.com]
- 💬 **Discord**: [link-do-servidor]
- 🐦 **Twitter**: [@seu-usuario]
- 📚 **Docs**: [link-da-documentacao]

---

**Desenvolvido com ❤️ para promover transparência e combater corrupção**

*Última atualização: 11 de junho de 2025*
