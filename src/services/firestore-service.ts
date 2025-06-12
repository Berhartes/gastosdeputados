import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  limit,
  orderBy 
} from 'firebase/firestore';
import type { GastoParlamentar } from '@/types/gastos';
import { analisadorGastos } from './analisador-gastos';

// Interface para deputado no Firestore
interface DeputadoFirestore {
  id: string;
  nome?: string;
  nomeCivil?: string;
  siglaPartido?: string;
  siglaUf?: string;
  urlFoto?: string;
  cpf?: string;
  ideCadastro?: string;
  nuCarteiraParlamentar?: string;
  nuLegislatura?: number;
  [key: string]: any;
}

// Interface para despesa no Firestore
interface DespesaFirestore {
  dataDocumento?: string;
  tipoDespesa?: string;
  tipoDocumento?: string;
  nomeFornecedor?: string;
  cnpjCpfFornecedor?: string;
  valorDocumento?: number | string;
  valorGlosa?: number | string;
  valorLiquido?: number | string;
  urlDocumento?: string;
  numDocumento?: string;
  numParcela?: number;
  [key: string]: any;
}

export class FirestoreService {
  private legislaturaAtual = '57'; // Legislatura atual

  /**
   * Busca deputados do Firestore com filtros opcionais
   */
  async buscarDeputados(filtros?: { uf?: string; partido?: string; limite?: number }) {
    try {
      console.log('Buscando deputados no Firestore...');
      
      const deputadosRef = collection(db, `congressoNacional/camaraDeputados/legislatura/${this.legislaturaAtual}/deputados`);
      let q = query(deputadosRef);

      // Aplicar filtros
      if (filtros?.uf) {
        q = query(q, where('siglaUf', '==', filtros.uf));
      }
      if (filtros?.partido) {
        q = query(q, where('siglaPartido', '==', filtros.partido));
      }
      if (filtros?.limite) {
        q = query(q, limit(filtros.limite));
      }

      const snapshot = await getDocs(q);
      
      const deputados: DeputadoFirestore[] = [];
      snapshot.forEach((doc) => {
        deputados.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`${deputados.length} deputados encontrados`);
      return deputados;
    } catch (error) {
      console.error('Erro ao buscar deputados:', error);
      throw error;
    }
  }

  /**
   * Busca despesas de um deputado específico
   */
  async buscarDespesasDeputado(
    deputadoId: string, 
    ano: number, 
    mes?: number | string
  ): Promise<DespesaFirestore[]> {
    try {
      const meses = mes === 'todos' || !mes 
        ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
        : [String(mes).padStart(2, '0')];

      const todasDespesas: DespesaFirestore[] = [];

      for (const mesAtual of meses) {
        const despesasPath = `congressoNacional/camaraDeputados/perfilComplementar/${deputadoId}/despesas/${ano}/${mesAtual}/all_despesas`;
        const despesaDocRef = doc(db, despesasPath);
        const despesaDocSnap = await getDoc(despesaDocRef);

        if (despesaDocSnap.exists()) {
          const data = despesaDocSnap.data();
          if (data && Array.isArray(data.despesas)) {
            todasDespesas.push(...data.despesas);
          }
        }
      }

      return todasDespesas;
    } catch (error) {
      console.error(`Erro ao buscar despesas do deputado ${deputadoId}:`, error);
      return [];
    }
  }

  /**
   * Busca e processa dados completos (deputados + despesas)
   */
  async buscarDadosCompletos(opcoes?: {
    ano?: number;
    mes?: number | string;
    uf?: string;
    partido?: string;
    // limite?: number; // Removido
  }) {
    try {
      const ano = opcoes?.ano || new Date().getFullYear();
      const mes = opcoes?.mes || 'todos';

      console.log(`Buscando dados do Firestore - Ano: ${ano}, Mês: ${mes}`);

      // Buscar deputados
      const deputados = await this.buscarDeputados({
        uf: opcoes?.uf,
        partido: opcoes?.partido,
        // limite: opcoes?.limite || 50 // Lógica de limite removida daqui
      });

      if (deputados.length === 0) {
        throw new Error('Nenhum deputado encontrado');
      }

      // Buscar despesas de cada deputado
      const gastosFormatados: GastoParlamentar[] = [];
      
      for (const deputado of deputados) {
        const despesas = await this.buscarDespesasDeputado(deputado.id, ano, mes);
        
        // Converter despesas para o formato GastoParlamentar
        for (const despesa of despesas) {
          const gasto: GastoParlamentar = {
            txNomeParlamentar: deputado.nome || deputado.nomeCivil || 'Nome não informado',
            cpf: deputado.cpf || null,
            ideCadastro: deputado.ideCadastro || deputado.id,
            nuCarteiraParlamentar: deputado.nuCarteiraParlamentar || null,
            nuLegislatura: deputado.nuLegislatura || 57,
            sgUF: deputado.siglaUf || 'NA',
            sgPartido: deputado.siglaPartido || null,
            codLegislatura: 57,
            numSubCota: this.mapearTipoDespesaParaSubCota(despesa.tipoDespesa),
            txtDescricao: despesa.tipoDespesa || 'Não especificado',
            numEspecificacaoSubCota: 0,
            txtDescricaoEspecificacao: null,
            txtFornecedor: despesa.nomeFornecedor || 'Não informado',
            txtCNPJCPF: despesa.cnpjCpfFornecedor || '',
            txtNumero: Number(despesa.numDocumento) || 0,
            indTipoDocumento: despesa.tipoDocumento === 'Nota Fiscal' ? 0 : 1,
            datEmissao: despesa.dataDocumento || new Date().toISOString(),
            vlrDocumento: this.parseValor(despesa.valorDocumento),
            vlrGlosa: this.parseValor(despesa.valorGlosa),
            vlrLiquido: this.parseValor(despesa.valorLiquido),
            numMes: parseInt(mes === 'todos' ? '1' : String(mes)),
            numAno: ano,
            numParcela: despesa.numParcela || 0,
            txtPassageiro: null,
            txtTrecho: null,
            numLote: 0,
            numRessarcimento: null,
            datPagamentoRestituicao: null,
            vlrRestituicao: null,
            nuDeputadoId: Number(deputado.id) || 0,
            ideDocumento: 0,
            urlDocumento: despesa.urlDocumento || ''
          };
          
          gastosFormatados.push(gasto);
        }
      }

      console.log(`Total de gastos processados: ${gastosFormatados.length}`);

      // Analisar os gastos usando o serviço existente
      const analise = analisadorGastos.analisarGastos(gastosFormatados);

      return {
        data: new Date().toISOString(),
        arquivo: `Firestore - ${ano}/${mes}`,
        fonte: 'firestore',
        periodo: { mes, ano },
        analise
      };

    } catch (error) {
      console.error('Erro ao buscar dados completos:', error);
      throw error;
    }
  }

  /**
   * Mapeia tipo de despesa para código de subcota
   */
  private mapearTipoDespesaParaSubCota(tipoDespesa?: string): number {
    const mapeamento: Record<string, number> = {
      'COMBUSTÍVEIS E LUBRIFICANTES.': 3,
      'DIVULGAÇÃO DA ATIVIDADE PARLAMENTAR.': 2,
      'MANUTENÇÃO DE ESCRITÓRIO DE APOIO À ATIVIDADE PARLAMENTAR': 1,
      'PASSAGEM AÉREA - SIGEPA': 999,
      'LOCAÇÃO OU FRETAMENTO DE VEÍCULOS AUTOMOTORES': 4,
      'TELEFONIA': 8,
      'SERVIÇOS POSTAIS': 6,
      'SERVIÇOS DE SEGURANÇA PRIVADA': 9
    };

    return mapeamento[tipoDespesa || ''] || 0;
  }

  /**
   * Converte valor para número
   */
  private parseValor(valor: any): number {
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') {
      const parsed = parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Busca ranking de despesas (similar ao componente de referência)
   */
  async buscarRankingDespesas(opcoes: {
    ano: number;
    mes: number | string;
    tipoDespesa?: string;
    uf?: string;
    // limite?: number; // Removido
  }) {
    try {
      const deputados = await this.buscarDeputados({ 
        uf: opcoes.uf,
        // limite: opcoes.limite // Removido
      });

      const ranking = await Promise.all(
        deputados.map(async (deputado) => {
          const despesas = await this.buscarDespesasDeputado(
            deputado.id, 
            opcoes.ano, 
            opcoes.mes
          );

          let valorTotal = 0;
          
          if (opcoes.tipoDespesa) {
            valorTotal = despesas
              .filter(d => d.tipoDespesa === opcoes.tipoDespesa)
              .reduce((sum, d) => sum + this.parseValor(d.valorLiquido), 0);
          } else {
            valorTotal = despesas
              .reduce((sum, d) => sum + this.parseValor(d.valorLiquido), 0);
          }

          return {
            id: deputado.id,
            nome: deputado.nome || deputado.nomeCivil || 'Nome não informado',
            partido: deputado.siglaPartido || 'N/A',
            uf: deputado.siglaUf || 'N/A',
            valorTotal,
            foto: deputado.urlFoto
          };
        })
      );

      return ranking
        .filter(d => d.valorTotal > 0)
        .sort((a, b) => b.valorTotal - a.valorTotal);

    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      throw error;
    }
  }
}

// Exportar instância única
export const firestoreService = new FirestoreService();
