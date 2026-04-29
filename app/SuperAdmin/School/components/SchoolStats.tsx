'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSchool, 
  faCheckCircle, 
  faTimesCircle, 
  faRupeeSign,
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import { School } from '../types';
import { calculateTotalRevenue } from '../lib/utils';
import '../styles/stats.css';

interface SchoolStatsProps {
  schools: School[];
}

export default function SchoolStats({ schools }: SchoolStatsProps) {
  const totalSchools = schools.length;
  const activeSchools = schools.filter(s => s.subscription.isActive && s.subscription.remainingDays > 0).length;
  const expiredSchools = schools.filter(s => !s.subscription.isActive || s.subscription.remainingDays <= 0).length;
  const expiringSoon = schools.filter(s => 
    s.subscription.isActive && 
    s.subscription.remainingDays > 0 && 
    s.subscription.remainingDays <= 30
  ).length;
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
      label: 'Active Schools',
      value: activeSchools,
      icon: faCheckCircle,
      color: 'green',
      progress: totalSchools > 0 ? (activeSchools / totalSchools) * 100 : 0
    },
    {
      label: 'Expired Schools',
      value: expiredSchools,
      icon: faTimesCircle,
      color: 'red',
      progress: totalSchools > 0 ? (expiredSchools / totalSchools) * 100 : 0
    },
    {
      label: 'Total Revenue',
      value: `Rs.${totalRevenue.toLocaleString()}`,
      icon: faRupeeSign,
      color: 'purple',
      isCurrency: true,
      secondaryValue: expiringSoon > 0 ? `${expiringSoon} expiring soon` : null,
      secondaryIcon: expiringSoon > 0 ? faExclamationTriangle : null
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
              <p className={`stat-change ${expiringSoon > 10 ? 'negative' : 'warning'}`}>
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
