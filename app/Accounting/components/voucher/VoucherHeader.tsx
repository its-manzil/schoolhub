// VoucherHeader Component
// Displays voucher type selector cards

'use client';

import React from 'react';
import { 
  BookOpen, 
  DollarSign, 
  FileText, 
  ArrowLeftRight, 
  ShoppingCart 
} from 'lucide-react';

export type VoucherType = 'JV' | 'RCT' | 'PR' | 'CN' | 'PV';

interface VoucherTypeOption {
  type: VoucherType;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  desc: string;
  prefix: string;
}

const VOUCHER_TYPES: VoucherTypeOption[] = [
  { type: 'JV', title: 'Journal Voucher', icon: BookOpen, desc: 'Non-cash adjustments', prefix: 'JV' },
  { type: 'RCT', title: 'Receipt Voucher', icon: DollarSign, desc: 'Income / Inflows', prefix: 'RCT' },
  { type: 'PR', title: 'Payment Voucher', icon: FileText, desc: 'Expense / Outflows', prefix: 'PR' },
  { type: 'CN', title: 'Contra Voucher', icon: ArrowLeftRight, desc: 'Cash-Bank transfers', prefix: 'CN' },
  { type: 'PV', title: 'Purchase Voucher', icon: ShoppingCart, desc: 'Purchase transactions', prefix: 'PV' },
];

interface VoucherHeaderProps {
  selectedType: VoucherType;
  onTypeChange: (type: VoucherType) => void;
  disabled?: boolean;
}

export const VoucherHeader: React.FC<VoucherHeaderProps> = React.memo(({
  selectedType,
  onTypeChange,
  disabled = false
}) => {
  return (
    <div className="ve-type-selector">
      {VOUCHER_TYPES.map((v) => {
        const Icon = v.icon;
        return (
          <div 
            key={v.type} 
            className={`ve-type-card ${selectedType === v.type ? 'active' : ''}`}
            onClick={() => !disabled && onTypeChange(v.type)}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
          >
            <div className="ve-type-icon"><Icon size={20} /></div>
            <div className="ve-type-info">
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

VoucherHeader.displayName = 'VoucherHeader';

export default VoucherHeader;
