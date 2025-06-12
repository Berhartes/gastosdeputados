import React, { useEffect, useState } from 'react';
import { firestoreService } from '@/services/firestore-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, AlertTriangle, Loader2 } from 'lucide-react';

interface TodosFornecedoresProps {
  ano?: number;
  mes?: number | string;
  uf?: string;
  partido?: string;
}

export function TodosFornecedores({ ano = new Date().getFullYear(), mes = 'todos', uf, partido }: TodosFornecedoresProps) {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProcessado, setTotalProcessado] = useState(0);
  const [deputadosProcessados, setDeputadosProcessados] = useState(0);

  useEffect(() => {
    const buscarTodosFornecedores = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Buscando todos os fornecedores do Firestore...');
        
        // Buscar todos os deputados
        const deputados = await firestoreService.buscarDeputados({ uf, partido });
        const todosFornecedores: Record<string, any> = {};
        let totalDeputados = 0;
        
        // Para cada deputado, buscar suas despesas
        for (const deputado of deputados) {
          try {
            const despesas = await firestoreService.buscarDespesasDeputado(deputado.id, ano, mes);
            totalDeputados++;
            setDeputadosProcessados(totalDeputados);
            
            // Processar despesas para extrair fornecedores
            despesas.forEach((despesa: any) => {
              const cnpj = despesa.cnpjCpfFornecedor || '';
              const nome = despesa.nomeFornecedor || 'Não informado';
              const valor = parseFloat(despesa.valorLiquido || despesa.valorDocumento || 0);
              const tipoDespesa = despesa.tipoDespesa || '';
              
              if (cnpj || nome !== 'Não informado') {
                const chave = cnpj || nome;
                
                if (!todosFornecedores[chave]) {
                  todosFornecedores[chave] = {
                    cnpj,
                    nome,
                    totalRecebido: 0,
                    numTransacoes: 0,
                    deputadosAtendidos: new Set(),
                    categorias: new Set(),
                    transacoes: []
                  };
                }
                
                todosFornecedores[chave].totalRecebido += valor;
                todosFornecedores[chave].numTransacoes += 1;
                todosFornecedores[chave].deputadosAtendidos.add(deputado.nome || deputado.id);
                if (tipoDespesa) {
                  todosFornecedores[chave].categorias.add(tipoDespesa);
                }
                
                // Guardar algumas transações como exemplo
                if (todosFornecedores[chave].transacoes.length < 5) {
                  todosFornecedores[chave].transacoes.push({
                    deputado: deputado.nome,
                    valor,
                    data: despesa.dataDocumento,
                    tipo: tipoDespesa
                  });
                }
              }
            });
          } catch (err) {
            console.error(`Erro ao buscar despesas do deputado ${deputado.id}:`, err);
          }
        }
        
        // Converter para array e calcular indicadores
        const fornecedoresArray = Object.entries(todosFornecedores).map(([chave, dados]) => {
          const deputadosArray = Array.from(dados.deputadosAtendidos);
          const categoriasArray = Array.from(dados.categorias);
          
          // Calcular índice de suspeição
          let indiceSuspeicao = 0;
          const alertas: string[] = [];
          
          if (deputadosArray.length < 5 && dados.totalRecebido > 50000) {
            alertas.push(`Atende apenas ${deputadosArray.length} deputados`);
            indiceSuspeicao += 30;
          }
          
          const mediaTransacao = dados.totalRecebido / dados.numTransacoes;
          if (mediaTransacao > 10000) {
            alertas.push(`Média alta: R$ ${mediaTransacao.toFixed(2)}`);
            indiceSuspeicao += 40;
          }
          
          if (dados.totalRecebido > 500000 && deputadosArray.length < 10) {
            alertas.push('Alto faturamento com poucos clientes');
            indiceSuspeicao += 30;
          }
          
          return {
            cnpj: dados.cnpj,
            nome: dados.nome,
            totalRecebido: dados.totalRecebido,
            numTransacoes: dados.numTransacoes,
            deputadosAtendidos: deputadosArray.length,
            deputadosNomes: deputadosArray,
            mediaTransacao,
            indiceSuspeicao,
            alertas,
            categorias: categoriasArray,
            transacoesExemplo: dados.transacoes
          };
        });
        
        // Ordenar por valor total
        fornecedoresArray.sort((a, b) => b.totalRecebido - a.totalRecebido);
        
        setFornecedores(fornecedoresArray);
        setTotalProcessado(fornecedoresArray.reduce((sum, f) => sum + f.totalRecebido, 0));
        
      } catch (err: any) {
        console.error('Erro ao buscar fornecedores:', err);
        setError(err.message || 'Erro ao carregar fornecedores');
      } finally {
        setLoading(false);
      }
    };
    
    buscarTodosFornecedores();
  }, [ano, mes, uf, partido]);
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Processando fornecedores...</p>
              <p className="text-sm text-muted-foreground">
                {deputadosProcessados > 0 && `${deputadosProcessados} deputados processados`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Erro: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Fornecedores</p>
                <p className="text-2xl font-bold">{fornecedores.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volume Total</p>
                <p className="text-2xl font-bold">
                  R$ {(totalProcessado / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fornecedores Suspeitos</p>
                <p className="text-2xl font-bold text-red-600">
                  {fornecedores.filter(f => f.indiceSuspeicao > 50).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deputados Analisados</p>
                <p className="text-2xl font-bold">{deputadosProcessados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Lista de Fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Fornecedores</CardTitle>
          <CardDescription>
            {fornecedores.length} fornecedores encontrados para {mes === 'todos' ? `o ano ${ano}` : `${mes}/${ano}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {fornecedores.slice(0, 100).map((fornecedor, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{fornecedor.nome}</h3>
                      {fornecedor.indiceSuspeicao > 0 && (
                        <Badge 
                          variant={
                            fornecedor.indiceSuspeicao >= 70 ? 'destructive' : 
                            fornecedor.indiceSuspeicao >= 40 ? 'secondary' : 'outline'
                          }
                        >
                          Score: {fornecedor.indiceSuspeicao}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>CNPJ:</strong> {fornecedor.cnpj || 'Não informado'}</p>
                        <p><strong>Volume Total:</strong> R$ {fornecedor.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p><strong>Transações:</strong> {fornecedor.numTransacoes}</p>
                        <p><strong>Média/Transação:</strong> R$ {fornecedor.mediaTransacao.toFixed(2)}</p>
                      </div>
                      <div>
                        <p><strong>Deputados Atendidos:</strong> {fornecedor.deputadosAtendidos}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {fornecedor.deputadosNomes.slice(0, 3).join(', ')}
                          {fornecedor.deputadosNomes.length > 3 && ` e mais ${fornecedor.deputadosNomes.length - 3}...`}
                        </div>
                      </div>
                    </div>
                    
                    {fornecedor.categorias.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Categorias:</p>
                        <div className="flex flex-wrap gap-1">
                          {fornecedor.categorias.slice(0, 5).map((categoria: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {categoria.length > 40 ? categoria.substring(0, 40) + '...' : categoria}
                            </Badge>
                          ))}
                          {fornecedor.categorias.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{fornecedor.categorias.length - 5} outras
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {fornecedor.alertas.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {fornecedor.alertas.map((alerta: string, i: number) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{alerta}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {fornecedores.length > 100 && (
              <div className="text-center py-4 text-muted-foreground">
                Mostrando os primeiros 100 fornecedores de {fornecedores.length} encontrados
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
