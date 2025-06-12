# Documentação Técnica - Monitor de Gastos Parlamentares

## Arquitetura do Sistema

### Visão Geral
O sistema segue uma arquitetura modular baseada em componentes React com TypeScript, utilizando análise de dados em tempo real no cliente.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│   Frontend      │────▶│  Análise Engine  │────▶│   Visualização  │
│   (React/TS)    │     │  (TypeScript)    │     │   (Recharts)    │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                        │                         │
         └────────────────────────┴─────────────────────────┘
                                 │
                          ┌──────▼──────┐
                          │             │
                          │  Firebase   │
                          │  (Opcional) │
                          │             │
                          └─────────────┘
```

## Estrutura de Diretórios

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Radix UI)
│   ├── DeputadoCard.tsx
│   ├── NetworkGraph.tsx
│   └── Navigation.tsx
│
├── pages/              # Páginas principais
│   ├── Dashboard.tsx
│   ├── PerfilDeputado.tsx
│   ├── ListaDeputados.tsx
│   ├── AlertasPage.tsx
│   └── RelatoriosPage.tsx
│
├── services/           # Lógica de negócio
│   ├── analisador-gastos.ts    # Engine principal
│   └── api-camara.ts           # Integração API
│
├── hooks/              # React Hooks customizados
│   ├── use-deputado-data.ts
│   ├── use-params.ts
│   └── use-toast.ts
│
├── types/              # TypeScript definitions
│   └── gastos.ts
│
├── lib/                # Utilitários
│   ├── utils.ts
│   └── firebase.ts
│
└── test/               # Configuração de testes
```

## Componentes Principais

### 1. AnalisadorGastos (Core Engine)

```typescript
class AnalisadorGastos {
  // Detectores de padrões suspeitos
  detectarSuperfaturamentoCombustivel(gastos: GastoParlamentar[]): AlertaSuspeito[]
  detectarGastosAcimaLimite(gastos: GastoParlamentar[]): AlertaSuspeito[]
  detectarFornecedoresSuspeitos(gastos: GastoParlamentar[]): AlertaSuspeito[]
  detectarConcentracaoTemporal(gastos: GastoParlamentar[]): AlertaSuspeito[]
  detectarValoresRepetidos(gastos: GastoParlamentar[]): AlertaSuspeito[]
  
  // Análise e scoring
  calcularScoreSuspeicao(alertas: AlertaSuspeito[]): number
  analisarDeputados(gastos: GastoParlamentar[], alertas: AlertaSuspeito[]): AnaliseDeputado[]
}
```

### 2. Sistema de Detecção

#### Superfaturamento em Combustível
```typescript
// Limites configuráveis
const LIMITE_COMBUSTIVEL = 1000
const LIMITE_ABASTECIMENTO_SUSPEITO = 2000

// Detecção
if (gasto.vlrLiquido > LIMITE_ABASTECIMENTO_SUSPEITO) {
  // Gerar alerta de ALTA gravidade
}
```

#### Score de Suspeição
```typescript
// Cálculo baseado em múltiplos fatores
score = 0
alertas.forEach(alerta => {
  switch (alerta.gravidade) {
    case 'ALTA': score += 30; break
    case 'MEDIA': score += 15; break
    case 'BAIXA': score += 5; break
  }
  // Bonus por tipo
  if (alerta.tipo === 'SUPERFATURAMENTO') score += 20
})
```

### 3. Visualizações

#### NetworkGraph (D3.js Alternative)
```typescript
// Implementação customizada com SVG
const NetworkGraph = ({ nodes, edges }) => {
  // Posicionamento circular dos nós
  const nodesWithPosition = nodes.map((node, index) => {
    const angle = (index * 2 * Math.PI) / nodes.length
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })
}
```

#### Gráficos Recharts
```typescript
// Configuração padrão para todos os gráficos
const defaultChartConfig = {
  margin: { top: 5, right: 30, left: 20, bottom: 5 },
  animationDuration: 1000,
  animationEasing: 'ease-out'
}
```

## Fluxo de Dados

### 1. Upload e Processamento
```
CSV Upload → Papa Parse → Validação → AnalisadorGastos → Estado Local
```

### 2. Análise em Tempo Real
```typescript
// Pipeline de análise
const pipeline = [
  validarDados,
  filtrarRegistrosValidos,
  detectarSuperfaturamento,
  detectarLimitesExcedidos,
  detectarFornecedoresSuspeitos,
  calcularScores,
  gerarRelatorio
]
```

