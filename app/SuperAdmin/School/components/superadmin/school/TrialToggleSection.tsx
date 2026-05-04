'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faCalendarCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/superadmin/school/trial-toggle.css';

interface TrialToggleSectionProps {
  isTrial: boolean;
  onToggle: (isTrial: boolean) => void;
}

export default function TrialToggleSection({ isTrial, onToggle }: TrialToggleSectionProps) {
  return (
    <div className="trial-toggle-container">
      <div className="trial-toggle-header">
        <div className="trial-toggle-info">
          <div className={`trial-toggle-icon ${isTrial ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faGift} />
          </div>
          <div className="trial-toggle-text">
            <h4 className="trial-toggle-title">Enable 30-Day Trial</h4>
            <p className="trial-toggle-description">
              Allow this school to use the system free for 30 days
            </p>
          </div>
        </div>

        <label className="trial-toggle-switch">
          <input
            type="checkbox"
            checked={isTrial}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="trial-toggle-slider"></span>
        </label>
      </div>

      {isTrial ? (
        <div className="trial-info-card">
          <div className="trial-info-icon">
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <h5 className="trial-info-title">Trial Mode Active</h5>
          <p className="trial-info-description">
            This school will have full access to all features for 30 days.
            No payment is required during the trial period.
          </p>
          <span className="trial-info-badge">
            <FontAwesomeIcon icon={faInfoCircle} />
            30 Days Free
          </span>
        </div>
      ) : (
        <div className="paid-mode-info">
          <h5 className="paid-mode-title">Paid Subscription Mode</h5>
          <p className="paid-mode-description">
            Select a subscription plan below. The school will be activated immediately upon payment confirmation.
          </p>
        </div>
      )}
    </div>
  );
}
