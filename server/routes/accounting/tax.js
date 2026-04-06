import express from 'express';
import { verifyToken, requireAccounting } from '../../middleware/auth.js';
import { getTaxSettings, saveTaxSettings } from '../../controllers/accounting/tax.js';

const router = express.Router();

// Apply authentication middleware to all tax routes
router.use(verifyToken);
router.use(requireAccounting);

router.get('/', getTaxSettings);
router.post('/', saveTaxSettings);

export default router;
