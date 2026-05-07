// ERP-Grade Report Viewer Component
// Displays detailed financial report data based on active tab

'use client';

import React, { useMemo } from 'react';
import { ReportTab } from '../hooks/useFinancialReports';
import { 
  TrialBalanceItem, 
  BalanceSheetItem, 
  ProfitLossItem, 
  CashFlowItem,
  IncomeStatement
} from '../services/accountingEngine';

interface ReportViewerProps {
  activeTab: ReportTab;
  trialBalanceData: TrialBalanceItem[];
  balanceSheetData: BalanceSheetItem[];
  profitLossData: ProfitLossItem[];
  cashFlowData: CashFlowItem[];
  incomeStatementData: IncomeStatement;
  summaryStats: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netProfit: number;
    netCashFlow: number;
    isBalanced: boolean;
  };
  isLoading: boolean;
  reportFormat: 'standard' | 'vertical';
}

const formatCurrency = (amount: number): string => {
  return `₨ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Trial Balance View
const TrialBalanceView: React.FC<{ data: TrialBalanceItem[]; isBalanced: boolean }> = ({ 
  data, 
  isBalanced 
}) => {
  const totals = useMemo(() => {
    return data.reduce((acc, item) => ({
      debit: acc.debit + item.debit,
      credit: acc.credit + item.credit
    }), { debit: 0, credit: 0 });
  }, [data]);

  return (
    <div className="report-view trial-balance">
      <div className={`balance-status-banner ${isBalanced ? 'balanced' : 'unbalanced'}`}>
        {isBalanced ? '✓ Trial Balance is Balanced' : '⚠ Trial Balance is Unbalanced'}
      </div>
      
      <table className="report-table">
        <thead>
          <tr>
            <th>Account</th>
            <th>Type</th>
            <th className="numeric">Debit</th>
            <th className="numeric">Credit</th>
            <th className="numeric">Balance</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.account}</td>
              <td className="account-type">{item.accountType}</td>
              <td className="numeric">{formatCurrency(item.debit)}</td>
              <td className="numeric">{formatCurrency(item.credit)}</td>
              <td className={`numeric ${item.balance >= 0 ? 'debit' : 'credit'}`}>
                {formatCurrency(Math.abs(item.balance))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}><strong>Total</strong></td>
            <td className="numeric"><strong>{formatCurrency(totals.debit)}</strong></td>
            <td className="numeric"><strong>{formatCurrency(totals.credit)}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// Balance Sheet View
const BalanceSheetView: React.FC<{ 
  data: BalanceSheetItem[]; 
  format: 'standard' | 'vertical';
  summary: { totalAssets: number; totalLiabilities: number; totalEquity: number };
}> = ({ data, format, summary }) => {
  const grouped = useMemo(() => {
    return {
      assets: data.filter(i => i.category === 'asset'),
      liabilities: data.filter(i => i.category === 'liability'),
      equity: data.filter(i => i.category === 'equity')
    };
  }, [data]);

  if (format === 'vertical') {
    return (
      <div className="report-view balance-sheet vertical">
        <section>
          <h3>Assets</h3>
          {grouped.assets.map((item, index) => (
            <div key={index} className="line-item">
              <span>{item.account}</span>
              <span className="amount">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div className="section-total">
            <strong>Total Assets</strong>
            <strong>{formatCurrency(summary.totalAssets)}</strong>
          </div>
        </section>

        <section>
          <h3>Liabilities</h3>
          {grouped.liabilities.map((item, index) => (
            <div key={index} className="line-item">
              <span>{item.account}</span>
              <span className="amount">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div className="section-total">
            <strong>Total Liabilities</strong>
            <strong>{formatCurrency(summary.totalLiabilities)}</strong>
          </div>
        </section>

        <section>
          <h3>Equity</h3>
          {grouped.equity.map((item, index) => (
            <div key={index} className="line-item">
              <span>{item.account}</span>
              <span className="amount">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div className="section-total">
            <strong>Total Equity</strong>
            <strong>{formatCurrency(summary.totalEquity)}</strong>
          </div>
        </section>

        <div className="accounting-equation">
          Assets = Liabilities + Equity
          <br />
          {formatCurrency(summary.totalAssets)} = {formatCurrency(summary.totalLiabilities + summary.totalEquity)}
        </div>
      </div>
    );
  }

  // T-Shape (Standard) Format
  return (
    <div className="report-view balance-sheet t-shape">
      <div className="t-shape-container">
        <div className="t-shape-left">
          <h3>Assets</h3>
          {grouped.assets.map((item, index) => (
            <div key={index} className="line-item">
              <span>{item.account}</span>
              <span className="amount">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div className="section-total">
            <strong>Total Assets</strong>
            <strong>{formatCurrency(summary.totalAssets)}</strong>
          </div>
        </div>

        <div className="t-shape-right">
          <div className="liabilities-section">
            <h3>Liabilities</h3>
            {grouped.liabilities.map((item, index) => (
              <div key={index} className="line-item">
                <span>{item.account}</span>
                <span className="amount">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="section-total">
              <strong>Total Liabilities</strong>
              <strong>{formatCurrency(summary.totalLiabilities)}</strong>
            </div>
          </div>

          <div className="equity-section">
            <h3>Equity</h3>
            {grouped.equity.map((item, index) => (
              <div key={index} className="line-item">
                <span>{item.account}</span>
                <span className="amount">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="section-total">
              <strong>Total Equity</strong>
              <strong>{formatCurrency(summary.totalEquity)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profit & Loss View
const ProfitLossView: React.FC<{ 
  data: ProfitLossItem[]; 
  netProfit: number;
}> = ({ data, netProfit }) => {
  const grouped = useMemo(() => {
    return {
      revenue: data.filter(i => i.category === 'revenue'),
      expenses: data.filter(i => i.category === 'expense')
    };
  }, [data]);

  const totalRevenue = grouped.revenue.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = grouped.expenses.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="report-view profit-loss">
      <section>
        <h3>Revenue</h3>
        {grouped.revenue.map((item, index) => (
          <div key={index} className="line-item">
            <span>{item.account}</span>
            <span className="amount credit">{formatCurrency(item.amount)}</span>
          </div>
        ))}
        <div className="section-total">
          <strong>Total Revenue</strong>
          <strong>{formatCurrency(totalRevenue)}</strong>
        </div>
      </section>

      <section>
        <h3>Expenses</h3>
        {grouped.expenses.map((item, index) => (
          <div key={index} className="line-item">
            <span>{item.account}</span>
            <span className="amount debit">{formatCurrency(item.amount)}</span>
          </div>
        ))}
        <div className="section-total">
          <strong>Total Expenses</strong>
          <strong>{formatCurrency(totalExpenses)}</strong>
        </div>
      </section>

      <div className={`net-profit ${netProfit >= 0 ? 'profit' : 'loss'}`}>
        <strong>Net {netProfit >= 0 ? 'Profit' : 'Loss'}</strong>
        <strong>{formatCurrency(Math.abs(netProfit))}</strong>
      </div>
    </div>
  );
};

// Cash Flow View
const CashFlowView: React.FC<{ 
  data: CashFlowItem[]; 
  netCashFlow: number;
}> = ({ data, netCashFlow }) => {
  const grouped = useMemo(() => {
    return {
      operating: data.filter(i => i.category === 'operating'),
      investing: data.filter(i => i.category === 'investing'),
      financing: data.filter(i => i.category === 'financing')
    };
  }, [data]);

  const calculateSubtotal = (items: CashFlowItem[]): number => {
    return items.reduce((sum, i) => sum + (i.inflow ? i.amount : -i.amount), 0);
  };

  const renderSection = (title: string, items: CashFlowItem[]) => (
    <section>
      <h3>{title}</h3>
      {items.map((item, index) => (
        <div key={index} className="line-item">
          <span>{item.description}</span>
          <span className={`amount ${item.inflow ? 'inflow' : 'outflow'}`}>
            {item.inflow ? '+' : '-'}{formatCurrency(item.amount)}
          </span>
        </div>
      ))}
      <div className="section-total">
        <strong>Net {title}</strong>
        <strong className={calculateSubtotal(items) >= 0 ? 'positive' : 'negative'}>
          {formatCurrency(Math.abs(calculateSubtotal(items)))}
        </strong>
      </div>
    </section>
  );

  return (
    <div className="report-view cash-flow">
      {renderSection('Operating Activities', grouped.operating)}
      {renderSection('Investing Activities', grouped.investing)}
      {renderSection('Financing Activities', grouped.financing)}

      <div className={`net-cash-flow ${netCashFlow >= 0 ? 'positive' : 'negative'}`}>
        <strong>Net Cash Flow</strong>
        <strong>{formatCurrency(Math.abs(netCashFlow))}</strong>
      </div>
    </div>
  );
};

// Overview View
const OverviewView: React.FC<{ summaryStats: ReportViewerProps['summaryStats'] }> = ({ summaryStats }) => {
  return (
    <div className="report-view overview">
      <div className="overview-cards">
        <div className="overview-card assets">
          <h4>Total Assets</h4>
          <div className="big-number">{formatCurrency(summaryStats.totalAssets)}</div>
        </div>
        <div className="overview-card liabilities">
          <h4>Total Liabilities</h4>
          <div className="big-number">{formatCurrency(summaryStats.totalLiabilities)}</div>
        </div>
        <div className="overview-card equity">
          <h4>Total Equity</h4>
          <div className="big-number">{formatCurrency(summaryStats.totalEquity)}</div>
        </div>
        <div className={`overview-card ${summaryStats.netProfit >= 0 ? 'profit' : 'loss'}`}>
          <h4>Net {summaryStats.netProfit >= 0 ? 'Profit' : 'Loss'}</h4>
          <div className="big-number">{formatCurrency(Math.abs(summaryStats.netProfit))}</div>
        </div>
      </div>
      
      <div className="health-indicators">
        <h4>Financial Health</h4>
        <div className="indicator">
          <span>Current Ratio</span>
          <span className="value">
            {summaryStats.totalLiabilities > 0 
              ? (summaryStats.totalAssets / summaryStats.totalLiabilities).toFixed(2)
              : 'N/A'}
          </span>
        </div>
        <div className="indicator">
          <span>Debt to Equity</span>
          <span className="value">
            {summaryStats.totalEquity > 0 
              ? (summaryStats.totalLiabilities / summaryStats.totalEquity).toFixed(2)
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Report Viewer Component
export const ReportViewer: React.FC<ReportViewerProps> = (props) => {
  const { activeTab, isLoading } = props;

  if (isLoading) {
    return (
      <div className="report-viewer loading">
        <div className="skeleton-loader">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  return (
    <div className="report-viewer">
      {activeTab === 'overview' && <OverviewView summaryStats={props.summaryStats} />}
      
      {activeTab === 'trial-balance' && (
        <TrialBalanceView 
          data={props.trialBalanceData} 
          isBalanced={props.summaryStats.isBalanced} 
        />
      )}
      
      {activeTab === 'balance-sheet' && (
        <BalanceSheetView 
          data={props.balanceSheetData}
          format={props.reportFormat}
          summary={{
            totalAssets: props.summaryStats.totalAssets,
            totalLiabilities: props.summaryStats.totalLiabilities,
            totalEquity: props.summaryStats.totalEquity
          }}
        />
      )}
      
      {activeTab === 'profit-loss' && (
        <ProfitLossView 
          data={props.profitLossData}
          netProfit={props.summaryStats.netProfit}
        />
      )}
      
      {activeTab === 'cash-flow' && (
        <CashFlowView 
          data={props.cashFlowData}
          netCashFlow={props.summaryStats.netCashFlow}
        />
      )}
      
      {activeTab === 'income-statement' && (
        <IncomeStatementView data={props.incomeStatementData} />
      )}
    </div>
  );
};

// Income Statement View
const IncomeStatementView: React.FC<{ data: IncomeStatement }> = ({ data }) => {
  return (
    <div className="report-view income-statement">
      <section>
        <h3>Revenue</h3>
        <div className="line-item">
          <span>Student Fees Revenue</span>
          <span className="amount credit">{formatCurrency(data.revenue.studentFees)}</span>
        </div>
        <div className="line-item">
          <span>Inventory Sales Revenue</span>
          <span className="amount credit">{formatCurrency(data.revenue.inventorySales)}</span>
        </div>
        <div className="section-total">
          <strong>Total Revenue</strong>
          <strong className="credit">{formatCurrency(data.revenue.totalRevenue)}</strong>
        </div>
      </section>

      <section>
        <h3>Expenses</h3>
        <div className="line-item">
          <span>Cost of Goods Sold (COGS)</span>
          <span className="amount debit">{formatCurrency(data.expenses.cogs)}</span>
        </div>
        <div className="line-item">
          <span>Operating Expenses (Vouchers)</span>
          <span className="amount debit">{formatCurrency(data.expenses.voucherExpenses)}</span>
        </div>
        <div className="section-total">
          <strong>Total Expenses</strong>
          <strong className="debit">{formatCurrency(data.expenses.totalExpenses)}</strong>
        </div>
      </section>

      <div className={`net-profit ${data.netIncome >= 0 ? 'profit' : 'loss'}`}>
        <strong>Net Income</strong>
        <strong>{formatCurrency(Math.abs(data.netIncome))}</strong>
      </div>

      <div className="income-statement-summary">
        <p>
          <strong>Gross Profit:</strong> {formatCurrency(data.revenue.totalRevenue - data.expenses.cogs)}
        </p>
        <p>
          <strong>Operating Income:</strong> {formatCurrency(data.netIncome)}
        </p>
      </div>
    </div>
  );
};

export default ReportViewer;
