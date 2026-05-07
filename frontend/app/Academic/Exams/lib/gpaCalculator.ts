/**
 * GPA Calculation Utilities
 * TASK 9: GPA Calculation (SAFE ADD)
 * DO NOT integrate deeply yet - prepare utility for future use
 */

export interface MarkEntry {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  creditHours?: number;
}

export interface GPAEntry {
  subject: string;
  marks: number;
  maxMarks: number;
  creditHours?: number;
  grade: string;
  gradePoint: number;
}

/**
 * Calculate GPA from marks (simple average)
 * @param marks - Marks obtained
 * @param maxMarks - Maximum possible marks
 * @returns GPA on a 4.0 scale
 */
export function calculateGPA(marks: number, maxMarks: number): number {
  if (maxMarks === 0) return 0;

  const percentage = (marks / maxMarks) * 100;

  // Standard GPA conversion (4.0 scale)
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return 3.6;
  if (percentage >= 70) return 3.2;
  if (percentage >= 60) return 2.8;
  if (percentage >= 50) return 2.4;
  if (percentage >= 40) return 2.0;
  return 1.6;
}

/**
 * Calculate weighted GPA using credit hours
 * @param marks - Marks obtained
 * @param maxMarks - Maximum possible marks
 * @param creditHours - Credit hours for the subject
 * @returns Weighted grade point
 */
export function calculateWeightedGPA(
  marks: number,
  maxMarks: number,
  creditHours: number
): number {
  const gradePoint = calculateGPA(marks, maxMarks);
  return gradePoint * creditHours;
}

/**
 * Calculate overall GPA for multiple subjects
 * @param entries - Array of mark entries with credit hours
 * @returns Overall GPA
 */
export function calculateOverallGPA(entries: MarkEntry[]): number {
  if (entries.length === 0) return 0;

  let totalGradePoints = 0;

  for (const entry of entries) {
    totalGradePoints += calculateGPA(entry.marksObtained, entry.maxMarks);
  }

  return totalGradePoints / entries.length;
}

/**
 * Calculate overall weighted GPA for multiple subjects
 * @param entries - Array of mark entries with credit hours
 * @returns Weighted GPA
 */
export function calculateOverallWeightedGPA(entries: MarkEntry[]): number {
  if (entries.length === 0) return 0;

  let totalWeightedPoints = 0;
  let totalCreditHours = 0;

  for (const entry of entries) {
    const creditHours = entry.creditHours || 1;
    totalWeightedPoints += calculateWeightedGPA(
      entry.marksObtained,
      entry.maxMarks,
      creditHours
    );
    totalCreditHours += creditHours;
  }

  if (totalCreditHours === 0) return 0;

  return totalWeightedPoints / totalCreditHours;
}

/**
 * Get grade from percentage
 * @param percentage - Percentage marks
 * @returns Grade letter
 */
export function getGradeFromPercentage(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  return 'F';
}

/**
 * Get grade point from percentage
 * @param percentage - Percentage marks
 * @returns Grade point on 4.0 scale
 */
export function getGradePointFromPercentage(percentage: number): number {
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return 3.6;
  if (percentage >= 70) return 3.2;
  if (percentage >= 60) return 2.8;
  if (percentage >= 50) return 2.4;
  if (percentage >= 40) return 2.0;
  return 1.6;
}

/**
 * Calculate detailed GPA report for all subjects
 * @param entries - Array of mark entries
 * @returns Detailed GPA report
 */
export function calculateGPAReport(entries: MarkEntry[]): GPAEntry[] {
  return entries.map(entry => {
    const percentage = (entry.marksObtained / entry.maxMarks) * 100;

    return {
      subject: entry.subject,
      marks: entry.marksObtained,
      maxMarks: entry.maxMarks,
      creditHours: entry.creditHours,
      grade: getGradeFromPercentage(percentage),
      gradePoint: getGradePointFromPercentage(percentage)
    };
  });
}

/**
 * Determine pass/fail status
 * @param marksObtained - Marks obtained
 * @param maxMarks - Maximum marks
 * @param passPercentage - Minimum passing percentage (default 40%)
 * @returns Boolean indicating pass status
 */
export function isPassed(
  marksObtained: number,
  maxMarks: number,
  passPercentage: number = 40
): boolean {
  if (maxMarks === 0) return false;
  const percentage = (marksObtained / maxMarks) * 100;
  return percentage >= passPercentage;
}
