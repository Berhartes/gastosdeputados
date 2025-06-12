# 🌐 Integração com API da Câmara dos Deputados

## Visão Geral

A versão 2.1.0 do Monitor de Gastos Parlamentares introduz integração direta com a API oficial da Câmara dos Deputados, permitindo buscar dados atualizados em tempo real sem necessidade de download manual de arquivos CSV.

## 🚀 Como Usar

### 1. Acessando a Funcionalidade

A integração com a API está disponível em dois locais:

#### No Dashboard
- Se não houver análise: O card de busca da API aparece automaticamente
- Com análise existente: Use o card "Atualizar Dados" para buscar novos dados

#### Na Análise Avançada
- Disponível ao lado do upload de arquivo CSV
- Interface intuitiva com seletores de período

### 2. Selecionando o Período

1. **Escolha o Mês**: Selecione o mês desejado no dropdown
2. **Escolha o Ano**: Selecione o ano (2024 ou 2025)
3. **Clique em "Buscar Dados"**: Inicie o processo de coleta

### 3. Processo de Coleta

O sistema irá:
1. Conectar à API da Câmara dos Deputados
2. Buscar lista de todos os 513 deputados federais
3. Para cada deputado, buscar despesas do período selecionado
4. Mostrar progresso em tempo real (0-100%)
5. Processar e analisar os dados automaticamente
6. Salvar a análise e recarregar a página

## ⏱️ Tempo Estimado

- **Coleta completa**: 5-10 minutos
- **Por deputado**: ~50-100ms (limite da API)
- **Análise**: 2-5 segundos após coleta

## 📊 Dados Coletados

### Informações dos Deputados
- Nome completo
- Partido e UF
- ID da legislatura
- Foto e contatos

### Detalhes das Despesas
- Tipo de despesa
- Fornecedor (nome e CNPJ/CPF)
- Valores (documento, glosa, líquido)
- Data de emissão
- Documentação comprobatória

## 🔧 Detalhes Técnicos

### Arquitetura

```typescript
// Serviço principal
class ApiCamaraService {
  buscarDeputados(legislatura?: number): Promise<DeputadoAPI[]>
  buscarDespesasDeputado(id: number, ano: number, mes?: number): Promise<DespesaAPI[]>
  converterParaGastoParlamentar(despesa: DespesaAPI, deputado: DeputadoAPI): GastoParlamentar
}

// Hook para componentes
function useApiCamara() {
  return {
    buscarDeputados,
    buscarDespesasDeputado,
    buscarGastosAtuais
  }
}
```

### Rate Limiting

- Delay de 50ms entre requisições
- Proteção contra sobrecarga da API
- Tratamento de erros por deputado

### Formato de Dados

Os dados da API são automaticamente convertidos para o formato interno do sistema, mantendo compatibilidade com análises de arquivos CSV.

## ⚠️ Limitações

### Da API Oficial
- Limite de requisições por segundo
- Dados podem estar defasados em alguns dias
- Alguns campos podem estar incompletos

### Do Sistema
- Processo não pode ser pausado após iniciado
- Requer conexão estável durante toda coleta
- Máximo de dados: últimos 2 anos

## 🔍 Comparação: API vs CSV

| Aspecto | API | Upload CSV |
|---------|-----|------------|
| **Atualização** | Dados mais recentes | Depende do arquivo |
| **Velocidade** | 5-10 minutos | Instantâneo |
| **Completude** | Todos os deputados | Conforme arquivo |
| **Automação** | Total | Manual |
| **Offline** | Não | Sim |

## 💡 Dicas de Uso

### Para Melhor Performance
1. Use conexão estável e rápida
2. Evite múltiplas abas/processos simultâneos
3. Busque apenas o período necessário

### Para Análises Completas
1. Comece com período menor (1 mês)
2. Valide os dados antes de períodos maiores
3. Exporte resultados para backup

## 🐛 Solução de Problemas

### Erro de Conexão
- Verifique sua internet
- Tente novamente em alguns minutos
- API pode estar temporariamente indisponível

### Processo Travado
- Aguarde mais alguns minutos
- Se não resolver, recarregue a página
- Dados parciais não são salvos

### Dados Incompletos
- Alguns deputados podem não ter despesas no período
- Verifique o log do console para erros específicos
- Tente período diferente

## 📝 Exemplos de Código

### Uso Básico
```typescript
import { ApiDataFetcher } from '@/components/api/ApiDataFetcher'

function MeuComponente() {
  return (
    <ApiDataFetcher 
      onDataFetched={(data) => {
        console.log('Análise completa:', data)
      }}
    />
  )
}
```

### Uso Avançado
```typescript
import { useApiCamara } from '@/services/api-camara'

function AnaliseCustomizada() {
  const { buscarDespesasDeputado } = useApiCamara()
  
  const analisarDeputado = async (id: number) => {
    const despesas = await buscarDespesasDeputado(id, 2025, 6)
    // Análise customizada
    return despesas
  }
}
```

## 🔗 Links Úteis

- [API da Câmara - Documentação](https://dadosabertos.camara.leg.br/swagger/api.html)
- [Portal da Transparência](https://www.camara.leg.br/transparencia/)
- [Dados Abertos](https://dadosabertos.camara.leg.br/)

## 📈 Próximas Melhorias

- [ ] Cache local para evitar re-downloads
- [ ] Busca incremental (apenas novos dados)
- [ ] Agendamento automático de coletas
- [ ] Comparação histórica de períodos
- [ ] Notificações de novos gastos suspeitos

---

**Última atualização**: 11 de junho de 2025
