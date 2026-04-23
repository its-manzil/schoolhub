import express from 'express';
import organizationRoutes from './organization.js';
import fiscalYearRoutes from './fiscalYear.js';
import coaRoutes from './coa.js';
import bankCashRoutes from './bankCash.js';
import contactRoutes from './contacts.js';
import taxRoutes from './tax.js';
import voucherRoutes from './voucher.js';
import tdsRoutes from './tds.js';
import feeManagementRoutes from './feeManagement.js';

const router = express.Router();

router.use('/organization', organizationRoutes);
router.use('/fiscal-years', fiscalYearRoutes);
router.use('/coa', coaRoutes);
router.use('/bank-cash', bankCashRoutes);
router.use('/contacts', contactRoutes);
router.use('/tax', taxRoutes);
router.use('/voucher', voucherRoutes);
router.use('/fee-management', feeManagementRoutes);
router.use('/', tdsRoutes);

export default router;
