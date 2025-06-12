# COMANDOS ÚTEIS - Monitor de Gastos Parlamentares

## 🚀 Desenvolvimento

### Iniciar o projeto
```bash
# Desenvolvimento
npm run dev

# Desenvolvimento com host exposto (acesso em rede local)
npm run dev -- --host

# Desenvolvimento em porta específica
npm run dev -- --port 3000
```

### Build e Preview
```bash
# Build de produção
npm run build

# Preview do build
npm run preview

# Análise do bundle
npm run build -- --analyze
```

## 🧪 Testes

### Executar testes
```bash
# Todos os testes
npm test

# Testes com UI
npm run test:ui

# Testes em modo watch
npm test -- --watch

# Cobertura
npm test -- --coverage

# Testes E2E
npm run test:e2e

# Testes E2E com UI
npm run test:e2e -- --ui
```

## 🔧 Linting e Formatação

```bash
# Verificar código
npm run lint

# Corrigir problemas automaticamente
npm run lint -- --fix

# Formatar código
npm run format

# Verificar formatação
npm run format:check
```

## 📦 Gerenciamento de Dependências

```bash
# Instalar dependência
npm install nome-do-pacote

# Instalar como dev dependency
npm install -D nome-do-pacote

# Atualizar dependências
npm update

# Verificar outdated
npm outdated

# Audit de segurança
npm audit

# Corrigir vulnerabilidades
npm audit fix
```

## 🛠️ Git Workflows

### Feature nova
```bash
git checkout -b feature/nome-da-feature
# ... fazer alterações ...
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nome-da-feature
```

### Hotfix
```bash
git checkout -b hotfix/corrige-bug-critico
# ... corrigir bug ...
git add .
git commit -m "fix: corrige bug crítico em X"
git push origin hotfix/corrige-bug-critico
```

## 🔍 Debug

### Console do navegador
```javascript
// Ver dados da análise atual
const analise = JSON.parse(localStorage.getItem('ultima-analise'))
console.table(analise.analise.deputadosAnalise)

// Ver alertas
console.table(analise.analise.alertas)

// Filtrar deputados suspeitos
const suspeitos = analise.analise.deputadosAnalise
  .filter(d => d.scoreSuspeicao > 70)
console.table(suspeitos)
```

### React DevTools
```javascript
// No console com React DevTools
$r // Componente selecionado
$r.props // Props do componente
$r.state // Estado do componente
```

## 📊 Análise de Performance

### Lighthouse
```bash
# Gerar relatório Lighthouse
npm run build
npm run preview
# Abrir Chrome DevTools > Lighthouse > Generate report
```

### Bundle Analyzer
```bash
# Analisar tamanho do bundle
npm run build -- --analyze
```

## 🚀 Deploy

### Vercel
```bash
# Deploy preview
vercel

# Deploy produção
vercel --prod
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔧 Configurações VS Code Recomendadas

### .vscode/settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

### Extensões Recomendadas
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- Auto Rename Tag
- Error Lens

## 🐛 Solução de Problemas Comuns

### Erro: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port already in use"
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>
```

### Limpar cache
```bash
# npm
npm cache clean --force

# Vite
rm -rf node_modules/.vite

# Build
rm -rf dist
```

## 📝 Snippets Úteis

### Novo Componente React
```typescript
import { FC } from 'react'
import { cn } from '@/lib/utils'

interface ComponenteProps {
  className?: string
}

export const Componente: FC<ComponenteProps> = ({ className }) => {
  return (
    <div className={cn("", className)}>
      {/* Conteúdo */}
    </div>
  )
}
```

### Hook Customizado
```typescript
import { useState, useEffect } from 'react'

export function useCustomHook() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    // Lógica
  }, [])
  
  return { data }
}
```

### Teste Unitário
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Componente } from './Componente'

describe('Componente', () => {
  it('deve renderizar corretamente', () => {
    render(<Componente />)
    expect(screen.getByText('Texto')).toBeInTheDocument()
  })
})
```

## 🔐 Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
VITE_FIREBASE_API_KEY=sua-chave-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-dominio-aqui
VITE_FIREBASE_PROJECT_ID=seu-projeto-aqui
VITE_API_URL=http://localhost:3001
```

### Produção (.env.production)
```env
VITE_FIREBASE_API_KEY=$FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
VITE_API_URL=$API_URL
```

## 📊 Métricas de Qualidade

### Cobertura de Testes Alvo
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

### Performance Alvo
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.9s
- Lighthouse Score: > 90

### Bundle Size Alvo
- Initial JS: < 200kb
- Initial CSS: < 50kb
- Largest Image: < 200kb

---

💡 **Dica**: Mantenha este arquivo aberto enquanto desenvolve para acesso rápido aos comandos!
