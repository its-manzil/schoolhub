import express from 'express';
import { getDB } from '../../config/db.js';
import { getCurrentBSDate } from '../../utils/dateConverter.cjs';

const router = express.Router();

// Helper to get schoolId from headers
const getSchoolId = (req) => {
  const id = req.headers['x-school-id'] || req.body.schoolId || req.query.schoolId || null;
  if (id && !isNaN(id)) {
    return Number(id);
  }
  return id;
};

// GET /api/billing/bills - Get all bills for a school
router.get('/', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const db = getDB();

    const bills = await db.collection('bills')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: bills
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bills' });
  }
});

// GET /api/billing/bills/:id - Get single bill
router.get('/:id', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const db = getDB();

    const bill = await db.collection('bills').findOne({ 
      _id: new ObjectId(id),
      schoolId 
    });

    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bill' });
  }
});

// POST /api/billing/bills - Create new bill(s)
router.post('/', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { 
      academicYear, 
      selectedStudents, 
      selectedComponents, 
      paymentMode,
      chequeNo,
      vatRate = 13
    } = req.body;

    const db = getDB();
    const createdBills = [];
    const errors = [];

    // Get current BS date
    const bsDate = getCurrentBSDate();
    const bsDateString = `${bsDate.year}-${String(bsDate.month).padStart(2, '0')}-${String(bsDate.day).padStart(2, '0')}`;
    const bsYear = bsDate.year;

    // Get tax setting and school info (for PAN/VAT)
    const taxSetting = await db.collection('tax_setting').findOne({ schoolId });
    const schoolInfo = await db.collection('schools').findOne({ schoolId });
    const finalVatRate = taxSetting?.vatRate || vatRate;
    const schoolPanVat = schoolInfo?.panVat || '';

    // Process each student
    for (const student of selectedStudents) {
      try {
        // Check if bill already exists for this student in this academic year
        const existingBill = await db.collection('bills').findOne({
          schoolId,
          studentId: student._id,
          academicYear
        });

        if (existingBill) {
          errors.push({
            studentName: student.name,
            error: 'Bill already exists for this student in this academic year'
          });
          continue;
        }

        // Calculate totals
        const subTotal = selectedComponents.reduce((sum, comp) => sum + comp.amount, 0);
        const vatAmount = (subTotal * finalVatRate) / 100;
        const totalAmount = subTotal + vatAmount;

        // Generate invoice ID
        const random = Math.floor(1000 + Math.random() * 9000);
        const cleanStudentId = student.studentId?.replace(/[^a-zA-Z0-9]/g, '') || student._id.substring(0, 8);
        const invoiceId = `INV-${bsYear}-${schoolId}-${cleanStudentId}-${random}`;

        // Determine payment status
        const paymentStatus = paymentMode === 'cheque' ? 'pending' : 'paid';

        const billData = {
          invoiceId,
          schoolId,
          studentId: student._id,
          studentName: student.name,
          className: student.className,
          academicYear,
          components: selectedComponents.map(comp => ({
            id: comp.id,
            name: comp.name,
            qty: comp.qty,
            rate: comp.rate,
            amount: comp.amount,
            frequency: comp.frequency,
            monthRange: comp.monthRange
          })),
          subTotal: Math.round(subTotal * 100) / 100,
          vatRate: finalVatRate,
          vatAmount: Math.round(vatAmount * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100,
          paymentMode,
          paymentStatus,
          chequeNo: paymentMode === 'cheque' ? chequeNo : undefined,
          createdAt: new Date(),
          createdAtBS: bsDateString,
          isLocked: true,
          schoolPanVat
        };

        const result = await db.collection('bills').insertOne(billData);
        
        createdBills.push({
          _id: result.insertedId,
          ...billData
        });
      } catch (err) {
        console.error(`Error creating bill for student ${student._id}:`, err);
        errors.push({
          studentName: student.name,
          error: err.message || 'Failed to create bill'
        });
      }
    }

    res.json({
      success: true,
      data: createdBills,
      errors: errors.length > 0 ? errors : undefined,
      message: `Created ${createdBills.length} bill(s)${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });
  } catch (error) {
    console.error('Error creating bills:', error);
    res.status(500).json({ success: false, error: 'Failed to create bills' });
  }
});

// PATCH /api/billing/bills/:id/mark-paid - Mark bill as paid
router.patch('/:id/mark-paid', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const db = getDB();

    // Import ObjectId
    const { ObjectId } = await import('mongodb');

    const result = await db.collection('bills').updateOne(
      { 
        _id: new ObjectId(id),
        schoolId 
      },
      {
        $set: {
          paymentStatus: 'paid',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    res.json({ success: true, message: 'Bill marked as paid' });
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({ success: false, error: 'Failed to mark bill as paid' });
  }
});

// DELETE /api/billing/bills/:id - Delete bill
router.delete('/:id', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const db = getDB();

    // Import ObjectId
    const { ObjectId } = await import('mongodb');

    // Check if bill is locked
    const bill = await db.collection('bills').findOne({
      _id: new ObjectId(id),
      schoolId
    });

    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    if (bill.isLocked) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete locked bill' 
      });
    }

    const result = await db.collection('bills').deleteOne({
      _id: new ObjectId(id),
      schoolId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ success: false, error: 'Failed to delete bill' });
  }
});

// GET /api/billing/bills/check-existing - Check if bill exists for student
router.get('/check-existing', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId, academicYear } = req.query;
    const db = getDB();

    const existingBill = await db.collection('bills').findOne({
      schoolId,
      studentId,
      academicYear
    });

    res.json({
      success: true,
      exists: !!existingBill,
      data: existingBill
    });
  } catch (error) {
    console.error('Error checking existing bill:', error);
    res.status(500).json({ success: false, error: 'Failed to check existing bill' });
  }
});

export default router;
