/**
 * Nepali Date Converter Utility
 * Converts between Bikram Sambat (BS) and Gregorian Calendar (AD)
 * Using nepali-date-converter library for accurate conversions
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const NepaliDate = require('nepali-date-converter').default;
/* eslint-enable @typescript-eslint/no-require-imports */

export interface BSDate {
  year: number;
  month: number;
  day: number;
}

export interface EnglishDate {
  year: number;
  month: number;
  day: number;
}

// Nepali months names
export const NEPALI_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Nepali months in Nepali
export const NEPALI_MONTHS_NP = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

// BS Date range supported by nepali-date-converter library
export const BS_DATE_RANGE = {
  MIN_YEAR: 2000,
  MIN_MONTH: 1,
  MIN_DAY: 1,
  MAX_YEAR: 2090,
  MAX_MONTH: 12,
  MAX_DAY: 30
};

/**
 * Check if BS date is within the supported range (2000-2090)
 */
export function isWithinBSRange(year: number, month: number, day: number): boolean {
  if (year < BS_DATE_RANGE.MIN_YEAR || year > BS_DATE_RANGE.MAX_YEAR) {
    return false;
  }
  if (year === BS_DATE_RANGE.MIN_YEAR) {
    if (month < BS_DATE_RANGE.MIN_MONTH) return false;
    if (month === BS_DATE_RANGE.MIN_MONTH && day < BS_DATE_RANGE.MIN_DAY) return false;
  }
  if (year === BS_DATE_RANGE.MAX_YEAR) {
    if (month > BS_DATE_RANGE.MAX_MONTH) return false;
    if (month === BS_DATE_RANGE.MAX_MONTH && day > BS_DATE_RANGE.MAX_DAY) return false;
  }
  return true;
}

/**
 * Convert English Date (AD) to Nepali Date (BS)
 * Returns null if date falls outside supported range (2000-2090 BS)
 */
export function toBS(englishDate: Date | string): BSDate | null {
  try {
    const date = typeof englishDate === 'string' ? new Date(englishDate) : englishDate;

    // Check if the input date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    const nepaliDate = new NepaliDate(date);

    return {
      year: parseInt(nepaliDate.format('YYYY')),
      month: parseInt(nepaliDate.format('MM')),
      day: parseInt(nepaliDate.format('DD'))
    };
  } catch {
    // Date falls outside supported range (2000-2090 BS)
    return null;
  }
}

/**
 * Convert Nepali Date (BS) to English Date (AD)
 */
export function toAD(nepaliDate: BSDate | string): Date {
  let bsDate: BSDate;
  
  if (typeof nepaliDate === 'string') {
    // Parse BS date string (e.g., "2081-04-15")
    const parts = nepaliDate.split('-');
    bsDate = {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]),
      day: parseInt(parts[2])
    };
  } else {
    bsDate = nepaliDate;
  }
  
  // Create NepaliDate object and get the English date
  const nepali = new NepaliDate(`${bsDate.year}-${bsDate.month.toString().padStart(2, '0')}-${bsDate.day.toString().padStart(2, '0')}`);
  return nepali.toJsDate();
}

/**
 * Format Nepali date as string
 */
export function formatBSDate(date: BSDate): string {
  return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
}

/**
 * Format Nepali date with month name
 * Returns empty string if date is null/invalid
 */
export function formatBSDateWithMonth(date: BSDate | null): string {
  if (!date) return '';
  const monthName = NEPALI_MONTHS[date.month - 1];
  return `${date.day} ${monthName} ${date.year}`;
}

/**
 * Get current Nepali date
 */
export function getCurrentBSDate(): BSDate {
  const nepaliDate = new NepaliDate();
  
  return {
    year: parseInt(nepaliDate.format('YYYY')),
    month: parseInt(nepaliDate.format('MM')),
    day: parseInt(nepaliDate.format('DD'))
  };
}

/**
 * Parse BS date string to BSDate object
 */
export function parseBSDate(dateString: string): BSDate {
  const parts = dateString.split('-');
  return {
    year: parseInt(parts[0]),
    month: parseInt(parts[1]),
    day: parseInt(parts[2])
  };
}

/**
 * Validate BS date
 * Checks:
 * 1. Year is within supported range (2000-2090)
 * 2. Month is valid (1-12)
 * 3. Day is valid for that specific month/year (handled by library)
 */
export function isValidBSDate(date: BSDate): boolean {
  // Check basic range first
  if (!isWithinBSRange(date.year, date.month, date.day)) {
    return false;
  }

  // Check month is valid
  if (date.month < 1 || date.month > 12) {
    return false;
  }

  // Check day is at least 1
  if (date.day < 1) {
    return false;
  }

  try {
    // Try to create a NepaliDate object - this will throw if day is invalid for the month
    // (e.g., day 32 in a month that only has 30 days)
    const dateString = `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
    const nepaliDate = new NepaliDate(dateString);

    // Verify the created date matches the input (catches invalid days)
    const createdYear = parseInt(nepaliDate.format('YYYY'));
    const createdMonth = parseInt(nepaliDate.format('MM'));
    const createdDay = parseInt(nepaliDate.format('DD'));

    return createdYear === date.year && createdMonth === date.month && createdDay === date.day;
  } catch {
    return false;
  }
}

/**
 * Get Nepali month name
 */
export function getNepaliMonthName(month: number): string {
  return NEPALI_MONTHS[month - 1] || '';
}

/**
 * Get Nepali month name in Nepali
 */
export function getNepaliMonthNameNP(month: number): string {
  return NEPALI_MONTHS_NP[month - 1] || '';
}

/**
 * Get day of week from BS date
 * Returns: 0 = Sunday ... 6 = Saturday
 */
export function getDayOfWeekFromBS(bsDate: BSDate | string): number | null {
  try {
    const adDate = toAD(bsDate);
    return adDate.getDay(); // JS: 0=Sun ... 6=Sat
  } catch {
    return null;
  }
}

/**
 * Check if BS date is Saturday (holiday)
 */
export function isSaturday(bsDate: BSDate | string): boolean {
  const dayOfWeek = getDayOfWeekFromBS(bsDate);
  return dayOfWeek === 6;
}

/**
 * Generate date range from start BS date to end BS date
 * Converts BS→AD, loops using JS Date, converts back AD→BS
 * Only returns dates within the supported BS range (2000-2090)
 */
export function generateDateRange(startBS: string, endBS: string): BSDate[] {
  try {
    const startAD = toAD(startBS);
    const endAD = toAD(endBS);
    const dates: BSDate[] = [];

    const currentAD = new Date(startAD);
    while (currentAD <= endAD) {
      const bsDate = toBS(currentAD);
      if (bsDate) {
        dates.push(bsDate);
      }
      currentAD.setDate(currentAD.getDate() + 1);
    }

    return dates;
  } catch {
    return [];
  }
}
