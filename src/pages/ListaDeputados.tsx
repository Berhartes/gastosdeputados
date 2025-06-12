import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeputadoCard } from '@/components/DeputadoCard'
import { Search, Filter, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdvancedSearch, FilterOptions } from '@/components/filters/AdvancedSearch'

interface ListaDeputadosProps {
  onSelectDeputado: (deputado: any) => void
}

export function ListaDeputados({ onSelectDeputado }: ListaDeputadosProps) {
  const [deputados, setDeputados] = useState<any[]>([])
  const [filteredDeputados, setFilteredDeputados] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroPartido, setFiltroPartido] = useState('TODOS')
  const [filtroUF, setFiltroUF] = useState('TODOS')
  const [ordenacao, setOrdenacao] = useState('score')

  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions | null>(null)

  useEffect(() => {
    const analiseStr = localStorage.getItem('ultima-analise')
    if (analiseStr) {
      const { analise } = JSON.parse(analiseStr)
      setDeputados(analise.deputadosAnalise || [])
      setFilteredDeputados(analise.deputadosAnalise || [])
    }
  }, [])

  useEffect(() => {
    let filtered = [...deputados]

    // Aplicar filtros avançados se existirem
    if (advancedFilters) {
      // Filtro por busca
      if (advancedFilters.searchTerm) {
        filtered = filtered.filter(d => 
          d.nome.toLowerCase().includes(advancedFilters.searchTerm.toLowerCase())
        )
      }

      // Filtro por score
      if (advancedFilters.scoreMinimo > 0) {
        filtered = filtered.filter(d => d.scoreSuspeicao >= advancedFilters.scoreMinimo)
      }

      // Filtro por estados
      if (advancedFilters.estados.length > 0) {
        filtered = filtered.filter(d => advancedFilters.estados.includes(d.uf))
      }

      // Filtro por partidos
      if (advancedFilters.partidos.length > 0) {
        filtered = filtered.filter(d => advancedFilters.partidos.includes(d.partido))
      }
    } else {
      // Usar filtros simples
      if (searchTerm) {
        filtered = filtered.filter(d => 
          d.nome.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (filtroPartido !== 'TODOS') {
        filtered = filtered.filter(d => d.partido === filtroPartido)
      }

      if (filtroUF !== 'TODOS') {
        filtered = filtered.filter(d => d.uf === filtroUF)
      }
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (ordenacao) {
        case 'score':
          return b.scoreSuspeicao - a.scoreSuspeicao
        case 'gastos':
          return b.totalGasto - a.totalGasto
        case 'alertas':
          return b.alertas.length - a.alertas.length
        case 'nome':
          return a.nome.localeCompare(b.nome)
        default:
          return 0
      }
    })

    setFilteredDeputados(filtered)
  }, [searchTerm, filtroPartido, filtroUF, ordenacao, deputados, advancedFilters])

  const partidos = ['TODOS', ...Array.from(new Set(deputados.map(d => d.partido).filter(p => p && p.trim() !== ''))).sort()]
  const estados = ['TODOS', ...Array.from(new Set(deputados.map(d => d.uf).filter(uf => uf && uf.trim() !== ''))).sort()]

  const estatisticas = {
    totalDeputados: filteredDeputados.length,
    mediaGastos: filteredDeputados.reduce((sum, d) => sum + d.totalGasto, 0) / (filteredDeputados.length || 1),
    totalAlertas: filteredDeputados.reduce((sum, d) => sum + d.alertas.length, 0),
    deputadoMaiorGasto: filteredDeputados[0]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Lista de Deputados</h2>
        <p className="text-muted-foreground">
          Explore os perfis individuais de cada deputado
        </p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{estatisticas.totalDeputados}</div>
            <p className="text-xs text-muted-foreground">Deputados listados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              R$ {(estatisticas.mediaGastos / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground">Média de gastos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{estatisticas.totalAlertas}</div>
            <p className="text-xs text-muted-foreground">Total de alertas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium truncate">
              {estatisticas.deputadoMaiorGasto?.nome || '-'}
            </div>
            <p className="text-xs text-muted-foreground">Maior gasto</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca Avançada */}
      <AdvancedSearch 
        onFilterChange={setAdvancedFilters}
        availableFilters={{
          estados,
          partidos,
          tiposAlerta: ['SUPERFATURAMENTO', 'LIMITE_EXCEDIDO', 'FORNECEDOR_SUSPEITO']
        }}
        showDateFilter={false}
        showValueFilter={false}
      />

      {/* Filtros */}
      {!advancedFilters && (
        <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar deputado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filtroPartido} onValueChange={setFiltroPartido}>
              <SelectTrigger>
                <SelectValue placeholder="Partido" />
              </SelectTrigger>
              <SelectContent>
                {partidos.map(partido => partido && (
                  <SelectItem key={partido} value={partido}>
                    {partido === 'TODOS' ? 'Todos os partidos' : partido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroUF} onValueChange={setFiltroUF}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map(uf => uf && (
                  <SelectItem key={uf} value={uf}>
                    {uf === 'TODOS' ? 'Todos os estados' : uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score de Suspeição</SelectItem>
                <SelectItem value="gastos">Total de Gastos</SelectItem>
                <SelectItem value="alertas">Número de Alertas</SelectItem>
                <SelectItem value="nome">Nome (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Lista de Deputados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeputados.slice(0, 12).map((deputado, index) => (
          <DeputadoCard
            key={index}
            nome={deputado.nome}
            partido={deputado.partido}
            uf={deputado.uf}
            foto={`https://www.camara.leg.br/internet/deputado/bandep/${220611 + index}.jpg`}
            totalGasto={deputado.totalGasto}
            numAlertas={deputado.alertas.length}
            scoreSuspeicao={deputado.scoreSuspeicao}
            onViewProfile={() => onSelectDeputado(deputado)}
          />
        ))}
      </div>

      {filteredDeputados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum deputado encontrado com os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      )}

      {filteredDeputados.length > 12 && (
        <div className="text-center">
          <Button variant="outline">
            Carregar mais ({filteredDeputados.length - 12} restantes)
          </Button>
        </div>
      )}
    </div>
  )
}
