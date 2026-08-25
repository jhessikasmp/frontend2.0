import { Request, Response } from 'express';
import RecurringExpense from '../models/RecurringExpense';
import Expense from '../models/Expense';

export const createRecurringExpense = async (req: Request, res: Response) => {
  try {
    const { user, name, value, category, description, frequency, startDate } = req.body;
    const recurring = new RecurringExpense({ user, name, value, category, description, frequency, startDate });
    await recurring.save();
    return res.status(201).json({ success: true, data: recurring });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserRecurringExpenses = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const expenses = await RecurringExpense.find({ user: userId, active: true }).sort({ startDate: -1 });
    return res.json({ success: true, data: expenses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRecurringExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await RecurringExpense.find({ active: true }).populate('user', 'name email').sort({ startDate: -1 });
    return res.json({ success: true, data: expenses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRecurringExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, value, category, description, frequency, startDate, active } = req.body;
    const updated = await RecurringExpense.findByIdAndUpdate(
      id,
      { name, value, category, description, frequency, startDate, active },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Despesa recorrente não encontrada' });
    }
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRecurringExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await RecurringExpense.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Despesa recorrente removida' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateRecurringExpenses = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

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

    return res.json({ success: true, message: `${generated} despesas recorrentes geradas`, generated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};