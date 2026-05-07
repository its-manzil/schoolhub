export interface ParentChild {
  _id: string
  studentId: string
  name: string
  className: string
  section: string
  rollNumber: number
  admissionYear: number
  academicStatus?: string
}

export interface ParentRecord {
  _id: string
  name: string
  phone: string
  email: string | null
  schoolId: number
  children: string[]
  childrenDetails: ParentChild[]
  createdAt: string
  updatedAt: string
}

export type FilterType = 'all' | 'single-child' | 'multi-child'
