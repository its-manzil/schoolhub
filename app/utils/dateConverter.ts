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

/**
 * Convert English Date (AD) to Nepali Date (BS)
 */
export function toBS(englishDate: Date | string): BSDate {
  const date = typeof englishDate === 'string' ? new Date(englishDate) : englishDate;
  const nepaliDate = new NepaliDate(date);
  
  return {
    year: parseInt(nepaliDate.format('YYYY')),
    month: parseInt(nepaliDate.format('MM')),
    day: parseInt(nepaliDate.format('DD'))
  };
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
 */
export function formatBSDateWithMonth(date: BSDate): string {
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
 */
export function isValidBSDate(date: BSDate): boolean {
  try {
    // Try to create a NepaliDate object to validate
    const nepaliDate = new NepaliDate(`${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`);
    return !!nepaliDate;
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
