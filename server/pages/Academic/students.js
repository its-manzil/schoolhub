import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSchoolAdmin } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { hashPassword } from '../../utils/password.js';

const router = express.Router();

// Helper function to format class code
const formatClassCode = (className) => {
  switch(className.toUpperCase()) {
    case 'N':
      return '0N';
    case 'LKG':
      return '0L';
    case 'UKG':
      return '0U';
    default:
      // For classes 1-12, ensure they're 2 digits
      const classNum = parseInt(className);
      if (!isNaN(classNum) && classNum >= 1 && classNum <= 12) {
        return classNum.toString().padStart(2, '0');
      }
      return className.padStart(2, '0');
  }
};

// Helper function to get next sequential number for student ID
const getNextStudentSequence = async (schoolId, currentYear, className) => {
  const db = getDB();
  const classCode = formatClassCode(className);
  const idPattern = `${schoolId}${currentYear}${classCode}`;
  
  // Find all students with matching pattern for this school, year, and class
  const existingStudents = await db.collection('students')
    .find({
      studentId: { $regex: `^${idPattern}` },
      schoolId: parseInt(schoolId)
    })
    .sort({ studentId: -1 })
    .toArray();
  
  if (existingStudents.length === 0) {
    return '001'; // First student in this class/year
  }
  
  // Get the highest sequence number
  let maxSequence = 0;
  existingStudents.forEach(student => {
    const sequencePart = student.studentId.slice(idPattern.length);
    const sequenceNum = parseInt(sequencePart);
    if (!isNaN(sequenceNum) && sequenceNum > maxSequence) {
      maxSequence = sequenceNum;
    }
  });
  
  // Return next sequence number padded to 3 digits
  return (maxSequence + 1).toString().padStart(3, '0');
};

// Helper function to generate student ID
const generateStudentId = async (schoolId, className, admissionYear = null) => {
  const currentYear = admissionYear || new Date().getFullYear();
  const classCode = formatClassCode(className);
  
  // Get the next sequential number
  const sequence = await getNextStudentSequence(schoolId, currentYear, className);
  
  // Generate student ID: SchoolID + Year + ClassCode + Sequence
  return `${schoolId}${currentYear}${classCode}${sequence}`;
};

// Get all students for a school (for school admin)
router.get('/', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    
    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin data not found' 
      });
    }

    const students = await db.collection('students')
      .find({ 
        schoolId: adminData.schoolId,
        isActive: true 
      })
      .sort({ name: 1 }) // Sort alphabetically by name
      .toArray();

    // Assign roll numbers based on alphabetical order within each class
    const classGroups = {};
    students.forEach(student => {
      if (!classGroups[student.className]) {
        classGroups[student.className] = [];
      }
      classGroups[student.className].push(student);
    });

    // Sort each class group alphabetically and assign roll numbers
    Object.keys(classGroups).forEach(className => {
      classGroups[className].sort((a, b) => a.name.localeCompare(b.name));
      classGroups[className].forEach((student, index) => {
        student.rollNumber = index + 1;
      });
    });

    const updatedStudents = Object.values(classGroups).flat();

    const safeStudents = updatedStudents.map(student => {
      const safeStudent = { ...student };
      delete safeStudent.password_hash;
      return safeStudent;
    });
    
    res.json({ 
      success: true, 
      data: safeStudents 
    });
    
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get student by ID (for details modal)
router.get('/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin data not found' 
      });
    }

    const student = await db.collection('students').findOne({ 
      _id: new ObjectId(id),
      schoolId: adminData.schoolId 
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    const studentResponse = { ...student };
    delete studentResponse.password_hash;

    res.json({ 
      success: true, 
      data: studentResponse 
    });
    
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add new student endpoint
router.post('/', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const {
      name,
      gender,
      dateOfBirth,
      phone,
      email,
      address,
      fatherName,
      motherName,
      fatherPhone,
      motherPhone,
      className,
      section,
      bloodGroup,
      emergencyContact,
      admissionDate,
      profilePicture,
      password,
      schoolId
    } = req.body;

    console.log('Adding new student:', { name, className, schoolId });

    // Validate required fields
    if (!name || !gender || !dateOfBirth || !phone || !address || 
        !fatherName || !fatherPhone || !className || !section || 
        !emergencyContact || !password || !schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled' 
      });
    }

    // Check if student already exists in this school with same phone
    const existingStudent = await db.collection('students').findOne({
      $or: [
        { phone: phone },
        { email: email ? email : null }
      ].filter(condition => condition),
      schoolId: parseInt(schoolId),
      isActive: true
    });

    if (existingStudent) {
      return res.status(409).json({ 
        success: false, 
        message: 'Student with this phone or email already exists in this school' 
      });
    }

    // Extract admission year from admission date or use current year
    let admissionYear;
    if (admissionDate) {
      admissionYear = new Date(admissionDate).getFullYear();
    } else {
      admissionYear = new Date().getFullYear();
    }

    // Generate unique student ID
    const studentId = await generateStudentId(schoolId, className, admissionYear);
    console.log('Generated student ID:', studentId);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get the next roll number for this class (alphabetical order will be handled on fetch)
    // For now, assign a temporary roll number
    const studentsInClass = await db.collection('students')
      .find({
        schoolId: parseInt(schoolId),
        className: className,
        section: section,
        isActive: true
      })
      .toArray();
    
    const tempRollNumber = studentsInClass.length + 1;

    // Create student document
    const student = {
      studentId,
      name,
      gender,
      dateOfBirth,
      phone,
      email: email || null,
      address,
      fatherName,
      motherName,
      fatherPhone,
      motherPhone: motherPhone || null,
      className,
      section,
      rollNumber: tempRollNumber, // Will be reassigned alphabetically on fetch
      bloodGroup: bloodGroup || null,
      emergencyContact,
      admissionDate: admissionDate || new Date().toISOString().split('T')[0],
      admissionYear: admissionYear,
      profilePicture: profilePicture || null,
      schoolId: parseInt(schoolId),
      password_hash: hashedPassword,
      role: 'student',
      permissions: [
        'view_assignments',
        'view_grades',
        'view_timetable',
        'view_attendance'
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    // Insert into students collection
    const result = await db.collection('students').insertOne(student);
    console.log('Student inserted with ID:', result.insertedId);

    // Also insert into parents collection if not exists
    const existingParent = await db.collection('parents').findOne({
      $or: [
        { phone: fatherPhone },
        { email: email ? email : null }
      ].filter(condition => condition)
    });

    if (!existingParent) {
      const parent = {
        name: fatherName,
        phone: fatherPhone,
        email: email || null,
        password_hash: hashedPassword, // Same password for parent login
        role: 'parent',
        schoolId: parseInt(schoolId),
        children: [studentId],
        permissions: [
          'view_child_grades',
          'view_child_attendance'
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      };
      await db.collection('parents').insertOne(parent);
    } else {
      // Update existing parent's children list
      await db.collection('parents').updateOne(
        { _id: existingParent._id },
        { $addToSet: { children: studentId }, $set: { updatedAt: new Date().toISOString() } }
      );
    }

    const studentResponse = { ...student };
    delete studentResponse.password_hash;

    res.status(201).json({ 
      success: true, 
      message: 'Student added successfully',
      data: {
        student: studentResponse,
        credentials: {
          studentId: studentId,
          password: password, // Only returned once
          note: 'Please save these credentials and provide them to the student/parent'
        }
      }
    });
    
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
