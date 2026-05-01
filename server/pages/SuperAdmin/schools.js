import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSuperAdmin, requireSchoolAdmin, requireAcademicOrSchoolAdmin } from '../../middleware/auth.js';
import { hashPassword } from '../../utils/password.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get school data for logged-in user (all school-related roles)
router.get('/my-school', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    // Prefer schoolId from token if available (for schooladmin and other school-bound roles)
    let schoolId = req.user.schoolId;

    // Fallback: resolve schoolId by looking up user in their role collections
    if (!schoolId) {
      const rawUserId = req.user.id;
      const userId = ObjectId.isValid(rawUserId) ? new ObjectId(rawUserId) : rawUserId;

      const collectionsToSearch = [
        'schooladmins',
        'academics',
        'accountants',
        'teachers',
        'students',
        'parents',
        'administratives',
        'billings'
      ];

      for (const collectionName of collectionsToSearch) {
        const userDoc = await db.collection(collectionName).findOne({ _id: userId });
        if (userDoc && userDoc.schoolId) {
          schoolId = userDoc.schoolId;
          break;
        }
      }
    }

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School data not found for user' });
    }

    const numericSchoolId = typeof schoolId === 'string' ? parseInt(schoolId) : schoolId;

    const school = await db.collection('schools').findOne({ schoolId: numericSchoolId });

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({ success: true, data: school });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school data' });
  }
});

// GET school by ID for editing
router.get('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'School ID is required' 
      });
    }

    const school = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    
    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    res.json({ 
      success: true, 
      data: school 
    });
    
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch school',
      error: error.message 
    });
  }
});

// Get school by schoolId (for school admin and academic users)
router.get('/school/:schoolId', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { schoolId } = req.params;
    
    const school = await db.collection('schools').findOne({ schoolId: parseInt(schoolId) });
    
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({ success: true, data: school });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school data' });
  }
});

// Save accounting data to schools table (for accounting users)
router.post('/school/:schoolId/accounting', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { schoolId } = req.params;
    const { 'acct-phone': acctPhone, 'acct-mail': acctMail, 'pan-number': panNumber, 'vat-number': vatNumber } = req.body;
    
    const numericSchoolId = parseInt(schoolId);
    
    // Check if school exists
    const school = await db.collection('schools').findOne({ schoolId: numericSchoolId });
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (acctPhone !== undefined) updateData['acct-phone'] = acctPhone;
    if (acctMail !== undefined) updateData['acct-mail'] = acctMail;
    if (panNumber !== undefined) updateData['pan-number'] = panNumber;
    if (vatNumber !== undefined) updateData['vat-number'] = vatNumber;
    updateData['updatedAt'] = new Date().toISOString();

    // Update school with accounting data
    await db.collection('schools').updateOne(
      { schoolId: numericSchoolId },
      { $set: updateData }
    );

    // Get updated school data
    const updatedSchool = await db.collection('schools').findOne({ schoolId: numericSchoolId });

    res.json({ 
      success: true, 
      message: 'Accounting information saved successfully',
      data: updatedSchool
    });
  } catch (error) {
    console.error('Save accounting error:', error);
    res.status(500).json({ success: false, message: 'Failed to save accounting information' });
  }
});

