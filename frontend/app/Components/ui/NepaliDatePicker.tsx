import React from 'react';

interface NepaliDatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export default function NepaliDatePicker({ value, onChange, placeholder, label, error }: NepaliDatePickerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{label}</label>}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '0.5rem',
          border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
          borderRadius: '0.375rem',
          fontSize: '0.875rem'
        }}
      />
      {error && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</span>}
    </div>
  );
}
