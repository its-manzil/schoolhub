// RecentVoucherTable Component
// Real-time voucher list with status updates

'use client';

import React from 'react';
import { Edit, CheckCircle2, Eye, AlertTriangle } from 'lucide-react';
import { RecentVoucher } from '../../services/voucher.service';

interface RecentVoucherTableProps {
  vouchers: RecentVoucher[];
  isLoading: boolean;
  onViewVoucher: (voucher: RecentVoucher) => void;
  onRequestEdit: (voucher: RecentVoucher) => void;
}

export const RecentVoucherTable: React.FC<RecentVoucherTableProps> = React.memo(({
  vouchers,
  isLoading,
  onViewVoucher,
  onRequestEdit
}) => {
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString();
  };

  if (isLoading && vouchers.length === 0) {
    return (
      <div className="ve-recent-activities">
        <div className="ve-section-header">
          <h3>Recent Voucher Activities</h3>
        </div>
        <div className="ve-loading-state">Loading recent vouchers...</div>
      </div>
    );
  }

  return (
    <div className="ve-recent-activities">
      <div className="ve-section-header">
        <h3>Recent Voucher Activities</h3>
        <div className="ve-section-subtitle">
          Track and manage recent voucher entries (auto-updates every 15 seconds)
        </div>
      </div>
      
      <div className="ve-activities-table-container">
        <table className="ve-activities-table">
          <thead>
            <tr>
              <th>Voucher Number</th>
              <th>Voucher Type</th>
              <th>Date</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="ve-empty-state">
                  No recent vouchers found
                </td>
              </tr>
            ) : (
              vouchers.map((voucher) => (
                <tr 
                  key={voucher.id} 
                  onClick={() => onViewVoucher(voucher)} 
                  style={{ cursor: 'pointer' }}
                  className={voucher.status === 'Posted' ? 've-voucher-posted' : 've-voucher-draft'}
                >
                  <td className="ve-voucher-number">{voucher.voucherNumber}</td>
                  <td>
                    <span className={`ve-voucher-type-badge ve-type-${voucher.voucherType.toLowerCase()}`}>
                      {voucher.voucherType}
                    </span>
                  </td>
                  <td>{voucher.date}</td>
                  <td>{voucher.createdBy}</td>
                  <td>
                    <span className={`ve-status-badge ve-status-${voucher.status.toLowerCase()}`}>
                      {voucher.status === 'Draft' ? <Edit size={14} /> : <CheckCircle2 size={14} />}
                      {voucher.status}
                    </span>
                  </td>
                  <td className="ve-amount">NPR {formatAmount(voucher.amount)}</td>
                  <td>
                    <div className="ve-action-buttons">
                      <button 
                        className="ve-btn-icon ve-btn-view" 
                        onClick={(e) => { e.stopPropagation(); onViewVoucher(voucher); }}
                        title="View Voucher"
                      >
                        <Eye size={16} />
                      </button>
                      {voucher.status === 'Posted' && (
                        <button 
                          className="ve-btn-icon ve-btn-edit-request" 
                          onClick={(e) => { e.stopPropagation(); onRequestEdit(voucher); }}
                          title="Request Edit"
                        >
                          <AlertTriangle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

RecentVoucherTable.displayName = 'RecentVoucherTable';

export default RecentVoucherTable;
