'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faEnvelope, 
  faPhone,
  faUserShield,
  faEye,
  faEdit,
  faSyncAlt,
  faTrash,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import { School } from '../types';
import { getStatusColor, copyToClipboard } from '../lib/utils';
import SubscriptionBadge from './SubscriptionBadge';
import '../styles/card.css';

interface SchoolCardProps {
  school: School;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (school: School) => void;
  onEdit: (school: School) => void;
  onExtend: (school: School) => void;
  onDelete: (school: School) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export default function SchoolCard({ 
  school, 
  isSelected, 
  onSelect, 
  onView, 
  onEdit, 
  onExtend, 
  onDelete,
  onShowToast 
}: SchoolCardProps) {
  const statusColor = getStatusColor(school.subscription.remainingDays, school.subscription.isActive);
  
  const getStatusText = () => {
    if (!school.subscription.isActive || school.subscription.remainingDays <= 0) return 'Expired';
    if (school.subscription.remainingDays <= 30) return 'Expiring Soon';
    return 'Active';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCopyUsername = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const username = `${school.schoolId}_admin`;
    const success = await copyToClipboard(username);
    if (success) {
      onShowToast('Username copied to clipboard!', 'success');
    } else {
      onShowToast('Failed to copy username', 'error');
    }
  };

  return (
    <motion.div 
      className={`school-card ${isSelected ? 'selected' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
    >
      {/* Selection Checkbox */}
      <div className="card-selection" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(school._id)}
          className="selection-checkbox"
        />
      </div>

      {/* Card Header */}
      <div className="card-header">
        <div className="card-header-left">
          {school.logo ? (
            <img 
              src={school.logo} 
              alt={school.name} 
              className="school-logo"
            />
          ) : (
            <div className="school-logo-placeholder">
              {getInitials(school.name)}
            </div>
          )}
          <div className="school-header-info">
            <h3 className="school-name" title={school.name}>{school.name}</h3>
            <span className="school-id">ID: {school.schoolId}</span>
          </div>
        </div>
        <div className="card-header-right">
          <span className={`status-badge ${statusColor === 'success' ? 'active' : statusColor === 'warning' ? 'expiring-soon' : 'expired'}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <p className="school-address">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="address-icon" />
          {school.address}
        </p>

        <div className="contact-info">
          <div className="contact-item">
            <FontAwesomeIcon icon={faEnvelope} />
            {school.contactEmail}
          </div>
          <div className="contact-item">
            <FontAwesomeIcon icon={faPhone} />
            {school.contactPhone}
          </div>
        </div>

        <SubscriptionBadge subscription={school.subscription} />

        <div className="admin-info-section">
          <FontAwesomeIcon icon={faUserShield} />
          <span>Admin: </span>
          <span className="admin-username">{school.schoolId}_admin</span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="card-actions">
          <button 
            className="action-btn view action-tooltip"
            data-tooltip="View Details"
            onClick={() => onView(school)}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button 
            className="action-btn edit action-tooltip"
            data-tooltip="Edit School"
            onClick={() => onEdit(school)}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button 
            className="action-btn extend action-tooltip"
            data-tooltip="Extend Subscription"
            onClick={() => onExtend(school)}
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
          <button 
            className="action-btn copy action-tooltip"
            data-tooltip="Copy Admin Username"
            onClick={handleCopyUsername}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
          <button 
            className="action-btn delete action-tooltip"
            data-tooltip="Delete School"
            onClick={() => onDelete(school)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
