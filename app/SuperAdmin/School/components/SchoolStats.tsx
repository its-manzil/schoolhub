'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSchool, 
  faCheckCircle, 
  faTimesCircle, 
  faRupeeSign,
  faExclamationTriangle,
  faClock,
  faGift
} from '@fortawesome/free-solid-svg-icons';
import { School } from '../types';
import { calculateTotalRevenue } from '../lib/utils';
import '../styles/stats.css';

interface SchoolStatsProps {
  schools: School[];
}

export default function SchoolStats({ schools }: SchoolStatsProps) {
  const totalSchools = schools.length;
  
  // New status-based counts
  const trialSchools = schools.filter(s => s.status === 'trial').length;
  const activeSchools = schools.filter(s => s.status === 'active').length;
  const pendingSchools = schools.filter(s => s.status === 'pending').length;
  const expiredSchools = schools.filter(s => s.status === 'inactive').length;
  
  // Fallback for schools without status field (backward compatibility)
  const legacyActiveSchools = schools.filter(s => 
    !s.status && s.subscription.isActive && s.subscription.remainingDays > 0
  ).length;
  const legacyExpiredSchools = schools.filter(s => 
    !s.status && (!s.subscription.isActive || s.subscription.remainingDays <= 0)
  ).length;
  
  const totalActive = activeSchools + legacyActiveSchools;
  const totalExpired = expiredSchools + legacyExpiredSchools;
  
  const totalRevenue = calculateTotalRevenue(schools);

  const stats = [
    {
      label: 'Total Schools',
      value: totalSchools,
      icon: faSchool,
      color: 'blue',
      progress: totalSchools > 0 ? 100 : 0
    },
    {
      label: 'Trial Schools',
      value: trialSchools,
      icon: faGift,
      color: 'cyan',
      progress: totalSchools > 0 ? (trialSchools / totalSchools) * 100 : 0
    },
    {
      label: 'Active Schools',
      value: totalActive,
      icon: faCheckCircle,
      color: 'green',
      progress: totalSchools > 0 ? (totalActive / totalSchools) * 100 : 0
    },
    {
      label: 'Grace Period',
      value: pendingSchools,
      icon: faClock,
      color: 'yellow',
      progress: totalSchools > 0 ? (pendingSchools / totalSchools) * 100 : 0,
      secondaryValue: pendingSchools > 0 ? 'Renewal needed' : null,
      secondaryIcon: pendingSchools > 0 ? faExclamationTriangle : null
    },
    {
      label: 'Expired Schools',
      value: totalExpired,
      icon: faTimesCircle,
      color: 'red',
      progress: totalSchools > 0 ? (totalExpired / totalSchools) * 100 : 0
    },
    {
      label: 'Total Revenue',
      value: `Rs.${totalRevenue.toLocaleString()}`,
      icon: faRupeeSign,
      color: 'purple',
      isCurrency: true
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="stats-section"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div 
          key={index} 
          className="stat-card"
          variants={itemVariants}
        >
          <div className={`stat-icon-wrapper ${stat.color}`}>
            <FontAwesomeIcon icon={stat.icon} className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            {stat.secondaryValue && (
              <p className={`stat-change ${pendingSchools > 5 ? 'negative' : 'warning'}`}>
                {stat.secondaryIcon && <FontAwesomeIcon icon={stat.secondaryIcon} />}
                {stat.secondaryValue}
              </p>
            )}
            {!stat.isCurrency && (
              <div className="stat-progress">
                <div 
                  className={`stat-progress-fill ${stat.color}`}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
