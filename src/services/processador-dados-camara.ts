/**
 * Processador de Dados da Câmara dos Deputados
 * Processa arquivos CSV oficiais da API da Câmara
 */

import Papa from 'papaparse'
import { analisadorGastos } from './analisador-gastos' // Importa a instância
import type { GastoParlamentar } from '@/types/gastos'; // Importa o tipo GastoParlamentar

export interface RegistroCamara {
  txNomeParlamentar: string
  cpf: number
  ideCadastro: number
  nuCarteiraParlamentar: number
  nuLegislatura: number
  sgUF: string
  sgPartido: string
  codLegislatura: number
  numSubCota: number
  txtDescricao: string
  numEspecificacaoSubCota: number
  txtDescricaoEspecificacao: string | null
  txtFornecedor: string
  txtCNPJCPF: string
  txtNumero: number
  indTipoDocumento: number
  datEmissao: string
  vlrDocumento: number
  vlrGlosa: number
  vlrLiquido: number
  numMes: number
  numAno: number
  numParcela: number
  txtPassageiro: string | null
  txtTrecho: string | null
  numLote: number
  numRessarcimento: string | null
  datPagamentoRestituicao: string | null
  vlrRestituicao: string | null
  nuDeputadoId: number
  ideDocumento: number
  urlDocumento: string
}

export interface DeputadoProcessado {
  nome: string
  partido: string
  uf: string
  totalGasto: number
  scoreSuspeicao: number
  alertas: Array<{
    tipo: string
    gravidade: 'BAIXA' | 'MEDIA' | 'ALTA'
    descricao: string
    valor?: number
    fornecedor?: string
  }>
  numTransacoes: number
  gastoMedio: number
  maioresCategorias: Array<{
    categoria: string
    valor: number
    percentual: number
  }>
  detalhes: {
    cpf: number
    nuDeputadoId: number
    gastosPorMes: Record<string, number>
    fornecedores: Record<string, number>
    categorias: Record<string, number>
  }
}

export interface FornecedorSuspeito {
  nome: string
  cnpj: string
  totalTransacionado: number
  deputadosAtendidos: string[]
  scoreSuspeicao: number
  alertas: string[]
  categorias: string[]
}

/**
 * Processa arquivo CSV da Câmara dos Deputados
 */
