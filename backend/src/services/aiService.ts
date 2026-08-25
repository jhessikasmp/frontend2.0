const DEEPSEEK_API_KEY = '5v1KKO8SRFurvsT4OVrdYzgEvGLe8tsN';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIAnalysisRequest {
  salaries: { user: string; value: number; date: Date }[];
  expenses: { name: string; value: number; category: string; date: Date }[];
  investments: { nome: string; valor: number; moeda: string; tipo: string }[];
  recurringExpenses: { name: string; value: number; category: string; frequency: string }[];
}

export async function generateFinancialAnalysis(data: AIAnalysisRequest): Promise<string> {
  try {
    // Calcular totais reais a partir dos dados fornecidos
    const totalSalarios = data.salaries.reduce((acc, s) => acc + s.value, 0);
    const totalDespesas = data.expenses.reduce((acc, e) => acc + e.value, 0);
    const totalInvestimentos = data.investments.reduce((acc, i) => acc + i.valor, 0);
    
    // Agrupar despesas por categoria
    const despesasPorCategoria: Record<string, number> = {};
    data.expenses.forEach(e => {
      despesasPorCategoria[e.category] = (despesasPorCategoria[e.category] || 0) + e.value;
    });
    const topCategorias = Object.entries(despesasPorCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Calcular média mensal de despesas
    const mesesComDados = new Set(data.expenses.map(e => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })).size;
    const mediaMensalDespesas = mesesComDados > 0 ? totalDespesas / mesesComDados : 0;

    // Saldo médio por mês
    const mesesSalario = new Set(data.salaries.map(s => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })).size;
    const mediaSalarioMensal = mesesSalario > 0 ? totalSalarios / mesesSalario : 0;
    const saldoMedio = mediaSalarioMensal - mediaMensalDespesas;

    const systemPrompt = `Você é um assistente especializado em análise financeira pessoal.
Analise os dados reais fornecidos e gere uma análise PRÁTICA e ÚTIL em português de Portugal.
Seja específico com números reais, não invente valores.
Dê recomendações acionáveis baseadas nos dados reais.

Formate a resposta assim:
**📊 Análise Financeira**

[parágrafo curto com visão geral]

**📈 Gastos Mensais**
- Média mensal total: [valor real]
- Principais categorias: [lista das 3 maiores com valores reais]
- Versus rendimento: [comparação real]

**💡 Recomendações**
- [recomendação 1 baseada nos dados reais]
- [recomendação 2 baseada nos dados reais]
- [recomendação 3 baseada nos dados reais]

**💰 Projeção**
- Saldo projetado mensal: [baseado em média real]
- Poupança possível: [sugestão realista baseada nos dados]`;

    const userPrompt = `Aqui estão os dados financeiros REAIS do utilizador:

Salários registados: ${data.salaries.length} meses
Total de salários: ${totalSalarios.toFixed(2)}
Média salarial mensal: ${mediaSalarioMensal.toFixed(2)}

Despesas registadas: ${data.expenses.length} registos
Total de despesas: ${totalDespesas.toFixed(2)}
Média mensal de despesas: ${mediaMensalDespesas.toFixed(2)}
Saldo médio mensal (salário - despesas): ${saldoMedio.toFixed(2)}

Top 3 categorias de despesas:
${topCategorias.map(([cat, val], i) => `${i + 1}. ${cat}: ${val.toFixed(2)}`).join('\n')}

Investimentos totais: ${totalInvestimentos.toFixed(2)}
Nº de investimentos: ${data.investments.length}

Despesas recorrentes activas: ${data.recurringExpenses.length}
${data.recurringExpenses.map(r => `  - ${r.name}: ${r.value} (${r.frequency})`).join('\n')}

Com base nestes valores REAIS, forneça uma análise prática e útil.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V4-Flash',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const responseData: any = await response.json();
    return responseData.choices[0]?.message?.content || 'Não foi possível gerar análise.';
  } catch (error: any) {
    console.error('Erro ao chamar DeepSeek API:', error?.message || error);
    return `Erro ao gerar análise: ${error?.message || 'Erro desconhecido'}`;
  }
}