// FiscalYearSelector Component
// BS Fiscal Year selector with format "2081 - 2082"

'use client';

import React, { useMemo, useCallback } from 'react';
import { Calendar } from 'lucide-react';

interface FiscalYearSelectorProps {
  value: string; // format: "2081-2082"
  onChange: (value: string) => void;
  disabled?: boolean;
  currentYear: number; // Current BS year from date converter
}

// Generate fiscal year options from 2080 to 2100
const generateFiscalYears = (currentYear: number): Array<{ value: string; label: string; isCurrent: boolean }> => {
  const years: Array<{ value: string; label: string; isCurrent: boolean }> = [];
  
  for (let startYear = 2080; startYear <= 2099; startYear++) {
    const endYear = startYear + 1;
    const value = `${startYear}-${endYear}`;
    const label = `${startYear} - ${endYear}`;
    // Fiscal year is current if current date falls within it
    // BS fiscal year: Shrawan (4th month) to Ashad (3rd month) of next year
    const isCurrent = currentYear === startYear || currentYear === endYear;
    
    years.push({ value, label, isCurrent });
  }
  
  return years;
};

// Get default fiscal year based on current BS date
export const getDefaultFiscalYear = (currentYear: number, currentMonth: number): string => {
  // BS Fiscal year runs from Shrawan (month 4) to Ashad (month 3)
  // If month >= 4 (Shrawan or later), we're in startYear-endYear fiscal year
  // If month <= 3 (Ashad or earlier), we're in (startYear-1)-startYear fiscal year
  
  if (currentMonth >= 4) {
    // We're in the first half of fiscal year (Shrawan to Chaitra)
    return `${currentYear}-${currentYear + 1}`;
  } else {
    // We're in the second half of fiscal year (Baishakh to Ashad)
    return `${currentYear - 1}-${currentYear}`;
  }
};

// Extract start year from fiscal year string
export const getFiscalYearStart = (fiscalYear: string): number => {
  return parseInt(fiscalYear.split('-')[0]);
};

export const FiscalYearSelector: React.FC<FiscalYearSelectorProps> = React.memo(({
  value,
  onChange,
  disabled = false,
  currentYear
}) => {
  const fiscalYears = useMemo(() => generateFiscalYears(currentYear), [currentYear]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="ve-field-group ve-fiscal-year">
      <label>Fiscal Year</label>
      <div className="ve-fiscal-year-wrapper">
        <Calendar size={16} className="ve-fiscal-year-icon" />
        <select
          className="ve-input ve-fiscal-year-select"
          value={value}
          onChange={handleChange}
          disabled={disabled}
        >
          {fiscalYears.map((fy) => (
            <option key={fy.value} value={fy.value}>
              {fy.label} {fy.isCurrent ? '(Current)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

FiscalYearSelector.displayName = 'FiscalYearSelector';

export default FiscalYearSelector;
