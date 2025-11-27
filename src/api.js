const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const handleResponse = async (response) => {
  // Check if response is ok before trying to parse JSON
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || `Server error (${response.status})`;
    }
    throw new Error(errorMessage);
  }
  
  // Parse JSON only if response is ok
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    throw new Error('Invalid response from server');
  }
};

export const api = {
  signup: async (email, username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });
      return handleResponse(response);
    } catch (error) {
      // Handle network errors (failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    } catch (error) {
      // Handle network errors (failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  getCurrentUser: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      // Handle network errors (failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return handleResponse(response);
    } catch (error) {
      // Handle network errors (failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },
};

export const tokenManager = {
  save: (token) => {
    localStorage.setItem('auth_token', token);
  },

  get: () => {
    return localStorage.getItem('auth_token');
  },

  remove: () => {
    localStorage.removeItem('auth_token');
  },
};
