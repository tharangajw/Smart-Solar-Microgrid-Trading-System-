const API_BASE_URL = 'http://localhost:5281/api';

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

export const apiClient = {
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

  async getCurrentUser(token) {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

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

  async requestDeactivation(token) {
    const response = await fetch(`${API_BASE_URL}/users/me/deactivate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  googleLogin() {
    window.location.href = `${API_BASE_URL}/auth/google-login`;
  },

  facebookLogin() {
    window.location.href = `${API_BASE_URL}/auth/facebook-login`;
  },

  appleLogin() {
    window.location.href = `${API_BASE_URL}/auth/apple-login`;
  },
};
