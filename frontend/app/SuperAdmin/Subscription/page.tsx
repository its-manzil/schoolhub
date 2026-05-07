'use client';

import { useState, useEffect, useCallback } from 'react';
import './subscription.css';
import SuperAdminNavbar from '../components/SuperAdminNavbar';
interface Subscription {
  _id: string;
  schoolName: string;
  plan: string;
  status: 'active' | 'expired' | 'trial' | 'suspended';
  startDate: string;
  endDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast helpers - defined first to avoid dependency issues
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching subscriptions...');
      const response = await fetch('/api/superadmin/subscriptions');
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        console.log('Subscriptions count:', data.data?.length || 0);
        setSubscriptions(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      showToast('Failed to load subscriptions', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Calculate stats
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    expired: subscriptions.filter(s => s.status === 'expired').length,
    revenue: subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Update subscription status
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/superadmin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptions(prev => 
          prev.map(sub => sub._id === id ? { ...sub, status: newStatus as Subscription['status'] } : sub)
        );
        showToast('Status updated successfully', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // Delete subscription
  const handleDelete = async () => {
    if (!selectedSubscription) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/superadmin/subscriptions?id=${selectedSubscription._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptions(prev => prev.filter(sub => sub._id !== selectedSubscription._id));
        showToast('Subscription deleted successfully', 'success');
        setDeleteModalOpen(false);
        setSelectedSubscription(null);
      } else {
        throw new Error(data.message);
      }
    } catch {
      showToast('Failed to delete subscription', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDeleteModalOpen(true);
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-badge active';
      case 'expired': return 'status-badge expired';
      case 'trial': return 'status-badge trial';
      case 'suspended': return 'status-badge suspended';
      default: return 'status-badge';
    }
  };

  // Get payment status class
  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'paid': return 'payment-status paid';
      case 'pending': return 'payment-status pending';
      case 'failed': return 'payment-status failed';
      default: return 'payment-status';
    }
  };

  if (isLoading) {
    return (
      <div className="subscription-page">
        <div className="subscription-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-page">
        <div className="subscription-container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Failed to load subscriptions</h2>
            <p className="error-message">{error}</p>
            <button className="btn btn-primary" onClick={fetchSubscriptions}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <SuperAdminNavbar />
    <div className="subscription-page">
      <div className="subscription-container">
        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              {toast.type === 'success' ? '✓' : '✗'} {toast.message}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="subscription-header">
          <h1>Subscription Management</h1>
          <p>Manage all school subscriptions</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Subscriptions</span>
              <div className="stat-icon total">📊</div>
            </div>
            <p className="stat-value">{stats.total}</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Active</span>
              <div className="stat-icon active">✓</div>
            </div>
            <p className="stat-value">{stats.active}</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Expired</span>
              <div className="stat-icon expired">⚠</div>
            </div>
            <p className="stat-value">{stats.expired}</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Revenue</span>
              <div className="stat-icon revenue">$</div>
            </div>
            <p className="stat-value">{formatAmount(stats.revenue)}</p>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="content-card">
          <div className="table-header">
            <h2 className="table-title">All Subscriptions</h2>
          </div>
          
          {subscriptions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">No subscriptions found</h3>
              <p className="empty-message">Get started by adding your first subscription.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="subscription-table">
                <thead>
                  <tr>
                    <th>School Name</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Payment Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(subscription => (
                    <tr key={subscription._id}>
                      <td>
                        <strong>{subscription.schoolName}</strong>
                      </td>
                      <td>{subscription.plan}</td>
                      <td>
                        <select
                          className="status-select"
                          value={subscription.status}
                          onChange={(e) => handleStatusChange(subscription._id, e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="trial">Trial</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td>{formatDate(subscription.startDate)}</td>
                      <td>{formatDate(subscription.endDate)}</td>
                      <td>
                        <span className={getPaymentStatusClass(subscription.paymentStatus)}>
                          {subscription.paymentStatus}
                        </span>
                      </td>
                      <td className="amount">{subscription.amount}</td>
                      <td>
                        <div className="action-buttons">
                          <span className={getStatusBadgeClass(subscription.status)}>
                            {subscription.status}
                          </span>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => openDeleteModal(subscription)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSubscription && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Subscription</h3>
              <button className="modal-close" onClick={() => setDeleteModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-confirm-text">
                Are you sure you want to delete the subscription for{' '}
                <span className="delete-confirm-name">{selectedSubscription.schoolName}</span>?
                <br />
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
