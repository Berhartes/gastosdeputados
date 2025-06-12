import React, { useState, useEffect } from 'react'
import { Building2, AlertTriangle, Search, Filter, Eye, Download, TrendingUp, Users, RefreshCw, Database } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFirestore } from '@/contexts/FirestoreContext'
import { FirestoreStatus, EmptyDataPlaceholder } from '@/components/FirestoreStatus'
import { TodosFornecedores } from '@/components/firestore/TodosFornecedores'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface FornecedorSuspeito {
  nome: string
  cnpj: string
  totalTransacionado: number
  deputadosAtendidos: string[]
  scoreSuspeicao: number
  alertas: string[]
  categorias: string[]
  transacoes: number
}

export function FornecedoresPage() {
  // Integração com Firestore
  const { data: firestoreData, loading: firestoreLoading, error, refetch, isConnected } = useFirestore()
  
  const [fornecedores, setFornecedores] = useState<FornecedorSuspeito[]>([])
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState<FornecedorSuspeito[]>([])
  const [busca, setBusca] = useState('')
  const [filtroScore, setFiltroScore] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const [mostrarTodos, setMostrarTodos] = useState(false)

  useEffect(() => {
    // Carregar dados do Firestore ou localStorage
    if (firestoreData?.analise?.fornecedoresSuspeitos) {
      // Converter dados do Firestore para o formato esperado
      const fornecedoresConvertidos = firestoreData.analise.fornecedoresSuspeitos.map((forn: any) => ({
        nome: forn.nome,
        cnpj: forn.cnpj,
        totalTransacionado: forn.totalRecebido,
        deputadosAtendidos: forn.deputadosNomes || [],
        scoreSuspeicao: forn.indiceSuspeicao,
        alertas: forn.razoesSuspeita || [],
        categorias: forn.categorias || ['Não especificado'],
        transacoes: forn.numTransacoes || 0
      }))
      setFornecedores(fornecedoresConvertidos)
      setLoading(false)
    } else {
      carregarFornecedores()
    }
  }, [firestoreData])

  useEffect(() => {
    // Aplicar filtros
    let resultado = fornecedores

    // Filtro de busca
    if (busca) {
      resultado = resultado.filter(f => 
        f.nome.toLowerCase().includes(busca.toLowerCase()) ||
        f.cnpj.includes(busca) ||
        f.deputadosAtendidos.some(d => d.toLowerCase().includes(busca.toLowerCase()))
      )
    }

    // Filtro de score
    switch (filtroScore) {
      case 'alto':
        resultado = resultado.filter(f => f.scoreSuspeicao >= 70)
        break
      case 'medio':
        resultado = resultado.filter(f => f.scoreSuspeicao >= 40 && f.scoreSuspeicao < 70)
        break
      case 'baixo':
        resultado = resultado.filter(f => f.scoreSuspeicao < 40)
        break
    }

    setFornecedoresFiltrados(resultado)
  }, [fornecedores, busca, filtroScore])

  const carregarFornecedores = async () => {
    setLoading(true)
    try {
      // Tentar carregar dados processados do localStorage
      const dadosSalvos = localStorage.getItem('dadosAnaliseCamara')
      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos)
        if (dados.fornecedores && dados.fornecedores.length > 0) {
          setFornecedores(dados.fornecedores)
          setLoading(false)
          return
        }
      }

      // Dados de exemplo caso não tenha dados processados
      const fornecedoresExemplo: FornecedorSuspeito[] = [
        {
          nome: "POSTO SUSPEITO LTDA",
          cnpj: "12.345.678/0001-90",
          totalTransacionado: 125000,
          deputadosAtendidos: ["Dilvanda Faro", "Maria Fernanda", "Eduardo Costa"],
          scoreSuspeicao: 85,
          alertas: [
            "Valores muito altos para combustível",
            "Atende poucos deputados",
            "Transações repetitivas"
          ],
          categorias: ["COMBUSTÍVEIS E LUBRIFICANTES"],
          transacoes: 15
        },
        {
          nome: "FORNECEDOR EXCLUSIVO LTDA",
          cnpj: "11.111.111/0001-11",
          totalTransacionado: 102000,
          deputadosAtendidos: ["General Pazuello", "Ana Costa Lima", "Claudia Mendes"],
          scoreSuspeicao: 75,
          alertas: [
            "Atende apenas 3 deputados",
            "Valores altos concentrados",
            "Categoria específica"
          ],
          categorias: ["MANUTENÇÃO DE ESCRITÓRIO DE APOIO À ATIVIDADE PARLAMENTAR"],
          transacoes: 8
        },
        {
          nome: "CIA AÉREA PREMIUM",
          cnpj: "22.222.222/0001-22",
          totalTransacionado: 45700,
          deputadosAtendidos: ["General Pazuello", "Claudia Mendes", "Helena Santos"],
          scoreSuspeicao: 60,
          alertas: [
            "Preços acima da média do mercado",
            "Concentração em poucos clientes"
          ],
          categorias: ["PASSAGENS AÉREAS"],
          transacoes: 6
        },
        {
          nome: "GRÁFICA STANDARD LTDA",
          cnpj: "66.666.666/0001-66",
          totalTransacionado: 28900,
          deputadosAtendidos: ["Pedro Santos Jr", "Luis Carlos Pereira", "Eduardo Costa", "Gustavo Lima", "Sergio Ribeiro"],
          scoreSuspeicao: 35,
          alertas: [
            "Valores repetidos frequentes"
          ],
          categorias: ["DIVULGAÇÃO DA ATIVIDADE PARLAMENTAR"],
          transacoes: 12
        },
        {
          nome: "MÓVEIS PREMIUM LTDA",
          cnpj: "88.888.888/0001-88",
          totalTransacionado: 73000,
          deputadosAtendidos: ["Maria Fernanda", "Patricia Silva", "Helena Santos", "Viviane Costa"],
          scoreSuspeicao: 45,
          alertas: [
            "Valores altos para categoria",
            "Concentração geográfica"
          ],
          categorias: ["MANUTENÇÃO DE ESCRITÓRIO DE APOIO À ATIVIDADE PARLAMENTAR"],
          transacoes: 8
        },
        {
          nome: "POSTO REGULAR SA",
          cnpj: "33.333.333/0001-33",
          totalTransacionado: 8420,
          deputadosAtendidos: ["João Silva Santos", "Carlos Ferreira", "Roberto Lima Silva", "Ricardo Santos", "Luis Carlos Pereira", "Marcos Antonio", "Gustavo Lima", "Rafael Moreira", "Sergio Ribeiro"],
          scoreSuspeicao: 15,
          alertas: [],
          categorias: ["COMBUSTÍVEIS E LUBRIFICANTES"],
          transacoes: 18
        }
      ]

      setFornecedores(fornecedoresExemplo)
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportarFornecedores = () => {
    const dadosExport = {
      fornecedores: fornecedoresFiltrados,
      estatisticas: {
        totalFornecedores: fornecedoresFiltrados.length,
        fornecedoresSuspeitos: fornecedoresFiltrados.filter(f => f.scoreSuspeicao >= 50).length,
        volumeTotal: fornecedoresFiltrados.reduce((sum, f) => sum + f.totalTransacionado, 0)
      },
      geradoEm: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(dadosExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fornecedores-suspeitos-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Preparar dados para gráficos
  const dadosGraficoTop = fornecedoresFiltrados
    .sort((a, b) => b.totalTransacionado - a.totalTransacionado)
    .slice(0, 10)
    .map(f => ({
      nome: f.nome.length > 20 ? f.nome.substring(0, 20) + '...' : f.nome,
      valor: f.totalTransacionado,
      score: f.scoreSuspeicao
    }))

  const dadosGraficoCategorias = fornecedoresFiltrados.reduce((acc, f) => {
    f.categorias.forEach(cat => {
      const categoria = cat.length > 30 ? cat.substring(0, 30) + '...' : cat
      acc[categoria] = (acc[categoria] || 0) + f.totalTransacionado
    })
    return acc
  }, {} as Record<string, number>)

  const dadosPieCategoria = Object.entries(dadosGraficoCategorias)
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8)

  const cores = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#87ceeb', '#ffa500']

  // Estatísticas
  const estatisticas = {
    total: fornecedoresFiltrados.length,
    suspeitos: fornecedoresFiltrados.filter(f => f.scoreSuspeicao >= 50).length,
    volumeTotal: fornecedoresFiltrados.reduce((sum, f) => sum + f.totalTransacionado, 0),
    mediaScore: fornecedoresFiltrados.length > 0 
      ? Math.round(fornecedoresFiltrados.reduce((sum, f) => sum + f.scoreSuspeicao, 0) / fornecedoresFiltrados.length)
      : 0
  }

  if (loading || firestoreLoading) {
    return <FirestoreStatus loading={true} />
  }

  if (error) {
    return <FirestoreStatus error={error} onRetry={refetch} />
  }

  if (fornecedores.length === 0 && !firestoreData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Fornecedores Suspeitos
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de empresas com padrões suspeitos identificados
          </p>
        </div>
        <EmptyDataPlaceholder 
          message="Nenhum fornecedor encontrado"
          actionLabel="Buscar dados do Firestore"
          onAction={refetch}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Fornecedores Suspeitos
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de empresas com padrões suspeitos identificados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FirestoreStatus 
            showConnectionStatus 
            isConnected={isConnected}
            dataSource={localStorage.getItem('fonte-dados') as 'firestore' | 'cache'}
          />
          <Button 
            onClick={refetch} 
            variant="outline" 
            size="sm"
            disabled={firestoreLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportarFornecedores} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-blue-600">{estatisticas.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspeitos</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.suspeitos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volume Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(estatisticas.volumeTotal / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas.mediaScore}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opção de Visualização */}
      <Card>
        <CardHeader>
          <CardTitle>Modo de Visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={!mostrarTodos ? "default" : "outline"}
              onClick={() => setMostrarTodos(false)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Apenas Suspeitos ({fornecedores.filter(f => f.indiceSuspeicao > 0).length})
            </Button>
            <Button
              variant={mostrarTodos ? "default" : "outline"}
              onClick={() => setMostrarTodos(true)}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Todos os Fornecedores
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mostrar Todos os Fornecedores se selecionado */}
      {mostrarTodos ? (
        <TodosFornecedores 
          ano={new Date().getFullYear()}
          mes="todos"
        />
      ) : (
        <>
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Buscar por nome, CNPJ ou deputado..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filtroScore} onValueChange={setFiltroScore}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os scores</SelectItem>
                    <SelectItem value="alto">Score Alto (≥70)</SelectItem>
                    <SelectItem value="medio">Score Médio (40-69)</SelectItem>
                    <SelectItem value="baixo">Score Baixo ({'<'}40)</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="flex items-center">
                  {fornecedoresFiltrados.length} resultado(s)
                </Badge>
              </div>
            </CardContent>
          </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Fornecedores */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Volume Transacionado</CardTitle>
            <CardDescription>Fornecedores com maior volume de negócios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficoTop} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <YAxis dataKey="nome" type="category" width={120} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Volume']}
                  labelFormatter={(label) => `Fornecedor: ${label}`}
                />
                <Bar dataKey="valor" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>Volume transacionado por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPieCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, percent }) => `${categoria.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {dadosPieCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Volume']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
          <CardDescription>
            {fornecedoresFiltrados.length} fornecedor(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fornecedoresFiltrados.map((fornecedor, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{fornecedor.nome}</h3>
                      <Badge 
                        variant={
                          fornecedor.scoreSuspeicao >= 70 ? 'destructive' : 
                          fornecedor.scoreSuspeicao >= 40 ? 'secondary' : 'outline'
                        }
                      >
                        Score: {fornecedor.scoreSuspeicao}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>CNPJ:</strong> {fornecedor.cnpj}</p>
                        <p><strong>Volume Total:</strong> R$ {fornecedor.totalTransacionado.toLocaleString('pt-BR')}</p>
                        <p><strong>Transações:</strong> {fornecedor.transacoes || 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Deputados Atendidos:</strong> {fornecedor.deputadosAtendidos.length}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {fornecedor.deputadosAtendidos.length > 0 ? (
                            fornecedor.deputadosAtendidos.slice(0, 5).join(', ') + 
                            (fornecedor.deputadosAtendidos.length > 5 ? ` e mais ${fornecedor.deputadosAtendidos.length - 5}...` : '')
                          ) : (
                            'Nenhum deputado identificado'
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Categorias:</p>
                      <div className="flex flex-wrap gap-1">
                        {fornecedor.categorias.map((categoria, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {categoria.length > 25 ? categoria.substring(0, 25) + '...' : categoria}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {fornecedor.alertas.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1 text-orange-600">Alertas:</p>
                        <div className="space-y-1">
                          {fornecedor.alertas.map((alerta, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-3 w-3 text-orange-600" />
                              <span className="text-orange-600">{alerta}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {fornecedoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum fornecedor encontrado com os filtros aplicados.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setBusca('')
                  setFiltroScore('todos')
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </>
      )}
    </div>
  )
}
