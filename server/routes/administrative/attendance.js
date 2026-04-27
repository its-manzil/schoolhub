import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';

// Import date converter (ES module compatible import)
const dateConverter = await import('../../utils/dateConverter.cjs').then(m => m.default || m).catch(() => null);

const router = express.Router();

// BS Month name to number mapping
const bsMonthMap = {
  'baishakh': 1, 'jestha': 2, 'ashadh': 3, 'shrawan': 4,
  'bhadra': 5, 'ashwin': 6, 'kartik': 7, 'mangsir': 8,
  'poush': 9, 'magh': 10, 'falgun': 11, 'chaitra': 12
};

// Helper to normalize monthBS to a consistent format (number)
const normalizeMonthBS = (monthBS) => {
  if (typeof monthBS === 'number') return monthBS;
  if (typeof monthBS === 'string') {
    // Try parsing as number first
    const asNumber = parseInt(monthBS);
    if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= 12) {
      return asNumber;
    }
    // Try mapping from name
    const normalized = monthBS.toLowerCase().trim();
    return bsMonthMap[normalized] || monthBS;
  }
  return monthBS;
};

// Helper to get schoolId for user
const getSchoolId = async (db, user) => {
  if (user.role === 'schooladmin' || user.role === 'superadmin') {
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    return adminData?.schoolId;
  } else if (user.role === 'academic') {
    const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    return academicData?.schoolId;
  }
  return user.schoolId || null;
};

// GET /api/staff/teachers - Get all teachers (role = "Teacher", status = "Active")
router.get('/teachers', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    const teachers = await db.collection('staff')
      .find({ 
        schoolId: schoolId,
        role: "Teacher",
        status: "Active"
      })
      .sort({ fullName: 1 })
      .toArray();

    const transformedTeachers = teachers.map(teacher => ({
      _id: teacher._id.toString(),
      staffId: teacher._id.toString(),
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      department: teacher.department || '',
      designation: teacher.designation || 'Teacher'
    }));

    res.json({
      success: true,
      data: transformedTeachers
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
  }
});

