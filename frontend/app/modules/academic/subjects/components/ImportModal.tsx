'use client';

import React, { useState } from 'react';
import { CLASS_OPTIONS } from '../types';

interface ImportModalProps {
  onImport: (sourceClass: string, sourceYear: string) => void;
  onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onImport, onClose }) => {
  const [sourceYear, setSourceYear] = useState('');
  const [sourceClass, setSourceClass] = useState('Class 1');

  const years = Array.from({ length: 15 }, (_, i) => `${2080 + i}-${2081 + i}`);

  return (
    <div className="import-modal-content">
      <p>Select the source class and year to import subjects from:</p>
      <div className="form-group">
        <label>Source Year</label>
        <select value={sourceYear} onChange={(e) => setSourceYear(e.target.value)}>
          <option value="">Select Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Source Class</label>
        <select value={sourceClass} onChange={(e) => setSourceClass(e.target.value)}>
          {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button 
          className="btn-primary" 
          onClick={() => onImport(sourceClass, sourceYear)}
          disabled={!sourceYear}
        >
          Import Now
        </button>
      </div>
    </div>
  );
};

export default ImportModal;
