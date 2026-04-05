import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireAcademicOrSchoolAdmin } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { hashPassword } from '../../utils/password.js';

const router = express.Router();

// Get all teachers for a school (for school admin)
router.get('/', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    
    // Get user data from their respective collection
    let userData;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }
    
    if (!userData || !userData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'User school data not found' 
      });
    }

    const teachers = await db.collection('teachers')
      .find({ 
        schoolId: userData.schoolId,
        isActive: true 
      })
      .sort({ createdAt: -1 })
      .toArray();

    const safeTeachers = teachers.map(teacher => {
      const safeTeacher = { ...teacher };
      delete safeTeacher.password_hash;
      return safeTeacher;
    });
    
    res.json({ 
      success: true, 
      data: safeTeachers 
    });
    
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch teachers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get teacher by ID (for details modal)
router.get('/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const user = req.user;

    // Get user data from their respective collection
    let userData;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }

    if (!userData || !userData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'User school data not found' 
      });
    }

    const teacher = await db.collection('teachers').findOne({ 
      _id: new ObjectId(id),
      schoolId: userData.schoolId 
    });

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    const teacherResponse = { ...teacher };
    delete teacherResponse.password_hash;
    
    res.json({ 
      success: true, 
      data: teacherResponse 
    });
    
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add new teacher endpoint
router.post('/', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const {
      name,
      phone,
      email,
      address,
      subjects,
      teachingClass,
      salary,
      joiningDate,
      profilePicture,
      password,
      schoolId
    } = req.body;

    console.log('Adding new teacher:', { name, email, schoolId });

    // Validate user and get schoolId if not provided or to verify
    let userData;
    const user = req.user;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }

    if (!userData || !userData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'User school data not found' 
      });
    }

    const effectiveSchoolId = parseInt(schoolId) || userData.schoolId;

    // Check if teacher already exists in this school
    const existingTeacher = await db.collection('teachers').findOne({
      $or: [
        { email: email },
        { phone: phone }
      ],
      schoolId: effectiveSchoolId
    });

    if (existingTeacher) {
      return res.status(409).json({ 
        success: false, 
        message: 'Teacher with this email or phone already exists in this school' 
      });
    }

    // Get the last teacher ID for this school to auto-increment
    const lastTeacher = await db.collection('teachers')
      .find({ schoolId: effectiveSchoolId })
      .sort({ teacherId: -1 })
      .limit(1)
      .toArray();

    let teacherNumber;
    if (lastTeacher.length > 0) {
      const lastId = lastTeacher[0].teacherId;
      // Extract the last 3 digits
      const match = lastId.match(/(\d+)$/);
      if (match) {
        const lastNumber = parseInt(match[1]);
        teacherNumber = (lastNumber + 1).toString().padStart(3, '0');
      } else {
        teacherNumber = '001';
      }
    } else {
      teacherNumber = '001';
    }

    const teacherId = `${effectiveSchoolId}TR${teacherNumber}`;
    console.log('Generated teacher ID:', teacherId);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create teacher document
    const teacher = {
      teacherId,
      name,
      phone,
      email,
      address: address || '',
      subjects: Array.isArray(subjects) ? subjects : (typeof subjects === 'string' ? subjects.split(',').map(s => s.trim()).filter(s => s) : []),
      teachingClass: teachingClass || '',
      salary: parseFloat(salary) || 0,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      profilePicture: profilePicture || null,
      schoolId: effectiveSchoolId,
      password_hash: hashedPassword,
      role: 'teacher',
      permissions: [
        'manage_assignments',
        'view_students',
        'submit_grades',
        'view_class_schedule'
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    // Insert into teachers collection
    const result = await db.collection('teachers').insertOne(teacher);
    console.log('Teacher inserted with ID:', result.insertedId);

    const teacherResponse = { ...teacher };
    delete teacherResponse.password_hash;

    res.status(201).json({ 
      success: true, 
      message: 'Teacher added successfully',
      data: {
        teacher: teacherResponse,
        credentials: {
          teacherId: teacherId,
          email: email,
          password: password, // Only returned once
          note: 'Please save these credentials and provide them to the teacher'
        }
      }
    });
    
  } catch (error) {
    console.error('Add teacher error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update teacher
router.put('/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;

    // Get user data from their respective collection
    let userData;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }
    
    if (!userData || !userData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'User school data not found' 
      });
    }

    // Check if teacher exists and belongs to the same school
    const existingTeacher = await db.collection('teachers').findOne({ 
      _id: new ObjectId(id),
      schoolId: userData.schoolId 
    });

    if (!existingTeacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Don't allow updating teacherId, schoolId, or password through this endpoint
    delete updateData.teacherId;
    delete updateData.schoolId;
    delete updateData.password_hash;

    // Update teacher
    const result = await db.collection('teachers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    const updatedTeacher = await db.collection('teachers').findOne({ _id: new ObjectId(id) });
    
    const teacherResponse = { ...updatedTeacher };
    delete teacherResponse.password_hash;

    res.json({ 
      success: true, 
      message: 'Teacher updated successfully', 
      data: teacherResponse 
    });
    
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete teacher (soft delete)
router.delete('/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const user = req.user;

    // Get user data from their respective collection
    let userData;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }
    
    if (!userData || !userData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'User school data not found' 
      });
    }

    // Check if teacher exists and belongs to the same school
    const teacher = await db.collection('teachers').findOne({ 
      _id: new ObjectId(id),
      schoolId: userData.schoolId 
    });

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Soft delete by setting isActive to false
    await db.collection('teachers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date().toISOString() } }
    );

    res.json({ 
      success: true, 
      message: 'Teacher deactivated successfully' 
    });
    
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
