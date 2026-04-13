import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './AuditLogs.module.css';

interface AuditLog {
  id: string;
  timestamp: string;
  who: {
    userId: string;
    username: string;
    role: string;
    ipAddress: string;
    userAgent: string;
  };
  what: {
    action: string;
    module: string;
    operation: string;
    description: string;
  };
  when: {
    timestamp: string;
    duration: number;
    timezone: string;
  };
  where: {
    component: string;
    page: string;
    section: string;
    endpoint?: string;
  };
  beforeAndAfter: {
    before: Record<string, any>;
    after: Record<string, any>;
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  };
  security: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'data_modification' | 'access_control' | 'system_config' | 'financial' | 'security';
    flagged: boolean;
    riskScore: number;
  };
  immutability: {
    checksum: string;
    blockchainHash?: string;
    digitalSignature: string;
    tampered: boolean;
    verified: boolean;
  };
}

export const AuditLogs: React.FC = () => {
  const router = useRouter();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    module: 'all',
    severity: 'all',
    user: 'all',
    action: 'all'
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data generation
  useEffect(() => {
    const generateMockLogs = (): AuditLog[] => {
      const logs: AuditLog[] = [];
      const actions = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT'];
      const modules = ['billing', 'students', 'fees', 'reports', 'system'];
      const users = [
        { userId: '1', username: 'admin', role: 'Administrator', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0' },
        { userId: '2', username: 'accountant', role: 'Accountant', ipAddress: '192.168.1.101', userAgent: 'Chrome/120.0' },
        { userId: '3', username: 'principal', role: 'Principal', ipAddress: '192.168.1.102', userAgent: 'Safari/17.0' }
      ];

      for (let i = 0; i < 50; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const module = modules[Math.floor(Math.random() * modules.length)];
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const beforeData = Math.random() > 0.5 ? {
          amount: Math.floor(Math.random() * 10000),
          status: 'pending',
          studentName: `Student ${i}`
        } : {};

        const afterData = Math.random() > 0.5 ? {
          amount: Math.floor(Math.random() * 10000),
          status: 'completed',
          studentName: `Student ${i + 1}`
        } : {};

        const log: AuditLog = {
          id: `log_${i + 1}`,
          timestamp,
          who: user,
          what: {
            action,
            module,
            operation: `${action.toLowerCase()}_${module}`,
            description: `${action} operation performed in ${module} module`
          },
          when: {
            timestamp,
            duration: Math.floor(Math.random() * 1000),
            timezone: 'Asia/Kathmandu'
          },
          where: {
            component: `${module.charAt(0).toUpperCase() + module.slice(1)}Component`,
            page: `/${module}`,
            section: module,
            endpoint: `/api/${module}/${action.toLowerCase()}`
          },
          beforeAndAfter: {
            before: beforeData,
            after: afterData,
            changes: Object.keys(beforeData).map(key => ({
              field: key,
              oldValue: (beforeData as any)[key],
              newValue: (afterData as any)[key] || null
            }))
          },
          security: {
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
            category: ['data_modification', 'access_control', 'system_config', 'financial', 'security'][Math.floor(Math.random() * 5)] as any,
            flagged: Math.random() > 0.7,
            riskScore: Math.floor(Math.random() * 100)
          },
          immutability: {
            checksum: `checksum_${i}`,
            digitalSignature: `signature_${i}`,
            tampered: false,
            verified: true
          }
        };
        
        logs.push(log);
      }
      
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    setTimeout(() => {
      const mockLogs = generateMockLogs();
      setAuditLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  // Search and filter functionality
  useEffect(() => {
    let filtered = [...auditLogs];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.who.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.what.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.what.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.what.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }

    // Module filter
    if (filters.module !== 'all') {
      filtered = filtered.filter(log => log.what.module === filters.module);
    }

    // Severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(log => log.security.severity === filters.severity);
    }

    // User filter
    if (filters.user !== 'all') {
      filtered = filtered.filter(log => log.who.username === filters.user);
    }

    // Action filter
    if (filters.action !== 'all') {
      filtered = filtered.filter(log => log.what.action === filters.action);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, filters, auditLogs]);

  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const handleExport = () => {
    const csvContent = [
      'Timestamp,User,Action,Module,Description,Severity,Risk Score',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.who.username}","${log.what.action}","${log.what.module}","${log.what.description}","${log.security.severity}","${log.security.riskScore}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    router.push('/billing#billing-setup');
  };

  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.who.username)));
  const uniqueModules = Array.from(new Set(auditLogs.map(log => log.what.module)));
  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.what.action)));

  if (loading) {
    return (
      <div id="audit-logs" className="content-section active">
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="audit-logs" className="content-section active">
      <div className={styles.header}>
        <h2>Audit Logs</h2>
        <p>Comprehensive system activity tracking with immutable audit trails</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search logs by user, action, module, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          <select
            value={filters.module}
            onChange={(e) => setFilters({ ...filters, module: e.target.value })}
          >
            <option value="all">All Modules</option>
            {uniqueModules.map(module => (
              <option key={module} value={module}>
                {module.charAt(0).toUpperCase() + module.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.user}
            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        <div className={styles.actions}>
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`} 
            onClick={handleBack}
            aria-label="Back to Billing Setup"
            title="Back to Billing Setup"
          >
            <i className="fas fa-arrow-left"></i> Back to Billing Setup
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleExport}>
            <i className="fas fa-download"></i> Export Logs
          </button>
        </div>

      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Logs</h3>
          <p>{filteredLogs.length.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Security Events</h3>
          <p>{filteredLogs.filter(log => log.security.flagged).length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>High Risk</h3>
          <p>{filteredLogs.filter(log => log.security.riskScore > 70).length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Tampered</h3>
          <p>{filteredLogs.filter(log => log.immutability.tampered).length}</p>
        </div>
      </div>

      <div className={styles.logsContainer}>
        <div className={styles.logsTable}>
          <div className={styles.tableHeader}>
            <div>Timestamp</div>
            <div>User</div>
            <div>Action</div>
            <div>Module</div>
            <div>Description</div>
            <div>Severity</div>
            <div>Risk</div>
            <div>Status</div>
          </div>
          
          <div className={styles.tableBody}>
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`${styles.logRow} ${log.security.flagged ? styles.flagged : ''}`}
                onClick={() => handleLogClick(log)}
              >
                <div className={styles.timestamp}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className={styles.user}>
                  <div className={styles.userInfo}>
                    <span className={styles.username}>{log.who.username}</span>
                    <span className={styles.role}>{log.who.role}</span>
                  </div>
                </div>
                <div className={styles.action}>
                  <span className={`${styles.actionBadge} ${styles[log.what.action.toLowerCase()]}`}>
                    {log.what.action}
                  </span>
                </div>
                <div className={styles.module}>
                  {log.what.module.charAt(0).toUpperCase() + log.what.module.slice(1)}
                </div>
                <div className={styles.description}>
                  {log.what.description}
                </div>
                <div className={styles.severity}>
                  <span className={`${styles.severityBadge} ${styles[log.security.severity]}`}>
                    {log.security.severity.toUpperCase()}
                  </span>
                </div>
                <div className={styles.risk}>
                  <div className={styles.riskBar}>
                    <div
                      className={styles.riskFill}
                      style={{
                        width: `${log.security.riskScore}%`,
                        backgroundColor: log.security.riskScore > 70 ? '#dc2626' : 
                                       log.security.riskScore > 40 ? '#d97706' : '#10b981'
                      }}
                    ></div>
                  </div>
                  <span>{log.security.riskScore}</span>
                </div>
                <div className={styles.status}>
                  {log.immutability.tampered ? (
                    <span className={`${styles.statusBadge} ${styles.tampered}`}>
                      <i className="fas fa-exclamation-triangle"></i> Tampered
                    </span>
                  ) : (
                    <span className={`${styles.statusBadge} ${styles.verified}`}>
                      <i className="fas fa-check-circle"></i> Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDetails && selectedLog && (
        <div className={styles.modal} onClick={() => setShowDetails(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Audit Log Details</h3>
              <button className={styles.closeBtn} onClick={() => setShowDetails(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h4>The 4 W's of Logging</h4>
                
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Who:</label>
                    <div>
                      <p><strong>User:</strong> {selectedLog.who.username}</p>
                      <p><strong>Role:</strong> {selectedLog.who.role}</p>
                      <p><strong>IP Address:</strong> {selectedLog.who.ipAddress}</p>
                      <p><strong>User Agent:</strong> {selectedLog.who.userAgent}</p>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <label>What:</label>
                    <div>
                      <p><strong>Action:</strong> {selectedLog.what.action}</p>
                      <p><strong>Module:</strong> {selectedLog.what.module}</p>
                      <p><strong>Operation:</strong> {selectedLog.what.operation}</p>
                      <p><strong>Description:</strong> {selectedLog.what.description}</p>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <label>When:</label>
                    <div>
                      <p><strong>Timestamp:</strong> {new Date(selectedLog.when.timestamp).toLocaleString()}</p>
                      <p><strong>Duration:</strong> {selectedLog.when.duration}ms</p>
                      <p><strong>Timezone:</strong> {selectedLog.when.timezone}</p>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <label>Where:</label>
                    <div>
                      <p><strong>Component:</strong> {selectedLog.where.component}</p>
                      <p><strong>Page:</strong> {selectedLog.where.page}</p>
                      <p><strong>Section:</strong> {selectedLog.where.section}</p>
                      <p><strong>Endpoint:</strong> {selectedLog.where.endpoint}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Contextual Before & After Data</h4>
                
                <div className={styles.dataComparison}>
                  <div className={styles.dataColumn}>
                    <h5>Before</h5>
                    <pre>{JSON.stringify(selectedLog.beforeAndAfter.before, null, 2)}</pre>
                  </div>
                  
                  <div className={styles.dataColumn}>
                    <h5>After</h5>
                    <pre>{JSON.stringify(selectedLog.beforeAndAfter.after, null, 2)}</pre>
                  </div>
                </div>

                {selectedLog.beforeAndAfter.changes.length > 0 && (
                  <div className={styles.changesList}>
                    <h5>Changes Detected</h5>
                    {selectedLog.beforeAndAfter.changes.map((change, index) => (
                      <div key={index} className={styles.changeItem}>
                        <span className={styles.fieldName}>{change.field}:</span>
                        <span className={styles.oldValue}>{JSON.stringify(change.oldValue)}</span>
                        <i className="fas fa-arrow-right"></i>
                        <span className={styles.newValue}>{JSON.stringify(change.newValue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <h4>Security Events</h4>
                
                <div className={styles.securityInfo}>
                  <div className={styles.securityItem}>
                    <label>Severity:</label>
                    <span className={`${styles.severityBadge} ${styles[selectedLog.security.severity]}`}>
                      {selectedLog.security.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className={styles.securityItem}>
                    <label>Category:</label>
                    <span>{selectedLog.security.category.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  
                  <div className={styles.securityItem}>
                    <label>Flagged:</label>
                    <span className={selectedLog.security.flagged ? styles.flaggedText : styles.normalText}>
                      {selectedLog.security.flagged ? 'Yes - Requires Attention' : 'No'}
                    </span>
                  </div>
                  
                  <div className={styles.securityItem}>
                    <label>Risk Score:</label>
                    <div className={styles.riskScore}>
                      <div className={styles.riskBar}>
                        <div
                          className={styles.riskFill}
                          style={{
                            width: `${selectedLog.security.riskScore}%`,
                            backgroundColor: selectedLog.security.riskScore > 70 ? '#dc2626' : 
                                           selectedLog.security.riskScore > 40 ? '#d97706' : '#10b981'
                          }}
                        ></div>
                      </div>
                      <span>{selectedLog.security.riskScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Immutability (Tamper-Proofing)</h4>
                
                <div className={styles.immutabilityInfo}>
                  <div className={styles.immutabilityItem}>
                    <label>Checksum:</label>
                    <code>{selectedLog.immutability.checksum}</code>
                  </div>
                  
                  {selectedLog.immutability.blockchainHash && (
                    <div className={styles.immutabilityItem}>
                      <label>Blockchain Hash:</label>
                      <code>{selectedLog.immutability.blockchainHash}</code>
                    </div>
                  )}
                  
                  <div className={styles.immutabilityItem}>
                    <label>Digital Signature:</label>
                    <code>{selectedLog.immutability.digitalSignature}</code>
                  </div>
                  
                  <div className={styles.immutabilityItem}>
                    <label>Tampered:</label>
                    <span className={selectedLog.immutability.tampered ? styles.tamperedText : styles.verifiedText}>
                      {selectedLog.immutability.tampered ? 'YES - INTEGRITY COMPROMISED' : 'No - Integrity Verified'}
                    </span>
                  </div>
                  
                  <div className={styles.immutabilityItem}>
                    <label>Verified:</label>
                    <span className={selectedLog.immutability.verified ? styles.verifiedText : styles.unverifiedText}>
                      {selectedLog.immutability.verified ? 'Signature Valid' : 'Signature Invalid'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
