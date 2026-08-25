import cron from 'node-cron';
import RecurringExpense from '../models/RecurringExpense';
import Expense from '../models/Expense';

/**
 * Gera despesas recorrentes automaticamente
 * Verifica todas as despesas recorrentes ativas e cria as que
 * devem ser geradas no mês atual com base na frequência
 */
async function generateRecurringExpenses(): Promise<number> {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const recurringExpenses = await RecurringExpense.find({ active: true });

  let generated = 0;

  for (const re of recurringExpenses) {
    // Check if already generated this month
    if (re.lastGenerated) {
      const lastGen = new Date(re.lastGenerated);
      if (lastGen.getMonth() === currentMonth && lastGen.getFullYear() === currentYear) {
        continue;
      }
    }

    // Check if should generate based on frequency and start date
    const start = new Date(re.startDate);
    const monthsSinceStart = (currentYear - start.getFullYear()) * 12 + (currentMonth - start.getMonth());
    
    let shouldGenerate = false;
    switch (re.frequency) {
      case 'monthly':
        shouldGenerate = monthsSinceStart >= 0;
        break;
      case 'bimonthly':
        shouldGenerate = monthsSinceStart >= 0 && monthsSinceStart % 2 === 0;
        break;
      case 'quarterly':
        shouldGenerate = monthsSinceStart >= 0 && monthsSinceStart % 3 === 0;
        break;
    }

    if (!shouldGenerate) continue;

    // Create the expense entry
    const expense = new Expense({
      user: re.user,
      name: `${re.name} (Recorrente)`,
      value: re.value,
      category: re.category,
      description: re.description || `Gerado automaticamente - ${re.frequency}`,
      date: now,
    });
    await expense.save();

    // Update last generated
    re.lastGenerated = now;
    await re.save();
    generated++;
  }

  return generated;
}

/**
 * Inicia o serviço de cron para despesas recorrentes
 * Executa todo dia 1 de cada mês às 00:00
 */
export function startRecurringExpenseCron(): void {
  // Cron: todo dia 1 do mês à meia-noite
  cron.schedule('0 0 1 * *', async () => {
    console.log('⏰ [Cron] Verificando despesas recorrentes...');
    try {
      const generated = await generateRecurringExpenses();
      if (generated > 0) {
        console.log(`✅ [Cron] ${generated} despesas recorrentes geradas automaticamente`);
      } else {
        console.log('ℹ️ [Cron] Nenhuma despesa recorrente pendente para gerar');
      }
    } catch (error) {
      console.error('❌ [Cron] Erro ao gerar despesas recorrentes:', error);
    }
  });

  // Cron: também executa a cada hora para garantir que não perca dias
  // (útil caso o servidor reinicie no meio do mês)
  cron.schedule('0 * * * *', async () => {
    const now = new Date();
    if (now.getDate() !== 1) return; // Só executa no dia 1
    
    console.log('⏰ [Cron-Hourly] Verificação horária de despesas recorrentes...');
    try {
      const generated = await generateRecurringExpenses();
      if (generated > 0) {
        console.log(`✅ [Cron-Hourly] ${generated} despesas recorrentes geradas`);
      }
    } catch (error) {
      console.error('❌ [Cron-Hourly] Erro:', error);
    }
  });

  console.log('📅 Serviço de despesas recorrentes iniciado');
}

/**
 * Executa a geração de despesas recorrentes imediatamente
 * (útil para testes ou execução manual)
 */
export async function runRecurringExpensesNow(): Promise<number> {
  return generateRecurringExpenses();
}