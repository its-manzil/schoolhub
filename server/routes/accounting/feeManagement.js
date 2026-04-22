import express from 'express';
import { getDB } from '../../config/db.js';

const router = express.Router();

// Helper to get schoolId from headers - returns as number if possible
const getSchoolId = (req) => {
  const id = req.headers['x-school-id'] || req.body.schoolId || null;
  // Convert to number if it's a numeric string
  if (id && !isNaN(id)) {
    return Number(id);
  }
  return id;
};

// GET /api/fee-management/academic-years
router.get('/academic-years', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const db = getDB();
    
    // Get unique academic years from fee configurations
    const years = await db.collection('fee_components')
      .distinct('academicYear', { schoolId });
    
    // Generate BS academic years from 2080 to 2100
    const bsYears = [];
    
    for (let year = 2080; year <= 2100; year++) {
      bsYears.push(`${year}-${year + 1}`);
    }
    
    // If no years exist in DB, return all BS years with current year first
    if (years.length === 0) {
      // Sort to put current year near the top
      const sortedYears = bsYears.sort((a, b) => {
        const yearA = parseInt(a.split('-')[0]);
        const yearB = parseInt(b.split('-')[0]);
        return yearB - yearA; // Descending order
      });
      return res.json({
        success: true,
        data: sortedYears
      });
    }
    
    // Combine stored years with all available BS years, remove duplicates
    const allYears = [...new Set([...years, ...bsYears])];
    const sortedYears = allYears.sort((a, b) => {
      const yearA = parseInt(a.split('-')[0]);
      const yearB = parseInt(b.split('-')[0]);
      return yearB - yearA; // Descending order (newest first)
    });
    
    res.json({ success: true, data: sortedYears });
  } catch (error) {
    console.error('Error fetching academic years:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch academic years' });
  }
});

// GET /api/fee-management/school-info
router.get('/school-info', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const db = getDB();
    
    // Get school from schools collection - schoolId is numeric
    const school = await db.collection('schools').findOne({ schoolId });
    
    if (!school) {
      return res.status(404).json({ 
        success: false, 
        error: 'School not found' 
      });
    }
    
    res.json({
      success: true,
      data: {
        name: school.name || school.schoolName || 'Unknown School',
        phone: school.contactPhone || school.phone || school.contactNumber || '',
        email: school.contactEmail || school.email || ''
      }
    });
  } catch (error) {
    console.error('Error fetching school info:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch school info' });
  }
});

// PUT /api/fee-management/school-info
router.put('/school-info', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { phone, email } = req.body;
    const db = getDB();
    
    // Query by numeric schoolId field
    const query = { schoolId };
    
    const result = await db.collection('schools').updateOne(
      query,
      { 
        $set: { 
          contactPhone: phone,
          contactEmail: email,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'School not found' 
      });
    }
    
    res.json({ success: true, message: 'School info updated successfully' });
  } catch (error) {
    console.error('Error updating school info:', error);
    res.status(500).json({ success: false, error: 'Failed to update school info' });
  }
});

// GET /api/fee-management/components
router.get('/components', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { academicYear } = req.query;
    const db = getDB();
    
    const query = { schoolId };
    if (academicYear) {
      query.academicYear = academicYear;
    }
    
    const config = await db.collection('fee_components').findOne(query);
    
    if (!config || !config.components) {
      return res.json({ 
        success: true, 
        data: [] 
      });
    }
    
    res.json({ success: true, data: config.components });
  } catch (error) {
    console.error('Error fetching fee components:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch fee components' });
  }
});

// POST /api/fee-management/components
router.post('/components', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { academicYear, components } = req.body;
    const db = getDB();
    
    if (!academicYear || !components) {
      return res.status(400).json({ 
        success: false, 
        error: 'Academic year and components are required' 
      });
    }
    
    // Upsert the components
    await db.collection('fee_components').updateOne(
      { schoolId, academicYear },
      { 
        $set: { 
          schoolId,
          academicYear,
          components,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Components saved successfully',
      data: { schoolId, academicYear, components }
    });
  } catch (error) {
    console.error('Error saving fee components:', error);
    res.status(500).json({ success: false, error: 'Failed to save fee components' });
  }
});

// GET /api/fee-management/class-fees
router.get('/class-fees', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { academicYear } = req.query;
    const db = getDB();
    
    const query = { schoolId };
    if (academicYear) {
      query.academicYear = academicYear;
    }
    
    const fees = await db.collection('class_fees').find(query).toArray();
    
    // Format the response
    const formattedFees = fees.map(f => ({
      className: f.className,
      fees: f.fees || {},
      total: Object.values(f.fees || {}).reduce((sum, val) => sum + (Number(val) || 0), 0)
    }));
    
    res.json({ success: true, data: formattedFees });
  } catch (error) {
    console.error('Error fetching class fees:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch class fees' });
  }
});

// POST /api/fee-management/class-fees
router.post('/class-fees', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { academicYear, className, fees } = req.body;
    const db = getDB();
    
    if (!academicYear || !className || !fees) {
      return res.status(400).json({ 
        success: false, 
        error: 'Academic year, class name, and fees are required' 
      });
    }
    
    // Upsert the class fees
    await db.collection('class_fees').updateOne(
      { schoolId, academicYear, className },
      { 
        $set: { 
          schoolId,
          academicYear,
          className,
          fees,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Class fees saved successfully' 
    });
  } catch (error) {
    console.error('Error saving class fees:', error);
    res.status(500).json({ success: false, error: 'Failed to save class fees' });
  }
});

// GET /api/fee-management/bill-preview
router.get('/bill-preview', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { academicYear, className, component } = req.query;
    const db = getDB();
    
    if (!academicYear) {
      return res.status(400).json({ 
        success: false, 
        error: 'Academic year is required' 
      });
    }
    
    // Get school info - schoolId is numeric
    const school = await db.collection('schools').findOne({ schoolId });
    
    // Build class query
    const classQuery = { schoolId, academicYear };
    if (className) {
      classQuery.className = className;
    }
    
    // Get class fees
    const classFees = await db.collection('class_fees').find(classQuery).toArray();
    
    // Format classes data
    const formattedClasses = classFees.map(cf => {
      let fees = cf.fees || {};
      
      // Filter by component if specified
      if (component && fees[component] !== undefined) {
        fees = { [component]: fees[component] };
      }
      
      const total = Object.values(fees).reduce((sum, val) => sum + (Number(val) || 0), 0);
      
      return {
        className: cf.className,
        fees,
        total
      };
    }).filter(c => Object.keys(c.fees).length > 0);
    
    const grandTotal = formattedClasses.reduce((sum, c) => sum + c.total, 0);
    
    res.json({
      success: true,
      data: {
        schoolName: school?.name || school?.schoolName || 'Unknown School',
        schoolPhone: school?.contactPhone || school?.phone || school?.contactNumber || '',
        schoolEmail: school?.contactEmail || school?.email || '',
        academicYear,
        generatedAt: new Date().toISOString(),
        classes: formattedClasses,
        grandTotal
      }
    });
  } catch (error) {
    console.error('Error generating bill preview:', error);
    res.status(500).json({ success: false, error: 'Failed to generate bill preview' });
  }
});

export default router;
