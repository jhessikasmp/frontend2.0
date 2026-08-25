import { Router } from 'express';
import {
  createRecurringExpense,
  getUserRecurringExpenses,
  getAllRecurringExpenses,
  deleteRecurringExpense,
  generateRecurringExpenses,
  updateRecurringExpense
} from '../controllers/recurringExpenseController';

const router = Router();

router.post('/', createRecurringExpense);
router.get('/user/:userId', getUserRecurringExpenses);
router.get('/all', getAllRecurringExpenses);
router.put('/:id', updateRecurringExpense);
router.delete('/:id', deleteRecurringExpense);
router.post('/generate', generateRecurringExpenses);

export default router;
