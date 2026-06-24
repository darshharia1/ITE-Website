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

  // ── logout ────────────────────────────────────────────────────────────────
  async function logout() {
    try { await ITE.API.post('/auth/logout'); } catch {}
    _clearUser();
    window.location.hash = '/';
    window.location.reload();
  }

  // ── getCurrentUser — sync read from cache ────────────────────────────────
  function getCurrentUser() {
    const cached = _loadCached();
    if (cached && cached.email) {
      // FIX: The backend DB seeds random UUIDs which mismatch the frontend localStorage UIDs.
      // To ensure perfect sync on localhost without rewriting everything to hit the backend API,
      // we grab the frontend's up-to-date localStorage version of the user by email.
      const localUser = ITE.Data.getUserByEmail(cached.email);
      if (localUser) return localUser;
    }
    return cached;
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
      const res = await ITE.API.post('/auth/login', { email, password: 'REGISTER' })
        .catch(() => null);
      // Backend registration endpoint — use /api/users/register if available,
      // otherwise fall back to creating via admin (handled server-side).
      // For now, send to a dedicated register route.
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

  return { login, logout, getCurrentUser, refreshMe, isLoggedIn, register, updateCurrentUser: _saveUser };
})();
