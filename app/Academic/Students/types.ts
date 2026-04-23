export interface Student {
  _id: string
  studentId: string
  name: string
  gender: 'male' | 'female' | 'other' | null
  dateOfBirth: string | null
  phone: string | null
  email: string | null
  address: string | null
  fatherName: string | null
  motherName: string | null
  fatherPhone: string | null
  motherPhone: string | null
  className: string
  section: string
  rollNumber: number | null
  bloodGroup?: string | null
  emergencyContact: string | null
  profilePicture?: string | null
  schoolId: number
  admissionDate: string
  admissionYear: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  academicStatus?: 'regular' | 'repeat' | 'promoted' | 'doublePromoted' | 'transferred' | 'passed_out'
}

export interface SchoolInfo {
  _id: string
  schoolId: number
  name: string
  address: string
  contactEmail: string
  contactPhone: string
  principalName: string
  logo?: string
  principalSignature?: string
  establishedYear: number
  subscription: {
    expiryDate: string
  }
}

export interface StudentFormData {
  name: string
  gender: 'male' | 'female' | 'other'
  dateOfBirth: string
  phone: string
  email: string
  address: string
  fatherName: string
  motherName: string
  fatherPhone: string
  motherPhone: string
  className: string
  section: string
  rollNumber: string
  bloodGroup: string
  emergencyContact: string
  admissionDate: string
  password?: string
  rePassword?: string
}

export const CLASS_OPTIONS = [
  { value: '0N', label: 'Nursery' },
  { value: '0L', label: 'LKG' },
  { value: '0U', label: 'UKG' },
  { value: '01', label: 'Class 1' },
  { value: '02', label: 'Class 2' },
  { value: '03', label: 'Class 3' },
  { value: '04', label: 'Class 4' },
  { value: '05', label: 'Class 5' },
  { value: '06', label: 'Class 6' },
  { value: '07', label: 'Class 7' },
  { value: '08', label: 'Class 8' },
  { value: '09', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' }
];

export const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const getClassName = (classCode: string | null) => {
  if (!classCode) return 'N/A';
  const classOption = CLASS_OPTIONS.find(c => c.value === classCode);
  return classOption ? classOption.label : classCode;
};

export const getDefaultProfilePic = (name: string | null = 'Student', gender: string | null = 'male') => {
  const safeName = name || 'Student';
  const bgColor = gender === 'female' ? '16A34A' : '16A34A';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=${bgColor}&color=fff&size=128`;
};

export const calculateAge = (dateOfBirth: string | null) => {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};
