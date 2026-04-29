'use client';

import { School } from '../types';
import { getStatusColor, formatDate } from '../lib/utils';

interface SubscriptionBadgeProps {
  subscription: School['subscription'];
}

export default function SubscriptionBadge({ subscription }: SubscriptionBadgeProps) {
  const statusColor = getStatusColor(subscription.remainingDays, subscription.isActive);
  
  return (
    <div className="subscription-section">
      <div className="subscription-header">
        <h4 className="subscription-title">Subscription</h4>
        <span className={`subscription-badge ${subscription.years === 1 ? 'yearly' : 'yearly'}`}>
          {subscription.years} Year{subscription.years > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="subscription-grid">
        <div className="subscription-item">
          <span className="subscription-label">Amount</span>
          <span className="subscription-value highlight">
            Rs.{subscription.amount.toLocaleString()}
          </span>
        </div>
        <div className="subscription-item">
          <span className="subscription-label">Expiry Date</span>
          <span className="subscription-value">{formatDate(subscription.expiryDate)}</span>
        </div>
      </div>
      
      <div className="remaining-days">
        <span className={`days-badge ${statusColor}`}>
          {subscription.remainingDays > 0 ? (
            <>
              {subscription.remainingDays} day{subscription.remainingDays !== 1 ? 's' : ''} remaining
            </>
          ) : (
            'Subscription Expired'
          )}
        </span>
      </div>
    </div>
  );
}
