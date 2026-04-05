import React from 'react';
import styles from './Toggle.module.css';

interface ToggleProps {
  active: boolean;
  onChange: (active: boolean) => void;
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ active, onChange, label }) => {
  return (
    <div className={styles.toggle} onClick={() => onChange(!active)}>
      <div className={`${styles.track} ${active ? styles.activeTrack : ''}`}>
        <div className={`${styles.thumb} ${active ? styles.activeThumb : ''}`} />
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};

export default Toggle;
