/* =====================================================
   ITE STARTUP LAUNCH PAD – AUTH (auth.js)
   Now backed by FastAPI instead of localStorage.
   ===================================================== */
window.ITE = window.ITE || {};

ITE.Auth = (function () {
  const USER_KEY = 'ite_current_user';

  // ── In-memory cache (set after login / page load) ─────────────────────────
  let _currentUser = null;

  function _loadCached() {
    if (_currentUser) return _currentUser;
    const s = sessionStorage.getItem(USER_KEY);
    if (s) { try { _currentUser = JSON.parse(s); } catch {} }
    return _currentUser;
  }

  function _saveUser(user) {
    _currentUser = user;
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function _clearUser() {
    _currentUser = null;
    sessionStorage.removeItem(USER_KEY);
    ITE.API.setToken(null);
  }

  // ── login — async, returns {success, user?, error?} ───────────────────────
  async function login(email, password) {
    try {
      const res = await ITE.API.post('/auth/login', { email, password });
      ITE.API.setToken(res.token);
      _saveUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  }

  // ── guestLogin — async, returns {success, user?, error?} ──────────────────
  async function guestLogin(email) {
    try {
      const res = await ITE.API.post('/auth/guest-login', { email });
      ITE.API.setToken(res.token);
      _saveUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message || 'Guest login failed.' };
    }
  }

  // ── logout ────────────────────────────────────────────────────────────────
  async function logout() {
    try { await ITE.API.post('/auth/logout'); } catch {}
    _clearUser();
    window.location.hash = '/';
    window.location.reload();
  }

  // ── getCurrentUser — sync read from cache ────────────────────────────────
  function getCurrentUser() {
    // Always return the backend-authenticated user from sessionStorage.
    // This ensures admins/mentors (who may not exist in local data.js) are
    // properly identified by their server-issued role.
    return _loadCached() || null;
  }

  // ── refreshMe — fetch fresh user from server, update cache ───────────────
  async function refreshMe() {
    try {
      const user = await ITE.API.get('/auth/me');
      _saveUser(user);
      return user;
    } catch {
      _clearUser();
      return null;
    }
  }

  function isLoggedIn() { return !!getCurrentUser(); }

  // ── register ──────────────────────────────────────────────────────────────
  async function register(data) {
    const { email, password, name, rollNo, branch, skills, interests } = data;
    if (!name || !email || !password || !branch)
      return { success: false, error: 'Please fill in all required fields.' };

    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    try {
      const created = await ITE.API.post('/auth/register', {
        email, password, name, rollNo, branch, avatar,
        skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        interests: interests ? interests.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      ITE.API.setToken(created.token);
      _saveUser(created.user);
      return { success: true, user: created.user };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }

  return { login, guestLogin, logout, getCurrentUser, refreshMe, isLoggedIn, register, updateCurrentUser: _saveUser, clearUser: _clearUser };
})();
