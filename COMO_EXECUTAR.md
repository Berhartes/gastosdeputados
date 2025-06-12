# 🚀 Como Executar o Projeto - Monitor de Gastos Parlamentares

## Pré-requisitos

Antes de começar, verifique se você tem instalado:

- **Node.js** versão 18 ou superior
- **NPM** (vem junto com o Node.js)
- **Git** (opcional, para clonar o repositório)

### Como verificar as versões:
```bash
node --version  # Deve mostrar v18.x.x ou superior
npm --version   # Deve mostrar 8.x.x ou superior
```

## Instalação Passo a Passo

### Opção 1: Método Rápido (Windows)

1. **Navegue até a pasta do projeto:**
   ```
   cd C:\Users\Kast Berhartes\projetos-web-berhartes\gastosdeputados
   ```

2. **Execute o script de inicialização:**
   ```
   iniciar.bat
   ```

3. O sistema abrirá automaticamente em `http://localhost:5173`

### Opção 2: Instalação Manual (Windows/Mac/Linux)

1. **Entre na pasta do projeto:**
   ```bash
   cd gastosdeputados
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:5173
   ```

## Primeiro Uso - Guia Rápido

### 1. Upload de Dados
- Na tela inicial, faça upload de um arquivo CSV
- Use o arquivo `dados-exemplo.csv` incluído para testar
- O sistema processará automaticamente

### 2. Navegue pelo Sistema
- **Dashboard**: Visão geral com estatísticas
- **Deputados**: Lista completa com filtros
- **Fornecedores**: Análise de fornecedores suspeitos
- **Alertas**: Todas as irregularidades detectadas
- **Relatórios**: Exportação de dados

### 3. Recursos Principais
- 🔍 **Busca Global**: Ctrl+K para buscar rapidamente
- ⭐ **Favoritos**: Clique na estrela nos cards
- 🤖 **IA Preditiva**: Execute análises no Dashboard
- 📥 **Exportação**: Multiple formatos disponíveis
- 🔔 **Notificações**: Alertas em tempo real

## Solução de Problemas

### Erro: "npm: comando não encontrado"
- Instale o Node.js em https://nodejs.org/

### Erro: "Porta 5173 já em uso"
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID [numero_do_pid] /F

# Mac/Linux
lsof -i :5173
kill -9 [numero_do_pid]
```

### Erro: "Falha ao instalar dependências"
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
npm install
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run dev -- --host # Compartilhar na rede local

# Build e Deploy
npm run build        # Cria versão de produção
npm run preview      # Visualiza build de produção

# Testes
npm test            # Executa testes unitários
npm run test:e2e    # Executa testes E2E
npm run test:ui     # Interface visual para testes

# Qualidade de Código
npm run lint        # Verifica problemas no código
npm run format      # Formata código automaticamente
```

## Configurações Avançadas

### Variáveis de Ambiente (.env)
```env
VITE_FIREBASE_API_KEY=sua_chave_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_dominio_aqui
VITE_FIREBASE_PROJECT_ID=seu_projeto_aqui
```

### Portas Customizadas
```bash
# Usar porta diferente
npm run dev -- --port 3000
```

### Modo de Produção
```bash
# Build otimizado
npm run build

# Servir localmente
npm run preview
```

## Estrutura do Projeto

```
gastosdeputados/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Lógica de negócio
│   ├── hooks/         # React Hooks
│   └── types/         # TypeScript types
├── public/            # Arquivos estáticos
├── dados-exemplo.csv  # Arquivo de teste
└── iniciar.bat       # Script Windows
```

## Suporte e Ajuda

### Documentação Completa
- `README.md` - Visão geral do projeto
- `DOCUMENTACAO_TECNICA.md` - Detalhes técnicos
- `NOVAS_FUNCIONALIDADES.md` - Últimas atualizações
- `COMANDOS.md` - Lista completa de comandos

### Precisa de Ajuda?
1. Verifique os logs no terminal
2. Abra o console do navegador (F12)
3. Consulte a documentação
4. Abra uma issue no GitHub

---

**Desenvolvido com 💙 para combater a corrupção nos gastos públicos**