export async function processarDadosCamara(csvContent: string): Promise<{
  deputados: DeputadoProcessado[]
  fornecedores: FornecedorSuspeito[]
  estatisticas: {
    totalGastos: number
    totalDeputados: number
    totalFornecedores: number
    alertasEncontrados: number
    periodoAnalise: { inicio: string; fim: string }
  }
}> {
  // Parse do CSV
  const resultadoParse = Papa.parse<RegistroCamara>(csvContent, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (header: string) => header.trim()
  })

  if (resultadoParse.errors.length > 0) {
    console.warn('Erros no parsing:', resultadoParse.errors)
  }

  const registros = resultadoParse.data.filter(r => r.txNomeParlamentar && r.vlrLiquido)

  // Agrupar por deputado
  const deputadosMap = new Map<string, RegistroCamara[]>()
  
  registros.forEach(registro => {
    const chave = `${registro.txNomeParlamentar}_${registro.nuDeputadoId}`
    if (!deputadosMap.has(chave)) {
      deputadosMap.set(chave, [])
    }
    deputadosMap.get(chave)!.push(registro)
  })

  // Processar cada deputado
  const deputados: DeputadoProcessado[] = []
  const fornecedoresMap = new Map<string, {
    nome: string
    cnpj: string
    transacoes: RegistroCamara[]
    deputados: Set<string>
  }>()

  for (const [chave, transacoes] of deputadosMap) {
    const primeiroRegistro = transacoes[0]
    
    // Calcular estatísticas básicas
    const totalGasto = transacoes.reduce((sum, t) => sum + (t.vlrLiquido || 0), 0)
    const gastoMedio = totalGasto / transacoes.length

    // Agrupar por categoria
    const categorias: Record<string, number> = {}
    const fornecedores: Record<string, number> = {}
    const gastosPorMes: Record<string, number> = {}

    transacoes.forEach(t => {
      // Categorias
      const categoria = t.txtDescricao || 'Outros'
      categorias[categoria] = (categorias[categoria] || 0) + t.vlrLiquido

      // Fornecedores
      const fornecedor = t.txtFornecedor || 'Não informado'
      fornecedores[fornecedor] = (fornecedores[fornecedor] || 0) + t.vlrLiquido

      // Gastos por mês
      const mes = `${t.numAno}-${String(t.numMes).padStart(2, '0')}`
      gastosPorMes[mes] = (gastosPorMes[mes] || 0) + t.vlrLiquido

      // Mapear fornecedores para análise posterior
      const fornecedorKey = `${t.txtFornecedor}_${t.txtCNPJCPF}`
      if (!fornecedoresMap.has(fornecedorKey)) {
        fornecedoresMap.set(fornecedorKey, {
          nome: t.txtFornecedor || 'Não informado',
          cnpj: t.txtCNPJCPF || '',
          transacoes: [],
          deputados: new Set()
        })
      }
      fornecedoresMap.get(fornecedorKey)!.transacoes.push(t)
      fornecedoresMap.get(fornecedorKey)!.deputados.add(primeiroRegistro.txNomeParlamentar)
    })

    // Maiores categorias
    const maioresCategorias = Object.entries(categorias)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
        percentual: (valor / totalGasto) * 100
      }))

    // Análise de suspeição usando o sistema existente
    const dadosParaAnalise: GastoParlamentar[] = transacoes.map(t => ({
      txNomeParlamentar: t.txNomeParlamentar,
      cpf: t.cpf?.toString() || null,
      ideCadastro: t.ideCadastro?.toString() || null,
      nuCarteiraParlamentar: t.nuCarteiraParlamentar?.toString() || null,
      nuLegislatura: t.nuLegislatura,
      sgUF: t.sgUF,
      sgPartido: t.sgPartido || null,
      codLegislatura: t.codLegislatura,
      numSubCota: t.numSubCota,
      txtDescricao: t.txtDescricao,
      numEspecificacaoSubCota: t.numEspecificacaoSubCota,
      txtDescricaoEspecificacao: t.txtDescricaoEspecificacao || null,
      txtFornecedor: t.txtFornecedor,
      txtCNPJCPF: t.txtCNPJCPF,
      txtNumero: t.txtNumero,
      indTipoDocumento: t.indTipoDocumento,
      datEmissao: t.datEmissao,
      vlrDocumento: t.vlrDocumento,
      vlrGlosa: t.vlrGlosa,
      vlrLiquido: t.vlrLiquido,
      numMes: t.numMes,
      numAno: t.numAno,
      numParcela: t.numParcela,
      txtPassageiro: t.txtPassageiro || null,
      txtTrecho: t.txtTrecho || null,
      numLote: t.numLote,
      numRessarcimento: t.numRessarcimento || null,
      datPagamentoRestituicao: t.datPagamentoRestituicao || null,
      vlrRestituicao: t.vlrRestituicao || null,
      nuDeputadoId: t.nuDeputadoId,
      ideDocumento: t.ideDocumento,
      urlDocumento: t.urlDocumento,
    }))

    const analise = analisadorGastos.analisarGastos(dadosParaAnalise) // Usa o método da instância
    const deputadoAnalise = analise.deputadosAnalise.find(d => d.nome === primeiroRegistro.txNomeParlamentar)


    const deputado: DeputadoProcessado = {
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
        gastosPorMes,
        fornecedores,
        categorias
      }
    }

    deputados.push(deputado)
  }

  // Processar fornecedores suspeitos
  const fornecedores: FornecedorSuspeito[] = []
  
  for (const [, dados] of fornecedoresMap) {
    const totalTransacionado = dados.transacoes.reduce((sum, t) => sum + t.vlrLiquido, 0)
    const deputadosAtendidos: string[] = Array.from(dados.deputados)
    
    // Calcular score de suspeição para fornecedores
    let scoreSuspeicao = 0
    const alertas: string[] = []

    // Fornecedor exclusivo ou quase exclusivo
    if (deputadosAtendidos.length <= 2) {
      scoreSuspeicao += 40
      alertas.push(`Atende apenas ${deputadosAtendidos.length} deputado(s)`)
    }

    // Volume alto de transações
    if (totalTransacionado > 100000) {
      scoreSuspeicao += 20
      alertas.push(`Volume alto: R$ ${totalTransacionado.toLocaleString('pt-BR')}`)
    }

    // Transações muito repetitivas
    const valoresUnicos = new Set(dados.transacoes.map(t => t.vlrLiquido))
    if (valoresUnicos.size < dados.transacoes.length * 0.3) {
      scoreSuspeicao += 30
      alertas.push('Muitos valores repetidos')
    }

    // Categorias atendidas
    const categorias: string[] = Array.from(new Set(dados.transacoes.map(t => t.txtDescricao as string)))

    const fornecedor: FornecedorSuspeito = {
      nome: dados.nome,
      cnpj: dados.cnpj,
      totalTransacionado,
      deputadosAtendidos,
      scoreSuspeicao: Math.min(scoreSuspeicao, 100),
      alertas,
      categorias
    }

    fornecedores.push(fornecedor)
  }

  // Calcular estatísticas gerais
  const totalGastos = registros.reduce((sum, r) => sum + r.vlrLiquido, 0)
  const datas = registros.map(r => r.datEmissao).sort()
  const alertasEncontrados = deputados.reduce((sum, d) => sum + d.alertas.length, 0)

  const estatisticas = {
    totalGastos,
    totalDeputados: deputados.length,
    totalFornecedores: fornecedores.length,
    alertasEncontrados,
    periodoAnalise: {
      inicio: datas[0] || '',
      fim: datas[datas.length - 1] || ''
    }
  }

  return {
    deputados: deputados.sort((a, b) => b.scoreSuspeicao - a.scoreSuspeicao),
    fornecedores: fornecedores
      .filter(f => f.scoreSuspeicao > 0)
      .sort((a, b) => b.scoreSuspeicao - a.scoreSuspeicao),
    estatisticas
  }
}

