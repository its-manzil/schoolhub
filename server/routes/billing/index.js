import express from 'express';
import billsRoutes from './bills.js';
import ledgerRoutes from './ledger.js';
import dashboardRoutes from './dashboard.js';
import { getDB } from '../../config/db.js';

const router = express.Router();

// Helper to get schoolId from headers
const getSchoolId = (req) => {
  const id = req.headers['x-school-id'] || req.body.schoolId || req.query.schoolId || null;
  if (id && !isNaN(id)) {
    return Number(id);
  }
  return id;
};

router.use('/bills', billsRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/dashboard', dashboardRoutes);

/**
 * GET /api/billing/inventory-bills/academic-years
 * Get unique academic years from inventory bills
 */
router.get('/inventory-bills/academic-years', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID is required' });
    }

    const db = getDB();
    const years = await db.collection('inventory_bills')
      .distinct('academicYear', { schoolId });

    // Sort years in descending order
    const sortedYears = years.sort((a, b) => b.localeCompare(a));

    res.json({
      success: true,
      data: sortedYears
    });
  } catch (error) {
    console.error('Error fetching inventory academic years:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch academic years' });
  }
});

/**
 * GET /api/billing/inventory-bills
 * Get inventory bills with optional filtering
 */
router.get('/inventory-bills', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID is required' });
    }

    const db = getDB();
    const { academicYear, className, section, status, search } = req.query;

    // Build query
    const query = { schoolId };
    if (academicYear) query.academicYear = academicYear;
    if (className) query.className = className;
    if (section) query.section = section;
    if (status && status !== 'all') query.paymentStatus = status;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { invoiceId: { $regex: search, $options: 'i' } }
      ];
    }

    const bills = await db.collection('inventory_bills')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: bills
    });
  } catch (error) {
    console.error('Error fetching inventory bills:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory bills' });
  }
});

export default router;
