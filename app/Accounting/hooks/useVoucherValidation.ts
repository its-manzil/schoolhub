// ERP-Grade Voucher Validation Hook
// Provides comprehensive validation for voucher entries

import { useMemo } from 'react';

export interface VoucherEntryRow {
  id: string;
  ledgerId: string;
  ledgerName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface ValidationError {
  field: string;
  message: string;
  rowIndex?: number;
}

export interface ValidationSummary {
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
  hasEntries: boolean;
  errors: ValidationError[];
  isValid: boolean;
}

interface UseVoucherValidationProps {
  rows: VoucherEntryRow[];
  selectedType: string;
  date: string;
  allowEmptyRows?: boolean;
}

export const useVoucherValidation = ({
  rows,
  selectedType,
  date,
  allowEmptyRows = false
}: UseVoucherValidationProps): ValidationSummary => {
  // Calculate totals
  const { totalDebit, totalCredit, hasEntries } = useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        totalDebit: acc.totalDebit + (Number(row.debit) || 0),
        totalCredit: acc.totalCredit + (Number(row.credit) || 0),
        hasEntries: acc.hasEntries || !!(row.ledgerName && (row.debit > 0 || row.credit > 0))
      }),
      { totalDebit: 0, totalCredit: 0, hasEntries: false }
    );
  }, [rows]);

  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;

  // Validate and return errors
  const errors = useMemo<ValidationError[]>(() => {
    const validationErrors: ValidationError[] = [];

    // Check required fields
    if (!selectedType) {
      validationErrors.push({
        field: 'type',
        message: 'Please select Voucher Type'
      });
    }

    if (!date) {
      validationErrors.push({
        field: 'date',
        message: 'Please fill Date'
      });
    }

    // Check for valid entries
    if (!hasEntries && !allowEmptyRows) {
      validationErrors.push({
        field: 'entries',
        message: 'Please add at least one entry with ledger and amount'
      });
    }

    // Validate each row
    rows.forEach((row, index) => {
      // Check for rows with amount but no ledger
      if (!row.ledgerName && (row.debit > 0 || row.credit > 0)) {
        validationErrors.push({
          field: 'ledger',
          message: 'Ledger is required for entries with amount',
          rowIndex: index
        });
      }

      // Check for rows with ledger but no amount
      if (row.ledgerName && row.debit === 0 && row.credit === 0) {
        validationErrors.push({
          field: 'amount',
          message: 'Amount is required for entries with ledger',
          rowIndex: index
        });
      }

      // Check for negative amounts
      if (row.debit < 0) {
        validationErrors.push({
          field: 'debit',
          message: 'Debit amount cannot be negative',
          rowIndex: index
        });
      }

      if (row.credit < 0) {
        validationErrors.push({
          field: 'credit',
          message: 'Credit amount cannot be negative',
          rowIndex: index
        });
      }

      // Check for both debit and credit in same row
      if (row.debit > 0 && row.credit > 0) {
        validationErrors.push({
          field: 'amount',
          message: 'Cannot have both debit and credit in the same row',
          rowIndex: index
        });
      }
    });

    // Check balance only if there are entries
    if (hasEntries && !isBalanced) {
      validationErrors.push({
        field: 'balance',
        message: `Debit (${totalDebit.toFixed(2)}) and Credit (${totalCredit.toFixed(2)}) must be equal`
      });
    }

    return validationErrors;
  }, [rows, selectedType, date, hasEntries, isBalanced, totalDebit, totalCredit, allowEmptyRows]);

  // Check if voucher is valid for posting
  const isValid = useMemo(() => {
    return errors.length === 0 && isBalanced && hasEntries;
  }, [errors, isBalanced, hasEntries]);

  return {
    totalDebit,
    totalCredit,
    difference,
    isBalanced,
    hasEntries,
    errors,
    isValid
  };
};

// Standalone validation function for server-side mirroring
export const validateVoucherData = (
  rows: VoucherEntryRow[],
  selectedType: string,
  date: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!selectedType) {
    errors.push({ field: 'type', message: 'Voucher type is required' });
  }

  if (!date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }

  const hasEntries = rows.some(row => 
    row.ledgerName && (row.debit > 0 || row.credit > 0)
  );

  if (!hasEntries) {
    errors.push({ field: 'entries', message: 'At least one valid entry is required' });
  }

  rows.forEach((row, index) => {
    if (!row.ledgerName && (row.debit > 0 || row.credit > 0)) {
      errors.push({ field: 'ledger', message: 'Ledger required', rowIndex: index });
    }

    if (row.ledgerName && row.debit === 0 && row.credit === 0) {
      errors.push({ field: 'amount', message: 'Amount required', rowIndex: index });
    }
  });

  const totalDebit = rows.reduce((sum, row) => sum + (Number(row.debit) || 0), 0);
  const totalCredit = rows.reduce((sum, row) => sum + (Number(row.credit) || 0), 0);

  if (hasEntries && Math.abs(totalDebit - totalCredit) > 0.01) {
    errors.push({ field: 'balance', message: 'Debit and Credit must be equal' });
  }

  return errors;
};

export default useVoucherValidation;
