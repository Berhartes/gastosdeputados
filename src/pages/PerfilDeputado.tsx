import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, Building2, Calendar, TrendingUp, AlertTriangle, 
  FileText, Share2, Download, Users, Briefcase, MapPin 
} from 'lucide-react'
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { NetworkGraph } from '@/components/NetworkGraph'

interface PerfilDeputadoProps {
  deputado?: any
}

export function PerfilDeputado({ deputado }: PerfilDeputadoProps) {
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [deputadoData, setDeputadoData] = useState<any>(null)

  useEffect(() => {
    if (deputado) {
      // Usar dados do deputado selecionado
      setDeputadoData({
        nome: deputado.nome,
        partido: deputado.partido,
        uf: deputado.uf,
        foto: `https://www.camara.leg.br/internet/deputado/bandep/220611.jpg`,
        mandatos: "2023-2027",
        comissoes: ["Saúde", "Defesa Nacional"],
        totalGasto: deputado.totalGasto,
        scoreSuspeicao: deputado.scoreSuspeicao,
        numAlertas: deputado.alertas.length,
        ranking: Math.floor(Math.random() * 513) + 1,
        email: `dep.${deputado.nome.toLowerCase().replace(/\s+/g, '.')}@camara.leg.br`,
        telefone: "(61) 3215-5XXX"
      })
    } else {
      // Dados padrão se nenhum deputado for selecionado
      setDeputadoData({
        nome: "General Pazuello",
        partido: "PL",
        uf: "RJ",
        foto: "https://www.camara.leg.br/internet/deputado/bandep/220611.jpg",
        mandatos: "2023-2027",
        comissoes: ["Saúde", "Defesa Nacional"],
        totalGasto: 49131.34,
        scoreSuspeicao: 25,
        numAlertas: 2,
        ranking: 145,
        email: "dep.generalpazuello@camara.leg.br",
        telefone: "(61) 3215-5XXX"
      })
    }
  }, [deputado])

  if (!deputadoData) {
    return <div>Carregando...</div>
  }

  // Usar as categorias do deputado se disponível
  const gastosCategoria = deputado?.maioresCategorias?.map((cat: any) => ({
    categoria: cat.categoria,
    valor: cat.valor,
    percentual: cat.percentual
  })) || [
    { categoria: 'Passagens Aéreas', valor: 15556.95, percentual: 31.7 },
    { categoria: 'Divulgação', valor: 13000.00, percentual: 26.5 },
    { categoria: 'Manutenção de Escritório', valor: 9252.02, percentual: 18.8 },
    { categoria: 'Locação de Veículos', valor: 7244.88, percentual: 14.7 },
    { categoria: 'Combustíveis', valor: 3164.72, percentual: 6.4 },
    { categoria: 'Hospedagem', valor: 598.50, percentual: 1.2 },
    { categoria: 'Telefonia', valor: 314.27, percentual: 0.6 }
  ]

  const evolucaoMensal = [
    { mes: 'Jan', valor: deputadoData.totalGasto * 0.9, limite: 45000 },
    { mes: 'Fev', valor: deputadoData.totalGasto * 0.85, limite: 45000 },
    { mes: 'Mar', valor: deputadoData.totalGasto * 0.8, limite: 45000 },
    { mes: 'Abr', valor: deputadoData.totalGasto * 0.95, limite: 45000 },
    { mes: 'Mai', valor: deputadoData.totalGasto * 0.88, limite: 45000 },
    { mes: 'Jun', valor: deputadoData.totalGasto * 0.92, limite: 45000 }
  ]

  const fornecedoresPrincipais = [
    { nome: 'Correios Brasil', valor: deputadoData.totalGasto * 0.15, transacoes: 12 },
    { nome: 'Gráfica Parlamentar', valor: deputadoData.totalGasto * 0.12, transacoes: 8 },
    { nome: 'Locadora Veículos', valor: deputadoData.totalGasto * 0.18, transacoes: 3 },
    { nome: 'Posto de Combustível', valor: deputadoData.totalGasto * 0.08, transacoes: 15 }
  ]

  const comparativoPartido = [
    { categoria: 'Combustível', deputado: deputadoData.totalGasto * 0.1, mediaPartido: 4500.00 },
    { categoria: 'Divulgação', deputado: deputadoData.totalGasto * 0.25, mediaPartido: 8000.00 },
    { categoria: 'Escritório', deputado: deputadoData.totalGasto * 0.2, mediaPartido: 10000.00 },
    { categoria: 'Passagens', deputado: deputadoData.totalGasto * 0.3, mediaPartido: 12000.00 },
    { categoria: 'Veículos', deputado: deputadoData.totalGasto * 0.15, mediaPartido: 6000.00 }
  ]

  const redesPoliticas = {
    nodes: [
      { id: 1, label: deputadoData.nome, group: 'current' },
      { id: 2, label: 'Dep. Aliado 1', group: 'strong' },
      { id: 3, label: 'Dep. Aliado 2', group: 'strong' },
      { id: 4, label: 'Líder Partido', group: 'moderate' },
      { id: 5, label: deputadoData.partido, group: 'party' },
      { id: 6, label: 'Frente Parlamentar', group: 'coalition' }
    ],
    edges: [
      { from: 1, to: 2, label: '23 projetos' },
      { from: 1, to: 3, label: '18 projetos' },
      { from: 1, to: 4, label: 'Apoio político' },
      { from: 1, to: 5, label: 'Partido' },
      { from: 1, to: 6, label: 'Membro' }
    ]
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#6B7280']

  const exportarPerfil = () => {
    const perfilData = {
      deputado: deputadoData,
      gastos: gastosCategoria,
      fornecedores: fornecedoresPrincipais,
      evolucao: evolucaoMensal
    }
    
    const blob = new Blob([JSON.stringify(perfilData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `perfil_${deputadoData.nome.replace(/\s+/g, '_')}.json`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header do Perfil */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <img 
              src={deputadoData.foto} 
              alt={deputadoData.nome}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Foto'
              }}
            />
            <div>
              <h1 className="text-3xl font-bold">{deputadoData.nome}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {deputadoData.partido}-{deputadoData.uf}
                </Badge>
                <span className="text-sm opacity-90 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {deputadoData.uf}
                </span>
                <span className="text-sm opacity-90 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Mandato: {deputadoData.mandatos}
                </span>
              </div>
              <div className="flex gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {deputadoData.comissoes.join(', ')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={exportarPerfil}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {deputadoData.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {((deputadoData.totalGasto / 45000) * 100).toFixed(1)}% do limite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Suspeição</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              deputadoData.scoreSuspeicao >= 70 ? 'text-red-600' :
              deputadoData.scoreSuspeicao >= 40 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {deputadoData.scoreSuspeicao}
            </div>
            <p className="text-xs text-muted-foreground">
              {deputadoData.numAlertas} alertas ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking de Gastos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{deputadoData.ranking}</div>
            <p className="text-xs text-muted-foreground">
              Entre 513 deputados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedoresPrincipais.length}</div>
            <p className="text-xs text-muted-foreground">
              Fornecedores principais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas do Deputado */}
      {deputado?.alertas && deputado.alertas.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertas Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deputado.alertas.slice(0, 3).map((alerta: any, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Badge variant={
                    alerta.gravidade === 'ALTA' ? 'destructive' :
                    alerta.gravidade === 'MEDIA' ? 'warning' : 'secondary'
                  }>
                    {alerta.gravidade}
                  </Badge>
                  <div>
                    <p className="font-medium">{alerta.tipo.replace(/_/g, ' ')}</p>
                    <p className="text-muted-foreground">{alerta.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs com Análises Detalhadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          <TabsTrigger value="relacoes">Relações</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Gastos por Categoria</CardTitle>
                <CardDescription>Análise detalhada dos gastos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="300">
                  <PieChart>
                    <Pie
                      data={gastosCategoria}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentual }) => `${percentual}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {gastosCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento de Despesas</CardTitle>
                <CardDescription>Principais categorias de gastos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gastosCategoria.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.categoria}</span>
                        <span>R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${item.percentual}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fornecedores */}
        <TabsContent value="fornecedores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Principais Fornecedores</CardTitle>
              <CardDescription>Empresas que mais receberam pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fornecedoresPrincipais.map((fornecedor, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{fornecedor.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {fornecedor.transacoes} transações
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          R$ {fornecedor.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Média: R$ {(fornecedor.valor / fornecedor.transacoes).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolução */}
        <TabsContent value="evolucao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal de Gastos</CardTitle>
              <CardDescription>Comparação com o limite permitido</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height="300">
                <LineChart data={evolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#3B82F6" 
                    name="Gastos"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="limite" 
                    stroke="#EF4444" 
                    name="Limite"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparativo */}
        <TabsContent value="comparativo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo com Média do Partido</CardTitle>
              <CardDescription>Gastos do deputado vs média do {deputadoData.partido}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height="300">
                <BarChart data={comparativoPartido}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  <Legend />
                  <Bar dataKey="deputado" fill="#3B82F6" name="Deputado" />
                  <Bar dataKey="mediaPartido" fill="#10B981" name="Média Partido" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relações Políticas */}
        <TabsContent value="relacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rede de Relações Políticas</CardTitle>
              <CardDescription>Conexões com outros parlamentares e grupos</CardDescription>
            </CardHeader>
            <CardContent>
              <NetworkGraph nodes={redesPoliticas.nodes} edges={redesPoliticas.edges} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{deputadoData.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{deputadoData.telefone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
