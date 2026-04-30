import express from 'express';
import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';

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

// GET /api/accounting/bus-fare/addresses
// Fetch unique student addresses for the school
router.get('/addresses', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { academicYear } = req.query;
    
    console.log('SESSION schoolId:', schoolId);
    
    if (!schoolId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - schoolId required' 
      });
    }
    
    const db = getDB();
    
    // Get students with addresses for this school
    const students = await db.collection('students')
      .find({ schoolId })
      .project({ address: 1 })
      .toArray();
    
    console.log('Found students:', students.length);
    
    // Remove empty addresses, normalize, and get unique addresses
    const uniqueAddresses = [...new Map(
      students
        .filter(s => s.address && s.address.trim())
        .map(s => [
          s.address.trim().toLowerCase(),
          s.address.trim()
        ])
    ).values()];
    
    console.log('Unique addresses found:', uniqueAddresses.length);
    
    // If academicYear provided, filter out already configured addresses
    let availableAddresses = uniqueAddresses;
    if (academicYear) {
      const existing = await db.collection('bus_fare_rates')
        .find({ schoolId, academicYear: Number(academicYear) })
        .toArray();
      
      const usedAddresses = existing.map(a => a.address);
      console.log('Used addresses:', usedAddresses.length);
      
      availableAddresses = uniqueAddresses.filter(addr =>
        !usedAddresses.includes(addr.toLowerCase())
      );
    }
    
    console.log('Available addresses:', availableAddresses.length);
    
    res.json({ 
      success: true, 
      data: availableAddresses 
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch addresses' });
  }
});

// GET /api/accounting/bus-fare/rates
// Fetch configured bus fare rates
router.get('/rates', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { academicYear } = req.query;
    
    if (!schoolId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - schoolId required' 
      });
    }
    
    const db = getDB();
    
    const query = { schoolId };
    if (academicYear) {
      query.academicYear = Number(academicYear);
    }
    
    const rates = await db.collection('bus_fare_rates')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ 
      success: true, 
      data: rates.map(r => ({
        ...r,
        _id: r._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching bus fare rates:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bus fare rates' });
  }
});

// POST /api/accounting/bus-fare/create
// Create a new bus fare rate
router.post('/create', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { academicYear, address, rate } = req.body;
    
    console.log('SESSION schoolId:', schoolId);
    console.log('Incoming address:', address);
    
    if (!schoolId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - schoolId required' 
      });
    }
    
    if (!academicYear || !address || rate === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Academic year, address, and rate are required'
      });
    }
    
    const db = getDB();
    
    const normalizedAddress = address.trim().toLowerCase();
    
    // Check for duplicate
    const exists = await db.collection('bus_fare_rates').findOne({
      schoolId,
      academicYear: Number(academicYear),
      address: normalizedAddress
    });
    
    if (exists) {
      return res.status(400).json({ 
        success: false, 
        error: 'Address already exists for this academic year' 
      });
    }
    
    const result = await db.collection('bus_fare_rates').insertOne({
      schoolId,
      academicYear: Number(academicYear),
      address: normalizedAddress,
      displayAddress: address.trim(),
      rate: Number(rate),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Bus fare rate created successfully',
      data: {
        _id: result.insertedId.toString(),
        schoolId,
        academicYear: Number(academicYear),
        address: normalizedAddress,
        displayAddress: address.trim(),
        rate: Number(rate)
      }
    });
  } catch (error) {
    console.error('Error creating bus fare rate:', error);
    res.status(500).json({ success: false, error: 'Failed to create bus fare rate' });
  }
});

// PUT /api/accounting/bus-fare/update/:id
// Update a bus fare rate
router.put('/update/:id', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const { rate } = req.body;
    
    if (!schoolId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - schoolId required' 
      });
    }
    
    if (rate === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Rate is required'
      });
    }
    
    const db = getDB();
    
    const result = await db.collection('bus_fare_rates').updateOne(
      { 
        _id: new ObjectId(id),
        schoolId
      },
      {
        $set: {
          rate: Number(rate),
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bus fare rate not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Bus fare rate updated successfully'
    });
  } catch (error) {
    console.error('Error updating bus fare rate:', error);
    res.status(500).json({ success: false, error: 'Failed to update bus fare rate' });
  }
});

// DELETE /api/accounting/bus-fare/delete/:id
// Delete a bus fare rate
router.delete('/delete/:id', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    
    if (!schoolId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - schoolId required' 
      });
    }
    
    const db = getDB();
    
    const result = await db.collection('bus_fare_rates').deleteOne({
      _id: new ObjectId(id),
      schoolId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bus fare rate not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Bus fare rate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bus fare rate:', error);
    res.status(500).json({ success: false, error: 'Failed to delete bus fare rate' });
  }
});

// GET /api/accounting/bus-fare/student-rate
// Get bus fare rate for a specific student (by address)
router.get('/student-rate', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { academicYear, address } = req.query;
    
    if (!schoolId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - schoolId required' 
      });
    }
    
    if (!academicYear || !address) {
      return res.status(400).json({
        success: false,
        error: 'Academic year and address are required'
      });
    }
    
    const db = getDB();
    
    const normalizedAddress = address.trim().toLowerCase();
    
    const rate = await db.collection('bus_fare_rates').findOne({
      schoolId,
      academicYear: Number(academicYear),
      address: normalizedAddress
    });
    
    if (!rate) {
      return res.json({
        success: true,
        data: null,
        message: 'No bus fare configured for this address'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...rate,
        _id: rate._id.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching student bus fare rate:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bus fare rate' });
  }
});

export default router;
