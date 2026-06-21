/* =====================================================
   ITE STARTUP LAUNCH PAD – DASHBOARD ROUTER
   js/dashboardRouter.js

   Responsibilities:
     1. Verify JWT + fetch/cache user profile on boot
     2. Route hash changes to the correct role module
     3. Guarantee a clean #page-content viewport exists
     4. Surface errors visibly – never fail to a blank page
   ===================================================== */
window.ITE = window.ITE || {};

ITE.Router = (function () {
  'use strict';

  /* ── 1. In-memory user cache ─────────────────────── */
  let _cachedUser  = null;   // Resolved ITE user object
  let _fetchPromise = null;  // Pending fetch (de-duplicates concurrent calls)

  /**
   * Returns the current user, fetching from /api/auth/me at most once
   * per page session. Clears cache on logout.
   */
  async function getUser(forceRefresh = false) {
    if (!ITE.Auth.isLoggedIn()) { _cachedUser = null; return null; }
    if (!forceRefresh && _cachedUser) return _cachedUser;
    if (_fetchPromise) return _fetchPromise;          // coalesce concurrent calls

    _fetchPromise = (async () => {
      try {
        const res = await ITE.Auth.fetchWithAuth('/api/auth/me');
        if (!res.ok) {
          // Token invalid/expired – evict
          localStorage.removeItem('token');
          _cachedUser = null;
          return null;
        }
        const data = await res.json();
        // data.user has: id, email, full_name, role, team_id, team_role, mentor_id, is_ceo
        const raw = data.user;
        _cachedUser = {
          id:         raw.id,
          email:      raw.email,
          name:       raw.full_name || raw.name || raw.email,
          role:       raw.role,
          teamId:     raw.team_id     || null,
          teamRole:   raw.team_role   || null,
          mentorId:   raw.mentor_id   || null,
          isCEO:      raw.is_ceo      || false,
          avatar:     (raw.full_name || raw.email || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          // aliases that page modules expect
          rollNo:     raw.roll_no     || '',
          branch:     raw.branch      || '',
          specialization: raw.specialization || '',
          skills:     raw.skills      || [],
        };
        return _cachedUser;
      } catch (err) {
        console.error('[Router] getUser fetch failed:', err);
        return null;
      } finally {
        _fetchPromise = null;
      }
    })();

    return _fetchPromise;
  }

  /** Invalidate cache (call after login/logout) */
  function clearUserCache() { _cachedUser = null; _fetchPromise = null; }

  /* ── 2. Viewport guardrail ───────────────────────── */
  /**
   * Ensures #page-content exists and returns it.
   * If somehow absent from the DOM, injects it into #main-wrapper.
   */
  function getViewport() {
    let el = document.getElementById('page-content');
    if (!el) {
      el = document.createElement('main');
      el.id = 'page-content';
      el.className = 'page-fade';
      el.setAttribute('role', 'main');
      const wrapper = document.getElementById('main-wrapper') || document.body;
      wrapper.appendChild(el);
      console.warn('[Router] #page-content was missing – injected dynamically.');
    }
    return el;
  }

  /* ── 3. Error state renderer ─────────────────────── */
  function showErrorState(msg, retryFn) {
    const vp = getViewport();
    vp.innerHTML = `
<div class="error-boundary" style="
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:60vh;gap:20px;padding:40px;text-align:center;">
  <div style="font-size:3rem">⚠️</div>
  <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;
              color:var(--text-primary);margin:0">Something went wrong</h2>
  <p style="color:var(--text-secondary);font-size:.9rem;max-width:420px;line-height:1.6;margin:0">
    ${msg}
  </p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
    <button class="btn btn-primary" id="error-retry-btn">↺ Retry</button>
    <button class="btn btn-ghost" onclick="ITE.Auth.logout()">Logout</button>
  </div>
</div>`;
    if (retryFn) {
      document.getElementById('error-retry-btn')?.addEventListener('click', retryFn);
    }
  }

  /* ── 4. Auth guard ───────────────────────────────── */
  function enforceAuth() {
    if (!ITE.Auth.isLoggedIn()) {
      // Wipe stale state and kick to login
      localStorage.removeItem('token');
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }

  /* ── 5. Role → page module dispatch table ────────── */
  const ROUTE_MAP = {
    admin: {
      default: '/admin/dashboard',
      prefixes: ['/admin'],
      routes: {
        '/admin/dashboard':     { title: 'Dashboard',     fn: () => ITE.Pages.Admin.renderDashboard()     },
        '/admin/startups':      { title: 'Startups',      fn: () => ITE.Pages.Admin.renderStartups()      },
        '/admin/students':      { title: 'Students',      fn: () => ITE.Pages.Admin.renderStudents()      },
        '/admin/mentors':       { title: 'Mentors',       fn: () => ITE.Pages.Admin.renderMentors()       },
        '/admin/announcements': { title: 'Announcements', fn: () => ITE.Pages.Admin.renderAnnouncements() },
        '/admin/csv-upload':    { title: 'CSV Upload',    fn: () => ITE.Pages.Admin.renderCSVUpload()     },
      },
    },
    mentor: {
      default: '/mentor/dashboard',
      prefixes: ['/mentor'],
      routes: {
        '/mentor/dashboard':     { title: 'Dashboard',     fn: () => ITE.Pages.Mentor.renderDashboard()     },
        '/mentor/teams':         { title: 'My Teams',      fn: () => ITE.Pages.Mentor.renderTeams()         },
        '/mentor/announcements': { title: 'Announcements', fn: () => ITE.Pages.Mentor.renderAnnouncements() },
      },
    },
    student: {
      default: '/student/dashboard',
      prefixes: ['/student'],
      routes: {
        '/student/dashboard':     { title: 'Dashboard',     fn: () => ITE.Pages.Student.renderDashboard()     },
        '/student/my-team':       { title: 'My Team',       fn: () => ITE.Pages.Student.renderMyTeam()       },
        '/student/tasks':         { title: 'Tasks',         fn: () => ITE.Pages.Student.renderTasks()         },
        '/student/announcements': { title: 'Announcements', fn: () => ITE.Pages.Student.renderAnnouncements() },
      },
    },
  };

  /* ── 6. Public routes ────────────────────────────── */
  const PUBLIC_ROUTES = {
    '/':              () => ITE.Pages.Home.render(),
    '/login':         () => ITE.Pages.Home.renderLogin(),
    '/register':      () => ITE.Pages.Home.renderRegister(),
    '/all-startups':  () => ITE.Pages.Home.renderAllStartups(),
    '/faculty':       () => ITE.Pages.Home.renderFaculty(),
    '/about':         () => ITE.Pages.About.render(),
  };

  /* ── 7. Core route dispatcher ────────────────────── */
  async function dispatch() {
    const hash = window.location.hash.replace('#', '') || '/';

    // ── 7a. Public routes — no auth needed
    if (hash in PUBLIC_ROUTES) {
      _updateShell(null, hash);
      try {
        await PUBLIC_ROUTES[hash]();
      } catch (err) {
        console.error('[Router] Public route error:', err);
        getViewport().innerHTML = `<div class="error-state">Page failed to load. <a href="#/">Go home</a></div>`;
      }
      return;
    }

    // ── 7b. Authenticated routes
    if (!enforceAuth()) return;

    // Show loading placeholder while we await the user
    getViewport().innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Loading...</span></div>';

    let user;
    try {
      user = await getUser();
    } catch (err) {
      console.error('[Router] Auth check failed:', err);
      showErrorState('Could not verify your session. Please log in again.', () => ITE.Auth.logout());
      return;
    }

    if (!user) {
      // Token was invalid
      clearUserCache();
      localStorage.removeItem('token');
      window.location.hash = '#/login';
      return;
    }

    // ── 7c. Delegate to ITE.App for the shell (sidebar/topbar update)
    _updateShell(user, hash);

    // ── 7d. Determine role config
    const roleConfig = ROUTE_MAP[user.role];
    if (!roleConfig) {
      showErrorState(`Unknown role "${user.role}". Please contact admin.`);
      return;
    }

    // ── 7e. Root "/" redirect to role default
    if (hash === '/') {
      window.location.hash = '#' + roleConfig.default;
      return;
    }

    // ── 7f. Find matching route
    const routeDef = roleConfig.routes[hash];
    const isRoleRoute = roleConfig.prefixes.some(p => hash.startsWith(p));

    if (!routeDef) {
      if (isRoleRoute) {
        // Hash matches role prefix but not a known sub-route → redirect to default
        window.location.hash = '#' + roleConfig.default;
      } else {
        // Completely unknown hash for this role
        showErrorState(
          `The page <code>${hash}</code> doesn't exist for your account.`,
          () => { window.location.hash = '#' + roleConfig.default; }
        );
      }
      return;
    }

    // ── 7g. Update topbar title
    const topbarTitle = document.getElementById('topbar-title');
    if (topbarTitle) topbarTitle.textContent = routeDef.title;

    // ── 7h. Execute page render inside error boundary
    try {
      await routeDef.fn();
    } catch (err) {
      console.error(`[Router] Error rendering "${hash}":`, err);
      showErrorState(
        `Failed to load the <strong>${routeDef.title}</strong> view.<br>
         <small style="color:var(--text-muted)">${err.message || 'Unknown error'}</small>`,
        () => dispatch()
      );
    }
  }

  /* ── 8. Shell update (delegates to ITE.App) ─────── */
  function _updateShell(user, hash) {
    // ITE.App.updateShell is private; we call the public helpers
    // that app.js exposes. If user is null → public page layout.
    if (typeof ITE.App._updateShell === 'function') {
      ITE.App._updateShell(user, hash);
    } else {
      // Fallback: manual show/hide of sidebar/topbar
      const sidebar  = document.getElementById('sidebar');
      const topbar   = document.getElementById('topbar');
      const mainWrap = document.getElementById('main-wrapper');
      if (user) {
        sidebar?.classList.remove('hidden');
        topbar?.classList.remove('hidden');
        mainWrap?.style.setProperty('margin-left', '');
      } else {
        sidebar?.classList.add('hidden');
        topbar?.classList.add('hidden');
        mainWrap?.style.setProperty('margin-left', '0');
      }
    }
  }

  /* ── 9. Page-transition wrapper ──────────────────── */
  let _routeDebounce = null;

  function route() {
    // Debounce rapid hash changes (e.g. during redirects)
    clearTimeout(_routeDebounce);
    _routeDebounce = setTimeout(async () => {
      // Fade out
      const vp = getViewport();
      vp.classList.remove('fade-in');

      // Close mobile sidebar on nav
      document.getElementById('sidebar')?.classList.remove('mobile-open');

      // Slight delay for CSS transition to play
      await new Promise(r => setTimeout(r, 80));

      await dispatch();

      // Fade in
      requestAnimationFrame(() => {
        vp.classList.add('fade-in');
      });
    }, 40);
  }

  /* ── 10. Public API ──────────────────────────────── */
  return {
    route,
    dispatch,
    getUser,
    clearUserCache,
    getViewport,
    /** Force a full re-render of the current view */
    refresh() { dispatch(); },
  };

})();
