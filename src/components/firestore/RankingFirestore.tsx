import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trophy, TrendingUp, AlertCircle, Eye, Loader2 } from 'lucide-react'
import { firestoreService } from '@/services/firestore-service'

interface RankingItem {
  id: string
  nome: string
  partido: string
  uf: string
  valorTotal: number
  foto?: string
}

export function RankingFirestore() {
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [ano, setAno] = useState(new Date().getFullYear())
  const [mes, setMes] = useState<string>('todos')
  const [tipoDespesa, setTipoDespesa] = useState<string>('todos_tipos')
  const [uf, setUf] = useState<string>('todos_estados')
  // const [limite, setLimite] = useState(10) // Limite removido

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const meses = [
    { value: 'todos', label: 'Ano completo' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })
    }))
  ]

  const tiposDespesa = [
    { value: 'todos_tipos', label: 'Todos os tipos' },
    { value: 'COMBUSTÍVEIS E LUBRIFICANTES.', label: 'Combustíveis' },
    { value: 'PASSAGEM AÉREA - SIGEPA', label: 'Passagens Aéreas' },
    { value: 'DIVULGAÇÃO DA ATIVIDADE PARLAMENTAR.', label: 'Divulgação' },
    { value: 'LOCAÇÃO OU FRETAMENTO DE VEÍCULOS AUTOMOTORES', label: 'Locação de Veículos' },
    { value: 'MANUTENÇÃO DE ESCRITÓRIO DE APOIO À ATIVIDADE PARLAMENTAR', label: 'Manutenção de Escritório' },
    { value: 'TELEFONIA', label: 'Telefonia' },
    { value: 'SERVIÇOS POSTAIS', label: 'Serviços Postais' },
    { value: 'SERVIÇOS DE SEGURANÇA PRIVADA', label: 'Segurança Privada' }
  ]

  const estados = [
    { value: 'todos_estados', label: 'Todos os estados' },
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ].map(uf => (typeof uf === 'string' ? { value: uf, label: uf } : uf))

  const carregarRanking = async () => {
    setLoading(true)
    setError(null)

    try {
      const dados = await firestoreService.buscarRankingDespesas({
        ano,
        mes: mes === 'todos' ? 'todos' : parseInt(mes),
        tipoDespesa: tipoDespesa === 'todos_tipos' ? undefined : tipoDespesa || undefined,
        uf: uf === 'todos_estados' ? undefined : uf || undefined,
        // limite // Limite removido da chamada
      })

      setRanking(dados)
      
      if (dados.length === 0) {
        setError('Nenhum dado encontrado para os filtros selecionados')
      }
    } catch (err: any) {
      console.error('Erro ao carregar ranking:', err)
      setError(err.message || 'Erro ao buscar dados do Firestore')
    } finally {
      setLoading(false)
    }
  }

  // Carregar ranking quando os filtros mudarem
  useEffect(() => {
    const timer = setTimeout(() => {
      carregarRanking()
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timer)
  }, [ano, mes, tipoDespesa, uf]) // limite removido das dependências do useEffect

  const getScoreSuspeicao = (valor: number): number => {
    // Calcular score baseado no valor
    if (valor > 100000) return 85
    if (valor > 50000) return 60
    if (valor > 30000) return 40
    if (valor > 20000) return 25
    return 10
  }

  const getBadgeVariant = (posicao: number): "default" | "secondary" | "outline" => {
    if (posicao === 1) return "default"
    if (posicao <= 3) return "secondary"
    return "outline"
  }

  const getPosicaoIcon = (posicao: number) => {
    if (posicao === 1) return "🥇"
    if (posicao === 2) return "🥈"
    if (posicao === 3) return "🥉"
    return `${posicao}º`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Ranking de Gastos - Firestore
            </CardTitle>
            <CardDescription>
              Ranking dos deputados com maiores gastos (dados em tempo real)
            </CardDescription>
          </div>
          {loading && (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select value={String(ano)} onValueChange={(v) => setAno(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map(a => (
                <SelectItem key={a} value={String(a)}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tipoDespesa} onValueChange={setTipoDespesa}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de despesa" />
            </SelectTrigger>
            <SelectContent>
              {tiposDespesa.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={uf} onValueChange={setUf}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {estados.map(e => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* O seletor de limite foi removido daqui */}
        </div>

        {/* Lista do Ranking */}
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && ranking.length > 0 && (
          <div className="space-y-3">
            {ranking.map((deputado, index) => {
              const posicao = index + 1
              const score = getScoreSuspeicao(deputado.valorTotal)
              
              return (
                <div
                  key={deputado.id}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Posição */}
                    <div className="text-2xl font-bold w-12 text-center">
                      {getPosicaoIcon(posicao)}
                    </div>

                    {/* Foto */}
                    <img
                      src={deputado.foto || `https://ui-avatars.com/api/?name=${deputado.nome.replace(/\s+/g, '+')}&background=random`}
                      alt={deputado.nome}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    {/* Informações */}
                    <div>
                      <div className="font-semibold text-gray-900">{deputado.nome}</div>
                      <div className="text-sm text-gray-500">
                        {deputado.partido} - {deputado.uf}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Score de suspeição */}
                    <div className="text-center">
                      <Badge 
                        variant={score > 70 ? "destructive" : score > 40 ? "secondary" : "outline"}
                      >
                        Score: {score}
                      </Badge>
                    </div>

                    {/* Valor total */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-700">
                        R$ {deputado.valorTotal.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mes === 'todos' ? 'Total anual' : 'Total no mês'}
                      </div>
                    </div>

                    {/* Botão de ação */}
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}

            {/* Resumo */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Resumo do Ranking</span>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Total gasto pelos {ranking.length} deputados: R${' '}
                  {ranking
                    .reduce((sum, d) => sum + d.valorTotal, 0)
                    .toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                </p>
                <p>
                  Média por deputado: R${' '}
                  {(
                    ranking.reduce((sum, d) => sum + d.valorTotal, 0) / ranking.length
                  ).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Carregando ranking...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
