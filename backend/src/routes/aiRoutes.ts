import { Router } from 'express';
import { analyzeFinances, generateEstimates } from '../controllers/aiController';

const router = Router();

router.get('/analyze/:userId', analyzeFinances);
router.get('/estimates/:userId', generateEstimates);

export default router;