'use client';

import React from 'react';
import { Period } from '../types';
import { Subject } from '../../subjects/types';

interface PeriodEditorProps {
  period: Period;
  availableSubjects: Subject[];
  onUpdate: (updated: Period) => void;
}

const PeriodEditor: React.FC<PeriodEditorProps> = ({
  period,
  availableSubjects,
  onUpdate
}) => {
  return (
    <div className="period-editor-card">
      <div className="editor-row">
        <label>Name:</label>
        <input 
          type="text" 
          value={period.periodName} 
          onChange={(e) => onUpdate({ ...period, periodName: e.target.value })} 
        />
      </div>
      <div className="editor-row">
        <label>Time:</label>
        <input 
          type="time" 
          value={period.startTime} 
          onChange={(e) => onUpdate({ ...period, startTime: e.target.value })} 
        />
        <span>to</span>
        <input 
          type="time" 
          value={period.endTime} 
          onChange={(e) => onUpdate({ ...period, endTime: e.target.value })} 
        />
      </div>
      <div className="editor-row">
        <label>Type:</label>
        <select 
          value={period.subjectType} 
          onChange={(e) => onUpdate({ ...period, subjectType: e.target.value as Period['subjectType'] })}
        >
          <option value="Primary">Primary</option>
          <option value="Minor">Minor</option>
          <option value="Optional">Optional</option>
          <option value="Break">Break</option>
          <option value="Lunch">Lunch</option>
        </select>
      </div>
      {period.subjectType === 'Minor' && (
        <div className="editor-row">
          <label>Mode:</label>
          <select 
            value={period.applyMode} 
            onChange={(e) => onUpdate({ ...period, applyMode: e.target.value as Period['applyMode'] })}
          >
            <option value="weekly">Same for whole week</option>
            <option value="daily">Customize per day</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default PeriodEditor;
