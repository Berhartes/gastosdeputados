import { useCallback } from 'react'

// Tipos e interfaces relacionados ao estado de análise de arquivo foram removidos,
// pois a funcionalidade de upload de arquivo não é mais utilizada.

export function useAnaliseGastos() {
  // A função processarArquivo e o estado relacionado foram removidos,
  // pois o processamento de arquivos CSV locais não é mais necessário.
  // A aplicação agora busca dados diretamente do Firestore.

  const obterUltimaAnalise = useCallback(() => {
    try {
      const data = localStorage.getItem('ultima-analise')
      // Os dados armazenados em 'ultima-analise' agora vêm do FirestoreDataFetcher
      return data ? JSON.parse(data) : null
    } catch (error) {
      // Adicionado tratamento de erro para o caso de JSON.parse falhar
      console.error("Erro ao parsear ultima-analise do localStorage:", error)
      return null
    }
  }, [])

  // A função resetarEstado foi removida pois o estado que ela resetava não existe mais.

  return {
    obterUltimaAnalise,
  }
}
