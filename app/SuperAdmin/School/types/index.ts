export interface School {
  _id: string;
  schoolId: number;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  subscription: {
    years: number;
    amount: number;
    subscribedDate: string;
    expiryDate: string;
    isActive: boolean;
    remainingDays: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  adminInfo?: {
    username: string;
    lastLogin?: string;
    permissions?: string[];
  };
}

export interface SchoolFormData {
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  subscriptionYears: number;
  adminPassword: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
  email: string;
  note?: string;
}

export type FilterStatus = 'all' | 'active' | 'expired' | 'expiring-soon';
export type SortOption = 'newest' | 'expiry' | 'name' | 'revenue';

export interface FilterState {
  searchQuery: string;
  statusFilter: FilterStatus;
  subscriptionYears: number | null;
  sortBy: SortOption;
}

export interface DashboardStats {
  totalSchools: number;
  activeSchools: number;
  expiredSchools: number;
  totalRevenue: number;
  expiringSoon: number;
}

export interface BulkAction {
  type: 'delete' | 'extend';
  schoolIds: string[];
}
