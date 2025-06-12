import React from 'react'
import { Card } from '@/components/ui/card'

interface LoadingAnimationProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingAnimation({ message = 'Carregando...', size = 'md' }: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-primary/20 border-t-primary`} />
        
        {/* Inner ring */}
        <div className={`absolute inset-2 animate-spin rounded-full border-2 border-secondary/20 border-t-secondary`} 
             style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  )
}

export function DataProcessingAnimation() {
  const [stage, setStage] = React.useState(0)
  const stages = [
    { icon: '📊', text: 'Lendo dados...' },
    { icon: '🔍', text: 'Analisando padrões...' },
    { icon: '🤖', text: 'Detectando irregularidades...' },
    { icon: '📈', text: 'Gerando relatórios...' }
  ]

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative w-24 h-24">
          {/* Animated circles */}
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="absolute inset-2 animate-ping rounded-full bg-secondary/20" 
               style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-4 animate-ping rounded-full bg-accent/20" 
               style={{ animationDelay: '1s' }} />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl animate-bounce">{stages[stage].icon}</span>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Processando Dados</h3>
          <p className="text-sm text-muted-foreground animate-pulse">
            {stages[stage].text}
          </p>
        </div>
        
        {/* Progress dots */}
        <div className="flex space-x-2">
          {stages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === stage ? 'bg-primary w-8' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

export function SuccessAnimation({ onComplete }: { onComplete?: () => void }) {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        {/* Success circle */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-scale-in">
          <svg
            className="w-10 h-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
              className="animate-draw-check"
            />
          </svg>
        </div>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full border-4 border-green-500/50 animate-ripple" />
      </div>
      
      <p className="text-lg font-semibold text-green-600 dark:text-green-400 animate-fade-in">
        Análise Concluída!
      </p>
    </div>
  )
}

// Add these animations to your global CSS
const animationStyles = `
@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes draw-check {
  from {
    stroke-dasharray: 0 100;
  }
  to {
    stroke-dasharray: 100 0;
  }
}

@keyframes ripple {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-scale-in {
  animation: scale-in 0.5s ease-out;
}

.animate-draw-check {
  stroke-dasharray: 100;
  animation: draw-check 0.5s ease-out 0.3s forwards;
}

.animate-ripple {
  animation: ripple 1s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out 0.5s forwards;
  opacity: 0;
}
`
