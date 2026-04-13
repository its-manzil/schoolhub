import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';

export const getStaff = async (req, res) => {
  try {
    const db = getDB();
    
    // Get schoolId from authenticated user or use default for development
    const schoolId = req.user?.schoolId || '507f1f77bcf86cd799439011'; // Default ObjectId for development
    
    const staff = await db.collection('staff').find({ 
      schoolId: new ObjectId(schoolId) 
    }).sort({ createdAt: -1 }).toArray();
    
    // Transform data for frontend compatibility - keep _id for mapping
    const transformedStaff = staff.map(member => ({
      _id: member._id,
      fullName: member.fullName,
      gender: member.gender,
      phone: member.phone,
      email: member.email,
      address: member.address || '',
      emergencyContact: member.emergencyContact || '',
      department: member.department || '',
      role: member.role || '',
      joiningDate: member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : '',
      qualification: member.qualification || '',
      status: member.status || 'Active',
      photo: member.photo || ''
    }));
    
    res.status(200).json({
      success: true,
      data: transformedStaff
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const createStaff = async (req, res) => {
  try {
    const db = getDB();
    const { fullName, phone, email, gender, address, emergencyContact, department, role, joiningDate, qualification } = req.body;
    
    // Get schoolId from authenticated user or use default for development
    const schoolId = req.user?.schoolId || '507f1f77bcf86cd799439011'; // Default ObjectId for development
    
    // Validation
    if (!fullName || !phone || !email) {
      return res.status(400).json({ message: 'Full name, phone, and email are required' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if email already exists within the same school
    const existingStaff = await db.collection('staff').findOne({ 
      email: email.trim().toLowerCase(),
      schoolId: new ObjectId(schoolId)
    });
    if (existingStaff) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const newStaff = {
      schoolId: new ObjectId(schoolId),
      fullName: fullName.trim(),
      gender: gender || 'Male',
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      address: address?.trim() || '',
      emergencyContact: emergencyContact?.trim() || '',
      department: department?.trim() || '',
      role: role?.trim() || '',
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      qualification: qualification?.trim() || '',
      status: 'Active',
      photo: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('staff').insertOne(newStaff);
    
    // Return transformed data for frontend with proper response format
    const responseStaff = {
      _id: result.insertedId,
      ...newStaff,
      joiningDate: newStaff.joiningDate ? newStaff.joiningDate.toISOString().split('T')[0] : ''
    };
    
    res.status(201).json({
      success: true,
      data: responseStaff
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;
    
    // Get schoolId from authenticated user or use default for development
    const schoolId = req.user?.schoolId || '507f1f77bcf86cd799439011'; // Default ObjectId for development
        
    // Validation
    if (updateData.fullName && !updateData.fullName.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Full name cannot be empty' 
      });
    }
    
    if (updateData.phone && !updateData.phone.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone cannot be empty' 
      });
    }
    
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid email format' 
        });
      }
      
      // Check if email already exists within the same school (excluding current staff)
      const existingStaff = await db.collection('staff').findOne({ 
        email: updateData.email.toLowerCase(),
        schoolId: new ObjectId(schoolId),
        _id: { $ne: new ObjectId(id) }
      });
      if (existingStaff) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already exists' 
        });
      }
    }
    
    // Prepare update object
    const updateFields = {
      ...updateData,
      updatedAt: new Date()
    };
    
    // Clean up data
    if (updateData.fullName) updateFields.fullName = updateData.fullName.trim();
    if (updateData.phone) updateFields.phone = updateData.phone.trim();
    if (updateData.email) updateFields.email = updateData.email.trim().toLowerCase();
    if (updateData.address) updateFields.address = updateData.address.trim();
    if (updateData.emergencyContact) updateFields.emergencyContact = updateData.emergencyContact.trim();
    if (updateData.department) updateFields.department = updateData.department.trim();
    if (updateData.role) updateFields.role = updateData.role.trim();
    if (updateData.qualification) updateFields.qualification = updateData.qualification.trim();
    if (updateData.joiningDate) updateFields.joiningDate = new Date(updateData.joiningDate);
    
    // Use updateOne with school isolation and then find the updated document
    const updateResult = await db.collection('staff').updateOne(
      { 
        _id: new ObjectId(id),
        schoolId: new ObjectId(schoolId)
      },
      { $set: updateFields }
    );
        
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff member not found' 
      });
    }
    
    // Get the updated document
    const updatedStaff = await db.collection('staff').findOne({ 
      _id: new ObjectId(id),
      schoolId: new ObjectId(schoolId)
    });
    
    if (!updatedStaff) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff member not found after update' 
      });
    }
    
    // Return transformed data for frontend with proper response format
    const responseStaff = {
      _id: updatedStaff._id,
      fullName: updatedStaff.fullName,
      gender: updatedStaff.gender,
      phone: updatedStaff.phone,
      email: updatedStaff.email,
      address: updatedStaff.address || '',
      emergencyContact: updatedStaff.emergencyContact || '',
      department: updatedStaff.department || '',
      role: updatedStaff.role || '',
      joiningDate: updatedStaff.joiningDate ? new Date(updatedStaff.joiningDate).toISOString().split('T')[0] : '',
      qualification: updatedStaff.qualification || '',
      status: updatedStaff.status || 'Active',
      photo: updatedStaff.photo || ''
    };
    
    res.status(200).json({
      success: true,
      data: responseStaff
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    // Get schoolId from authenticated user or use default for development
    const schoolId = req.user?.schoolId || '507f1f77bcf86cd799439011'; // Default ObjectId for development
    
    const result = await db.collection('staff').deleteOne({ 
      _id: new ObjectId(id),
      schoolId: new ObjectId(schoolId)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff member not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