// Update school endpoint
router.put('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { name, address, contactEmail, contactPhone, subscriptionYears } = req.body;
    
    console.log('Updating school:', id, req.body);
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'School ID is required' 
      });
    }

    // Validate required fields
    if (!name || !address || !contactEmail || !contactPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate subscription years (1-3)
    if (!subscriptionYears || subscriptionYears < 1 || subscriptionYears > 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subscription years must be between 1 and 3' 
      });
    }

    // Find existing school
    const existingSchool = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    
    if (!existingSchool) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    // Calculate new subscription details
    const subscribedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + subscriptionYears);
    
    const subscriptionAmount = subscriptionYears * 30000;
    const isActive = new Date() <= expiryDate;
    
    // Calculate remaining days
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const updateData = {
      name,
      address,
      contactEmail,
      contactPhone,
      subscription: {
        years: subscriptionYears,
        amount: subscriptionAmount,
        subscribedDate: subscribedDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive,
        remainingDays: remainingDays > 0 ? remainingDays : 0
      },
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('schools').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    // Also update school name in admin account if school name changed
    if (name !== existingSchool.name) {
      await db.collection('schooladmins').updateOne(
        { schoolId: existingSchool.schoolId },
        { $set: { schoolName: name, updatedAt: new Date().toISOString() } }
      );
    }

    console.log(`School ${existingSchool.schoolId} updated successfully`);
    
    res.json({ 
      success: true, 
      message: 'School updated successfully',
      data: { ...updateData, _id: id, schoolId: existingSchool.schoolId }
    });
    
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete school
router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    console.log('Attempting to delete school with ID:', id);
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'School ID is required' 
      });
    }

    // Find the school first to get schoolId
    const school = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    
    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    // Delete the school
    const deleteResult = await db.collection('schools').deleteOne({ _id: new ObjectId(id) });
    
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    // Delete associated admin account
    await db.collection('schooladmins').deleteOne({ schoolId: school.schoolId });

    console.log(`School ${school.schoolId} deleted successfully`);
    
    res.json({ 
      success: true, 
      message: 'School and associated admin account deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add school
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { name, address, contactEmail, contactPhone, subscriptionYears, adminPassword } = req.body;
    
    // Validate required fields
    if (!name || !address || !contactEmail || !contactPhone || !subscriptionYears) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Get the last school ID to auto-increment
    const lastSchool = await db.collection('schools')
      .find()
      .sort({ schoolId: -1 })
      .limit(1)
      .toArray();
    
    const nextSchoolId = lastSchool.length > 0 ? lastSchool[0].schoolId + 1 : 1001;
    
    // Calculate subscription details
    const subscribedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + subscriptionYears);
    
    const subscriptionAmount = subscriptionYears * 30000;
    const isActive = new Date() <= expiryDate;
    
    // Calculate remaining days
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const newSchool = {
      schoolId: nextSchoolId,
      name,
      address,
      contactEmail,
      contactPhone,
      subscription: {
        years: subscriptionYears,
        amount: subscriptionAmount,
        subscribedDate: subscribedDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive,
        remainingDays: remainingDays > 0 ? remainingDays : 0
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert school
    const result = await db.collection('schools').insertOne(newSchool);
    
    // Create admin account for the school
    const adminUsername = `${nextSchoolId}_admin`;
    
    // Use custom password if provided, otherwise generate default
    const finalAdminPassword = adminPassword || `admin${nextSchoolId}`;
    const adminEmail = `admin${nextSchoolId}@${name.toLowerCase().replace(/\s+/g, '')}.edu`;
    
    // Hash admin password
    const hashedPassword = await hashPassword(finalAdminPassword);
    
    const schoolAdmin = {
      username: adminUsername,
      email: adminEmail,
      password_hash: hashedPassword,
      role: 'schooladmin',
      schoolId: nextSchoolId,
      schoolName: name,
      permissions: [
        'manage_teachers',
        'manage_students', 
        'manage_classes',
        'view_reports',
        'manage_school_settings'
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    // Insert school admin
    await db.collection('schooladmins').insertOne(schoolAdmin);
    
    console.log(`School created with ID: ${nextSchoolId}`);
    console.log(`Admin account created - Username: ${adminUsername}, Password: ${finalAdminPassword}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'School added successfully with admin account',
      data: { 
        ...newSchool, 
        _id: result.insertedId,
        adminAccount: {
          username: adminUsername,
          password: finalAdminPassword, // Only returned once for initial setup
          email: adminEmail,
          note: adminPassword ? 'Using custom password' : 'Using auto-generated password'
        }
      }
    });
    
  } catch (error) {
    console.error('Add school error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add school',
      error: error.message 
    });
  }
});

// Get all schools
router.get('/', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const schools = await db.collection('schools').find().toArray();
    res.json({ success: true, data: schools });
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schools' });
  }
});

// Upload school logo
router.post('/upload-logo', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { logo } = req.body;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Validate base64 data
    if (!logo || typeof logo !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid image data' });
    }

    // Check if base64 string is valid
    if (!logo.match(/^[A-Za-z0-9+/]+=*$/)) {
      return res.status(400).json({ success: false, message: 'Invalid base64 format' });
    }

    // Calculate size (approximately)
    const sizeInBytes = Math.ceil((logo.length * 3) / 4);
    const sizeInKB = sizeInBytes / 1024;

    // Check if compressed to under 100KB
    if (sizeInKB > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image must be compressed to under 100KB' 
      });
    }

    // Update school with logo
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { 
        $set: { 
          logo: logo,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Logo uploaded successfully', 
      data: updatedSchool 
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload logo' });
  }
});

// Upload principal signature
router.post('/upload-signature', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { principalSignature } = req.body;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Validate base64 data
    if (!principalSignature || typeof principalSignature !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid image data' });
    }

    // Check if base64 string is valid
    if (!principalSignature.match(/^[A-Za-z0-9+/]+=*$/)) {
      return res.status(400).json({ success: false, message: 'Invalid base64 format' });
    }

    // Calculate size (approximately)
    const sizeInBytes = Math.ceil((principalSignature.length * 3) / 4);
    const sizeInKB = sizeInBytes / 1024;

    // Check if compressed to under 100KB
    if (sizeInKB > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image must be compressed to under 100KB' 
      });
    }

    // Update school with signature
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { 
        $set: { 
          principalSignature: principalSignature,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Signature uploaded successfully', 
      data: updatedSchool 
    });
  } catch (error) {
    console.error('Upload signature error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload signature' });
  }
});

// Remove school logo
router.delete('/remove-logo', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Remove logo from school
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { 
        $unset: { logo: "" },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Logo removed successfully', 
      data: updatedSchool 
    });
  } catch (error) {
    console.error('Remove logo error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove logo' });
  }
});

// Remove principal signature
router.delete('/remove-signature', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Remove signature from school
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { 
        $unset: { principalSignature: "" },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Signature removed successfully', 
      data: updatedSchool 
    });
  } catch (error) {
    console.error('Remove signature error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove signature' });
  }
});

// Add subscription
router.post('/:id/subscription', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { years, advanceSubscription } = req.body;

    const school = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const currentDate = new Date();
    let newExpiryDate = new Date(school.subscription.expiryDate);
    
    if (advanceSubscription && school.subscription.isActive) {
      // Add new years to existing expiry date
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);
    } else {
      // Start from current date
      newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);
    }

    const subscriptionAmount = years * 30000;
    const isActive = new Date() <= newExpiryDate;
    
    // Calculate remaining days
    const timeDiff = newExpiryDate.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Create subscription history entry
    const subscriptionHistory = {
      years: years,
      amount: subscriptionAmount,
      subscribedDate: currentDate.toISOString(),
      expiryDate: newExpiryDate.toISOString(),
      paymentDate: currentDate.toISOString(),
      transactionId: `TXN${Date.now()}`
    };

    const updateData = {
      subscription: {
        years: school.subscription.years + years,
        amount: school.subscription.amount + subscriptionAmount,
        subscribedDate: school.subscription.subscribedDate,
        expiryDate: newExpiryDate.toISOString(),
        isActive,
        remainingDays: remainingDays > 0 ? remainingDays : 0,
        totalPaid: (school.subscription.totalPaid || school.subscription.amount) + subscriptionAmount,
        history: [...(school.subscription.history || []), subscriptionHistory]
      },
      updatedAt: currentDate.toISOString()
    };

    await db.collection('schools').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedSchool = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    res.json({ 
      success: true, 
      message: 'Subscription added successfully', 
      data: updatedSchool 
    });

  } catch (error) {
    console.error('Add subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to add subscription' });
  }
});

// School admin update profile
router.put('/admin/update-profile', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const updateData = req.body;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Update school data
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ success: true, message: 'School updated successfully', data: updatedSchool });
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ success: false, message: 'Failed to update school' });
  }
});

// School admin add subscription
router.post('/admin/add-subscription', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { years, advanceSubscription } = req.body;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const school = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const currentDate = new Date();
    let newExpiryDate = new Date(school.subscription.expiryDate);
    
    if (advanceSubscription && school.subscription.isActive) {
      // Add new years to existing expiry date
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);
    } else {
      // Start from current date
      newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);
    }

    const subscriptionAmount = years * 30000;
    const isActive = new Date() <= newExpiryDate;
    
    // Calculate remaining days
    const timeDiff = newExpiryDate.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Create subscription history entry
    const subscriptionHistory = {
      years: years,
      amount: subscriptionAmount,
      subscribedDate: currentDate.toISOString(),
      expiryDate: newExpiryDate.toISOString(),
      paymentDate: currentDate.toISOString(),
      transactionId: `TXN${Date.now()}`
    };

    const updateData = {
      subscription: {
        years: school.subscription.years + years,
        amount: school.subscription.amount + subscriptionAmount,
        subscribedDate: school.subscription.subscribedDate,
        expiryDate: newExpiryDate.toISOString(),
        isActive,
        remainingDays: remainingDays > 0 ? remainingDays : 0,
        totalPaid: (school.subscription.totalPaid || school.subscription.amount) + subscriptionAmount,
        history: [...(school.subscription.history || []), subscriptionHistory]
      },
      updatedAt: currentDate.toISOString()
    };

    await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { $set: updateData }
    );

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Subscription added successfully', 
      data: updatedSchool 
    });

  } catch (error) {
    console.error('Add subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to add subscription' });
  }
});

// Update school logo and signature
router.put('/:id/branding', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { logo, principalSignature } = req.body;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (logo) updateData.logo = logo;
    if (principalSignature) updateData.principalSignature = principalSignature;

    const result = await db.collection('schools').updateOne(
      { schoolId: parseInt(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'School branding updated successfully'
    });
    
  } catch (error) {
    console.error('Update school branding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update school branding',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
