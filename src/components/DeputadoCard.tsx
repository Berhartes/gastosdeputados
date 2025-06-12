import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, MapPin, Building2, TrendingUp, AlertTriangle, Eye, Star 
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DeputadoCardProps {
  nome: string
  partido: string
  uf: string
  foto?: string
  totalGasto: number
  numAlertas: number
  scoreSuspeicao: number
  onViewProfile: () => void
  compact?: boolean
}

export function DeputadoCard({
  nome,
  partido,
  uf,
  foto,
  totalGasto,
  numAlertas,
  scoreSuspeicao,
  onViewProfile,
  compact = false
}: DeputadoCardProps) {
  const { toast } = useToast()
  
  const adicionarAosFavoritos = () => {
    const deputado = {
      nome,
      partido,
      uf,
      totalGasto,
      scoreSuspeicao,
      numAlertas
    }
    
    // Usar a função global do componente Favoritos
    if (typeof window !== 'undefined' && (window as any).adicionarFavorito) {
      (window as any).adicionarFavorito(deputado)
    } else {
      // Fallback: adicionar diretamente ao localStorage
      const favoritosSalvos = localStorage.getItem('deputados-favoritos')
      const favoritos = favoritosSalvos ? JSON.parse(favoritosSalvos) : []
      
      if (!favoritos.find((f: any) => f.nome === nome)) {
        favoritos.push({
          ...deputado,
          dataAdicionado: new Date().toISOString()
        })
        localStorage.setItem('deputados-favoritos', JSON.stringify(favoritos))
        
        toast({
          title: "Adicionado aos favoritos",
          description: `${nome} foi adicionado à lista de favoritos.`,
        })
      } else {
        toast({
          title: "Já está nos favoritos",
          description: `${nome} já está na sua lista de favoritos.`,
          variant: "destructive"
        })
      }
    }
  }
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 70) return 'destructive'
    if (score >= 40) return 'warning'
    return 'secondary'
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all hover:shadow-md cursor-pointer"
           onClick={onViewProfile}>
        <div className="flex items-center gap-3">
          {foto ? (
            <img 
              src={foto} 
              alt={nome}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <div>
            <p className="font-medium">{nome}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{partido}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {uf}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">R$ {(totalGasto / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">{numAlertas} alertas</p>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(scoreSuspeicao)}`}>
            {scoreSuspeicao}
          </div>
          <Button size="sm" variant="ghost">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {foto ? (
              <img 
                src={foto} 
                alt={nome}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-md">
                <User className="h-8 w-8 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{nome}</h3>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {partido}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {uf}
                </span>
              </div>
            </div>
          </div>
          <Badge variant={getScoreBadge(scoreSuspeicao)} className="text-lg px-3 py-1">
            {scoreSuspeicao}
          </Badge>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Total Gasto</p>
            <p className="font-semibold text-sm flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              R$ {(totalGasto / 1000).toFixed(1)}k
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Alertas</p>
            <p className="font-semibold text-sm flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {numAlertas}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ranking</p>
            <p className="font-semibold text-sm flex items-center justify-center gap-1">
              <Building2 className="h-3 w-3" />
              #145
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            variant="outline"
            onClick={onViewProfile}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Perfil
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={adicionarAosFavoritos}
            title="Adicionar aos favoritos"
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
