/* =====================================================
   ITE STARTUP LAUNCH PAD – AUTH (auth.js)
   Handles JWT storage, login, register, logout.
   getCurrentUser() now delegates to ITE.Router cache
   so we never make redundant /api/auth/me calls.
   ===================================================== */
window.ITE = window.ITE || {};

ITE.Auth = (function () {
  'use strict';

  const TOKEN_KEY = 'token';

  /* ── fetchWithAuth ───────────────────────────────── */
  async function fetchWithAuth(path, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const baseUrl = window.ITE?.Config?.API_BASE_URL || 'http://localhost:3002';
    return fetch(`${baseUrl}${path}`, { ...options, headers });
  }

  /* ── login ───────────────────────────────────────── */
  async function login(email, password) {
    try {
      const res = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Authentication failed.' };

      localStorage.setItem(TOKEN_KEY, data.token);

      // Prime the router cache immediately so the first route
      // dispatch doesn't need to make a second fetch.
      if (ITE.Router?.clearUserCache) ITE.Router.clearUserCache();

      return { success: true, user: data.user };
    } catch (err) {
      console.error('[Auth] Login request failed:', err);
      return { success: false, error: 'Network error: Cannot reach the authentication server.' };
    }
  }

  /* ── register ────────────────────────────────────── */
  async function register(data) {
    const { email, password, name } = data;
    if (!name || !email || !password)
      return { success: false, error: 'Please fill in all required fields.' };

    try {
      const res = await fetchWithAuth('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: name }),
      });
      const responseData = await res.json();
      if (!res.ok) return { success: false, error: responseData.error || 'Registration failed.' };
      return { success: true, user: responseData };
    } catch (err) {
      console.error('[Auth] Registration request failed:', err);
      return { success: false, error: 'Network error: Cannot reach the registration server.' };
    }
  }

  /* ── logout ──────────────────────────────────────── */
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    // Clear cached user so the next visitor starts fresh
    if (ITE.Router?.clearUserCache) ITE.Router.clearUserCache();
    window.location.hash = '#/';
    window.location.reload();
  }

  /* ── getCurrentUser ──────────────────────────────── */
  /**
   * Returns the current user object.
   * Delegates to ITE.Router.getUser() when available so we
   * only make one /api/auth/me call per session.
   * Falls back to a direct fetch if the router isn't loaded yet.
   */
  async function getCurrentUser() {
    if (!isLoggedIn()) return null;

    // Prefer router cache
    if (ITE.Router?.getUser) return ITE.Router.getUser();

    // Fallback: direct fetch (used by page modules before router loads)
    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (!res.ok) { localStorage.removeItem(TOKEN_KEY); return null; }
      const data = await res.json();
      const raw = data.user;
      return {
        id:         raw.id,
        email:      raw.email,
        name:       raw.full_name || raw.name || raw.email,
        role:       raw.role,
        teamId:     raw.team_id   || null,
        teamRole:   raw.team_role || null,
        mentorId:   raw.mentor_id || null,
        isCEO:      raw.is_ceo    || false,
        avatar:     (raw.full_name || raw.email || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        rollNo:     raw.roll_no   || '',
        branch:     raw.branch    || '',
        specialization: raw.specialization || '',
        skills:     raw.skills    || [],
      };
    } catch (err) {
      console.error('[Auth] getCurrentUser fallback failed:', err);
      return null;
    }
  }

  /* ── isLoggedIn ──────────────────────────────────── */
  function isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  return { login, logout, getCurrentUser, isLoggedIn, register, fetchWithAuth };
})();
