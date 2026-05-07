// API service functions for voucher operations

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/accounting/voucher' 
  : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/accounting/voucher`;

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'exists' : 'not found');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Handle API errors
const handleApiError = async (response) => {
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers.get('content-type'));
  
  const contentType = response.headers.get('content-type');
  
  // Check if response is JSON
  if (contentType && contentType.includes('application/json')) {
    try {
      const data = await response.json();
      console.log('JSON response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }
      
      return data;
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      throw new Error('Invalid JSON response from server');
    }
  } else {
    // Handle non-JSON response (HTML error pages, etc.)
    const text = await response.text();
    console.error('Non-JSON response:', text.substring(0, 500));
    throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
  }
};

// Voucher API functions
export const voucherAPI = {
  // Create draft voucher
  async createDraft(voucherData) {
    console.log('Sending voucher data:', voucherData);
    
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(voucherData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));
    
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server did not return JSON. Status: ${response.status}, Content: ${text.substring(0, 200)}`);
    }
    
    const data = await response.json();
    console.log('JSON response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  },

  // Update voucher (only if draft)
  async updateVoucher(id, voucherData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(voucherData)
    });
    
    return handleApiError(response);
  },

  // Post voucher
  async postVoucher(id) {
    console.log('Posting voucher with ID:', id);
    
    const response = await fetch(`${API_BASE_URL}/${id}/post`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    console.log('Post response status:', response.status);
    console.log('Post response headers:', response.headers.get('content-type'));
    
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response on post:', text);
      throw new Error(`Server did not return JSON on post. Status: ${response.status}, Content: ${text.substring(0, 200)}`);
    }
    
    const data = await response.json();
    console.log('Post JSON response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Post request failed');
    }
    
    return data;
  },

  // Get single voucher
  async getVoucher(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiError(response);
  },

  // List vouchers with pagination and filters
  async listVouchers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiError(response);
  }
};

// Helper function to convert frontend voucher format to backend format
export const convertToBackendFormat = (frontendVoucher) => {
  return {
    type: frontendVoucher.selectedType,
    date: frontendVoucher.date,
    fiscalYear: frontendVoucher.fiscalYear || '2082/83',
    refNo: frontendVoucher.refNo || '',
    narration: frontendVoucher.narration || '',
    entries: frontendVoucher.rows.map(row => ({
      ledgerId: row.ledgerId,
      ledgerName: row.ledgerName,
      debit: row.debit || 0,
      credit: row.credit || 0,
      description: row.description || ''
    })).filter(entry => entry.ledgerName && (entry.debit > 0 || entry.credit > 0))
  };
};

// Helper function to convert backend voucher format to frontend format
export const convertToFrontendFormat = (backendVoucher) => {
  return {
    id: backendVoucher._id,
    voucherNo: backendVoucher.voucherNo,
    selectedType: backendVoucher.type,
    date: backendVoucher.date,
    fiscalYear: backendVoucher.fiscalYear,
    refNo: backendVoucher.refNo,
    narration: backendVoucher.narration,
    status: backendVoucher.status,
    rows: backendVoucher.entries.map(entry => ({
      id: entry._id,
      ledgerId: entry.ledgerId,
      ledgerName: entry.ledgerName,
      debit: entry.debit,
      credit: entry.credit,
      description: entry.description
    })),
    createdAt: backendVoucher.createdAt,
    updatedAt: backendVoucher.updatedAt
  };
};
