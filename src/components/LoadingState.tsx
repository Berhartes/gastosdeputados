import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, FileText, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react'

interface LoadingStateProps {
  stage: 'parsing' | 'analyzing' | 'generating' | 'complete'
  progress: number
  fileName?: string
  totalRecords?: number
  message?: string
}

const stages = {
  parsing: {
    icon: FileText,
    title: 'Processando arquivo',
    description: 'Lendo e validando dados do CSV...'
  },
  analyzing: {
    icon: BarChart3,
    title: 'Analisando gastos',
    description: 'Detectando padrões suspeitos...'
  },
  generating: {
    icon: AlertTriangle,
    title: 'Gerando alertas',
    description: 'Criando relatório de irregularidades...'
  },
  complete: {
    icon: CheckCircle,
    title: 'Análise concluída',
    description: 'Resultados prontos para visualização'
  }
}

export function LoadingState({ 
  stage, 
  progress, 
  fileName, 
  totalRecords, 
  message 
}: LoadingStateProps) {
  const currentStage = stages[stage]
  const Icon = currentStage.icon

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* Ícone animado */}
          <div className="flex justify-center">
            {stage === 'complete' ? (
              <CheckCircle className="h-16 w-16 text-green-600" />
            ) : (
              <div className="relative">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <Icon className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>

          {/* Título e descrição */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{currentStage.title}</h3>
            <p className="text-muted-foreground">
              {message || currentStage.description}
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progress.toFixed(1)}%</span>
              <span>
                {stage === 'complete' ? 'Concluído' : 'Processando...'}
              </span>
            </div>
          </div>

          {/* Informações do arquivo */}
          {fileName && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Arquivo:</span>
                <span className="truncate">{fileName}</span>
              </div>
              {totalRecords && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Registros:</span>
                  <span>{totalRecords.toLocaleString('pt-BR')}</span>
                </div>
              )}
            </div>
          )}

          {/* Etapas do processo */}
          <div className="flex justify-center space-x-8 text-xs">
            {Object.entries(stages).map(([key, stageInfo], index) => {
              const StageIcon = stageInfo.icon
              const isActive = key === stage
              const isComplete = Object.keys(stages).indexOf(key) < Object.keys(stages).indexOf(stage)
              
              return (
                <div key={key} className="flex flex-col items-center space-y-1">
                  <div className={`p-2 rounded-full ${
                    isComplete ? 'bg-green-100 text-green-600' :
                    isActive ? 'bg-primary/10 text-primary' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    <StageIcon className="h-4 w-4" />
                  </div>
                  <span className={`${
                    isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}>
                    {stageInfo.title.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
