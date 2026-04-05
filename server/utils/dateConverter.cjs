/**
 * Nepali Date Converter Utility - Backend
 * Converts between Bikram Sambat (BS) and Gregorian Calendar (AD)
 * Using nepali-date-converter library for accurate conversions
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const NepaliDate = require('nepali-date-converter').default;
/* eslint-enable @typescript-eslint/no-require-imports */

// Nepali months names
const NEPALI_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

/**
 * Convert English Date (AD) to Nepali Date (BS)
 */
function toBS(englishDate) {
  const date = new Date(englishDate);
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
function toAD(nepaliDate) {
  let bsDate;
  
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
function formatBSDate(date) {
  return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
}

/**
 * Format Nepali date with month name
 */
function formatBSDateWithMonth(date) {
  const monthName = NEPALI_MONTHS[date.month - 1];
  return `${date.day} ${monthName} ${date.year}`;
}

/**
 * Get current Nepali date
 */
function getCurrentBSDate() {
  const nepaliDate = new NepaliDate();
  
  return {
    year: parseInt(nepaliDate.format('YYYY')),
    month: parseInt(nepaliDate.format('MM')),
    day: parseInt(nepaliDate.format('DD'))
  };
}

/**
 * Parse BS date string to object
 */
function parseBSDate(dateString) {
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
function isValidBSDate(date) {
  try {
    // Try to create a NepaliDate object to validate
    const nepaliDate = new NepaliDate(`${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`);
    return !!nepaliDate;
  } catch {
    return false;
  }
}

/**
 * Middleware to convert BS dates to AD in request body
 */
function convertBSToAD(req, res, next) {
  try {
    const body = req.body;
    
    // Convert startDate and endDate if they exist
    if (body.startDate && typeof body.startDate === 'string') {
      body.startDate = toAD(body.startDate);
    }
    
    if (body.endDate && typeof body.endDate === 'string') {
      body.endDate = toAD(body.endDate);
    }
    
    // Convert any other date fields that might be BS dates
    if (body.date && typeof body.date === 'string') {
      body.date = toAD(body.date);
    }
    
    next();
  } catch {
    res.status(400).json({ message: 'Invalid date format' });
  }
}

/**
 * Middleware to convert AD dates to BS in response
 */
function convertADToBS(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    try {
      if (Array.isArray(data)) {
        // Handle array of objects
        data = data.map(item => convertDatesInObject(item));
      } else if (data && typeof data === 'object') {
        // Handle single object
        data = convertDatesInObject(data);
      }
    } catch {
      // If conversion fails, return original data
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Helper function to convert dates in an object from AD to BS
 */
function convertDatesInObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const converted = { ...obj };
  
  // Convert common date fields
  ['startDate', 'endDate', 'createdAt', 'updatedAt', 'date'].forEach(field => {
    if (converted[field]) {
      const date = new Date(converted[field]);
      if (!isNaN(date.getTime())) {
        converted[`${field}BS`] = formatBSDate(toBS(date));
      }
    }
  });
  
  return converted;
}

module.exports = {
  toBS,
  toAD,
  formatBSDate,
  formatBSDateWithMonth,
  getCurrentBSDate,
  parseBSDate,
  isValidBSDate,
  convertBSToAD,
  convertADToBS,
  convertDatesInObject
};