### 3. Persistência
```typescript
// LocalStorage para sessão
localStorage.setItem('ultima-analise', JSON.stringify({
  data: new Date().toISOString(),
  arquivo: fileName,
  analise: resultados
}))

// Firebase para persistência (opcional)
await setDoc(doc(db, 'analises', userId), analiseData)
```

## Performance e Otimizações

### 1. Virtualização de Listas
```typescript
// Para grandes volumes de dados
import { useVirtual } from '@tanstack/react-virtual'

const rowVirtualizer = useVirtual({
  count: deputados.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
})
```

### 2. Memoização
```typescript
// Cálculos pesados
const deputadosOrdenados = useMemo(() => {
  return deputados.sort((a, b) => b.scoreSuspeicao - a.scoreSuspeicao)
}, [deputados])
```

### 3. Lazy Loading
```typescript
// Componentes pesados
const PerfilDeputado = lazy(() => import('./pages/PerfilDeputado'))
```

## Testes

### 1. Testes Unitários (Vitest)
```typescript
describe('AnalisadorGastos', () => {
  it('deve detectar superfaturamento em combustível', () => {
    const gastos = [criarGastoMock({ vlrLiquido: 8500 })]
    const alertas = analisador.detectarSuperfaturamento(gastos)
    expect(alertas[0].gravidade).toBe('ALTA')
  })
})
```

### 2. Testes E2E (Playwright)
```typescript
test('deve carregar perfil do deputado', async ({ page }) => {
  await page.goto('/deputados')
  await page.click('[data-testid="deputado-card"]')
  await expect(page.locator('h1')).toContainText('Perfil do Deputado')
})
```

## Segurança

### 1. Validação de Dados
```typescript
// Schema Zod para validação
const GastoParlamentarSchema = z.object({
  txNomeParlamentar: z.string(),
  vlrLiquido: z.number().positive(),
  datEmissao: z.string().datetime()
})
```

### 2. Sanitização
```typescript
// Prevenir XSS
const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input)
}
```

### 3. Rate Limiting (API)
```typescript
// Para futuras integrações
const rateLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: "minute"
})
```

## Integração com API da Câmara

### Endpoints Disponíveis
```typescript
const API_ENDPOINTS = {
  deputados: '/deputados',
  deputado: '/deputados/{id}',
  despesas: '/deputados/{id}/despesas',
  proposicoes: '/proposicoes'
}
```

### Exemplo de Uso
```typescript
const buscarDespesasAtuais = async () => {
  const deputados = await api.buscarDeputados()
  
  for (const deputado of deputados) {
    const despesas = await api.buscarDespesas(deputado.id, 2025)
    // Processar com AnalisadorGastos
  }
}
```

## Deployment

### Build de Produção
```bash
npm run build
# Otimizações aplicadas:
# - Tree shaking
# - Code splitting
# - Minificação
# - Compressão gzip
```

### Variáveis de Ambiente
```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_API_CAMARA_URL=https://dadosabertos.camara.leg.br/api/v2
```

### Deploy Vercel
```bash
vercel --prod
```

## Monitoramento

### Sentry (Erros)
```typescript
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
})
```

### Analytics
```typescript
// Eventos customizados
trackEvent('deputado_visualizado', {
  deputado_id: deputadoId,
  score_suspeicao: score
})
```

## Melhores Práticas

1. **Componentes**: Pequenos, focados, testáveis
2. **Estado**: Mínimo necessário, próximo ao uso
3. **Performance**: Lazy loading, memoização, virtualização
4. **Acessibilidade**: ARIA labels, navegação por teclado
5. **Responsividade**: Mobile-first, breakpoints consistentes

## Troubleshooting

### Problema: Memória com arquivos grandes
```typescript
// Solução: Processar em chunks
const processarEmChunks = async (dados, chunkSize = 1000) => {
  for (let i = 0; i < dados.length; i += chunkSize) {
    const chunk = dados.slice(i, i + chunkSize)
    await processar(chunk)
  }
}
```

### Problema: Lentidão na análise
```typescript
// Solução: Web Workers
const worker = new Worker('analise.worker.js')
worker.postMessage({ gastos })
worker.onmessage = (e) => {
  const { alertas } = e.data
  setAlertas(alertas)
}
```

## Contribuindo com Código

### Padrão de Commits
```
feat: adiciona comparação entre deputados
fix: corrige cálculo de score de suspeição
docs: atualiza documentação de API
test: adiciona testes para fornecedores suspeitos
```

### Pull Request Template
```markdown
## Descrição
Breve descrição da mudança

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change

## Checklist
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Sem warnings do linter
```

---

Para mais informações técnicas ou dúvidas de implementação, consulte os comentários no código ou abra uma issue no repositório.
