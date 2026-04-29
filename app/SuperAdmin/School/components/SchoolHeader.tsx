'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSchool, faPlus, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import '../styles/header.css';

interface SchoolHeaderProps {
  onAddClick: () => void;
  onImportClick: () => void;
  isImportOpen: boolean;
}

export default function SchoolHeader({ onAddClick, onImportClick, isImportOpen }: SchoolHeaderProps) {
  return (
    <motion.div 
      className="schools-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="header-content-wrapper">
        <div className="header-left">
          <h1 className="page-title">
            <FontAwesomeIcon icon={faSchool} className="title-icon" />
            Schools Management
          </h1>
          <p className="page-subtitle">Manage all registered schools and their subscriptions</p>
        </div>
        <div className="header-right">
          <motion.button
            className={`header-btn import-btn ${isImportOpen ? 'active' : ''}`}
            onClick={onImportClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FontAwesomeIcon icon={faUserGraduate} />
            {isImportOpen ? 'View Schools' : 'Import Students'}
          </motion.button>
          <motion.button
            className="header-btn primary"
            onClick={onAddClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New School
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
