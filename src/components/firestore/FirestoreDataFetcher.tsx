import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { firestoreService } from '@/services/firestore-service'
import { useToast } from '@/hooks/use-toast'

interface FirestoreDataFetcherProps {
  onDataFetched: (data: any) => void
}

export function FirestoreDataFetcher({ onDataFetched }: FirestoreDataFetcherProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Filtros
  const [ano, setAno] = useState(new Date().getFullYear())
  const [mes, setMes] = useState<string>('todos')
  const [uf, setUf] = useState<string>('todos_estados')
  const [partido, setPartido] = useState<string>('todos_partidos')
  // const [limite, setLimite] = useState<string>('50') // Limite removido
  
  const { toast } = useToast()

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const meses = [
    { value: 'todos', label: 'Todos os meses' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })
    }))
  ]

  const estados = [
    { value: 'todos_estados', label: 'Todos os estados' },
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ].map(uf => (typeof uf === 'string' ? { value: uf, label: uf } : uf))

  const partidos = [
    { value: 'todos_partidos', label: 'Todos os partidos' },
    'PT', 'PL', 'PSDB', 'MDB', 'PP', 'PSD', 'REPUBLICANOS', 'PSB',
    'DEM', 'PDT', 'PODE', 'PSC', 'PCdoB', 'NOVO', 'PSOL', 'CIDADANIA'
  ].map(p => (typeof p === 'string' ? { value: p, label: p } : p))

  const buscarDados = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('Buscando dados do Firestore...')
      
      const dados = await firestoreService.buscarDadosCompletos({
        ano,
        mes: mes === 'todos' ? 'todos' : parseInt(mes),
        uf: uf === 'todos_estados' ? undefined : uf || undefined,
        partido: partido === 'todos_partidos' ? undefined : partido || undefined,
        // limite: parseInt(limite) // Limite removido da chamada
      })

      if (!dados || !dados.analise) {
        throw new Error('Nenhum dado retornado do Firestore')
      }

      // Salvar no localStorage
      localStorage.setItem('ultima-analise', JSON.stringify(dados))
      
      // Notificar o componente pai
      onDataFetched(dados)
      
      setSuccess(true)
      
      toast({
        title: "Dados carregados com sucesso!",
        description: `${dados.analise.estatisticas.totalRegistros} registros processados do Firestore.`,
      })

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(false), 3000)

    } catch (err: any) {
      console.error('Erro ao buscar dados do Firestore:', err)
      setError(err.message || 'Erro ao conectar com o Firestore')
      
      toast({
        title: "Erro ao buscar dados",
        description: err.message || "Não foi possível conectar ao Firestore",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Buscar Dados do Firestore
        </CardTitle>
        <CardDescription>
          Conecte-se ao banco de dados oficial para obter dados em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuração Firebase */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Configure suas credenciais do Firebase em 
            <code className="mx-1 px-2 py-1 bg-gray-100 rounded text-sm">src/services/firebase.ts</code>
            antes de usar esta funcionalidade.
          </AlertDescription>
        </Alert>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ano</label>
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mês</label>
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estado (UF)</label>
            <Select value={uf} onValueChange={setUf}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                {estados.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Partido</label>
            <Select value={partido} onValueChange={setPartido}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os partidos" />
              </SelectTrigger>
              <SelectContent>
                {partidos.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* O seletor de limite foi removido daqui */}
        </div>

        {/* Botão de busca */}
        <Button 
          onClick={buscarDados} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Database className="h-4 w-4 mr-2 animate-spin" />
              Buscando dados...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Buscar Dados do Firestore
            </>
          )}
        </Button>

        {/* Mensagens de feedback */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Dados carregados com sucesso do Firestore!
            </AlertDescription>
          </Alert>
        )}

        {/* Informações sobre os dados */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Os dados são buscados diretamente do banco de dados oficial</p>
          {/* <p>• O limite é aplicado para evitar sobrecarga</p> // Comentário sobre limite removido */}
          <p>• Os dados são analisados e processados automaticamente</p>
        </div>
      </CardContent>
    </Card>
  )
}
