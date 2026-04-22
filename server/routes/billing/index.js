import express from 'express';
import billsRoutes from './bills.js';

const router = express.Router();

router.use('/bills', billsRoutes);

export default router;
