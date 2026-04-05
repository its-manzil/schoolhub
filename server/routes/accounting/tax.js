import express from 'express';
import { getTaxSettings, saveTaxSettings } from '../../controllers/accounting/tax.js';

const router = express.Router();

router.get('/', getTaxSettings);
router.put('/', saveTaxSettings);

export default router;
