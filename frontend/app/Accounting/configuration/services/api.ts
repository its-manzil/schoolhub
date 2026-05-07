import { Organization, FiscalYear, Account, BankCashAccount, Contact, TaxRule } from './types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/accounting`;
const SCHOOLS_API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api`;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  console.log('API Response status:', response.status);
  console.log('API Response headers:', response.headers.get('content-type'));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || 'Something went wrong' };
    }
    
    throw new Error(errorData.error || errorData.message || 'Something went wrong');
  }
  
  const responseText = await response.text();
  console.log('API Success Response:', responseText);
  
  try {
    return JSON.parse(responseText);
  } catch {
    console.error('Failed to parse JSON response:', responseText);
    throw new Error('Invalid JSON response from server');
  }
};

export const fetchOrganization = (schoolId: number) => fetch(`${API_BASE_URL}/organization?schoolId=${schoolId}`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const saveOrganization = (data: Organization) => fetch(`${API_BASE_URL}/organization`, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(handleResponse);

export const saveOrganizationAccounting = (schoolId: number, data: { phone: string; email: string; pan: string; vat: string }) => 
  fetch(`${API_BASE_URL}/organization`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ schoolId, ...data }),
  }).then(handleResponse);

export const fetchFiscalYears = () => fetch(`${API_BASE_URL}/fiscal-years`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const saveFiscalYear = (data: Partial<FiscalYear>) => {
  const url = data._id ? `${API_BASE_URL}/fiscal-years/${data._id}` : `${API_BASE_URL}/fiscal-years`;
  const method = data._id ? 'PUT' : 'POST';
  return fetch(url, {
    method,
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
};

export const deleteFiscalYear = (id: string) => fetch(`${API_BASE_URL}/fiscal-years/${id}`, { 
  method: 'DELETE',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);
export const activateFiscalYear = (id: string) => fetch(`${API_BASE_URL}/fiscal-years/${id}/activate`, { 
  method: 'PATCH',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const fetchAccounts = () => fetch(`${API_BASE_URL}/coa`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);
export const saveAccount = (data: Partial<Account>) => {
  const url = data._id ? `${API_BASE_URL}/coa/${data._id}` : `${API_BASE_URL}/coa`;
  const method = data._id ? 'PUT' : 'POST';
  return fetch(url, {
    method,
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
};
export const deleteAccount = (id: string) => fetch(`${API_BASE_URL}/coa/${id}`, { 
  method: 'DELETE',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const fetchBankCashAccounts = () => fetch(`${API_BASE_URL}/bank-cash`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);
export const saveBankCashAccount = (data: Partial<BankCashAccount>) => {
  const url = data._id ? `${API_BASE_URL}/bank-cash/${data._id}` : `${API_BASE_URL}/bank-cash`;
  const method = data._id ? 'PUT' : 'POST';
  return fetch(url, {
    method,
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
};
export const deleteBankCashAccount = (id: string) => fetch(`${API_BASE_URL}/bank-cash/${id}`, { 
  method: 'DELETE',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const fetchContacts = (type: string) => fetch(`${API_BASE_URL}/contacts?type=${type}`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);
export const saveContact = (data: Partial<Contact>) => {
  const url = data._id ? `${API_BASE_URL}/contacts/${data._id}` : `${API_BASE_URL}/contacts`;
  const method = data._id ? 'PUT' : 'POST';
  return fetch(url, {
    method,
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
};
export const deleteContact = (id: string) => fetch(`${API_BASE_URL}/contacts/${id}`, { 
  method: 'DELETE',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const fetchTaxSettings = () => fetch(`${API_BASE_URL}/tax`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const saveTaxSettings = (data: { vatRate: number; taxRules: TaxRule[] }) => fetch(`${API_BASE_URL}/tax`, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(handleResponse);

// TDS Entry APIs
export const fetchTDSEntries = () => fetch(`${API_BASE_URL}/tds-entry`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const saveTDSEntry = (data: {
  payeeId: string;
  ruleId: string;
  gross: number;
  tds: number;
  net: number;
  date: string;
  narration?: string;
}) => fetch(`${API_BASE_URL}/tds-entry`, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(handleResponse);

export const fetchPendingEntries = () => fetch(`${API_BASE_URL}/tds-entry/pending`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

// Payee APIs
export const fetchPayees = () => fetch(`${API_BASE_URL}/payees`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const savePayee = (data: {
  name: string;
  pan: string;
  type: 'Employee' | 'Vendor';
  phone?: string;
  email?: string;
  category?: string;
  threshold?: number;
}) => fetch(`${API_BASE_URL}/payees`, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(handleResponse);

// Challan APIs
export const fetchChallans = () => fetch(`${API_BASE_URL}/tds-challan`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const saveChallan = (data: {
  challanNo: string;
  bank: string;
  bsr: string;
  amount: number;
  period: string;
  depositDate: string;
  revenueCode: string;
}) => fetch(`${API_BASE_URL}/tds-challan`, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(handleResponse);

// Certificate API
export const fetchCertificateData = (payeeId: string) => fetch(`${API_BASE_URL}/certificate/${payeeId}`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

// Report API
export const fetchReportStats = () => fetch(`${API_BASE_URL}/report/stats`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

// School data API (following Administrative page pattern)
export const fetchSchoolData = (schoolId: number) => fetch(`${SCHOOLS_API_URL}/schools/school/${schoolId}`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

// Admin contacts API
export const fetchAdminContacts = (schoolId: number) => fetch(`${SCHOOLS_API_URL}/admin-contacts/${schoolId}`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

// Save accounting data directly to schools table with new field names
export const saveSchoolAccounting = (schoolId: number, data: { 
  phone: string; 
  email: string; 
  pan: string; 
  vat: string;
}) => fetch(`${SCHOOLS_API_URL}/schools/school/${schoolId}/accounting`, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  body: JSON.stringify({
    'acct-phone': data.phone,
    'acct-mail': data.email,
    'pan-number': data.pan,
    'vat-number': data.vat
  }),
}).then(handleResponse);
