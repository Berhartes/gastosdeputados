import { useEffect, useState } from 'react'

export function useParams() {
  const [params, setParams] = useState<Record<string, string>>({})

  useEffect(() => {
    // Simulando parâmetros da URL - em produção usaria react-router
    const urlParams = new URLSearchParams(window.location.search)
    const deputadoId = urlParams.get('id') || 'general-pazuello'
    
    setParams({ deputadoId })
  }, [])

  return params
}
