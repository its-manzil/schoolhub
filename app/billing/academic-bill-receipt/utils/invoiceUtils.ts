/**
 * Invoice Utilities for Bill Records
 * Handles number-to-words conversion and number formatting
 */

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