/**
 * Detecta padrões específicos nos dados da Câmara
 */
export function detectarPadroesEspecificos(registros: RegistroCamara[]): {
  superfaturamentoCombustivel: RegistroCamara[]
  gastosForaLimite: RegistroCamara[]
  fornecedoresExclusivos: string[]
  valoresRedondos: RegistroCamara[]
} {
  // Superfaturamento em combustível (valor > R$ 2000 por transação)
  const superfaturamentoCombustivel = registros.filter(r => 
    r.txtDescricao.includes('COMBUSTÍVEIS') && r.vlrLiquido > 2000
  )

  // Gastos muito altos (acima de R$ 20.000 por transação)
  const gastosForaLimite = registros.filter(r => r.vlrLiquido > 20000)

  // Valores redondos suspeitos
  const valoresRedondos = registros.filter(r => 
    r.vlrLiquido % 1000 === 0 && r.vlrLiquido >= 5000
  )

  // Fornecedores que só atendem poucos deputados
  const fornecedorDeputados = new Map<string, Set<string>>()
  registros.forEach(r => {
    const key = `${r.txtFornecedor}_${r.txtCNPJCPF}`
    if (!fornecedorDeputados.has(key)) {
      fornecedorDeputados.set(key, new Set())
    }
    fornecedorDeputados.get(key)!.add(r.txNomeParlamentar)
  })

  const fornecedoresExclusivos = Array.from(fornecedorDeputados.entries())
    .filter(([, deputados]) => deputados.size <= 2)
    .map(([fornecedor]) => fornecedor.split('_')[0])

  return {
    superfaturamentoCombustivel,
    gastosForaLimite,
    fornecedoresExclusivos,
    valoresRedondos
  }
}

/**
 * Gera relatório detalhado da análise
 */
export function gerarRelatorioAnalise(
  deputados: DeputadoProcessado[],
  fornecedores: FornecedorSuspeito[],
  estatisticas: any
): string {
  const relatorio = `
# RELATÓRIO DE ANÁLISE - GASTOS PARLAMENTARES

## 📊 RESUMO EXECUTIVO

- **Total de gastos analisados**: R$ ${estatisticas.totalGastos.toLocaleString('pt-BR')}
- **Deputados analisados**: ${estatisticas.totalDeputados}
- **Fornecedores identificados**: ${estatisticas.totalFornecedores}
- **Alertas encontrados**: ${estatisticas.alertasEncontrados}
- **Período**: ${estatisticas.periodoAnalise.inicio} a ${estatisticas.periodoAnalise.fim}

## 🚨 PRINCIPAIS ACHADOS

### Top 5 Deputados com Maior Score de Suspeição
${deputados.slice(0, 5).map((d, i) => 
  `${i + 1}. **${d.nome}** (${d.partido}/${d.uf}) - Score: ${d.scoreSuspeicao}/100\n   - Total gasto: R$ ${d.totalGasto.toLocaleString('pt-BR')}\n   - Alertas: ${d.alertas.length}`
).join('\n')}

### Top 5 Fornecedores Suspeitos
${fornecedores.slice(0, 5).map((f, i) => 
  `${i + 1}. **${f.nome}** - Score: ${f.scoreSuspeicao}/100\n   - CNPJ: ${f.cnpj}\n   - Total: R$ ${f.totalTransacionado.toLocaleString('pt-BR')}\n   - Deputados atendidos: ${f.deputadosAtendidos.length}`
).join('\n')}

## 📈 ESTATÍSTICAS DETALHADAS

### Distribuição por Gravidade de Alertas
${(() => {
  const contadores = { ALTA: 0, MEDIA: 0, BAIXA: 0 }
  deputados.forEach(d => {
    d.alertas.forEach(a => {
      contadores[a.gravidade]++
    })
  })
  return Object.entries(contadores)
    .map(([gravidade, count]) => `- **${gravidade}**: ${count} alertas`)
    .join('\n')
})()}

---

*Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}*
`

  return relatorio
}
