import './stats-cards.css';
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  FileText,
  Bell
} from 'lucide-react';

interface StatsData {
  todayCollection: number;
  monthlyCollection: number;
  pendingDues: number;
  overdueBills: number;
  pendingInvoices: number;
  studentStatus: {
    paid: number;
    partial: number;
    pending: number;
  };
}

interface BillingStatsCardsProps {
  stats: StatsData | null;
  loading: boolean;
}

export default function BillingStatsCards({ stats, loading }: BillingStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="stats-cards-container">
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card skeleton">
              <div className="card-top">
                <div className="icon-box skeleton-box"></div>
                <div className="trend-badge skeleton-pill"></div>
              </div>
              <div className="skeleton-label"></div>
              <div className="card-bottom">
                <div className="skeleton-value"></div>
                <div className="skeleton-pill"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalBilled = stats.studentStatus.paid + stats.studentStatus.partial + stats.studentStatus.pending;
  const paidPercentage = totalBilled > 0 ? Math.round((stats.studentStatus.paid / totalBilled) * 100) : 0;

  return (
    <div className="stats-cards-container">
      {/* Top row - Student status */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box icon-primary">
              <Users size={20} />
            </div>
            <div className="status-badge status-active">
              <TrendingUp size={12} />
              <span>+0.0%</span>
            </div>
          </div>
          <div className="card-label">TOTAL BILLED</div>
          <div className="card-bottom">
            <div className="card-value">{totalBilled}</div>
            <div className="sub-badge">Unique students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box icon-success">
              <UserCheck size={20} />
            </div>
            <div className="status-badge status-active">
              <TrendingUp size={12} />
              <span>{paidPercentage}%</span>
            </div>
          </div>
          <div className="card-label">FULLY PAID</div>
          <div className="card-bottom">
            <div className="card-value">{stats.studentStatus.paid}</div>
            <div className="sub-badge">{paidPercentage}% cleared</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box icon-info">
              <Clock size={20} />
            </div>
            <div className="status-badge status-active">
              <span>Active</span>
            </div>
          </div>
          <div className="card-label">PARTIALLY PAID</div>
          <div className="card-bottom">
            <div className="card-value">{stats.studentStatus.partial}</div>
            <div className="sub-badge">Pending balance</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box icon-warning">
              <UserX size={20} />
            </div>
            <div className="status-badge status-review">
              <span>Review</span>
            </div>
          </div>
          <div className="card-label">PENDING PAYMENT</div>
          <div className="card-bottom">
            <div className="card-value">{stats.studentStatus.pending}</div>
            <div className="sub-badge">No payment yet</div>
          </div>
        </div>
      </div>

      {/* Second row - Financial overview */}
      <div className="stats-grid mt-8">
        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box icon-success">
              <Coins size={20} />
            </div>
            <div className="status-badge status-active">
              <span>Today</span>
            </div>
          </div>
          <div className="card-label">TODAY&apos;S COLLECTION</div>
          <div className="card-bottom">
            <div className="card-value">{formatCurrency(stats.todayCollection)}</div>
            <div className="sub-badge">Real-time</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box icon-primary">
              <TrendingUp size={20} />
            </div>
            <div className="status-badge status-active">
              <span>Monthly</span>
            </div>
          </div>
          <div className="card-label">MONTHLY COLLECTION</div>
          <div className="card-bottom">
            <div className="card-value">{formatCurrency(stats.monthlyCollection)}</div>
            <div className="sub-badge">This month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box icon-danger">
              <AlertTriangle size={20} />
            </div>
            <div className="status-badge status-review">
              <span>Review</span>
            </div>
          </div>
          <div className="card-label">OUTSTANDING DUES</div>
          <div className="card-bottom">
            <div className="card-value">{formatCurrency(stats.pendingDues)}</div>
            <div className="sub-badge">Uncollected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box icon-warning">
              <FileText size={20} />
            </div>
            <div className="status-badge status-active">
              <span>Pending</span>
            </div>
          </div>
          <div className="card-label">PENDING INVOICES</div>
          <div className="card-bottom">
            <div className="card-value">{stats.pendingInvoices}</div>
            <div className="sub-badge">Awaiting processing</div>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {stats.overdueBills > 0 && (
        <div className="overdue-alert">
          <div className="overdue-icon">
            <Bell size={20} />
          </div>
          <div className="overdue-content">
            <h4>Overdue Bills Alert</h4>
            <p>You have {stats.overdueBills} bill{stats.overdueBills > 1 ? 's' : ''} that are overdue by 30+ days</p>
          </div>
        </div>
      )}
    </div>
  );
}
