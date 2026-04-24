import express from 'express';
import billsRoutes from './bills.js';
import ledgerRoutes from './ledger.js';
import dashboardRoutes from './dashboard.js';

const router = express.Router();

router.use('/bills', billsRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
