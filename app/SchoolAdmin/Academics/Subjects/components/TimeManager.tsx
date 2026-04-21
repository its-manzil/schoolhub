'use client';

import React from 'react';
import './TimeManager.css';

interface TimeManagerProps {
  periodName: string;
  startTime: string;
  endTime: string;
  onUpdate: (field: 'startTime' | 'endTime', value: string) => void;
}

const TimeManager: React.FC<TimeManagerProps> = ({ periodName, startTime, endTime, onUpdate }) => {
  return (
    <div className="time-manager">
      <div className="time-inputs">
        <input 
          type="time" 
          value={startTime} 
          onChange={(e) => onUpdate('startTime', e.target.value)}
          title="Start Time"
        />
        <span>-</span>
        <input 
          type="time" 
          value={endTime} 
          onChange={(e) => onUpdate('endTime', e.target.value)}
          title="End Time"
        />
      </div>
    </div>
  );
};

export default TimeManager;
