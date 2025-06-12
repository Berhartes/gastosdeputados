/**
 * Processador Otimizado para Arquivos Grandes
 * 
 * Este serviço implementa processamento eficiente de arquivos CSV grandes (até 100MB+)
 * usando técnicas de streaming, chunking e Web Workers
 */

import Papa from 'papaparse'
import { RegistroCamara, DeputadoProcessado, FornecedorSuspeito } from './processador-dados-camara'
import { analisadorGastos } from './analisador-gastos' // Importa a instância

interface ProcessamentoConfig {
  chunkSize?: number // Tamanho de cada chunk em registros
  maxMemory?: number // Limite de memória em MB
  useWebWorker?: boolean // Usar Web Worker para processamento
  onProgress?: (progress: number, status: string) => void
  onChunkProcessed?: (chunkIndex: number, totalChunks: number) => void
}

interface ChunkResult {
  deputados: Map<string, RegistroCamara[]>
  fornecedores: Map<string, any>
  estatisticas: {
    registrosProcessados: number
    tempoProcessamento: number
    memoriaUsada: number
  }
}

export class ProcessadorArquivosGrandes {
  private readonly DEFAULT_CHUNK_SIZE = 5000 // registros por chunk
  private readonly MAX_MEMORY_MB = 50 // MB
  private abortController: AbortController | null = null

