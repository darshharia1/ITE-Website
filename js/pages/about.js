/* =====================================================
   ITE STARTUP LAUNCH PAD – ABOUT PAGE (about.js)
   Lean, high-end dark-mode layout — 2 paragraphs only
   ===================================================== */
window.ITE = window.ITE || {};
ITE.Pages = ITE.Pages || {};

ITE.Pages.About = (function () {

  function _navThemeBtn() {
    return `<button class="theme-toggle-btn" onclick="ITE.App.toggleTheme()" style="background:var(--bg-secondary); border:1px solid var(--border);" title="Toggle theme">
      <svg class="sun-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      <svg class="moon-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>`;
  }

  function render() {
    const el = document.getElementById('page-content');
    el.innerHTML = `<div class="about-page about-page--lean">

<!-- NAVBAR -->
<nav class="home-nav home-nav--solid">
  <div class="home-nav-logo">
    ${ITE.App.renderLogo(34)}
    <div><div class="home-nav-brand">ITE Startup Launch Pad</div><div class="home-nav-sub">VNIT Nagpur</div></div>
  </div>
  <div class="home-nav-links">
    <a class="home-nav-link active" href="#/about">About</a>
    <a class="home-nav-link" href="#/faculty">Faculty</a>
    <button class="home-nav-link" onclick="window.location.hash='#/'">Home</button>
    ${_navThemeBtn()}
    <a href="#/login" class="btn btn-ghost btn-sm">Login</a>
    <a href="#/register" class="btn btn-primary btn-sm">Get Started</a>
  </div>
</nav>

<!-- LEAN ABOUT CONTENT -->
<div class="about-lean-wrap">
  <div class="about-lean-inner">

    <!-- Logo -->
    <div class="about-lean-logo">
      ${ITE.App.renderLogo(72)}
    </div>

    <!-- Heading -->
    <h1 class="about-lean-heading">About ITE Launch Pad</h1>

    <!-- Two exact paragraphs -->
    <div class="about-lean-body">
      <p>The VNIT Introduction to Entrepreneurship (ITE) Startup Launch Pad is a centralized management platform designed to transform student ideas into viable, high-impact ventures. Serving as the digital backbone of the course, the platform streamlines student onboarding, automated team formation, mentor pairing, and milestone validation.</p>
      <p>By bridging the gap between academic theory and venture execution, the Launch Pad guides cohorts through rigorous product development, giving founders direct access to alumni investors, strategic startup resources, and standardized final evaluations.</p>
    </div>

  </div>
</div>

</div>`;
    ITE.App.applyTheme(localStorage.getItem('ite_theme') || 'light');
  }

  return { render };
})();
