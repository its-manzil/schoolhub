import React, { useState } from 'react';
import styles from './BillingSetup.module.css';
import { SetupItemProps, ActionType, SectionType } from '../../../types/billing';

// Internal Components
const SetupItem: React.FC<SetupItemProps & { onNavigate?: (section: SectionType) => void }> = ({
  title,
  description,
  actionType,
  actionText,
  actionValue,
  expandableContent,
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [toggleState, setToggleState] = useState(Boolean(actionValue));

  const handleActionClick = () => {
    if (title === "Fiscal Year Management" && onNavigate) {
      onNavigate('fiscal-year-management' as SectionType);
    } else if (title === "Fee Head Configuration" && onNavigate) {
      onNavigate('fee-head-configuration' as SectionType);
    } else if (title === "Fine Calculation" && onNavigate) {
      onNavigate('fine-calculation' as SectionType);
    } else if (title === "Tax Configuration (VAT/PAN)" && onNavigate) {
      onNavigate('tax-configuration' as SectionType);
    } else if (title === "Audit Logs" && onNavigate) {
      onNavigate('audit-logs' as SectionType);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setToggleState(isChecked);
    setIsExpanded(isChecked); 
  };

  return (
    <div className={styles.setupItemContainer}>
      <div className={styles.setupItem}>
        <div className={styles.setupItemInfo}>
          <h5>{title}</h5>
          <p>{description}</p>
        </div>
        
        {actionType === 'button' && (
          <button className={styles.btnSetupAction} onClick={handleActionClick}>
            {actionText} {isExpanded ? '▲' : '▼'}
          </button>
        )}

        {actionType === 'toggle' && (
          <label className={styles.setupToggle}>
            <input type="checkbox" checked={toggleState} onChange={handleToggleChange} />
            <span className={styles.slider}></span>
          </label>
        )}

        {actionType === 'input' && (
          <input 
            type="number" 
            defaultValue={actionValue as string | number} 
            className="filter-input"
            style={{ width: '50px' }} 
            onFocus={() => setIsExpanded(true)}
          />   
        )}
      </div>

      {isExpanded && expandableContent && (
        <div className={styles.setupItemExpanded}>
          {expandableContent}
        </div>
      )}
    </div>
  );
};

const SetupCard: React.FC<{ iconClass: string; title: string; borderColor?: string; children: React.ReactNode }> = ({ 
  iconClass, title, borderColor, children 
}) => (
  <div className={styles.setupCard} style={borderColor ? { borderTopColor: borderColor } : undefined}>
    <div className={styles.setupCardHeader}><i className={iconClass}></i> {title}</div>
    <div className={styles.setupCardBody}>{children}</div>
  </div>
);

// Main Component
export const BillingSetup: React.FC<{ onNavigate?: (section: SectionType) => void }> = ({ onNavigate }) => {
  return (
    <div id="billing-setup" className="content-section active">
      <div className={styles.setupGrid}>
        
        <SetupCard iconClass="fas fa-sitemap" title="Structure and Planning">
          <SetupItem
            title="Fiscal Year Management"
            description="Define and manage school financial years."
            actionType="button"
            actionText="Manage"
            onNavigate={onNavigate}
            expandableContent={
              <div>
                <p>Configure fiscal year dates and active status here.</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input type="text" placeholder="Start Date" className="filter-input" style={{ padding: '8px' }} />
                  <input type="text" placeholder="End Date" className="filter-input" style={{ padding: '8px' }} />
                  <button className="btn btn-show">Save</button>
                </div>
              </div>
            }
          />
          <SetupItem
            title="Fee Head Configuration"
            description="Set up Tuition, Exam, Bus, and other heads."
            actionType="button"
            actionText="Configure"
            onNavigate={onNavigate}
            expandableContent={
              <div>
                <p>Create and edit various fee categories.</p>
                <button className="btn btn-show" style={{ marginTop: '10px' }}>
                  <i className="fas fa-plus"></i> Add New Fee Head
                </button>
              </div>
            }
          />
        </SetupCard>

        <SetupCard 
          iconClass="fas fa-tags" 
          title="Discounts and Adjustments" 
          borderColor="var(--success-green, #4caf50)"
        >
          <SetupItem
            title="Scholarship Rules"
            description="Set percentage or fixed discounts per criteria."
            actionType="toggle"
            actionValue={true}
            expandableContent={
              <div>
                <p>Advanced scholarship and discount rules parameters:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                  <li>Merit-based rules</li>
                  <li>Need-based rules</li>
                </ul>
              </div>
            }
          />
         
        </SetupCard>

        <SetupCard 
          iconClass="fas fa-credit-card" 
          title="Collection and Payment" 
          borderColor="var(--primary-blue, #00334e)"
        >
          <SetupItem
            title="Payment Gateway"
            description="Connect Khalti, Esewa, or Bank APIs."
            actionType="toggle"
            actionValue={false}
            expandableContent={
              <div>
                <p>Enter your API Credentials below:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <input type="text" placeholder="Public Key" style={{ padding: '8px' }} />
                  <input type="password" placeholder="Secret Key" style={{ padding: '8px' }} />
                  <button className="btn btn-show" style={{ width: 'fit-content' }}>Connect</button>
                </div>
              </div>
            }
          />
          <SetupItem
            title="Bank Accounts"
            description="Manage multiple school bank accounts."
            actionType="button"
            actionText="Manage"
            expandableContent={
              <div>
                <p>List of configured bank accounts:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                  <li>Global IME Bank - xxxx1234</li>
                  <li>Nabil Bank - xxxx5678</li>
                </ul>
                <button className="btn btn-show" style={{ marginTop: '10px' }}>Add Account</button>
              </div>
            }
          />
        </SetupCard>

        <SetupCard 
          iconClass="fas fa-user-clock" 
          title="Late Payment and Penalties" 
          borderColor="var(--danger-red, #d9534f)"
        >
          <SetupItem
            title="Fine Calculation"
            description="Daily, weekly, or monthly penalty rules."
            actionType="button"
            actionText="Set Rules"
            onNavigate={onNavigate}
            expandableContent={
              <div>
                <p>Configure fine criteria:</p>
                <select className="filter-input" style={{ marginTop: '10px', width: '100%' }}>
                  <option>Flat amount per day</option>
                  <option>Percentage per month</option>
                </select>
              </div>
            }
          />
         
        </SetupCard>

        <SetupCard iconClass="fas fa-file-contract" title="Auditing and Compliance" borderColor="#333">
          <SetupItem
            title="Tax Configuration (VAT/PAN)"
            description="Set tax rates for various fee services."
            actionType="button"
            actionText="Settings"
            onNavigate={onNavigate}
            expandableContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label>Standard VAT % :</label>
                <input type="number" defaultValue="13" style={{ width: '60px', padding: '5px' }} />
                <button className="btn btn-show">Save Rates</button>
              </div>
            }
          />
          <SetupItem
            title="Audit Logs"
            description="Track all billing modifications by users."
            actionType="button"
            actionText="View Logs"
            onNavigate={onNavigate}
            expandableContent={
              <div>
                <p>Recent audit logs and system activities will be shown here.</p>
                <button className="btn btn-excel" style={{ marginTop: '10px' }}>
                  <i className="fas fa-download"></i> Export Logs
                </button>
              </div>
            }
          />
        </SetupCard>
      </div>
    </div>
  );
};

export default BillingSetup;
