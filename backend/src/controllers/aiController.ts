import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Investment from '../models/Investment';
import User from '../models/User';
import Salary from '../models/Salary';
import RecurringExpense from '../models/RecurringExpense';

const AI_API_KEY = '5v1KKO8SRFurvsT4OVrdYzgEvGLe8tsN';
const AI_MODEL = 'deepseek-ai/DeepSeek-V4-Flash';
const AI_API_URL = 'https://api.deepseek.com/v1/chat/completions';

function formatEUR(v: number): string {
  return `€ ${v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcularMetricas(userId: string, expenses: any[], investments: any[], salaries: any[], recurring: any[]) {
  const totalDespesas = expenses.reduce((s: number, e: any) => s + (e.value || 0), 0);
  const mesesExp = new Set(expenses.map((e: any) => {
    const d = new Date(e.date);
    return `${d.getFullYear()}-${d.getMonth()}`;
  })).size;
  const mediaMensalDespesas = mesesExp > 0 ? totalDespesas / mesesExp : 0;

  const totalSalarios = salaries.reduce((s: number, sal: any) => s + (sal.value || 0), 0);
  const mesesSal = new Set(salaries.map((s: any) => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${d.getMonth()}`;
  })).size;
  const mediaSalario = mesesSal > 0 ? totalSalarios / mesesSal : 0;

  const catTotals: Record<string, number> = {};
  expenses.forEach((e: any) => {
    const cat = e.category || 'Outros';
    catTotals[cat] = (catTotals[cat] || 0) + (e.value || 0);
  });
  const topCat = Object.entries(catTotals).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 3);

  const totalInv = investments.reduce((s: number, i: any) => s + (Number(i.valor) || 0), 0);
  const invPorMoeda: Record<string, number> = {};
  investments.forEach((i: any) => {
    const m = i.moeda || 'EUR';
    invPorMoeda[m] = (invPorMoeda[m] || 0) + (Number(i.valor) || 0);
  });

  const totalRecorrentes = recurring.reduce((s: number, r: any) => s + (r.value || 0), 0);

  return {
    totalDespesas,
    totalSalarios,
    mediaMensalDespesas,
    mediaSalario,
    saldoMedio: mediaSalario - mediaMensalDespesas,
    topCategorias: topCat,
    catTotals,
    totalInv,
    invPorMoeda,
    totalRecorrentes,
    numExpenses: expenses.length,
    numInvestments: investments.length,
    mesesAnalisados: Math.max(mesesExp, mesesSal, 1)
  };
}

function gerarAnaliseFallback(m: ReturnType<typeof calcularMetricas>): string {
  const pctGasto = m.mediaSalario > 0 ? ((m.mediaMensalDespesas / m.mediaSalario) * 100).toFixed(1) : 'N/A';
  const podePoup = Math.max(0, m.saldoMedio * 0.3);
  const poupAnual = podePoup * 12;

  let score = 5;
  if (m.saldoMedio > 0) score++;
  if (m.totalInv > 10000) score++;
  if (m.totalInv > 50000) score++;
  if (m.mediaMensalDespesas < m.mediaSalario * 0.5) score++;
  if (m.numInvestments > 3) score++;
  score = Math.min(10, Math.max(1, score));

  return `
<div class="space-y-3 text-sm">
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
    <h3 class="font-bold text-base mb-2 flex items-center gap-2">📊 Visão Geral</h3>
    <div class="grid grid-cols-2 gap-2">
      <div><span class="text-gray-500">Rendimento médio:</span><br><span class="font-semibold">${formatEUR(m.mediaSalario)}/mês</span></div>
      <div><span class="text-gray-500">Gasto médio:</span><br><span class="font-semibold">${formatEUR(m.mediaMensalDespesas)}/mês</span></div>
      <div><span class="text-gray-500">Saldo médio:</span><br><span class="font-semibold ${m.saldoMedio >= 0 ? 'text-green-600' : 'text-red-600'}">${formatEUR(m.saldoMedio)}/mês</span></div>
      <div><span class="text-gray-500">% gasto do rendimento:</span><br><span class="font-semibold">${pctGasto}%</span></div>
    </div>
  </div>

  ${m.topCategorias.length > 0 ? `
  <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
    <h3 class="font-bold text-base mb-2 flex items-center gap-2">📈 Top Categorias de Gastos</h3>
    <div class="space-y-1">
      ${m.topCategorias.map(([cat, val]: [string, any], i: number) => {
        const pct = m.totalDespesas > 0 ? ((Number(val) / m.totalDespesas) * 100).toFixed(1) : '0';
        return `<div class="flex justify-between"><span>${i + 1}. ${cat}</span><span class="font-medium">${formatEUR(Number(val))} (${pct}%)</span></div>`;
      }).join('')}
    </div>
  </div>` : ''}

  <div class="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
    <h3 class="font-bold text-base mb-2 flex items-center gap-2">💡 Recomendações</h3>
    <ul class="space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
      ${m.saldoMedio <= 0 ? '<li>⚠️ As despesas estão a exceder o rendimento. Reveja gastos supérfluos.</li>' : `<li>✅ Tem saldo positivo de ${formatEUR(m.saldoMedio)}/mês. Tente poupar pelo menos ${formatEUR(podePoup)}/mês.</li>`}
      ${m.totalRecorrentes > 0 ? `<li>📋 Despesas recorrentes activas: ${formatEUR(m.totalRecorrentes)}/mês em subscrições.</li>` : '<li>📋 Considere automatizar poupanças com débito directo.</li>'}
      ${m.totalInv < 1000 ? '<li>💰 Comece a investir mesmo com pouco. ETFs como VWCE são boa entrada.</li>' : `<li>💰 Carteira de ${formatEUR(m.totalInv)}. Diversifique entre EUR, USD, GBP se possível.</li>`}
      ${pctGasto !== 'N/A' && Number(pctGasto) > 80 ? '<li>🔴 Mais de 80% do rendimento vai em despesas. Tente reduzir para 70%.</li>' : ''}
    </ul>
  </div>

  <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
    <h3 class="font-bold text-base mb-2 flex items-center gap-2">🔮 Projeção</h3>
    <div class="grid grid-cols-2 gap-2">
      <div><span class="text-gray-500">Saldo projetado/mês:</span><br><span class="font-semibold">${formatEUR(m.saldoMedio)}</span></div>
      <div><span class="text-gray-500">Poupança possível/mês:</span><br><span class="font-semibold text-green-600">${formatEUR(podePoup)}</span></div>
      <div><span class="text-gray-500">Economia anual estimada:</span><br><span class="font-semibold text-green-600">${formatEUR(poupAnual)}</span></div>
      <div><span class="text-gray-500">Saúde financeira:</span><br><span class="font-semibold">${score}/10 🎯</span></div>
    </div>
  </div>
</div>`;
}