// GET /api/attendance/daily?date=YYYY-MM-DD&dateBS=YYYY-MM-DD - Get holiday status for date
router.get('/daily', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { date, dateBS } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    // Check if date is Saturday (automatic weekly holiday)
    if (dateBS && dateConverter && dateConverter.isSaturday) {
      if (dateConverter.isSaturday(dateBS)) {
        return res.json({
          success: true,
          data: { isHoliday: true, isSaturday: true, reason: 'Saturday is a weekly holiday' },
          locked: true
        });
      }
    }

    // Check for holiday by dateBS or date
    const holidayQuery = dateBS 
      ? { schoolId: schoolId, dateBS: dateBS, type: 'daily', isHoliday: true }
      : { schoolId: schoolId, date: date, type: 'daily', isHoliday: true };
    
    const holidayRecord = await db.collection('staffattendance').findOne(holidayQuery);

    if (holidayRecord) {
      return res.json({
        success: true,
        data: { isHoliday: true },
        locked: true
      });
    }

    res.json({
      success: true,
      data: null,
      locked: false
    });
  } catch (error) {
    console.error('Get daily attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

// POST /api/attendance/daily - Save daily attendance (per-staff)
router.post('/daily', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { date, dateBS, attendance, isHoliday } = req.body;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!dateBS && !date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    // Check if date is Saturday (automatic holiday)
    if (dateBS && dateConverter && dateConverter.isSaturday) {
      if (dateConverter.isSaturday(dateBS)) {
        return res.status(400).json({
          success: false,
          message: 'Saturday is a weekly holiday. Attendance marking is not allowed.'
        });
      }
    }

    // Check if holiday is already declared for this date (global lock)
    const holidayCheck = await db.collection('staffattendance').findOne({
      schoolId: schoolId,
      dateBS: dateBS,
      isHoliday: true
    });

    if (holidayCheck) {
      return res.status(400).json({ 
        success: false, 
        message: 'Holiday already declared for this date' 
      });
    }

    // Handle Holiday save (single global record)
    if (isHoliday) {
      const holidayRecord = {
        schoolId: schoolId,
        date: date || new Date().toISOString().split('T')[0],
        dateBS: dateBS,
        type: 'daily',
        isHoliday: true,
        isGlobal: true,
        attendance: [],
        createdAt: new Date().toISOString(),
        createdBy: req.user.id
      };
      await db.collection('staffattendance').insertOne(holidayRecord);
      return res.json({ 
        success: true, 
        message: 'Holiday saved successfully'
      });
    }

    // Handle per-staff attendance save
    if (!attendance || !Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attendance data is required' 
      });
    }

    // Status mapping from frontend to backend codes
    const statusMap = {
      'Present': 'P',
      'Absent': 'A',
      'Late': 'L',
      'Hold': 'Hold'
    };

    // Filter only entries with valid status (P/A/L) for saving - Hold is ignored
    const validEntries = attendance.filter(entry => {
      const mappedStatus = statusMap[entry.status];
      return mappedStatus && mappedStatus !== 'Hold';
    });

    if (validEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid attendance entries to save. Please mark at least one staff as Present, Absent, or Late.'
      });
    }

    // STRICT DUPLICATE CHECK: Check each staff before saving - only block P/A/L, not Hold
    for (const entry of validEntries) {
      if (!entry.staffId) continue;

      const existing = await db.collection('staffattendance').findOne({
        schoolId: schoolId,
        dateBS: dateBS,
        staffId: entry.staffId,
        status: { $in: ['P', 'A', 'L'] }  // Only check for locked records
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Attendance already marked for staff on ${dateBS}. Cannot modify locked record.`
        });
      }
    }

    // Fetch staff details for the entries being saved
    const staffIds = validEntries.map(e => e.staffId);
    const staffDetails = await db.collection('staff')
      .find({ _id: { $in: staffIds.map(id => {
        try { return new ObjectId(id); } catch { return id; }
      })}})
      .toArray();

    const staffMap = new Map(staffDetails.map(s => [s._id.toString(), s]));

    // All checks passed - save all attendance
    const savedCount = { success: 0, errors: [] };

    for (const entry of validEntries) {
      if (!entry.staffId) continue;

      const staff = staffMap.get(entry.staffId);
      const mappedStatus = statusMap[entry.status] || 'P';

      // Create per-staff attendance record - LOCKED permanently once saved
      const staffRecord = {
        schoolId: schoolId,
        date: date || new Date().toISOString().split('T')[0],
        dateBS: dateBS,
        type: 'daily',
        isHoliday: false,
        staffId: entry.staffId,
        fullName: staff?.fullName || entry.staffName || 'Unknown',
        department: staff?.department || entry.department || '',
        role: staff?.role || staff?.designation || entry.role || '',
        status: mappedStatus,  // P, A, L (not Hold - Hold is not saved)
        note: entry.note || '',
        isLocked: true,  // Once P/A/L is saved, it's locked forever
        createdAt: new Date().toISOString(),
        createdBy: req.user.id
      };

      try {
        await db.collection('staffattendance').insertOne(staffRecord);
        savedCount.success++;
      } catch {
        savedCount.errors.push(entry.staffId);
      }
    }

    res.json({ 
      success: true, 
      message: `Attendance saved for ${savedCount.success} staff`,
      saved: savedCount.success
    });
  } catch (error) {
    console.error('Save daily attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to save attendance' });
  }
});

// GET /api/attendance/monthly?yearBS=2080&monthBS=Baisakh&staffId=xxx - Get existing monthly attendance
router.get('/monthly', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { yearBS, monthBS, staffId } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!yearBS || !monthBS) {
      return res.status(400).json({ success: false, message: 'Year and month are required' });
    }

    const normalizedMonth = normalizeMonthBS(monthBS);

    // Build query - per-staff if staffId provided, otherwise global
    const query = {
      schoolId: schoolId,
      yearBS: parseInt(yearBS),
      monthBS: normalizedMonth,
      type: 'monthly'
    };

    if (staffId) {
      query.staffId = staffId;
    }

    const attendanceRecord = await db.collection('staffattendance').findOne(query);

    if (attendanceRecord) {
      return res.json({
        success: true,
        data: attendanceRecord,
        locked: attendanceRecord.locked || false
      });
    }

    res.json({
      success: true,
      data: null,
      locked: false
    });
  } catch (error) {
    console.error('Get monthly attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch monthly attendance' });
  }
});

// POST /api/attendance/monthly - Save monthly attendance (per-staff)
router.post('/monthly', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { yearBS, monthBS, staffId, totalHolidays, totalPresentDays } = req.body;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!yearBS || !monthBS) {
      return res.status(400).json({ success: false, message: 'Year and month are required' });
    }

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' });
    }

    const normalizedMonth = normalizeMonthBS(monthBS);

    // Check for duplicate per staff
    const existingRecord = await db.collection('staffattendance').findOne({
      schoolId: schoolId,
      yearBS: parseInt(yearBS),
      monthBS: normalizedMonth,
      staffId: staffId,
      type: 'monthly'
    });

    if (existingRecord && existingRecord.locked) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monthly attendance already submitted and locked for this staff' 
      });
    }

    if (existingRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monthly attendance already submitted for this staff' 
      });
    }

    // Fetch staff details
    const staff = await db.collection('staff').findOne({
      _id: new ObjectId(staffId),
      schoolId: schoolId
    });

    const attendanceRecord = {
      schoolId: schoolId,
      staffId: staffId,
      fullName: staff?.fullName || 'Unknown',
      department: staff?.department || '',
      role: staff?.role || staff?.designation || '',
      yearBS: parseInt(yearBS),
      monthBS: normalizedMonth,
      type: 'monthly',
      totalHolidays: parseInt(totalHolidays) || 0,
      totalPresentDays: parseInt(totalPresentDays) || 0,
      locked: true,
      createdAt: new Date().toISOString(),
      createdBy: req.user.id
    };

    await db.collection('staffattendance').insertOne(attendanceRecord);

    res.json({ 
      success: true, 
      message: 'Monthly attendance saved successfully',
      locked: true
    });
  } catch (error) {
    console.error('Save monthly attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to save monthly attendance' });
  }
});

// GET /api/admin/attendance/current-bs-date - Get current Nepali date
router.get('/current-bs-date', verifyToken, async (req, res) => {
  try {
    if (dateConverter && dateConverter.getCurrentBSDate) {
      const bsDate = dateConverter.getCurrentBSDate();
      return res.json({ success: true, data: bsDate });
    }
    // Fallback: return approximate current BS date
    const now = new Date();
    // Rough approximation: BS is approximately 56 years, 8 months ahead
    const bsYear = now.getFullYear() + 56;
    const bsMonth = now.getMonth() + 1 + 8;
    const adjustedYear = bsMonth > 12 ? bsYear + 1 : bsYear;
    const adjustedMonth = bsMonth > 12 ? bsMonth - 12 : bsMonth;
    res.json({
      success: true,
      data: {
        year: adjustedYear,
        month: adjustedMonth,
        day: now.getDate()
      }
    });
  } catch (error) {
    console.error('Get BS date error:', error);
    res.status(500).json({ success: false, message: 'Failed to get BS date' });
  }
});

// GET /api/admin/attendance/staff - Get all active staff (with optional date filter to exclude already marked)
router.get('/staff', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    const { dateBS } = req.query;

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    // Find staff already marked for this date (per-staff records)
    let excludedStaffIds = [];
    if (dateBS) {
      const markedRecords = await db.collection('staffattendance')
        .find({
          schoolId: schoolId,
          dateBS: dateBS,
          isHoliday: false,
          status: { $in: ['P', 'A', 'L'] }
        })
        .project({ staffId: 1 })
        .toArray();
      
      excludedStaffIds = markedRecords.map(r => r.staffId?.toString()).filter(Boolean);
    }

    const staff = await db.collection('staff')
      .find({ 
        schoolId: schoolId,
        status: 'Active',
        _id: { $nin: excludedStaffIds.map(id => {
          try { return new ObjectId(id); } catch { return id; }
        })}
      })
      .sort({ fullName: 1 })
      .toArray();

    const transformedStaff = staff.map(s => ({
      _id: s._id.toString(),
      staffId: s._id.toString(),
      fullName: s.fullName,
      email: s.email,
      phone: s.phone || '',
      department: s.department || '',
      designation: s.designation || s.role || '',
      role: s.role || s.designation || ''
    }));

    res.json({
      success: true,
      data: transformedStaff
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
});

// GET /api/admin/attendance/check-conflict - Check if daily attendance exists for a BS month
router.get('/check-conflict', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { yearBS, monthBS } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    const normalizedMonth = normalizeMonthBS(monthBS);

    // Build BS date pattern for the month (e.g., "2081-01-" for Baishakh 2081)
    const monthPrefix = `${yearBS}-${normalizedMonth.toString().padStart(2, '0')}`;

    // Check if any daily attendance exists for this month
    const dailyExists = await db.collection('staffattendance').findOne({
      schoolId: schoolId,
      dateBS: { $regex: `^${monthPrefix}` },
      status: { $in: ['P', 'A', 'L'] }
    });

    res.json({
      success: true,
      data: {
        hasConflict: !!dailyExists,
        message: dailyExists ? 'Daily attendance exists for this month. Monthly attendance is blocked.' : null
      }
    });
  } catch (error) {
    console.error('Check conflict error:', error);
    res.status(500).json({ success: false, message: 'Failed to check conflicts' });
  }
});

// GET /api/admin/attendance/monthly-recorded - Get list of staff already recorded for a month
router.get('/monthly-recorded', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { yearBS, monthBS } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    const normalizedMonth = normalizeMonthBS(monthBS);

    const records = await db.collection('staffattendance')
      .find({
        schoolId: schoolId,
        type: 'monthly',
        yearBS: parseInt(yearBS),
        monthBS: normalizedMonth
      })
      .toArray();

    const staffIds = records.map(r => r.staffId?.toString()).filter(Boolean);

    res.json({
      success: true,
      data: { staffIds }
    });
  } catch (error) {
    console.error('Get monthly recorded error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recorded staff' });
  }
});

// GET /api/admin/attendance/detailed - Get detailed attendance records for sheet view
router.get('/detailed', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { yearBS, monthBS, staffId, department } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!yearBS || !monthBS) {
      return res.status(400).json({ success: false, message: 'Year and month (BS) are required' });
    }

    // Build query for the month
    const monthPrefix = `${yearBS}-${monthBS.toString().padStart(2, '0')}`;
    let query = {
      schoolId: schoolId,
      dateBS: { $regex: `^${monthPrefix}` },
      status: { $in: ['P', 'A', 'L'] }  // Only actual attendance records
    };

    if (staffId) query.staffId = staffId;
    if (department) query.department = department;

    // Fetch all attendance records for the month
    const records = await db.collection('staffattendance')
      .find(query)
      .sort({ dateBS: 1, fullName: 1 })
      .toArray();

    // Also fetch holidays for this month
    const holidayQuery = {
      schoolId: schoolId,
      isHoliday: true,
      dateBS: { $regex: `^${monthPrefix}` }
    };
    const holidays = await db.collection('staffattendance').find(holidayQuery).toArray();
    const holidayDates = new Set(holidays.map(h => h.dateBS));

    // Transform records to include holiday info
    const transformedRecords = records.map(record => ({
      _id: record._id.toString(),
      schoolId: record.schoolId,
      date: record.date,
      dateBS: record.dateBS,
      type: record.type,
      isHoliday: holidayDates.has(record.dateBS),
      staffId: record.staffId?.toString() || record.staffId,
      fullName: record.fullName || 'Unknown',
      department: record.department || '',
      role: record.role || record.designation || 'Staff',
      status: record.status,
      note: record.note || ''
    }));

    res.json({
      success: true,
      data: transformedRecords,
      holidays: holidays.length,
      monthPrefix
    });
  } catch (error) {
    console.error('Get detailed attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch detailed attendance' });
  }
});

// GET /api/admin/attendance/report - Generate attendance report
router.get('/report', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { startDate, endDate, staffId, department, yearBS, monthBS } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    let query = {
      schoolId: schoolId,
      isHoliday: false
    };

    // Support both AD date range and BS year/month filtering
    if (yearBS) {
      // BS year/month filtering (for Monthly/Yearly reports)
      if (monthBS) {
        // Specific month - use regex for dateBS pattern
        const monthPrefix = `${yearBS}-${monthBS.toString().padStart(2, '0')}`;
        query.dateBS = { $regex: `^${monthPrefix}` };
      } else {
        // Whole year - use regex for year
        query.dateBS = { $regex: `^${yearBS}` };
      }
    } else if (startDate && endDate) {
      // AD date range filtering (for custom range)
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Fetch all attendance records matching the query
    const records = await db.collection('staffattendance')
      .find(query)
      .toArray();

    // Aggregate by staff - records are flat (one doc per staff per day)
    const staffMap = new Map();

    for (const record of records) {
      // Skip records without staffId or status
      if (!record.staffId) continue;
      if (record.status === 'Hold') continue;  // Don't count Hold records

      const sid = record.staffId.toString();

      // Filter by specific staffId if provided
      if (staffId && sid !== staffId) continue;

      // Filter by department if specified
      if (department && record.department !== department) continue;

      if (!staffMap.has(sid)) {
        staffMap.set(sid, {
          staffId: sid,
          staffName: record.fullName || 'Unknown',
          department: record.department || '',
          present: 0,
          absent: 0,
          late: 0,
          holidays: 0,
          total: 0,
          records: []  // For detailed view
        });
      }

      const stats = staffMap.get(sid);
      const status = record.status;  // P, A, L (single letters)

      if (status === 'P') stats.present++;
      else if (status === 'A') stats.absent++;
      else if (status === 'L') stats.late++;

      stats.total++;

      // Add to detailed records
      stats.records.push({
        dateBS: record.dateBS,
        dateAD: record.date,
        status: record.status,
        note: record.note || ''
      });
    }

    // Count holidays separately
    const holidayQuery = {
      schoolId: schoolId,
      isHoliday: true
    };

    if (yearBS && monthBS) {
      const monthPrefix = `${yearBS}-${monthBS.toString().padStart(2, '0')}`;
      holidayQuery.dateBS = { $regex: `^${monthPrefix}` };
    } else if (startDate && endDate) {
      holidayQuery.date = { $gte: startDate, $lte: endDate };
    }

    const holidayCount = await db.collection('staffattendance').countDocuments(holidayQuery);

    // Add holiday count to all staff (holidays are global)
    let summary = Array.from(staffMap.values());
    if (holidayCount > 0) {
      summary.forEach(s => s.holidays = holidayCount);
    }

    res.json({
      success: true,
      data: {
        summary: summary.sort((a, b) => a.staffName.localeCompare(b.staffName)),
        totalRecords: records.length,
        holidays: holidayCount
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

export default router;
