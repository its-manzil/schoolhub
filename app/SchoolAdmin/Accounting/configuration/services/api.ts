import { Organization, FiscalYear, Account, BankCashAccount, Contact, TaxSettings } from './types';

const API_BASE_URL = 'http://localhost:2056/api/accounting';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const fetchOrganization = () => fetch(`${API_BASE_URL}/organization`, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
}).then(handleResponse);

export const saveOrganization = (data: Organization) => fetch(`${API_BASE_URL}/organization`, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
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

export const saveTaxSettings = (data: Partial<TaxSettings>) => fetch(`${API_BASE_URL}/tax`, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(handleResponse);
