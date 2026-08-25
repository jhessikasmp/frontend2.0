
import { Router } from 'express';
import { addViagemExpense, getViagemExpenses, getViagemExpensesTotal, getViagemExpensesGrouped, getAllViagemExpenses, getViagemExpensesByYear, getViagemExpensesByUserAndYear, deleteViagemExpense } from '../controllers/ViagemExpenseController';

const router = Router();

router.post('/', addViagemExpense);
router.get('/user/:userId', getViagemExpenses);
router.get('/user/:userId/total', getViagemExpensesTotal);
router.get('/user/:userId/grouped', getViagemExpensesGrouped);
// Nova rota global para despesas de viagem
router.get('/all', getAllViagemExpenses);
// Rota global para despesas por ano
router.get('/year/:year', getViagemExpensesByYear);
// Rota para despesas por ano e por userId
router.get('/year/:userId/:year', getViagemExpensesByUserAndYear);
// DELETE /api/viagem-expense/:id
router.delete('/:id', deleteViagemExpense);

export default router;
