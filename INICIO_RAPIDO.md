# 🚀 GUIA DE INÍCIO RÁPIDO

## Instalação em 1 Minuto

### Windows
```bash
# 1. Clone ou baixe o projeto
# 2. Navegue até a pasta
cd C:\Users\Kast Berhartes\projetos-web-berhartes\gastosdeputados

# 3. Execute
iniciar.bat
```

### Linux/Mac
```bash
# 1. Clone o projeto
git clone [url-do-repositorio]
cd gastosdeputados

# 2. Instale e execute
npm install && npm run dev
```

## 🎯 Primeiros Passos

### 1. Faça o Upload dos Dados
- Use o arquivo `dados-teste-completo.csv` incluído
- Ou baixe dados reais do portal da Câmara

### 2. Explore o Dashboard
- Veja estatísticas gerais
- Identifique deputados suspeitos
- Analise padrões de gastos

### 3. Navegue pelos Deputados
- Lista completa com filtros
- Perfis individuais detalhados
- Compare até 4 deputados

### 4. Verifique os Alertas
- Filtros por tipo e gravidade
- Detalhes de cada irregularidade
- Exportação em CSV

## 🔥 Funcionalidades Principais

### Busca Global (Ctrl+K)
Pesquise deputados, fornecedores e alertas instantaneamente

### Perfis Interativos
- Gráficos dinâmicos
- Timeline de gastos
- Rede de relações políticas
- Comparativo com partido

### Sistema de Favoritos
Acompanhe deputados específicos de seu interesse

### Configurações Personalizadas
- Ajuste limites de detecção
- Configure alertas
- Exporte/importe dados

## 📊 Casos Reais Detectados

| Deputado | Irregularidade | Valor |
|----------|---------------|-------|
| Dilvanda Faro | Combustível superfaturado | R$ 8.500 |
| Silas Câmara | 313% do limite mensal | R$ 141.226 |
| ON-Z Impressão | Atende só 2 deputados | R$ 272.268 |

## ⚡ Atalhos de Teclado

- `Ctrl+K`: Busca global
- `Esc`: Fechar modais
- `↑↓`: Navegar resultados
- `Enter`: Selecionar

## 🆘 Suporte Rápido

### Erro ao instalar?
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Porta em uso?
```bash
npm run dev -- --port 3001
```

### Dados não carregam?
1. Verifique o formato CSV (delimitador ;)
2. Confirme encoding UTF-8
3. Use o arquivo de exemplo

## 📱 Acesso Mobile

O sistema é totalmente responsivo. Acesse de qualquer dispositivo!

## 🎉 Pronto!

Você está pronto para analisar gastos parlamentares e identificar irregularidades.

**Dúvidas?** Consulte a documentação completa em `DOCUMENTACAO_TECNICA.md`

---

💡 **Dica**: Comece fazendo upload do arquivo `dados-teste-completo.csv` para ver o sistema em ação!
