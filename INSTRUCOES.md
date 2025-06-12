# INSTRUÇÕES DE USO - Monitor de Gastos Parlamentares

## 🚀 Início Rápido

### Opção 1: Usando o script automático (Windows)
1. Navegue até a pasta do projeto
2. Dê duplo clique em `iniciar.bat`
3. O sistema abrirá automaticamente em http://localhost:5173

### Opção 2: Instalação manual
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

## 📁 Estrutura do Projeto

```
gastosdeputados/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Lógica de análise
│   ├── types/         # Definições TypeScript
│   ├── hooks/         # React hooks
│   ├── lib/           # Utilitários
│   └── test/          # Configuração de testes
├── e2e/               # Testes end-to-end
├── public/            # Arquivos estáticos
├── dados-exemplo.csv  # Arquivo de teste
└── iniciar.bat        # Script de início rápido
```

## 🔍 Funcionalidades Implementadas

### 1. Sistema de Análise
- ✅ Detecção de superfaturamento em combustível
- ✅ Identificação de gastos acima do limite
- ✅ Análise de fornecedores suspeitos
- ✅ Detecção de concentração temporal
- ✅ Identificação de valores repetidos

### 2. Interface de Usuário
- ✅ Upload de arquivos CSV
- ✅ Dashboard com gráficos interativos
- ✅ Sistema de alertas com filtros
- ✅ Geração de relatórios em múltiplos formatos
- ✅ **NOVO: Perfil detalhado de cada deputado**

### 3. Perfil Individual do Deputado
- **Visualização completa de gastos**: Gráfico de pizza interativo
- **Evolução temporal**: Acompanhamento mês a mês
- **Comparativo com partido**: Análise comparativa
- **Rede de relações políticas**: Visualização de conexões
- **Principais fornecedores**: Lista detalhada
- **Score de suspeição**: Indicador visual

### 4. Alertas Implementados
- **SUPERFATURAMENTO**: Gastos anormais (ex: R$ 8.500 em combustível)
- **LIMITE_EXCEDIDO**: Gastos mensais acima do permitido
- **FORNECEDOR_SUSPEITO**: Empresas atendendo poucos deputados
- **CONCENTRACAO_TEMPORAL**: Muitas transações no mesmo dia
- **VALOR_REPETIDO**: Valores idênticos com alta frequência

## 📊 Teste com Dados de Exemplo

1. Use o arquivo `dados-exemplo.csv` incluído
2. Faça upload na página inicial
3. O sistema detectará automaticamente:
   - Superfaturamento de combustível (João da Silva - R$ 8.500)
   - Fornecedor exclusivo (atende apenas 2 deputados)
   - Múltiplas transações no mesmo dia

## 🎯 Como Acessar o Perfil de um Deputado

1. **A partir do Dashboard**: 
   - Clique em "Ver Perfil" nos cards dos deputados com maior score de suspeição

2. **A partir dos Alertas**:
   - Clique em "Ver Perfil" em qualquer alerta específico de um deputado
   - Para fornecedores suspeitos, clique no nome do deputado para ver seu perfil

3. **Informações disponíveis no perfil**:
   - Foto e dados básicos
   - Estatísticas de gastos
   - Distribuição por categoria
   - Evolução mensal
   - Comparativo com média do partido
   - Rede de relações políticas
   - Lista de principais fornecedores

## 🛠️ Comandos Disponíveis

```bash
npm run dev        # Desenvolvimento
npm run build      # Build de produção
npm run test       # Testes unitários
npm run test:e2e   # Testes end-to-end
npm run lint       # Verificar código
npm run format     # Formatar código
```

## 🔐 Segurança e Privacidade

- Todos os dados são processados localmente no navegador
- Nenhuma informação é enviada para servidores externos
- Os dados permanecem apenas na sessão do navegador

## 🐛 Solução de Problemas

### Erro ao instalar dependências
```bash
# Limpar cache do npm
npm cache clean --force
npm install
```

### Porta 5173 já em uso
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Ou use outra porta
npm run dev -- --port 3000
```

### Perfil do deputado não carrega
- Verifique se fez upload de um arquivo CSV primeiro
- Certifique-se de que a análise foi concluída
- Tente recarregar a página

## 📈 Próximos Passos

1. **Integração com API da Câmara**: Buscar dados em tempo real
2. **Machine Learning**: Detecção avançada de padrões
3. **Comparação histórica**: Análise de tendências ao longo do tempo
4. **Exportação avançada**: Relatórios em PDF com gráficos
5. **Compartilhamento de perfis**: URLs únicas para cada deputado

## 🌟 Recursos Visuais

### Dashboard Principal
- Gráficos de barras com top deputados
- Pizza com distribuição de alertas
- Cards com estatísticas em tempo real

### Perfil do Deputado
- Header com gradiente e foto
- Tabs organizadas por categoria
- Gráficos interativos (Recharts)
- Rede de relações (SVG customizado)
- Cards informativos

### Página de Alertas
- Filtros dinâmicos
- Cards expandidos com detalhes
- Botões de ação contextuais
- Exportação em CSV

## 📞 Suporte

Em caso de problemas:
1. Verifique o console do navegador (F12)
2. Consulte os logs no terminal
3. Abra uma issue no repositório

---

**Desenvolvido para promover transparência e combater a corrupção nos gastos públicos.**
