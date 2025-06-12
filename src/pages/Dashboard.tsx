import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, TrendingUp, Users, AlertTriangle, Building2, Eye, Database } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ExportDialog } from '@/components/export/ExportDialog'
import { Favoritos } from '@/components/Favoritos'
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics'
import { ApiDataFetcher } from '@/components/api/ApiDataFetcher'
import { FirestoreDataFetcher } from '@/components/firestore/FirestoreDataFetcher'
import { RankingFirestore } from '@/components/firestore/RankingFirestore'

interface DashboardProps {
  onViewProfile?: () => void
}

export function Dashboard({ onViewProfile }: DashboardProps) {
  const [analiseData, setAnaliseData] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem('ultima-analise')
    if (data) {
      setAnaliseData(JSON.parse(data))
    }
  }, [])

  if (!analiseData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Análise</h2>
          <p className="text-muted-foreground">
            Comece fazendo upload de um arquivo CSV ou buscando dados diretamente da API
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma análise encontrada. Por favor, faça upload de um arquivo CSV ou busque dados da API.
            </AlertDescription>
          </Alert>

          <ApiDataFetcher onDataFetched={(data) => {
            setAnaliseData(data)
          }} />
          
          <FirestoreDataFetcher onDataFetched={(data) => {
            setAnaliseData(data)
          }} />
        </div>
        
        {/* Ranking do Firestore - sempre visível */}
        <RankingFirestore />
      </div>
    )
  }

  const { analise } = analiseData
  const { estatisticas, deputadosAnalise, fornecedoresSuspeitos, alertas } = analise

  // Preparar dados para gráficos
  const topDeputados = deputadosAnalise
    .slice(0, 10)
    .map((d: any) => ({
      nome: d.nome.split(' ').slice(0, 2).join(' '),
      nomeCompleto: d.nome,
      total: d.totalGasto,
      alertas: d.alertas.length
    }))

  const categoriaGastos = estatisticas.categoriasMaisGastos.map((c: any) => ({
    categoria: c.categoria.length > 20 ? c.categoria.substring(0, 20) + '...' : c.categoria,
    valor: c.total
  }))

  const alertasPorTipo = alertas.reduce((acc: any, alerta: any) => {
    acc[alerta.tipo] = (acc[alerta.tipo] || 0) + 1
    return acc
  }, {})

  const dadosAlertasPorTipo = Object.entries(alertasPorTipo).map(([tipo, count]) => ({
    name: tipo.replace(/_/g, ' '),
    value: count
  }))

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Análise</h2>
          <p className="text-muted-foreground">
            Análise realizada em {new Date(analiseData.data).toLocaleString('pt-BR')} 
            {analiseData.fonte === 'api' && `- Dados da API (${analiseData.arquivo})`}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportDialog data={analiseData.analise} title="Exportar Análise" />
        </div>
      </div>

      {/* Busca de dados da API */}
      {analiseData && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atualizar Dados</CardTitle>
              <CardDescription>
                Busque dados mais recentes diretamente da API oficial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiDataFetcher onDataFetched={(data) => {
                setAnaliseData(data)
              }} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ranking do Firestore - sempre visível como último item */}
      <RankingFirestore />

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(estatisticas.totalGasto / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.totalRegistros.toLocaleString()} registros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deputados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.numDeputados}</div>
            <p className="text-xs text-muted-foreground">
              Média: R$ {(estatisticas.mediaGastoPorDeputado / 1000).toFixed(1)}k
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertas.length}</div>
            <p className="text-xs text-muted-foreground">
              {alertas.filter((a: any) => a.gravidade === 'ALTA').length} de alta gravidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Suspeitos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedoresSuspeitos.length}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.numFornecedores} fornecedores totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top 10 Deputados - Maiores Gastos</CardTitle>
            <CardDescription>
              Deputados com maiores gastos totais e número de alertas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="350">
              <BarChart data={topDeputados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" name="Total Gasto" />
                <Bar dataKey="alertas" fill="#ef4444" name="Alertas" yAxisId="right" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Alertas por Tipo</CardTitle>
            <CardDescription>
              Distribuição dos tipos de alertas detectados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="350">
              <PieChart>
                <Pie
                  data={dadosAlertasPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosAlertasPorTipo.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
          <CardDescription>
            Principais categorias de despesas parlamentares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height="350">
            <BarChart data={categoriaGastos} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" angle={-30} textAnchor="end" height={120} />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Bar dataKey="valor" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top deputados com botão de perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Deputados com Maior Score de Suspeição</CardTitle>
          <CardDescription>
            Baseado em alertas e padrões suspeitos - Clique para ver o perfil completo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deputadosAnalise.slice(0, 5).map((d: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{d.nome}</p>
                  <p className="text-sm text-muted-foreground">{d.partido}-{d.uf}</p>
                  <div className="flex gap-4 text-xs">
                    <span>Total: R$ {d.totalGasto.toLocaleString('pt-BR')}</span>
                    <span>{d.alertas.length} alertas</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">{d.scoreSuspeicao}</div>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={onViewProfile}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Perfil
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deputados Favoritos */}
      {onViewProfile && (
        <Favoritos onSelectDeputado={(deputado) => {
          // Navegar para o perfil do deputado favorito
          onViewProfile()
        }} />
      )}

      {/* Análise Preditiva */}
      <PredictiveAnalytics 
        dados={analiseData}
        onPredicaoGerada={(predicoes) => {
          console.log('Predições geradas:', predicoes)
        }}
      />

      {/* Top fornecedores suspeitos */}
      <Card>
        <CardHeader>
          <CardTitle>Fornecedores Mais Suspeitos</CardTitle>
          <CardDescription>
            Fornecedores com maior índice de suspeição baseado em múltiplos fatores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fornecedoresSuspeitos.slice(0, 5).map((f: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{f.nome}</p>
                  <p className="text-sm text-muted-foreground">CNPJ: {f.cnpj}</p>
                  <div className="flex gap-4 text-xs">
                    <span>Total: R$ {f.totalRecebido.toLocaleString('pt-BR')}</span>
                    <span>Média: R$ {f.mediaTransacao.toLocaleString('pt-BR')}</span>
                    <span>Deputados: {f.deputadosAtendidos}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{f.indiceSuspeicao}</div>
                  <p className="text-xs text-muted-foreground">Índice de Suspeição</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
