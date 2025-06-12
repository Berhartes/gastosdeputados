# 📂 Guia: Processando Arquivos da Pasta "gastos em csv"

## 📊 Arquivos Disponíveis

Na pasta `C:\Users\Kast Berhartes\projetos-web-berhartes\gastosdeputados\gastos em csv`, você tem:

### 1. **Ano-2024.csv**
- **Tamanho**: 80.3 MB
- **Estimativa**: ~400.000-500.000 registros
- **Tempo de Processamento**: 2-4 minutos

### 2. **Ano-2025.csv**
- **Tamanho**: Verificar tamanho
- **Dados**: Janeiro a Junho 2025

## 🚀 Como Processar

### Método 1: Interface Web (Recomendado)

1. **Inicie o projeto**:
   ```bash
   cd C:\Users\Kast Berhartes\projetos-web-berhartes\gastosdeputados
   npm run dev
   ```

2. **Acesse no navegador**:
   ```
   http://localhost:5173
   ```

3. **Navegue para Análise**:
   - Clique em **"Análise IA"** no menu
   - Role até **"Processador de Arquivos Grandes"**

4. **Selecione o arquivo**:
   - Clique em **"Selecionar Arquivo CSV Grande"**
   - Navegue até a pasta `gastos em csv`
   - Selecione **Ano-2024.csv**

5. **Processe**:
   - Clique em **"Processar Arquivo"**
   - Aguarde 2-4 minutos
   - Acompanhe o progresso

### Método 2: Drag & Drop

1. Abra o Windows Explorer na pasta dos CSVs
2. Arraste o arquivo **Ano-2024.csv**
3. Solte sobre a área de upload
4. Clique em processar

## 📈 Durante o Processamento

### O que você verá:

```
Progresso: 45%
Status: Processados 225.000 registros...
Chunk 45 de 100
Velocidade: 8.500 reg/s
```

### Dicas importantes:

- ✅ **Mantenha a aba aberta**
- ✅ **Use Chrome ou Firefox**
- ✅ **Feche outras abas pesadas**
- ❌ **Não recarregue a página**
- ❌ **Não mude de aba frequentemente**

## 🎯 Após o Processamento

### Resultados Esperados:

1. **Estatísticas Gerais**:
   - Total de deputados analisados
   - Gastos totais do ano
   - Alertas detectados
   - Fornecedores suspeitos

2. **Análises Disponíveis**:
   - Top deputados por gastos
   - Score de suspeição
   - Padrões irregulares
   - Fornecedores exclusivos

3. **Visualizações**:
   - Gráficos por partido
   - Distribuição por estado
   - Evolução temporal
   - Correlações

## ⚡ Otimizações para Arquivos Grandes

### 1. Preparação do Sistema

```bash
# Feche aplicações desnecessárias
# Libere memória RAM
# Use modo de alta performance
```

### 2. Configurações do Navegador

**Chrome**:
```
chrome://flags
→ Enable: "Parallel downloading"
→ Enable: "Experimental Web Platform features"
```

**Firefox**:
```
about:config
→ dom.workers.maxPerDomain = 20
→ javascript.options.mem.high_water_mark = 256
```

### 3. Se houver problemas

**Erro de memória**:
- Divida o arquivo em partes menores
- Use o script de divisão (abaixo)

**Processamento lento**:
- Feche outras abas
- Desative extensões
- Use modo incógnito

## 🔧 Scripts Auxiliares

### Dividir arquivo grande (PowerShell):

```powershell
# split-csv.ps1
$inputFile = "Ano-2024.csv"
$linesPerFile = 100000
$header = Get-Content $inputFile -First 1

$content = Get-Content $inputFile | Select-Object -Skip 1
$fileCount = 1

for ($i = 0; $i -lt $content.Count; $i += $linesPerFile) {
    $outputFile = "Ano-2024-parte$fileCount.csv"
    $header | Out-File $outputFile
    $content[$i..($i + $linesPerFile - 1)] | Out-File $outputFile -Append
    $fileCount++
}
```

### Verificar integridade (Node.js):

```javascript
// check-csv.js
const fs = require('fs');
const readline = require('readline');

async function checkCSV(filename) {
  const fileStream = fs.createReadStream(filename);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let errorCount = 0;

  for await (const line of rl) {
    lineCount++;
    const columns = line.split(';');
    if (columns.length !== 33) { // Ajuste conforme necessário
      errorCount++;
      console.log(`Erro na linha ${lineCount}: ${columns.length} colunas`);
    }
  }

  console.log(`Total: ${lineCount} linhas, ${errorCount} erros`);
}

checkCSV('gastos em csv/Ano-2024.csv');
```

## 📊 Análises Específicas para 2024

### 1. Gastos Eleitorais
- Aumento esperado em outubro
- Fornecedores de campanha
- Gastos com publicidade

### 2. Padrões Anuais
- Sazonalidade de gastos
- Picos e vales
- Comparação com anos anteriores

### 3. COVID-19 Impact
- Redução de viagens
- Aumento de tecnologia
- Novos fornecedores

## 🎉 Resultado Final

Após processar o arquivo **Ano-2024.csv**, você terá:

1. **Análise completa** de todos os deputados de 2024
2. **Alertas automáticos** de irregularidades
3. **Rankings** e comparações
4. **Relatórios** exportáveis
5. **Dados salvos** para consultas futuras

## 🆘 Suporte

### Problemas comuns:

**"Arquivo muito grande"**:
- Use o processador de arquivos grandes
- Divida em partes se necessário

**"Processamento travou"**:
- Cancele e tente novamente
- Use menos abas abertas

**"Erro de formato"**:
- Verifique encoding (UTF-8)
- Confirme delimitador (;)

---

**Dica Final**: O arquivo de 2024 é perfeito para testar o novo processador. Com 80MB, ele demonstra a capacidade do sistema de lidar com dados reais em escala!

📧 **Dúvidas?** O sistema está preparado para processar seus dados!
