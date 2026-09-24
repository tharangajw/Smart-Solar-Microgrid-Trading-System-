const API_BASE_URL = '/api';

// Sends fetch request with automatic JWT auth header
export async function request(path, options = {}) {
  const token = localStorage.getItem('token')
    || localStorage.getItem('operator_token')
    || localStorage.getItem('backoffice_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// API service helper for user authentication and profile management
export const apiClient = {
  // Logs in user with email & password
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  // Registers a new Prosumer account
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Fetches current user profile using JWT token
  async getCurrentUser(token) {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Updates current user profile details
  async updateCurrentUser(token, userData) {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Submits deactivation request for current prosumer
  async requestDeactivation(token) {
    const response = await fetch(`${API_BASE_URL}/users/me/deactivate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Initiates Google OAuth login flow
  googleLogin() {
    window.location.href = `${API_BASE_URL}/auth/google-login`;
  },

  // Initiates Facebook OAuth login flow
  facebookLogin() {
    window.location.href = `${API_BASE_URL}/auth/facebook-login`;
  },

  // Initiates Apple OAuth login flow
  appleLogin() {
    window.location.href = `${API_BASE_URL}/auth/apple-login`;
  },
};
