'use client';

import React from 'react';
import './HolidayToggle.css';

interface HolidayToggleProps {
  day: string;
  isHoliday: boolean;
  onToggle: () => void;
}

const HolidayToggle: React.FC<HolidayToggleProps> = ({ day, isHoliday, onToggle }) => {
  return (
    <div className={`holiday-toggle ${isHoliday ? 'is-holiday' : ''}`}>
      <button 
        type="button" 
        onClick={onToggle}
        className={isHoliday ? 'btn-holiday' : 'btn-weekday'}
      >
        {isHoliday ? 'HOLIDAY' : '👉 "Mark as Holiday"'}
      </button>
    </div>
  );
};

export default HolidayToggle;
