import express from 'express';
const router = express.Router();
import * as voucherController from './controller.js';

// Create Draft Voucher
router.post('/create', voucherController.createDraft);

// Update Voucher (only if draft)
router.put('/:id', voucherController.updateVoucher);

// Post Voucher (draft to posted)
router.post('/:id/post', voucherController.postVoucher);

// Get Voucher by ID
router.get('/:id', voucherController.getVoucher);

// List Vouchers with pagination and filtering
router.get('/', voucherController.listVouchers);

export default router;
