import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSuperAdmin } from '../../middleware/auth.js';
import { hashPassword } from '../../utils/password.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// GET all school admins
router.get('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    
    // Fetch all school admins, exclude password_hash
    const admins = await db.collection('schooladmins')
      .find({}, { projection: { password_hash: 0 } })
      .toArray();
    
    res.json({ 
      success: true, 
      data: admins,
      count: admins.length
    });
  } catch (error) {
    console.error('Get school admins error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch school admins',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT change password (no old password required)
router.put('/:id/password', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { newPassword } = req.body;
    
    // Validate ID
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid admin ID' 
      });
    }
    
    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    const result = await db.collection('schooladmins').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          password_hash: hashedPassword,
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT toggle active status
router.put('/:id/status', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Validate ID
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid admin ID' 
      });
    }
    
    // Validate isActive
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'isActive must be a boolean value' 
      });
    }
    
    // Get admin to find the associated school
    const admin = await db.collection('schooladmins').findOne(
      { _id: new ObjectId(id) },
      { projection: { schoolId: 1 } }
    );
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin not found' 
      });
    }
    
    // Update admin status
    const result = await db.collection('schooladmins').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isActive: isActive,
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin not found' 
      });
    }
    
    // Also update the school's status
    await db.collection('schools').updateOne(
      { schoolId: admin.schoolId },
      { 
        $set: { 
          status: isActive ? 'active' : 'inactive',
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    res.json({ 
      success: true, 
      message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive }
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT update permissions
router.put('/:id/permissions', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { permissions } = req.body;
    
    // Validate ID
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid admin ID' 
      });
    }
    
    // Validate permissions
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Permissions must be an array' 
      });
    }
    
    // Valid permission values
    const validPermissions = [
      'manage_teachers',
      'manage_students',
      'manage_classes',
      'view_reports',
      'manage_school_settings'
    ];
    
    // Filter out invalid permissions
    const sanitizedPermissions = permissions.filter(p => validPermissions.includes(p));
    
    // Update permissions
    const result = await db.collection('schooladmins').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          permissions: sanitizedPermissions,
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Permissions updated successfully',
      data: { permissions: sanitizedPermissions }
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
