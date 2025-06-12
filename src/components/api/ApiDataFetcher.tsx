import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, DownloadCloud, Calendar, CheckCircle2, AlertCircle, Database, Trash2 } from 'lucide-react'
import { useApiCamara } from '@/services/api-camara'
import { analisadorGastos } from '@/services/analisador-gastos'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApiCache } from '@/services/cache/api-cache'

interface ApiDataFetcherProps {
  onDataFetched?: (data: any) => void
}

export function ApiDataFetcher({ onDataFetched }: ApiDataFetcherProps) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [cacheStats, setCacheStats] = useState<any>(null)
  const { buscarGastosAtuais, buscarDespesasDeputado, buscarDeputados } = useApiCamara()
  const { getCacheStats, cleanupCache, clearCache } = useApiCache()

  // Atualizar estatísticas do cache
  useEffect(() => {
    updateCacheStats()
  }, [])

  const updateCacheStats = () => {
    const stats = getCacheStats()
    setCacheStats(stats)
  }

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ]

  const buscarDadosAPI = async () => {
    setLoading(true)
    setProgress(0)
    setStatus('Conectando à API da Câmara dos Deputados...')

    try {
      // Primeiro, buscar lista de deputados
      setStatus('Buscando lista de deputados...')
      const deputados = await buscarDeputados()
      const totalDeputados = deputados.length
      
      setStatus(`Encontrados ${totalDeputados} deputados. Iniciando busca de despesas...`)

      const todosGastos: any[] = []
      const erros: string[] = []

      // Usar método otimizado que já verifica cache
      const gastosColetados = await buscarGastosAtuais(
        (progressValue: number, statusText?: string) => {
          setProgress(progressValue)
          if (statusText) {
            setStatus(statusText)
          }
        }
      )

      // Converter para o formato esperado
      todosGastos.push(...gastosColetados)

      // Removido - agora usa buscarGastosAtuais que já faz tudo

      setStatus('Processando e analisando dados...')

      // Analisar dados coletados
      const analise = analisadorGastos.analisarGastos(todosGastos)

      // Salvar análise
      const resultadoAnalise = {
        data: new Date().toISOString(),
        arquivo: `API Câmara - ${meses.find(m => m.value === selectedMonth)?.label}/${selectedYear}`,
        fonte: 'api',
        periodo: {
          mes: selectedMonth,
          ano: selectedYear
        },
        analise,
        estatisticas: {
          totalDeputados,
          totalGastos: todosGastos.length,
          errosColeta: erros.length
        }
      }

      localStorage.setItem('ultima-analise', JSON.stringify(resultadoAnalise))

      if (onDataFetched) {
        onDataFetched(resultadoAnalise)
      }

      toast({
        title: 'Dados coletados com sucesso!',
        description: `${todosGastos.length} gastos analisados de ${totalDeputados - erros.length} deputados`,
      })

      setStatus('Análise concluída com sucesso!')
      updateCacheStats() // Atualizar estatísticas após busca

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('Erro ao buscar dados da API:', error)
      setStatus('Erro ao buscar dados')
      toast({
        title: 'Erro ao buscar dados',
        description: 'Verifique sua conexão e tente novamente',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const ultimaAnaliseAPI = localStorage.getItem('ultima-analise')
  const temAnaliseAPI = ultimaAnaliseAPI && JSON.parse(ultimaAnaliseAPI).fonte === 'api'

  const handleClearCache = () => {
    if (confirm('Tem certeza que deseja limpar todo o cache? Isso forçará o download completo dos dados na próxima busca.')) {
      clearCache()
      updateCacheStats()
      toast({
        title: 'Cache limpo',
        description: 'Todo o cache foi removido com sucesso.'
      })
    }
  }

  const handleCleanupCache = () => {
    const removed = cleanupCache()
    updateCacheStats()
    toast({
      title: 'Limpeza concluída',
      description: `${removed} entradas expiradas foram removidas do cache.`
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DownloadCloud className="h-5 w-5" />
              Dados em Tempo Real
            </CardTitle>
            <CardDescription>
              Busque dados atualizados diretamente da API oficial da Câmara dos Deputados
            </CardDescription>
          </div>
          {temAnaliseAPI && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Dados da API
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletores de período */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mês</label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meses.map(mes => (
                  <SelectItem key={mes.value} value={mes.value.toString()}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ano</label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025].map(ano => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status e progresso */}
        {loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {status}
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progress.toFixed(0)}% completo
            </p>
          </div>
        )}

        {/* Informações sobre o processo */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Este processo pode levar alguns minutos pois busca dados individuais de cada deputado.
            A API oficial tem limites de requisições, por isso o processo é feito de forma gradual.
          </AlertDescription>
        </Alert>

        {/* Botão de busca */}
        <Button 
          onClick={buscarDadosAPI} 
          disabled={loading} 
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando dados... ({progress.toFixed(0)}%)
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Buscar Dados de {meses.find(m => m.value === selectedMonth)?.label}/{selectedYear}
            </>
          )}
        </Button>

        {/* Informações adicionais */}
        <div className="pt-4 border-t space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">O que será coletado:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Dados de todos os 513 deputados federais</li>
              <li>• Despesas do período selecionado</li>
              <li>• Informações de fornecedores e valores</li>
              <li>• Documentos comprobatórios quando disponíveis</li>
            </ul>
          </div>

          {/* Estatísticas do Cache */}
          {cacheStats && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Cache Local
                </h4>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCleanupCache}
                    title="Limpar dados expirados"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearCache}
                    title="Limpar todo o cache"
                  >
                    <AlertCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• {cacheStats.totalEntries} entradas armazenadas</p>
                <p>• {(cacheStats.totalSize / 1024 / 1024).toFixed(2)} MB de dados</p>
                {cacheStats.oldestEntry && (
                  <p>• Dados mais antigos: {new Date(cacheStats.oldestEntry).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Dica:</strong> O cache acelera buscas futuras do mesmo período.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
