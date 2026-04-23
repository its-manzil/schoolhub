import express from 'express';
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

/**
 * GET /api/billing/ledger/:studentId
 * Fetch student payment history and paid months for ledger-based billing
 * Returns: paid months per component, bill history
 */
router.get('/:studentId', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId } = req.params;
    const { academicYear, componentId } = req.query;
    const db = getDB();

    // Build query for bills
    const billQuery = { schoolId, studentId };
    if (academicYear) {
      billQuery.academicYear = academicYear;
    }

    // Fetch all bills for the student
    const bills = await db.collection('bills')
      .find(billQuery)
      .sort({ createdAt: -1 })
      .toArray();

    // Extract paid months per component from bill components
    const paidComponents = {};
    
    bills.forEach(bill => {
      if (bill.components && Array.isArray(bill.components)) {
        bill.components.forEach(comp => {
          const compId = comp.id || comp.name;
          if (!paidComponents[compId]) {
            paidComponents[compId] = {
              name: comp.name,
              paidMonths: [],
              paidCount: 0,
              totalPaid: 0
            };
          }
          
          // If component has monthRange, extract paid months
          if (comp.monthRange) {
            const { fromMonth, toMonth } = comp.monthRange;
            if (fromMonth && toMonth) {
              for (let m = fromMonth; m <= toMonth; m++) {
                if (!paidComponents[compId].paidMonths.includes(m)) {
                  paidComponents[compId].paidMonths.push(m);
                }
              }
            } else if (fromMonth) {
              if (!paidComponents[compId].paidMonths.includes(fromMonth)) {
                paidComponents[compId].paidMonths.push(fromMonth);
              }
            }
          }
          
          paidComponents[compId].paidCount += comp.qty || 1;
          paidComponents[compId].totalPaid += comp.amount || 0;
        });
      }
    });

    // Sort paid months for each component
    Object.keys(paidComponents).forEach(key => {
      paidComponents[key].paidMonths.sort((a, b) => a - b);
    });

    // If specific component requested, return only that data
    if (componentId && paidComponents[componentId]) {
      return res.json({
        success: true,
        data: {
          component: paidComponents[componentId],
          bills: bills.map(b => ({
            invoiceId: b.invoiceId,
            academicYear: b.academicYear,
            createdAt: b.createdAt,
            createdAtBS: b.createdAtBS,
            components: b.components.filter(c => (c.id || c.name) === componentId)
          }))
        }
      });
    }

    res.json({
      success: true,
      data: {
        studentId,
        academicYear: academicYear || 'all',
        paidComponents,
        billCount: bills.length,
        bills: bills.map(b => ({
          _id: b._id,
          invoiceId: b.invoiceId,
          academicYear: b.academicYear,
          totalAmount: b.totalAmount,
          paymentStatus: b.paymentStatus,
          createdAt: b.createdAt,
          createdAtBS: b.createdAtBS
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ledger data' });
  }
});

/**
 * GET /api/billing/ledger/:studentId/paid-months
 * Get paid months for a specific component (for monthly billing)
 */
router.get('/:studentId/paid-months', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId } = req.params;
    const { academicYear, componentId, componentName } = req.query;
    const db = getDB();

    if (!academicYear) {
      return res.status(400).json({
        success: false,
        error: 'Academic year is required'
      });
    }

    // Build query
    const billQuery = { 
      schoolId, 
      studentId, 
      academicYear,
      'components.name': componentName || componentId
    };

    // Find bills with this component
    const bills = await db.collection('bills')
      .find(billQuery)
      .toArray();

    // Extract paid months
    const paidMonths = new Set();
    
    bills.forEach(bill => {
      if (bill.components) {
        const comp = bill.components.find(c => 
          c.id === componentId || c.name === componentName
        );
        if (comp && comp.monthRange) {
          const { fromMonth, toMonth } = comp.monthRange;
          if (fromMonth && toMonth) {
            for (let m = parseInt(fromMonth); m <= parseInt(toMonth); m++) {
              paidMonths.add(m);
            }
          } else if (fromMonth) {
            paidMonths.add(parseInt(fromMonth));
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        studentId,
        academicYear,
        componentId: componentId || componentName,
        paidMonths: Array.from(paidMonths).sort((a, b) => a - b)
      }
    });
  } catch (error) {
    console.error('Error fetching paid months:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch paid months' });
  }
});

export default router;
