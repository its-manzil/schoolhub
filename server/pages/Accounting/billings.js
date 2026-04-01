import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireAccounting, requireSchoolAdmin } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Helper to get schoolId for user
const getSchoolId = async (db, user) => {
  if (user.role === 'schooladmin' || user.role === 'superadmin') {
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    return adminData?.schoolId;
  } else if (user.role === 'accountant') {
    const accountantData = await db.collection('accountants').findOne({ _id: new ObjectId(user.id) });
    return accountantData?.schoolId;
  }
  return null;
};

// Get all billings/fees for a school
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School data not found' });
    }

    const billings = await db.collection('billings')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: billings });
  } catch (error) {
    console.error('Get billings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch billings' });
  }
});

// Create new billing/invoice
router.post('/', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School data not found' });
    }

    const { studentId, studentName, className, section, items, totalAmount, dueDate } = req.body;

    if (!studentId || !items || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const billing = {
      schoolId,
      studentId,
      studentName,
      className,
      section,
      items, // Array of { description, amount }
      totalAmount,
      amountPaid: 0,
      status: 'unpaid', // 'unpaid', 'partially_paid', 'paid'
      dueDate: dueDate || new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('billings').insertOne(billing);

    res.status(201).json({ success: true, message: 'Invoice created successfully', data: { ...billing, _id: result.insertedId } });
  } catch (error) {
    console.error('Create billing error:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
});

// Update billing (e.g., record payment)
router.put('/:id/payment', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { amountPaid } = req.body;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School data not found' });
    }

    const billing = await db.collection('billings').findOne({ _id: new ObjectId(id), schoolId });
    if (!billing) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const newAmountPaid = (billing.amountPaid || 0) + parseFloat(amountPaid);
    let status = 'unpaid';
    if (newAmountPaid >= billing.totalAmount) {
      status = 'paid';
    } else if (newAmountPaid > 0) {
      status = 'partially_paid';
    }

    await db.collection('billings').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          amountPaid: newAmountPaid,
          status,
          updatedAt: new Date().toISOString()
        },
        $push: {
          payments: {
            amount: parseFloat(amountPaid),
            date: new Date().toISOString(),
            recordedBy: req.user.id
          }
        }
      }
    );

    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
});

export default router;
