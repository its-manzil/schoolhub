import express from 'express';
import { ObjectId } from 'mongodb';
import { verifyToken, requireAccounting } from '../../middleware/auth.js';
import { getDB } from '../../config/db.js';
import { 
  getTDSEntries, 
  saveTDSEntry, 
  getPayees, 
  savePayee, 
  getChallans, 
  saveChallan,
  getSchoolId
} from '../../controllers/accounting/tds.js';

const router = express.Router();

// Apply authentication middleware to all TDS routes
router.use(verifyToken);
router.use(requireAccounting);

// TDS Entry routes
router.get('/tds-entry', getTDSEntries);
router.post('/tds-entry', saveTDSEntry);

// Payee routes
router.get('/payees', getPayees);
router.post('/payees', savePayee);

// Challan routes
router.get('/tds-challan', getChallans);
router.post('/tds-challan', saveChallan);

// Get pending entries for challan linking
router.get('/tds-entry/pending', async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const pendingEntries = await db.collection('tds_entries').find({
      schoolId,
      status: 'pending'
    }).sort({ date: -1 }).toArray();

    // Get payee and tax rule details
    const payeeIds = pendingEntries.map(entry => entry.payeeId);
    const payees = await db.collection('payees').find({
      _id: { $in: payeeIds }
    }).toArray();

    const taxSettings = await db.collection('tax_settings').findOne({ schoolId });

    const entriesWithDetails = pendingEntries.map(entry => {
      const payee = payees.find(p => p._id.toString() === entry.payeeId.toString());
      const rule = taxSettings?.taxRules?.find(r => r.id === entry.ruleId);
      
      return {
        ...entry,
        payeeName: payee?.name || 'Unknown',
        payeePAN: payee?.pan || 'N/A',
        ruleName: rule?.name || 'Unknown',
        revenueCode: rule?.revenueCode || 'N/A'
      };
    });

    res.status(200).json({
      success: true,
      data: entriesWithDetails
    });
  } catch (error) {
    console.error('Get pending entries error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Certificate routes
router.get('/certificate/:payeeId', async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { payeeId } = req.params;
    
    // Get payee data
    const payee = await db.collection('payees').findOne({ _id: new ObjectId(payeeId), schoolId });
    if (!payee) {
      return res.status(404).json({ success: false, error: 'Payee not found' });
    }

    // Get entries for this payee
    const entries = await db.collection('tds_entries').find({ 
      payeeId: new ObjectId(payeeId), 
      schoolId 
    }).sort({ date: -1 }).toArray();

    // Get tax rules for entry details
    const taxSettings = await db.collection('tax_settings').findOne({ schoolId });
    
    const entriesWithRules = entries.map(entry => {
      const rule = taxSettings?.taxRules?.find(r => r.id === entry.ruleId);
      return {
        ...entry,
        ruleName: rule?.name || 'Unknown',
        revenueCode: rule?.revenueCode || 'N/A',
        rate: rule?.rate || 0,
        type: rule?.type || 'FIXED'
      };
    });

    const totalTDS = entries.reduce((sum, entry) => sum + entry.tds, 0);
    const totalGross = entries.reduce((sum, entry) => sum + entry.gross, 0);

    res.status(200).json({
      success: true,
      data: {
        payee,
        entries: entriesWithRules,
        summary: {
          totalTDS,
          totalGross,
          totalNet: totalGross - totalTDS,
          entryCount: entries.length
        }
      }
    });
  } catch (error) {
    console.error('Certificate data error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Report routes
router.get('/report/stats', async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // MongoDB aggregation for dashboard stats
    const stats = await db.collection('tds_entries').aggregate([
      { $match: { schoolId } },
      {
        $group: {
          _id: null,
          totalTDSThisMonth: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: [{ $month: { $dateFromString: { dateString: '$date' } } }, currentMonth] },
                    { $eq: [{ $year: { $dateFromString: { dateString: '$date' } } }, currentYear] }
                  ]
                },
                then: '$tds',
                else: 0
              }
            }
          },
          totalTDSYTD: { $sum: '$tds' },
          pendingDeposits: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$tds', 0]
            }
          },
          totalEntries: { $sum: 1 }
        }
      }
    ]).toArray();

    const payeeCount = await db.collection('payees').countDocuments({ schoolId });

    const result = stats[0] || {
      totalTDSThisMonth: 0,
      totalTDSYTD: 0,
      pendingDeposits: 0,
      totalEntries: 0
    };

    res.status(200).json({
      success: true,
      data: {
        ...result,
        totalPayees: payeeCount
      }
    });
  } catch (error) {
    console.error('Report stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
