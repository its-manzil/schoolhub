import * as React from "react";

const Sidebar = () => {
  return (
    <div style={{ 
      width: '16rem', 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      borderRight: '1px solid #e5e7eb',
      padding: '1rem 0.75rem' 
    }}>
      <div style={{ 
        padding: '0 0.5rem 0.75rem',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '0.75rem',
        flexShrink: 0
      }}>
        <h2 style={{ 
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#374151' 
        }}>SIDEBAR</h2>
      </div>
      <nav style={{ padding: '0.5rem' }}>
        <a 
          href=".." 
          style={{ 
            display: 'block', 
            padding: '0.5rem', 
            textDecoration: 'none', 
            color: '#374151',
            borderRadius: '0.375rem'
          }}
        >Dashboard</a>
        <a 
          href="../configuration" 
          style={{ 
            display: 'block', 
            padding: '0.5rem', 
            textDecoration: 'none', 
            color: '#6b7280',
            borderRadius: '0.375rem'
          }}
        >Configuration</a>
      </nav>
    </div>
  );
};

export default Sidebar;
