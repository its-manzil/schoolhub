/**
 * Invoice Utilities for Bill Generation
 * Handles invoice ID generation, calculations, and number-to-words conversion
 */

export interface BillComponent {
  name: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface BillData {
  invoiceId: string;
  schoolId: number;
  studentId: string;
  studentName: string;
  className: string;
  academicYear: string;
  components: BillComponent[];
  subTotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMode: 'cash' | 'online' | 'cheque';
  paymentStatus: 'paid' | 'pending';
  chequeNo?: string;
  createdAt: Date;
  createdAtBS: string;
  isLocked: boolean;
}

/**
 * Generate Invoice ID
 * Format: INV-{BS_YEAR}-{schoolId}-{studentId}-{random}
 */
export function generateInvoiceId(
  bsYear: number,
  schoolId: number,
  studentId: string
): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  const cleanStudentId = studentId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
  return `INV-${bsYear}-${schoolId}-${cleanStudentId}-${random}`;
}

/**
 * Calculate bill totals (VAT Inclusive)
 * The component sum is treated as VAT-inclusive total
 */
export function calculateTotals(
  components: { qty: number; rate: number }[],
  vatRate: number
): {
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
} {
  const round2 = (num: number): number => Number(num.toFixed(2));

  // VAT-inclusive total from components
  const vatInclusiveTotal = components.reduce((sum, comp) => sum + comp.qty * comp.rate, 0);

  if (vatRate === 0) {
    return {
      subTotal: round2(vatInclusiveTotal),
      vatAmount: 0,
      totalAmount: round2(vatInclusiveTotal),
    };
  }

  const vatMultiplier = 1 + vatRate / 100;
  const subTotal = round2(vatInclusiveTotal / vatMultiplier);
  const vatAmount = round2(vatInclusiveTotal - subTotal);
  const totalAmount = round2(vatInclusiveTotal);

  return {
    subTotal,
    vatAmount,
    totalAmount,
  };
}

/**
 * Convert number to words (Indian/Nepali style)
 * Supports up to Crores
 */
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const numToWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) {
      return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    }
    if (n < 1000) {
      return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
    }
    if (n < 100000) {
      return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    }
    if (n < 10000000) {
      return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
    }
    return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let words = 'Rupees ' + numToWords(integerPart);
  if (decimalPart > 0) {
    words += ' and ' + numToWords(decimalPart) + ' Paisa';
  }
  words += ' Only';

  return words;
}

/**
 * Format number with commas and 2 decimal places
 */
export function formatNumber(num: number): string {
  return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * Format date to BS string
 */
export function formatBSDate(date: { year: number; month: number; day: number }): string {
  const monthStr = date.month.toString().padStart(2, '0');
  const dayStr = date.day.toString().padStart(2, '0');
  return `${date.year}-${monthStr}-${dayStr}`;
}

/**
 * Get current year in BS (Bikram Sambat)
 * This is a simplified version - actual implementation should use the date converter
 */
export function getCurrentBSYear(): number {
  // Approximate conversion: Current AD year + 57
  const currentYear = new Date().getFullYear();
  return currentYear + 57;
}

/**
 * Generate academic years list (BS format: 2080-2081)
 */
export function generateAcademicYears(startYear: number = 2080, count: number = 20): string[] {
  const years: string[] = [];
  for (let i = 0; i < count; i++) {
    const year = startYear + i;
    years.push(`${year}-${year + 1}`);
  }
  return years.reverse();
}

/**
 * Static classes list (Class 1-12)
 */
export const STATIC_CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
];

/**
 * Payment mode options
 */
export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash', status: 'paid' },
  { value: 'online', label: 'Online', status: 'paid' },
  { value: 'cheque', label: 'Cheque', status: 'pending' }
] as const;

/**
 * Validate bill data before saving
 */
export function validateBillData(bill: Partial<BillData>): { valid: boolean; error?: string } {
  if (!bill.schoolId) {
    return { valid: false, error: 'School ID is required' };
  }
  if (!bill.studentId) {
    return { valid: false, error: 'Student ID is required' };
  }
  if (!bill.studentName) {
    return { valid: false, error: 'Student name is required' };
  }
  if (!bill.className) {
    return { valid: false, error: 'Class name is required' };
  }
  if (!bill.academicYear) {
    return { valid: false, error: 'Academic year is required' };
  }
  if (!bill.components || bill.components.length === 0) {
    return { valid: false, error: 'At least one component is required' };
  }
  if (!bill.paymentMode) {
    return { valid: false, error: 'Payment mode is required' };
  }
  if (bill.paymentMode === 'cheque' && !bill.chequeNo) {
    return { valid: false, error: 'Cheque number is required for cheque payment' };
  }

  return { valid: true };
}

/**
 * Calculate component amount
 */
export function calculateComponentAmount(qty: number, rate: number): number {
  return Math.round(qty * rate * 100) / 100;
}