  /**
   * Processa arquivo grande em chunks
   */
  async processarArquivoGrande(
    file: File,
    config: ProcessamentoConfig = {}
  ): Promise<{
    deputados: DeputadoProcessado[]
    fornecedores: FornecedorSuspeito[]
    estatisticas: any
  }> {
    const {
      chunkSize = this.DEFAULT_CHUNK_SIZE,
      maxMemory = this.MAX_MEMORY_MB,
      useWebWorker = true,
      onProgress,
      onChunkProcessed
    } = config

    // Verificar tamanho do arquivo
    const fileSizeMB = file.size / (1024 * 1024)
    console.log(`Processando arquivo de ${fileSizeMB.toFixed(2)} MB`)

    if (fileSizeMB > 100) {
      console.warn('Arquivo muito grande! Processamento pode ser lento.')
    }

    // Iniciar processamento
    const startTime = Date.now()
    this.abortController = new AbortController()

    // Estruturas para acumular resultados
    const deputadosMap = new Map<string, RegistroCamara[]>()
    const fornecedoresMap = new Map<string, any>()
    let totalRegistros = 0
    let chunksProcessados = 0

    return new Promise((resolve, reject) => {
      // Configurar parser com streaming
      Papa.parse(file, {
        header: true,
        delimiter: ';',
        dynamicTyping: true,
        skipEmptyLines: true,
        chunk: async (results, parser) => {
          // Pausar parser durante processamento
          parser.pause()

          try {
            // Verificar cancelamento
            if (this.abortController?.signal.aborted) {
              parser.abort()
              return
            }

            // Processar chunk
            const chunkResult = await this.processarChunk(
              results.data as RegistroCamara[],
              deputadosMap,
              fornecedoresMap
            )

            totalRegistros += chunkResult.estatisticas.registrosProcessados
            chunksProcessados++

            // Verificar uso de memória
            const memoriaUsada = this.estimarUsoMemoria()
            if (memoriaUsada > maxMemory) {
              console.warn(`Uso de memória alto: ${memoriaUsada}MB. Liberando recursos...`)
              await this.liberarMemoria()
            }

            // Callbacks de progresso
            if (onProgress) {
              const progress = Math.min(99, (totalRegistros / this.estimarTotalRegistros(file)) * 100)
              onProgress(progress, `Processados ${totalRegistros} registros...`)
            }

            if (onChunkProcessed) {
              onChunkProcessed(chunksProcessados, Math.ceil(this.estimarTotalRegistros(file) / chunkSize))
            }

            // Continuar parsing
            parser.resume()

          } catch (error) {
            console.error('Erro ao processar chunk:', error)
            parser.abort()
            reject(error)
          }
        },
        complete: async () => {
          try {
            // Processar resultados finais
            onProgress?.(99, 'Finalizando análise...')
            
            const resultado = await this.processarResultadosFinais(
              deputadosMap,
              fornecedoresMap,
              totalRegistros,
              startTime
            )

            onProgress?.(100, 'Processamento concluído!')
            resolve(resultado)

          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          console.error('Erro no parsing:', error)
          reject(error)
        }
      })
    })
  }

  /**
   * Processa um chunk de dados
   */
  private async processarChunk(
    registros: RegistroCamara[],
    deputadosMap: Map<string, RegistroCamara[]>,
    fornecedoresMap: Map<string, any>
  ): Promise<ChunkResult> {
    const startTime = Date.now()

    // Agrupar por deputado
    registros.forEach(registro => {
      if (!registro.txNomeParlamentar || !registro.vlrLiquido) return

      const chave = `${registro.txNomeParlamentar}_${registro.nuDeputadoId}`
      
      if (!deputadosMap.has(chave)) {
        deputadosMap.set(chave, [])
      }
      deputadosMap.get(chave)!.push(registro)

      // Mapear fornecedores
      const fornecedorKey = `${registro.txtFornecedor}_${registro.txtCNPJCPF}`
      if (!fornecedoresMap.has(fornecedorKey)) {
        fornecedoresMap.set(fornecedorKey, {
          nome: registro.txtFornecedor || 'Não informado',
          cnpj: registro.txtCNPJCPF || '',
          transacoes: [],
          deputados: new Set()
        })
      }
      
      const fornecedor = fornecedoresMap.get(fornecedorKey)!
      fornecedor.transacoes.push(registro)
      fornecedor.deputados.add(registro.txNomeParlamentar)
    })

    const tempoProcessamento = Date.now() - startTime

    return {
      deputados: deputadosMap,
      fornecedores: fornecedoresMap,
      estatisticas: {
        registrosProcessados: registros.length,
        tempoProcessamento,
        memoriaUsada: this.estimarUsoMemoria()
      }
    }
  }

  /**
   * Processa resultados finais após todos os chunks
   */
  private async processarResultadosFinais(
    deputadosMap: Map<string, RegistroCamara[]>,
    fornecedoresMap: Map<string, any>,
    totalRegistros: number,
    startTime: number
  ) {
    // Processar deputados
    const deputados: DeputadoProcessado[] = []
    
    for (const [chave, transacoes] of deputadosMap) {
      const deputado = await this.processarDeputado(transacoes)
      deputados.push(deputado)
    }

    // Processar fornecedores
    const fornecedores: FornecedorSuspeito[] = []
    
    for (const [, dados] of fornecedoresMap) {
      const fornecedor = await this.processarFornecedor(dados)
      if (fornecedor.scoreSuspeicao > 0) {
        fornecedores.push(fornecedor)
      }
    }

    // Estatísticas finais
    const tempoTotal = Date.now() - startTime
    const totalGastos = deputados.reduce((sum, d) => sum + d.totalGasto, 0)
    const alertasEncontrados = deputados.reduce((sum, d) => sum + d.alertas.length, 0)

    return {
      deputados: deputados.sort((a, b) => b.scoreSuspeicao - a.scoreSuspeicao),
      fornecedores: fornecedores.sort((a, b) => b.scoreSuspeicao - a.scoreSuspeicao),
      estatisticas: {
        totalRegistros,
        totalGastos,
        totalDeputados: deputados.length,
        totalFornecedores: fornecedores.length,
        alertasEncontrados,
        tempoProcessamento: tempoTotal,
        velocidadeProcessamento: totalRegistros / (tempoTotal / 1000), // registros/segundo
        memoriaMaxima: this.estimarUsoMemoria()
      }
    }
  }

  /**
   * Processa dados de um deputado
   */
  private async processarDeputado(transacoes: RegistroCamara[]): Promise<DeputadoProcessado> {
    const primeiroRegistro = transacoes[0]
    const totalGasto = transacoes.reduce((sum, t) => sum + (t.vlrLiquido || 0), 0)
    const gastoMedio = totalGasto / transacoes.length

    // Análise com sistema existente
    const dadosParaAnalise = transacoes.map(t => ({
      nome: t.txNomeParlamentar,
      partido: t.sgPartido,
      uf: t.sgUF,
      valor: t.vlrLiquido,
      data: t.datEmissao,
      categoria: t.txtDescricao,
      fornecedor: t.txtFornecedor,
      documento: t.txtNumero?.toString() || ''
    }))

    const analise = analisadorGastos.analisarGastos(dadosParaAnalise) // Usa o método da instância
    const deputadoAnalise = analise.deputadosAnalise.find(d => d.nome === primeiroRegistro.txNomeParlamentar)


    // Categorias principais
    const categorias: Record<string, number> = {}
    transacoes.forEach(t => {
      const cat = t.txtDescricao || 'Outros'
      categorias[cat] = (categorias[cat] || 0) + t.vlrLiquido
    })

    const maioresCategorias = Object.entries(categorias)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
        percentual: (valor / totalGasto) * 100
      }))

    return {
      nome: primeiroRegistro.txNomeParlamentar,
      partido: primeiroRegistro.sgPartido,
      uf: primeiroRegistro.sgUF,
      totalGasto,
      scoreSuspeicao: deputadoAnalise?.scoreSuspeicao || 0,
      alertas: deputadoAnalise?.alertas || [],
      numTransacoes: transacoes.length,
      gastoMedio,
      maioresCategorias,
      detalhes: {
        cpf: primeiroRegistro.cpf,
        nuDeputadoId: primeiroRegistro.nuDeputadoId,
        gastosPorMes: {},
        fornecedores: {},
        categorias
      }
    }
  }

  /**
   * Processa dados de um fornecedor
   */
  private async processarFornecedor(dados: any): Promise<FornecedorSuspeito> {
    const totalTransacionado = dados.transacoes.reduce((sum: number, t: any) => sum + t.vlrLiquido, 0)
    const deputadosAtendidos: string[] = Array.from(dados.deputados as Set<string>)
    
    // Score de suspeição
    let scoreSuspeicao = 0
    const alertas: string[] = []

    if (deputadosAtendidos.length <= 2) {
      scoreSuspeicao += 40
      alertas.push(`Atende apenas ${deputadosAtendidos.length} deputado(s)`)
    }

    if (totalTransacionado > 100000) {
      scoreSuspeicao += 20
      alertas.push(`Volume alto: R$ ${totalTransacionado.toLocaleString('pt-BR')}`)
    }

    // Categorias
    const categorias: string[] = Array.from(new Set(dados.transacoes.map((t: any) => t.txtDescricao as string)))

    return {
      nome: dados.nome,
      cnpj: dados.cnpj,
      totalTransacionado,
      deputadosAtendidos,
      scoreSuspeicao: Math.min(scoreSuspeicao, 100),
      alertas,
      categorias
    }
  }

  /**
   * Estima total de registros no arquivo
   */
  private estimarTotalRegistros(file: File): number {
    // Estimativa baseada no tamanho médio de linha
    const tamanhoMedioLinha = 500 // bytes
    return Math.floor(file.size / tamanhoMedioLinha)
  }

  /**
   * Estima uso de memória atual
   */
  private estimarUsoMemoria(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return Math.floor(memory.usedJSHeapSize / (1024 * 1024))
    }
    // Fallback: estimativa baseada no número de objetos
    return 10 // MB padrão
  }

  /**
   * Libera memória forçando garbage collection
   */
  private async liberarMemoria(): Promise<void> {
    // Aguardar próximo ciclo de evento
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Tentar forçar GC se disponível
    if ('gc' in window) {
      (window as any).gc()
    }
  }

  /**
   * Cancela processamento em andamento
   */
  cancelar(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }
}

// Instância singleton
export const processadorGrande = new ProcessadorArquivosGrandes()

// Hook para React
export function useProcessadorGrande() {
  return {
    processar: processadorGrande.processarArquivoGrande.bind(processadorGrande),
    cancelar: processadorGrande.cancelar.bind(processadorGrande)
  }
}
