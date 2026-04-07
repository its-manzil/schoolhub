import React from 'react';

interface NepaliDatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function NepaliDatePicker({ value, onChange, placeholder }: NepaliDatePickerProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: '0.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        fontSize: '0.875rem'
      }}
    />
  );
}
