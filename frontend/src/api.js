// API Base URL - update this to match your backend
const API_BASE = 'http://localhost:4000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Important for session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Authentication APIs
export const authAPI = {
  register: (username, password, role, secret = '') =>
    apiCall('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role, secret }),
    }),

  login: (username, password) =>
    apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    apiCall('/logout', {
      method: 'POST',
    }),

  getSession: () => apiCall('/session'),
};

// Charity APIs
export const charityAPI = {
  getAll: () => apiCall('/charities'),

  create: async (formData) => {
    const response = await fetch(`${API_BASE}/charities`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // multipart/form-data
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },
};

// Favorites APIs
export const favoritesAPI = {
  getAll: () => apiCall('/favorites'),

  add: (charityId) =>
    apiCall(`/favorites/${charityId}`, {
      method: 'POST',
    }),

  remove: (charityId) =>
    apiCall(`/favorites/${charityId}`, {
      method: 'DELETE',
    }),
};