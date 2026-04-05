import express from 'express';
import { getBankCashAccounts, createBankCashAccount, updateBankCashAccount, deleteBankCashAccount } from '../../controllers/accounting/bankCash.js';

const router = express.Router();

router.get('/', getBankCashAccounts);
router.post('/', createBankCashAccount);
router.put('/:id', updateBankCashAccount);
router.delete('/:id', deleteBankCashAccount);

export default router;
