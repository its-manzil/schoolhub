import React from 'react';
import './skeleton.css';

// Base skeleton text component
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'title';
  width?: string;
}

const SkeletonText: React.FC<SkeletonTextProps> = ({ 
  lines = 1, 
  className = '', 
  size = 'md',
  width 
}) => {
  const sizeClass = size === 'sm' ? 'skeleton-text-sm' : 
                    size === 'lg' ? 'skeleton-text-lg' : 
                    size === 'xl' ? 'skeleton-text-xl' : 
                    size === 'title' ? 'skeleton-text-title' : 
                    'skeleton-text';

  return (
    <div className={`skeleton-wrapper ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`skeleton ${sizeClass}`}
          style={width ? { width: index === lines - 1 ? '60%' : width } : undefined}
        />
      ))}
    </div>
  );
};

// Skeleton circle component for avatars
interface SkeletonCircleProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SkeletonCircle: React.FC<SkeletonCircleProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClass = size === 'sm' ? 'skeleton-circle-sm' : 
                    size === 'lg' ? 'skeleton-circle-lg' : 
                    size === 'xl' ? 'skeleton-circle-xl' : 
                    'skeleton-circle';

  return <div className={`skeleton ${sizeClass} ${className}`} />;
};

// Skeleton rectangle component for cards, buttons, etc.
interface SkeletonRectProps {
  width?: string;
  height?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SkeletonRect: React.FC<SkeletonRectProps> = ({ 
  width, 
  height, 
  className = '',
  size 
}) => {
  const sizeClass = size === 'sm' ? 'skeleton-rect-sm' : 
                    size === 'lg' ? 'skeleton-rect-lg' : 
                    size === 'xl' ? 'skeleton-rect-xl' : 
                    size === 'md' ? 'skeleton-rect-md' : '';

  return (
    <div 
      className={`skeleton skeleton-rect ${sizeClass} ${className}`}
      style={{ width, height }}
    />
  );
};

// Skeleton wrapper for layout
interface SkeletonWrapperProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'column';
  spaceBetween?: boolean;
  alignStart?: boolean;
}

const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({ 
  children, 
  className = '',
  direction = 'column',
  spaceBetween = false,
  alignStart = false
}) => {
  const directionClass = direction === 'row' ? 'skeleton-row' : 'skeleton-wrapper';
  const spaceClass = spaceBetween ? 'skeleton-row-space-between' : '';
  const alignClass = alignStart ? 'skeleton-row-align-start' : '';

  return (
    <div className={`${directionClass} ${spaceClass} ${alignClass} ${className}`}>
      {children}
    </div>
  );
};

// Header skeleton component
const SkeletonHeader: React.FC = () => {
  return (
    <div className="skeleton-header">
      <div className="skeleton skeleton-header-title" />
      <div className="skeleton skeleton-header-subtitle" />
    </div>
  );
};

// Card skeleton component
const SkeletonCard: React.FC<{ showFooter?: boolean }> = ({ showFooter = true }) => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <SkeletonRect width="120px" height="24px" />
        <SkeletonRect width="80px" height="32px" size="sm" />
      </div>
      <div className="skeleton-card-body">
        <SkeletonText lines={2} width="100%" />
        <SkeletonWrapper direction="row">
          <SkeletonCircle size="sm" />
          <div style={{ flex: 1 }}>
            <SkeletonText lines={1} width="70%" size="sm" />
            <SkeletonText lines={1} width="40%" size="sm" />
          </div>
        </SkeletonWrapper>
      </div>
      {showFooter && (
        <div className="skeleton-card-footer">
          <SkeletonRect width="80px" height="32px" size="sm" />
          <SkeletonRect width="100px" height="32px" size="sm" />
        </div>
      )}
    </div>
  );
};

// Form skeleton component
const SkeletonForm: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <div className="skeleton-form">
      <div className="skeleton-form-row">
        {Array.from({ length: Math.min(2, fields) }).map((_, index) => (
          <div key={index} className="skeleton-form-group">
            <div className="skeleton skeleton-form-label" />
            <div className="skeleton skeleton-form-input" />
          </div>
        ))}
      </div>
      {fields > 2 && (
        <div className="skeleton-form-row">
          {Array.from({ length: Math.min(2, fields - 2) }).map((_, index) => (
            <div key={index} className="skeleton-form-group">
              <div className="skeleton skeleton-form-label" />
              <div className="skeleton skeleton-form-input" />
            </div>
          ))}
        </div>
      )}
      {fields > 4 && (
        <div className="skeleton-form-group">
          <div className="skeleton skeleton-form-label" />
          <div className="skeleton skeleton-form-textarea" />
        </div>
      )}
    </div>
  );
};

// Table skeleton component
const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonRect key={index} height="20px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonRect key={colIndex} height="16px" />
          ))}
        </div>
      ))}
    </div>
  );
};

// List skeleton component
const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="skeleton-list">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="skeleton-list-item">
          <SkeletonCircle size="md" />
          <div style={{ flex: 1 }}>
            <SkeletonText lines={1} width="80%" />
            <SkeletonText lines={1} width="60%" size="sm" />
          </div>
          <SkeletonRect width="60px" height="24px" size="sm" />
        </div>
      ))}
    </div>
  );
};

// Modal skeleton component
const SkeletonModal: React.FC = () => {
  return (
    <div className="skeleton-modal">
      <div className="skeleton-modal-content">
        <div className="skeleton-modal-header">
          <SkeletonRect width="200px" height="28px" />
          <SkeletonCircle size="sm" />
        </div>
        <div className="skeleton-modal-body">
          <SkeletonForm fields={3} />
        </div>
        <div className="skeleton-modal-footer">
          <SkeletonRect width="80px" height="36px" size="sm" />
          <SkeletonRect width="100px" height="36px" size="sm" />
        </div>
      </div>
    </div>
  );
};

// Main Skeleton component
interface SkeletonProps {
  numCards?: number;
  numRows?: number;
  showHeader?: boolean;
  showForm?: boolean;
  showTable?: boolean;
  showList?: boolean;
  showModal?: boolean;
  className?: string;
  darkMode?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  numCards = 3,
  numRows = 5,
  showHeader = true,
  showForm = false,
  showTable = false,
  showList = false,
  showModal = false,
  className = '',
  darkMode = false
}) => {
  return (
    <div className={`skeleton-page ${darkMode ? 'skeleton-page-dark' : ''} ${className}`}>
      {showHeader && <SkeletonHeader />}
      
      {showForm && <SkeletonForm fields={4} />}
      
      {showTable && <SkeletonTable rows={numRows} columns={4} />}
      
      {showList && <SkeletonList items={numRows} />}
      
      {Array.from({ length: numCards }).map((_, index) => (
        <SkeletonCard key={index} showFooter={index % 2 === 0} />
      ))}
      
      {showModal && <SkeletonModal />}
    </div>
  );
};

// Export all components
export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonRect,
  SkeletonWrapper,
  SkeletonHeader,
  SkeletonCard,
  SkeletonForm,
  SkeletonTable,
  SkeletonList,
  SkeletonModal
};
