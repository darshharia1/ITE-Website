/* =====================================================
   ITE STARTUP LAUNCH PAD – AUTH (auth.js)
   Refactored for Asynchronous API Fetch Connections
   ===================================================== */
window.ITE = window.ITE || {};

ITE.Auth = (function () {
  const TOKEN_KEY = 'token';

  /**
   * Helper to perform fetch calls with automatic JWT Bearer headers
   */
  async function fetchWithAuth(path, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const baseUrl = window.ITE.Config?.API_BASE_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers
    });

    return response;
  }

  /**
   * Authenticate user with the backend
   */
  async function login(email, password) {
    try {
      const res = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed.' };
      }

      // Store JWT token securely in localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Login request failed:', err);
      return { success: false, error: 'Network error: Cannot reach the authentication server.' };
    }
  }

  /**
   * Register a new user with the whitelist-protected registry
   */
  async function register(data) {
    const { email, password, name } = data;
    if (!name || !email || !password) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    try {
      const res = await fetchWithAuth('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: name 
        })
      });

      const responseData = await res.json();

      if (!res.ok) {
        return { success: false, error: responseData.error || 'Registration failed.' };
      }

      return { success: true, user: responseData };
    } catch (err) {
      console.error('Registration request failed:', err);
      return { success: false, error: 'Network error: Cannot reach the registration server.' };
    }
  }

  /**
   * Log out user and clear JWT token
   */
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.hash = '#/';
    window.location.reload();
  }

  /**
   * Fetch current logged-in user profile details from backend
   */
  async function getCurrentUser() {
    if (!isLoggedIn()) return null;

    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (!res.ok) {
        // Token is invalid/expired, log out
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch (err) {
      console.error('Fetch profile details failed:', err);
      return null;
    }
  }

  /**
   * Sync check if user is logged in (has a local token)
   */
  function isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  return { 
    login, 
    logout, 
    getCurrentUser, 
    isLoggedIn, 
    register,
    fetchWithAuth 
  };
})();
