import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'School',
    index: true
  },
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true 
  },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'],
    default: 'Male' 
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  address: { 
    type: String, 
    trim: true,
    default: '' 
  },
  emergencyContact: { 
    type: String, 
    trim: true,
    default: '' 
  },
  department: { 
    type: String, 
    trim: true,
    default: '' 
  },
  role: { 
    type: String, 
    trim: true,
    default: '' 
  },
  joiningDate: { 
    type: Date 
  },
  qualification: { 
    type: String, 
    trim: true,
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'On Leave', 'Resigned'],
    default: 'Active' 
  },
  photo: { 
    type: String, 
    default: '' 
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Staff', StaffSchema);
