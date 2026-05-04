'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCheck } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/superadmin/school/subscription-section.css';

interface PricingConfig {
  yearly: number;
}

interface SubscriptionSectionProps {
  selectedYears: number;
  onSelect: (years: number) => void;
  pricing: PricingConfig;
  isLoading: boolean;
  disabled?: boolean;
}

export default function SubscriptionSection({
  selectedYears,
  onSelect,
  pricing,
  isLoading,
  disabled = false
}: SubscriptionSectionProps) {
  const options = [
    { years: 1, recommended: true },
    { years: 2, recommended: false },
    { years: 3, recommended: false }
  ];

  if (isLoading) {
    return (
      <div className="subscription-section-container">
        <h4 className="subscription-section-title">
          <FontAwesomeIcon icon={faCalendarAlt} className="subscription-section-icon" />
          Subscription Plan
        </h4>
        <div className="subscription-loading">
          <div className="subscription-loading-spinner"></div>
          <span>Loading pricing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-section-container">
      <h4 className="subscription-section-title">
        <FontAwesomeIcon icon={faCalendarAlt} className="subscription-section-icon" />
        Subscription Plan
      </h4>

      <div className="subscription-options-grid">
        {options.map((option) => (
          <div
            key={option.years}
            className={`
              subscription-option-card
              ${selectedYears === option.years ? 'selected' : ''}
              ${option.recommended ? 'recommended' : ''}
              ${disabled ? 'disabled' : ''}
            `}
            onClick={() => !disabled && onSelect(option.years)}
          >
            {option.recommended && (
              <span className="subscription-recommended-badge">Recommended</span>
            )}

            <div className="subscription-option-content">
              <p className="subscription-option-years">{option.years} Year</p>
              <p className="subscription-option-label">
                {option.years === 1 ? 'Basic' : option.years === 2 ? 'Standard' : 'Premium'}
              </p>
              <p className="subscription-option-price">
                Rs. {(pricing.yearly * option.years).toLocaleString()}
                <span> / {option.years} yr</span>
              </p>
            </div>

            <div className="subscription-option-check">
              <FontAwesomeIcon icon={faCheck} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
