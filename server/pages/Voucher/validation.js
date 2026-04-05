// Business rules validation for voucher types
const validateVoucherEntries = (entries, voucherType) => {
  const errors = [];
  
  entries.forEach((entry, index) => {
    const { debit, credit, ledgerType } = entry;
    
    // Check for empty amounts
    if ((!debit || debit === 0) && (!credit || credit === 0)) {
      errors.push({
        field: 'amount',
        message: `Row ${index + 1}: Amount is required`,
        rowIndex: index
      });
      return;
    }
    
    // Check for empty ledger
    if (!ledgerType) {
      errors.push({
        field: 'ledger',
        message: `Row ${index + 1}: Ledger is required`,
        rowIndex: index
      });
      return;
    }
    
    // Apply voucher type rules
    switch (voucherType) {
      case 'RCT': // Receipt
        if (debit > 0) {
          // Debit should be Cash/Bank
          if (!['Cash', 'Bank'].includes(ledgerType)) {
            errors.push({
              field: 'ledger',
              message: `Row ${index + 1}: Receipt voucher debit must be Cash or Bank account`,
              rowIndex: index
            });
          }
        } else {
          // Credit should be Income/Receivable
          if (!['Income', 'Asset'].includes(ledgerType)) {
            errors.push({
              field: 'ledger',
              message: `Row ${index + 1}: Receipt voucher credit must be Income or Receivable account`,
              rowIndex: index
            });
          }
        }
        break;
        
      case 'PR': // Payment
        if (debit > 0) {
          // Debit should be Expense
          if (ledgerType !== 'Expense') {
            errors.push({
              field: 'ledger',
              message: `Row ${index + 1}: Payment voucher debit must be Expense account`,
              rowIndex: index
            });
          }
        } else {
          // Credit should be Cash/Bank
          if (!['Cash', 'Bank'].includes(ledgerType)) {
            errors.push({
              field: 'ledger',
              message: `Row ${index + 1}: Payment voucher credit must be Cash or Bank account`,
              rowIndex: index
            });
          }
        }
        break;
        
      case 'CN': // Contra
        // Both sides must be Cash/Bank
        if (!['Cash', 'Bank'].includes(ledgerType)) {
          errors.push({
            field: 'ledger',
            message: `Row ${index + 1}: Contra voucher only allows Cash or Bank accounts`,
            rowIndex: index
          });
        }
        break;
        
      case 'JV': // Journal - no restrictions
        // All ledger types allowed
        break;
    }
  });
  
  return errors;
};

// Validate voucher balance
const validateVoucherBalance = (entries) => {
  const errors = [];
  
  // Calculate totals
  const totalDebit = entries.reduce((sum, entry) => sum + (parseFloat(entry.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (parseFloat(entry.credit) || 0), 0);
  
  // Check balance
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    errors.push({
      field: 'balance',
      message: `Debit (${totalDebit.toFixed(2)}) and Credit (${totalCredit.toFixed(2)}) must be equal`
    });
  }
  
  // Check minimum entries
  if (entries.length < 2) {
    errors.push({
      field: 'entries',
      message: 'Voucher must have at least 2 entries'
    });
  }
  
  return errors;
};

// Main validation function
const validateVoucher = (voucher) => {
  const errors = [];
  
  if (!voucher.voucherNo) {
    errors.push({
      field: 'voucherNo',
      message: 'Voucher number is required'
    });
  }
  
  if (!voucher.date) {
    errors.push({
      field: 'date',
      message: 'Voucher date is required'
    });
  }
  
  if (!voucher.entries || !Array.isArray(voucher.entries)) {
    errors.push({
      field: 'entries',
      message: 'Voucher entries are required'
    });
  } else {
    // Validate entries
    const entryErrors = validateVoucherEntries(voucher.entries, voucher.type);
    errors.push(...entryErrors);
    
    // Validate balance
    const balanceErrors = validateVoucherBalance(voucher.entries);
    errors.push(...balanceErrors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export {
  validateVoucher,
  validateVoucherEntries,
  validateVoucherBalance
};
