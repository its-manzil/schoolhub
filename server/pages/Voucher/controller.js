import * as voucherService from './service.js';
import { validateVoucher } from './validation.js';

// Create Draft Voucher
export const createDraft = async (req, res) => {
  try {
    const { voucherData, entries } = req.body;
    
    // Validate basic structure
    if (!voucherData || !entries || !Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher structure',
        errors: ['voucherData and entries array are required']
      });
    }

    // Generate voucher number
    const voucherNo = await voucherService.generateVoucherNumber(voucherData.type);
    
    // Calculate totals
    const totalDebit = entries.reduce((sum, entry) => sum + (parseFloat(entry.debit) || 0), 0);
    const totalCredit = entries.reduce((sum, entry) => sum + (parseFloat(entry.credit) || 0), 0);

    // Create voucher with draft status
    const voucher = await voucherService.createVoucher({
      ...voucherData,
      voucherNo,
      totalDebit,
      totalCredit,
      status: 'draft',
      entries
    });

    res.status(201).json({
      success: true,
      message: 'Draft voucher created successfully',
      data: voucher
    });
  } catch (error) {
    console.error('Create draft voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message]
    });
  }
};

// Update Voucher (only if draft)
export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { voucherData, entries } = req.body;
    
    // Get existing voucher
    const existingVoucher = await voucherService.getVoucherById(id);
    if (!existingVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found',
        errors: [`Voucher with id ${id} not found`]
      });
    }

    // Check if voucher is still draft
    if (existingVoucher.status !== 'draft') {
      return res.status(403).json({
        success: false,
        message: 'Cannot update posted voucher',
        errors: ['Only draft vouchers can be updated']
      });
    }

    // Update voucher
    const updatedVoucher = await voucherService.updateVoucher(id, {
      ...voucherData,
      entries
    });

    res.status(200).json({
      success: true,
      message: 'Voucher updated successfully',
      data: updatedVoucher
    });
  } catch (error) {
    console.error('Update voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message]
    });
  }
};

// Post Voucher (draft to posted)
export const postVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get existing voucher
    const existingVoucher = await voucherService.getVoucherById(id);
    if (!existingVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found',
        errors: [`Voucher with id ${id} not found`]
      });
    }

    // Check if voucher is still draft
    if (existingVoucher.status !== 'draft') {
      return res.status(403).json({
        success: false,
        message: 'Voucher already posted',
        errors: ['Voucher is already posted and cannot be posted again']
      });
    }

    // Validate voucher before posting
    const validation = validateVoucher(existingVoucher);
    if (validation.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Post the voucher
    const postedVoucher = await voucherService.postVoucher(id);

    res.status(200).json({
      success: true,
      message: 'Voucher posted successfully',
      data: postedVoucher
    });
  } catch (error) {
    console.error('Post voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message]
    });
  }
};

// Get Voucher by ID
export const getVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await voucherService.getVoucherById(id);
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found',
        errors: [`Voucher with id ${id} not found`]
      });
    }

    res.status(200).json({
      success: true,
      message: 'Voucher retrieved successfully',
      data: voucher
    });
  } catch (error) {
    console.error('Get voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message]
    });
  }
};

// List Vouchers with pagination and filtering
export const listVouchers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      dateFrom, 
      dateTo,
      fiscalYear 
    } = req.query;

    const vouchers = await voucherService.listVouchers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      filters: {
        type,
        status,
        dateFrom,
        dateTo,
        fiscalYear
      }
    });

    res.status(200).json({
      success: true,
      message: 'Vouchers retrieved successfully',
      data: vouchers
    });
  } catch (error) {
    console.error('List vouchers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message]
    });
  }
};
