import { School } from '../types';

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateRemainingDays = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (remainingDays: number, isActive: boolean, status?: string): string => {
  // New status-based coloring
  if (status === 'inactive') return 'danger';
  if (status === 'pending') return 'warning';
  if (status === 'trial') return 'info';
  if (status === 'active') return 'success';
  
  // Fallback to old logic if status not provided
  if (!isActive || remainingDays <= 0) return 'danger';
  if (remainingDays <= 7) return 'critical';
  if (remainingDays <= 30) return 'warning';
  return 'success';
};

export const getStatusText = (status: string, remainingDays?: number, gracePeriodDays?: number): string => {
  switch (status) {
    case 'trial':
      return remainingDays !== undefined 
        ? `Trial (${remainingDays} days left)` 
        : 'Trial';
    case 'active':
      return 'Active';
    case 'pending':
      return gracePeriodDays !== undefined 
        ? `Grace Period (${gracePeriodDays} days left)` 
        : 'Grace Period';
    case 'inactive':
      return 'Expired';
    default:
      // Fallback to old logic
      if (remainingDays !== undefined) {
        if (remainingDays <= 0) return 'Expired';
        if (remainingDays <= 30) return 'Expiring Soon';
        return 'Active';
      }
      return 'Unknown';
  }
};

export const calculateAmount = (years: number): number => {
  return years * 30000;
};

export const calculateTotalRevenue = (schools: School[]): number => {
  return schools.reduce((total, school) => total + (school.subscription?.amount || 0), 0);
};

export const generatePassword = (schoolName: string): string => {
  const schoolNamePart = schoolName.split(' ')[0]?.toLowerCase() || 'school';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${schoolNamePart}${randomNum}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Copy to clipboard error:', err);
    return false;
  }
};

export const filterSchools = (
  schools: School[],
  searchQuery: string,
  statusFilter: string,
  subscriptionYears: number | null
): School[] => {
  return schools.filter(school => {
    const matchesSearch = !searchQuery || 
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.schoolId.toString().includes(searchQuery);
    
    const remainingDays = school.subscription.remainingDays;
    let matchesStatus = true;
    
    switch (statusFilter) {
      case 'trial':
        matchesStatus = school.status === 'trial';
        break;
      case 'active':
        // Use status field if available, fallback to old logic
        matchesStatus = school.status === 'active' || 
          (!school.status && school.subscription.isActive && remainingDays > 0);
        break;
      case 'pending':
        matchesStatus = school.status === 'pending';
        break;
      case 'expired':
        // Use status field if available, fallback to old logic
        matchesStatus = school.status === 'inactive' || 
          (!school.status && (!school.subscription.isActive || remainingDays <= 0));
        break;
      case 'expiring-soon':
        matchesStatus = (school.status === 'active' || school.status === 'trial') && 
          remainingDays > 0 && remainingDays <= 30;
        break;
      default:
        matchesStatus = true;
    }
    
    const matchesYears = subscriptionYears === null || school.subscription.years === subscriptionYears;
    
    return matchesSearch && matchesStatus && matchesYears;
  });
};

export const sortSchools = (schools: School[], sortBy: string): School[] => {
  const sorted = [...schools];
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'expiry':
      return sorted.sort((a, b) => a.subscription.remainingDays - b.subscription.remainingDays);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'revenue':
      return sorted.sort((a, b) => b.subscription.amount - a.subscription.amount);
    default:
      return sorted;
  }
};
