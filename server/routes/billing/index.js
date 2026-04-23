import express from 'express';
import billsRoutes from './bills.js';
import ledgerRoutes from './ledger.js';

const router = express.Router();

router.use('/bills', billsRoutes);
router.use('/ledger', ledgerRoutes);

export default router;
