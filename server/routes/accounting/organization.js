import express from 'express';
import { getOrganization, saveOrganization } from '../../controllers/accounting/organization.js';
import { verifyToken, requireAccounting } from '../../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAccounting);

router.get('/', getOrganization);
router.post('/', saveOrganization);
router.put('/', saveOrganization);

export default router;
