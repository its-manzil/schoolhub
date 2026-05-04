'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt, faCalendar, faCheckCircle, faGift } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/superadmin/school/pricing-summary.css';

interface PricingConfig {
  yearly: number;
}

interface PricingSummaryProps {
  isTrial: boolean;
  subscriptionYears: number;
  pricing: PricingConfig;
}

export default function PricingSummary({ isTrial, subscriptionYears, pricing }: PricingSummaryProps) {
  const totalAmount = isTrial ? 0 : pricing.yearly * subscriptionYears;

  return (
    <div className={`pricing-summary-container ${isTrial ? 'trial' : ''}`}>
      <div className="pricing-summary-header">
        <FontAwesomeIcon icon={faReceipt} className="pricing-summary-icon" />
        <h4 className="pricing-summary-title">Order Summary</h4>
      </div>

      <div className="pricing-summary-content">
        <div className="pricing-summary-row">
          <span className="pricing-summary-label">Status</span>
          <span className={`pricing-summary-status ${isTrial ? 'trial' : 'active'}`}>
            <FontAwesomeIcon icon={isTrial ? faGift : faCheckCircle} />
            {isTrial ? 'Trial Period' : 'Active Subscription'}
          </span>
        </div>

        <div className="pricing-summary-row">
          <span className="pricing-summary-label">Duration</span>
          <span className="pricing-summary-value">
            {isTrial ? '30 Days' : `${subscriptionYears} Year${subscriptionYears > 1 ? 's' : ''}`}
          </span>
        </div>

        {!isTrial && (
          <div className="pricing-summary-row">
            <span className="pricing-summary-label">Rate per Year</span>
            <span className="pricing-summary-value">
              Rs. {pricing.yearly.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="pricing-summary-total-row">
        <span className="pricing-summary-total-label">Total Amount</span>
        <span className={`pricing-summary-total-value ${isTrial ? 'free' : ''}`}>
          {isTrial ? 'FREE' : `Rs. ${totalAmount.toLocaleString()}`}
        </span>
      </div>

      <div className="pricing-summary-duration">
        <FontAwesomeIcon icon={faCalendar} className="pricing-summary-duration-icon" />
        <span>
          {isTrial
            ? 'Trial ends in 30 days. Upgrade anytime to continue using.'
            : `Subscription valid for ${subscriptionYears} year${subscriptionYears > 1 ? 's' : ''} from activation date.`}
        </span>
      </div>
    </div>
  );
}
