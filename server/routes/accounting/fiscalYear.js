import express from 'express';
import { getFiscalYears, createFiscalYear, updateFiscalYear, deleteFiscalYear, activateFiscalYear } from '../../controllers/accounting/fiscalYear.js';

const router = express.Router();

router.get('/', getFiscalYears);
router.post('/', createFiscalYear);
router.put('/:id', updateFiscalYear);
router.delete('/:id', deleteFiscalYear);
router.patch('/:id/activate', activateFiscalYear);

export default router;
