import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, Building2, Calendar, TrendingUp, AlertTriangle, 
  FileText, Share2, Download, Users, Briefcase, MapPin,
  RefreshCw, Database
} from 'lucide-react'
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NetworkGraph } from '@/components/NetworkGraph'
// import { useDeputadoFirestore } from '@/hooks/use-firestore-data' // Comentado pois não parece estar em uso direto no componente
import { useFirestore } from '@/contexts/FirestoreContext'
import { FirestoreStatus } from '@/components/FirestoreStatus'
import { firestoreService } from '@/services/firestore-service'

interface PerfilDeputadoProps {
  deputado?: any
}

export function PerfilDeputado({ deputado }: PerfilDeputadoProps) {
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [deputadoData, setDeputadoData] = useState<any>(null)
  const [despesasDetalhadas, setDespesasDetalhadas] = useState<any[]>([])
  const [loadingDespesas, setLoadingDespesas] = useState(false)
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<string>('todos'); // 'todos' para ano completo

  const anosDisponiveis = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const mesesDisponiveis = [
    { valor: 'todos', nome: 'Ano completo' },
    { valor: '1', nome: 'Janeiro' },
    { valor: '2', nome: 'Fevereiro' },
    { valor: '3', nome: 'Março' },
    { valor: '4', nome: 'Abril' },
    { valor: '5', nome: 'Maio' },
    { valor: '6', nome: 'Junho' },
    { valor: '7', nome: 'Julho' },
    { valor: '8', nome: 'Agosto' },
    { valor: '9', nome: 'Setembro' },
    { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' },
    { valor: '12', nome: 'Dezembro' },
  ];

  const renderFornecedoresReais = () => {
    // Agrupar por fornecedor
    const fornecedoresMap: Record<string, any> = {};
    
    despesasDetalhadas.forEach((despesa: any) => {
      const fornecedor = despesa.nomeFornecedor || 'Não informado';
      const cnpj = despesa.cnpjCpfFornecedor || '';
      const valor = parseFloat(despesa.valorLiquido || despesa.valorDocumento || 0);
      
      const chave = `${fornecedor}|${cnpj}`;
      
      if (!fornecedoresMap[chave]) {
        fornecedoresMap[chave] = { 
          nome: fornecedor,
          cnpj: cnpj,
          valor: 0, 
          count: 0,
          categorias: new Set()
        };
      }
      
      fornecedoresMap[chave].valor += valor;
      fornecedoresMap[chave].count += 1;
      if (despesa.tipoDespesa) {
        fornecedoresMap[chave].categorias.add(despesa.tipoDespesa);
      }
    });
    
    // Converter para array e ordenar
    const fornecedoresOrdenados = Object.entries(fornecedoresMap)
      .map(([chave, dados]) => ({
        nome: dados.nome,
        cnpj: dados.cnpj,
        valor: dados.valor,
        transacoes: dados.count,
        categorias: Array.from(dados.categorias)
      }))
      .sort((a, b) => b.valor - a.valor); // Removido o .slice(0, 10) para mostrar todos
    
    return fornecedoresOrdenados.map((fornecedor, index) => (
      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">{fornecedor.nome}</p>
            <p className="text-xs text-muted-foreground mb-1">
              CNPJ: {fornecedor.cnpj || 'Não informado'}
            </p>
            <p className="text-sm text-muted-foreground">
              {fornecedor.transacoes} transações
            </p>
            {fornecedor.categorias.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {fornecedor.categorias.map((cat: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {cat.length > 30 ? cat.substring(0, 30) + '...' : cat}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="text-right ml-4">
            <p className="font-bold text-lg">
              R$ {fornecedor.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <Badge variant="outline" className="text-xs">
              Média: R$ {(fornecedor.valor / fornecedor.transacoes).toFixed(2)}
            </Badge>
          </div>
        </div>
      </div>
    ));
  };
  
  // Usar contexto do Firestore
  const { data: firestoreData, isConnected } = useFirestore();
  
  // Buscar despesas detalhadas do deputado
  const buscarDespesasDeputado = async (deputadoId: string, ano: number, mes: string) => {
    setLoadingDespesas(true);
    try {
      const despesas = await firestoreService.buscarDespesasDeputado(
        deputadoId,
        ano,
        mes 
      );
      setDespesasDetalhadas(despesas);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      // TODO: Adicionar toast de erro para o usuário
    } finally {
      setLoadingDespesas(false);
    }
  };

  // Efeito para definir os dados básicos do deputado
  useEffect(() => {
    if (deputado) {
      setDeputadoData({
        id: deputado.id || deputado.ideCadastro,
        nome: deputado.nome,
        partido: deputado.partido,
        uf: deputado.uf,
        foto: deputado.urlFoto || `https://www.camara.leg.br/internet/deputado/bandep/${deputado.id || deputado.ideCadastro || '220611'}.jpg`,
        mandatos: deputado.mandatos || "2023-2027",
        comissoes: deputado.comissoes || ["Comissões não informadas"],
        totalGasto: deputado.totalGasto || 0, // Adicionado fallback para totalGasto
        scoreSuspeicao: deputado.scoreSuspeicao || 0, // Adicionado fallback
        numAlertas: deputado.alertas?.length || 0,
        ranking: deputado.ranking || Math.floor(Math.random() * 513) + 1,
        email: deputado.email || `dep.${(deputado.nome || 'nome').toLowerCase().replace(/\s+/g, '.')}@camara.leg.br`,
        telefone: deputado.telefone || "(61) 3215-5XXX"
      });
    } else if (firestoreData?.analise?.deputadosAnalise?.length > 0 && !deputadoData) { 
      const primeiroDeputado = firestoreData.analise.deputadosAnalise[0];
      setDeputadoData({
        id: primeiroDeputado.id || primeiroDeputado.ideCadastro,
        nome: primeiroDeputado.nome,
        partido: primeiroDeputado.partido,
        uf: primeiroDeputado.uf,
        foto: `https://www.camara.leg.br/internet/deputado/bandep/${primeiroDeputado.id || primeiroDeputado.ideCadastro || '220611'}.jpg`,
        mandatos: "2023-2027",
        comissoes: ["Comissões não informadas"],
        totalGasto: primeiroDeputado.totalGasto || 0, // Adicionado fallback
        scoreSuspeicao: primeiroDeputado.scoreSuspeicao || 0, // Adicionado fallback
        numAlertas: primeiroDeputado.alertas?.length || 0,
        ranking: 1,
        email: `dep.${primeiroDeputado.nome.toLowerCase().replace(/\s+/g, '.')}@camara.leg.br`,
        telefone: "(61) 3215-5XXX"
      });
    }
  }, [deputado, firestoreData]);

  // Efeito para buscar despesas detalhadas quando o deputado ou filtros mudam
  useEffect(() => {
    if (deputadoData?.id) {
      buscarDespesasDeputado(deputadoData.id, anoSelecionado, mesSelecionado);
    }
  }, [deputadoData?.id, anoSelecionado, mesSelecionado]);

  if (!deputadoData) {
    return (
      <div className="flex items-center justify-center p-8">
        <FirestoreStatus loading={true} />
      </div>
    )
  }

  // Processar despesas detalhadas para gerar categorias
  const processarDespesasPorCategoria = () => {
    if (despesasDetalhadas.length === 0) {
      return deputado?.maioresCategorias?.map((cat: any) => ({
        categoria: cat.categoria,
        valor: cat.valor,
        percentual: cat.percentual
      })) || [];
    }
    
    // Agrupar despesas por tipo
    const categorias: Record<string, number> = {};
    let totalGeral = 0;
    
    despesasDetalhadas.forEach((despesa: any) => {
      const tipo = despesa.tipoDespesa || 'Outros';
      const valor = parseFloat(despesa.valorLiquido || despesa.valorDocumento || 0);
      categorias[tipo] = (categorias[tipo] || 0) + valor;
      totalGeral += valor;
    });
    
    // Converter para array e calcular percentuais
    return Object.entries(categorias)
      .map(([categoria, valor]) => ({
        categoria: categoria.substring(0, 30),
        valor,
        percentual: totalGeral > 0 ? ((valor / totalGeral) * 100).toFixed(1) : "0.0" // Evitar divisão por zero
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 7);
  };
  
  const gastosCategoria = processarDespesasPorCategoria() || deputado?.maioresCategorias?.map((cat: any) => ({
    categoria: cat.categoria,
    valor: cat.valor,
    percentual: cat.percentual
  })) || [
    { categoria: 'Passagens Aéreas', valor: 15556.95, percentual: "31.7" },
    { categoria: 'Divulgação', valor: 13000.00, percentual: "26.5" },
    { categoria: 'Manutenção de Escritório', valor: 9252.02, percentual: "18.8" },
    { categoria: 'Locação de Veículos', valor: 7244.88, percentual: "14.7" },
    { categoria: 'Combustíveis', valor: 3164.72, percentual: "6.4" },
    { categoria: 'Hospedagem', valor: 598.50, percentual: "1.2" },
    { categoria: 'Telefonia', valor: 314.27, percentual: "0.6" }
  ]

  const evolucaoMensal = [
    { mes: 'Jan', valor: (deputadoData.totalGasto || 0) * 0.9, limite: 45000 },
    { mes: 'Fev', valor: (deputadoData.totalGasto || 0) * 0.85, limite: 45000 },
    { mes: 'Mar', valor: (deputadoData.totalGasto || 0) * 0.8, limite: 45000 },
    { mes: 'Abr', valor: (deputadoData.totalGasto || 0) * 0.95, limite: 45000 },
    { mes: 'Mai', valor: (deputadoData.totalGasto || 0) * 0.88, limite: 45000 },
    { mes: 'Jun', valor: (deputadoData.totalGasto || 0) * 0.92, limite: 45000 }
  ]

  const fornecedoresPrincipais = [
    { nome: 'Correios Brasil', valor: (deputadoData.totalGasto || 0) * 0.15, transacoes: 12 },
    { nome: 'Gráfica Parlamentar', valor: (deputadoData.totalGasto || 0) * 0.12, transacoes: 8 },
    { nome: 'Locadora Veículos', valor: (deputadoData.totalGasto || 0) * 0.18, transacoes: 3 },
    { nome: 'Posto de Combustível', valor: (deputadoData.totalGasto || 0) * 0.08, transacoes: 15 }
  ]

  const comparativoPartido = [
    { categoria: 'Combustível', deputado: (deputadoData.totalGasto || 0) * 0.1, mediaPartido: 4500.00 },
    { categoria: 'Divulgação', deputado: (deputadoData.totalGasto || 0) * 0.25, mediaPartido: 8000.00 },
    { categoria: 'Escritório', deputado: (deputadoData.totalGasto || 0) * 0.2, mediaPartido: 10000.00 },
    { categoria: 'Passagens', deputado: (deputadoData.totalGasto || 0) * 0.3, mediaPartido: 12000.00 },
    { categoria: 'Veículos', deputado: (deputadoData.totalGasto || 0) * 0.15, mediaPartido: 6000.00 }
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
      fornecedores: fornecedoresPrincipais, // Idealmente seriam os fornecedoresReais
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
      {/* Status da Conexão */}
      <div className="flex justify-end mb-4">
        <FirestoreStatus 
          showConnectionStatus 
          isConnected={isConnected}
          dataSource={localStorage.getItem('fonte-dados') as 'firestore' | 'cache'}
        />
      </div>
      
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
              R$ {(deputadoData.totalGasto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {(((deputadoData.totalGasto || 0) / 45000) * 100).toFixed(1)}% do limite
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
              (deputadoData.scoreSuspeicao || 0) >= 70 ? 'text-red-600' :
              (deputadoData.scoreSuspeicao || 0) >= 40 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {deputadoData.scoreSuspeicao || 0}
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
            <div className="text-2xl font-bold">{
              despesasDetalhadas.length > 0 ? 
              Object.keys(despesasDetalhadas.reduce((acc: any, curr: any) => { acc[curr.nomeFornecedor || 'Não informado'] = true; return acc; }, {})).length :
              fornecedoresPrincipais.length
            }</div>
            <p className="text-xs text-muted-foreground">
             {despesasDetalhadas.length > 0 ? "Fornecedores no período" : "Fornecedores principais (exemplo)"}
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

      {/* Filtros de Ano e Mês */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-auto">
              <Select
                value={anoSelecionado.toString()}
                onValueChange={(value) => setAnoSelecionado(parseInt(value))}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Selecione o Ano" />
                </SelectTrigger>
                <SelectContent>
                  {anosDisponiveis.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <Select
                value={mesSelecionado}
                onValueChange={(value) => setMesSelecionado(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Selecione o Mês" />
                </SelectTrigger>
                <SelectContent>
                  {mesesDisponiveis.map((mes) => (
                    <SelectItem key={mes.valor} value={mes.valor}>
                      {mes.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com Análises Detalhadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          <TabsTrigger value="relacoes">Relações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visao-geral" className="space-y-4">
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Gastos por Categoria</CardTitle>
                  <CardDescription>Análise detalhada dos gastos ({mesSelecionado === 'todos' ? `Ano ${anoSelecionado}` : `${mesesDisponiveis.find(m => m.valor === mesSelecionado)?.nome}/${anoSelecionado}`})</CardDescription>
                </CardHeader>
                <CardContent>
                {loadingDespesas ? (
                <div className="flex items-center justify-center h-[300px]">
                    <FirestoreStatus loading={true} />
                  </div>
                ) : gastosCategoria.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={gastosCategoria}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentual, categoria }) => `${categoria}: ${percentual}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {gastosCategoria.map((entry: { categoria: string; valor: number; percentual: string }, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground h-[300px] flex items-center justify-center">
                      Não há dados de despesas para o período selecionado.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Despesas</CardTitle>
                  <CardDescription>
                    Principais categorias de gastos
                    {despesasDetalhadas.length > 0 && (
                      <span className="ml-2 text-xs">
                        ({despesasDetalhadas.length} transações no período)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingDespesas ? (
                     <div className="flex items-center justify-center h-[300px]">
                       <FirestoreStatus loading={true} />
                     </div>
                  ) : gastosCategoria.length > 0 ? (
                    <div className="space-y-4">
                      {gastosCategoria.map((item: { categoria: string; valor: number; percentual: string }, index: number) => (
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
                  ) : (
                    <p className="text-center text-muted-foreground h-[300px] flex items-center justify-center">
                      Não há dados de despesas para o período selecionado.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-4">
          <>
            {loadingDespesas ? (
              <div className="flex items-center justify-center h-[300px]">
                <FirestoreStatus loading={true} />
              </div>
            ) : despesasDetalhadas.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Fornecedores</CardTitle>
                  <CardDescription>Baseado em {despesasDetalhadas.length} transações do Firestore para {mesSelecionado === 'todos' ? `o ano ${anoSelecionado}` : `${mesesDisponiveis.find(m => m.valor === mesSelecionado)?.nome}/${anoSelecionado}`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {renderFornecedoresReais()}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Fornecedores</CardTitle>
                  <CardDescription>Empresas que mais receberam pagamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    Não há dados de fornecedores para o período selecionado.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        </TabsContent>

        <TabsContent value="evolucao" className="space-y-4">
          <>
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal de Gastos</CardTitle>
                <CardDescription>Comparação com o limite permitido (Dados de exemplo)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
          </>
        </TabsContent>

        <TabsContent value="comparativo" className="space-y-4">
          <>
            <Card>
              <CardHeader>
                <CardTitle>Comparativo com Média do Partido</CardTitle>
                <CardDescription>Gastos do deputado vs média do {deputadoData.partido} (Dados de exemplo)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
          </>
        </TabsContent>

        <TabsContent value="relacoes" className="space-y-4">
          <>
            <Card>
              <CardHeader>
                <CardTitle>Rede de Relações Políticas</CardTitle>
                <CardDescription>Conexões com outros parlamentares e grupos (Dados de exemplo)</CardDescription>
              </CardHeader>
              <CardContent>
                <NetworkGraph nodes={redesPoliticas.nodes} edges={redesPoliticas.edges} />
              </CardContent>
            </Card>
          </>
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
