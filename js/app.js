/* =====================================================
   ITE STARTUP LAUNCH PAD – APP SHELL CONTROLLER
   js/app.js

   Manages: Shell UI (sidebar, topbar, toast, modal),
            global helpers, and wires up ITE.Router.
   Routing is fully delegated to js/dashboardRouter.js.
   ===================================================== */
window.ITE = window.ITE || {};

ITE.App = (function () {
  'use strict';

  /* ── Stage metadata ──────────────────────────────── */
  const STAGES = [
    { label: 'Idea Validation'     },
    { label: 'Market Research'     },
    { label: 'Customer Interviews' },
    { label: 'MVP Development'     },
    { label: 'Pitch Deck'          },
    { label: 'Final Pitch'         },
  ];

  /* ── Theme ───────────────────────────────────────── */
  let _theme = localStorage.getItem('ite_theme') || 'light';

  function applyTheme(t) {
    _theme = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('ite_theme', t);
    document.querySelectorAll('.sun-icon').forEach(el => { el.style.display = t === 'light' ? '' : 'none'; });
    document.querySelectorAll('.moon-icon').forEach(el => { el.style.display = t === 'dark'  ? '' : 'none'; });
  }
  function toggleTheme() { applyTheme(_theme === 'light' ? 'dark' : 'light'); }

  /* ── Navigation ──────────────────────────────────── */
  function navigate(path) { window.location.hash = path; }

  /* ── Nav height tracking ─────────────────────────── */
  function updateNavHeight() {
    const nav = document.querySelector('.home-nav');
    document.documentElement.style.setProperty(
      '--nav-height', nav ? `${nav.offsetHeight}px` : '0px'
    );
  }

  /* ── SVG Icons ───────────────────────────────────── */
  const _ico = (d) => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ico_grid   = _ico('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>');
  const ico_rocket = _ico('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>');
  const ico_users  = _ico('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>');
  const ico_badge  = _ico('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>');
  const ico_bell   = _ico('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>');
  const ico_upload = _ico('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>');
  const ico_home   = _ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>');
  const ico_check  = _ico('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>');

  /* ── Shell update (public – called by ITE.Router) ── */
  function _updateShell(user, hash) {
    const sidebar = document.getElementById('sidebar');
    const topbar  = document.getElementById('topbar');
    const pc      = document.getElementById('page-content');
    const mw      = document.getElementById('main-wrapper');

    const publicHashes = ['/', '/login', '/register', '/all-startups', '/faculty', '/about'];
    const isPublic     = !user || publicHashes.includes(hash);

    if (isPublic) {
      sidebar?.classList.add('hidden');
      topbar?.classList.add('hidden');
      if (pc) pc.style.padding = '0';
      if (mw) mw.style.marginLeft = '0';
    } else {
      sidebar?.classList.remove('hidden');
      topbar?.classList.remove('hidden');
      if (pc) pc.style.padding = '';
      if (mw) mw.style.marginLeft = '';
      _buildSidebar(user, hash);
      _buildSidebarUser(user);
    }
  }

  /* ── Sidebar builder ─────────────────────────────── */
  function _buildSidebar(user, currentHash) {
    let items = [];
    if (user.role === 'admin') {
      items = [
        { icon: ico_grid,   label: 'Dashboard',     path: '/admin/dashboard'     },
        { icon: ico_rocket, label: 'Startups',       path: '/admin/startups'      },
        { icon: ico_users,  label: 'Students',       path: '/admin/students'      },
        { icon: ico_badge,  label: 'Mentors',        path: '/admin/mentors'       },
        { icon: ico_bell,   label: 'Announcements',  path: '/admin/announcements' },
        { icon: ico_upload, label: 'CSV Upload',     path: '/admin/csv-upload'    },
      ];
    } else if (user.role === 'mentor') {
      items = [
        { icon: ico_grid,   label: 'Dashboard',    path: '/mentor/dashboard'     },
        { icon: ico_users,  label: 'My Teams',     path: '/mentor/teams'         },
        { icon: ico_bell,   label: 'Announcements',path: '/mentor/announcements' },
      ];
    } else if (user.role === 'student') {
      items = [
        { icon: ico_grid,  label: 'Dashboard',    path: '/student/dashboard'     },
        { icon: ico_home,  label: 'My Team',      path: '/student/my-team'       },
        { icon: ico_check, label: 'Tasks',         path: '/student/tasks'         },
        { icon: ico_bell,  label: 'Announcements', path: '/student/announcements' },
      ];
    }

    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = `<div class="nav-section"><div class="nav-section-label">Navigation</div>${
      items.map(it =>
        `<a class="nav-item ${currentHash === it.path ? 'active' : ''}" href="#${it.path}">${it.icon}<span class="nav-label">${it.label}</span></a>`
      ).join('')
    }</div>`;
  }

  function _buildSidebarUser(user) {
    const el = document.getElementById('sidebar-user');
    if (!el) return;
    const roleLabel = { admin: 'Administrator', mentor: 'Mentor', student: user.teamRole || 'Student' }[user.role] || 'User';
    el.innerHTML = `
<div class="sidebar-user-info">
  <div class="sidebar-avatar">${user.avatar || (user.name || '?')[0]}</div>
  <div>
    <div class="sidebar-user-name">${user.name}</div>
    <div class="sidebar-user-role">${roleLabel}</div>
  </div>
</div>`;
  }

  /* ── Toast ───────────────────────────────────────── */
  function toast(msg, type = 'info') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-dot"></div><span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 3500);
  }

  /* ── Modal ───────────────────────────────────────── */
  function showModal(html) {
    const ov = document.getElementById('modal-overlay');
    if (!ov) return;
    ov.innerHTML = html;
    ov.classList.remove('hidden');
    const close = () => closeModal();
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelector('.modal-close')?.addEventListener('click', close);
  }
  function closeModal() {
    const ov = document.getElementById('modal-overlay');
    if (!ov) return;
    ov.classList.add('hidden');
    ov.innerHTML = '';
  }

  /* ── Progress tracker ────────────────────────────── */
  function renderProgressTracker(stage) {
    return `<div class="progress-tracker">${STAGES.map((s, i) => {
      const done = i < stage, active = i === stage;
      return `<div class="progress-step ${done ? 'done' : active ? 'active' : ''}">
        <div class="step-circle">${done ? '✓' : (i + 1)}</div>
        <div class="step-label">${s.label}</div>
      </div>`;
    }).join('')}</div>`;
  }

  /* ── ITE SVG Logo ────────────────────────────────── */
  function renderLogo(size = 40) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M50 5 L95 85 L72 85 L72 68 L28 68 L28 85 L5 85 Z" fill="#2563EB"/>
<path d="M50 32 L67 65 L33 65 Z" fill="white"/>
</svg>`;
  }

  /* ── Role color ──────────────────────────────────── */
  function roleColor(role) {
    return { CEO: '#2563EB', CTO: '#10B981', CFO: '#F59E0B', CMO: '#8B5CF6' }[role] || '#2563EB';
  }

  /* ── Viewport helper (used by page modules) ──────── */
  const pc = () => ITE.Router ? ITE.Router.getViewport?.() || document.getElementById('page-content')
                              : document.getElementById('page-content');

  /* ── Init ────────────────────────────────────────── */
  function init() {
    // Boot data layer
    if (typeof ITE.Data?.init === 'function') ITE.Data.init();

    // Apply saved theme
    applyTheme(_theme);

    // Wire static button listeners
    document.getElementById('theme-toggle-app')
      ?.addEventListener('click', toggleTheme);

    document.getElementById('logout-btn')
      ?.addEventListener('click', () => {
        ITE.Router?.clearUserCache?.();
        ITE.Auth.logout();
      });

    document.getElementById('sidebar-toggle')
      ?.addEventListener('click', () => {
        const sb = document.getElementById('sidebar');
        if (!sb) return;
        if (window.innerWidth <= 768) {
          sb.classList.remove('mobile-open');
        } else {
          sb.classList.toggle('collapsed');
        }
      });

    document.getElementById('mobile-menu-btn')
      ?.addEventListener('click', () =>
        document.getElementById('sidebar')?.classList.toggle('mobile-open')
      );

    // Resize / nav-height tracking
    window.addEventListener('resize', updateNavHeight);
    window.addEventListener('load', updateNavHeight);

    // Intercept non-hash internal links for fade transition
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (
        a && a.href &&
        !a.href.includes('#') &&
        a.target !== '_blank' &&
        !a.getAttribute('download')
      ) {
        const isExternal = a.hostname !== window.location.hostname;
        if (!isExternal) {
          e.preventDefault();
          const targetUrl = a.href;
          const vp = document.getElementById('page-content');
          if (vp) vp.classList.remove('fade-in');
          else { document.body.style.opacity = '0'; document.body.style.transition = 'opacity 0.4s'; }
          setTimeout(() => { window.location.href = targetUrl; }, 400);
        }
      }
    });

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        const vp = document.getElementById('page-content');
        if (vp) vp.classList.add('fade-in');
        document.body.style.opacity = '1';
      }
    });

    // ── Hand routing control to ITE.Router ──────────
    window.addEventListener('hashchange', () => ITE.Router.route());

    // Global error safety net
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[App] Unhandled promise rejection:', event.reason);
    });

    // Kick off initial route
    ITE.Router.route();
  }

  /* ── Expose public surface ───────────────────────── */
  return {
    init,
    navigate,
    toast,
    showModal,
    closeModal,
    pc,
    renderProgressTracker,
    renderLogo,
    roleColor,
    toggleTheme,
    applyTheme,
    STAGES,
    // Exposed for ITE.Router to call
    _updateShell,
  };

})();

/* ── Bootstrap on DOM ready ──────────────────────── */
document.addEventListener('DOMContentLoaded', ITE.App.init);