const SYSTEM_PROMPT = `You are a financial analysis AI assistant for a personal finance app.
Analyze user financial data and provide insights, estimates, and recommendations.
Always respond in Portuguese (Portugal - pt-PT).
Format responses in clean HTML for display in a web app.
Use bullet points, bold text, and clear sections.
Be concise but insightful. Base your analysis STRICTLY on the provided data, do not invent numbers.

Structure your response with these sections:
1. **Visão Geral** - quick summary with real numbers
2. **📈 Gastos por Categoria** - top categories with real values and % of total
3. **💡 Recomendações Práticas** - 2-3 actionable tips based on real data
4. **🔮 Projeção Financeira** - realistic projections`;

export const analyzeFinances = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Gather all data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const [expenses, investments, salaries, recurring] = await Promise.all([
      Expense.find({ user: userId, date: { $gte: sixMonthsAgo } }).sort({ date: -1 }).limit(100),
      Investment.find({}).sort({ data: -1 }),
      Salary.find({ user: userId, date: { $gte: sixMonthsAgo } }).sort({ date: -1 }),
      RecurringExpense.find({ user: userId, active: true })
    ]);

    const metrics = calcularMetricas(userId, expenses, investments, salaries, recurring);

    const financialData = {
      periodo: `Últimos ${metrics.mesesAnalisados} meses`,
      totalDespesas: metrics.totalDespesas,
      mediaMensal: metrics.mediaMensalDespesas,
      totalSalarios: metrics.totalSalarios,
      mediaSalario: metrics.mediaSalario,
      saldoMedio: metrics.saldoMedio,
      despesasPorCategoria: metrics.catTotals,
      numDespesas: metrics.numExpenses,
      totalInvestimentos: metrics.totalInv,
      investimentosPorMoeda: metrics.invPorMoeda,
      numInvestimentos: metrics.numInvestments,
      totalRecorrentes: metrics.totalRecorrentes,
      topCategorias: metrics.topCategorias
    };

    const prompt = `Analyze this REAL financial data and provide insights. Use ONLY these numbers, do not invent values.

Financial Data:
${JSON.stringify(financialData, null, 2)}

Provide analysis in HTML format with real values. Be practical and direct.`;

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      return res.json({ 
        success: true, 
        analysis: gerarAnaliseFallback(metrics),
        raw: financialData,
        source: 'fallback'
      });
    }

    const aiResponse: any = await response.json();
    let analysis = aiResponse.choices?.[0]?.message?.content || '';

    // If AI response is empty or just HTML tags without content, use fallback
    if (!analysis || analysis.length < 50) {
      analysis = gerarAnaliseFallback(metrics);
    }

    return res.json({ 
      success: true, 
      analysis,
      raw: financialData,
      source: 'ai'
    });
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    const emptyMetrics = calcularMetricas('', [], [], [], []);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      fallback: gerarAnaliseFallback(emptyMetrics)
    });
  }
};

export const generateEstimates = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const [expenses, salaries, recurring] = await Promise.all([
      Expense.find({ user: userId, date: { $gte: sixMonthsAgo } }).sort({ date: -1 }),
      Salary.find({ user: userId, date: { $gte: sixMonthsAgo } }).sort({ date: -1 }),
      RecurringExpense.find({ user: userId, active: true })
    ]);

    if (expenses.length === 0) {
      return res.json({
        success: true,
        estimates: {
          monthlyAverage: 0,
          nextMonth: 0,
          quarterlyProjection: 0,
          savingsPotential: 0,
          message: 'Sem dados suficientes para estimativas precisas'
        }
      });
    }

    const monthlyTotals: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + (e.value || 0);
    });

    const values = Object.values(monthlyTotals);
    const monthlyAverage = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
    
    const totalSalarios = salaries.reduce((s: number, sal: any) => s + (sal.value || 0), 0);
    const mesesSal = new Set(salaries.map((s: any) => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })).size;
    const mediaSalario = mesesSal > 0 ? totalSalarios / mesesSal : 0;
    const totalRecorrentes = recurring.reduce((s: number, r: any) => s + (r.value || 0), 0);

    return res.json({
      success: true,
      estimates: {
        monthlyAverage: Math.round(monthlyAverage * 100) / 100,
        saldoMedio: Math.round((mediaSalario - monthlyAverage) * 100) / 100,
        mediaSalario: Math.round(mediaSalario * 100) / 100,
        totalRecorrentes: Math.round(totalRecorrentes * 100) / 100,
        savingsPotential: Math.max(0, Math.round((mediaSalario - monthlyAverage) * 0.3 * 100) / 100),
        dataPoints: values.length
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};