import express from 'express';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../../controllers/administrative/staff.js';
import { verifyToken } from '../../middleware/auth.js';

const router = express.Router();

// All staff routes require authentication
router.get('/', verifyToken, getStaff);
router.post('/', verifyToken, createStaff);
router.put('/:id', verifyToken, updateStaff);
router.delete('/:id', verifyToken, deleteStaff);

export default router;
