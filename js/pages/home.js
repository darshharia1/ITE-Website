/* =====================================================
   ITE STARTUP LAUNCH PAD – HOME PAGE (home.js)
   Handles: Landing, Login, Register, All Startups
   ===================================================== */
window.ITE = window.ITE || {};
ITE.Pages = ITE.Pages || {};

ITE.Pages.Home = (function () {
  function _themeToggle() {
    const t = document.documentElement.getAttribute('data-theme');
    ITE.App.applyTheme(t === 'light' ? 'dark' : 'light');
  }

  function _navThemeBtn() {
    return `<button class="theme-toggle-btn" onclick="ITE.App.toggleTheme()" style="background:var(--bg-secondary); border:1px solid var(--border);" title="Toggle theme">
      <svg class="sun-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      <svg class="moon-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>`;
  }

  function _renderFooter() {
    return `<footer class="home-footer">
  <div class="footer-container">
    <div class="footer-brand">
      <div class="home-footer-logo">
        ${ITE.App.renderLogo(36)}
        <div>
          <div class="home-footer-name">ITE Startup Launch Pad</div>
          <div class="home-footer-sub">Introduction to Entrepreneurship</div>
        </div>
      </div>
    </div>
    <div class="footer-divider"></div>
    <div class="footer-vnit">
      <a href="https://vnit.ac.in/" target="_blank" rel="noopener noreferrer" class="vnit-footer-link">
        <img src="assets/vnit-logo.jpg" alt="VNIT Nagpur Logo" class="vnit-footer-logo">
        <span class="vnit-footer-text">Visvesvaraya National Institute of Technology<br><strong>VNIT Nagpur</strong></span>
      </a>
    </div>
  </div>
  <div class="home-footer-copy">© 2024 <a href="https://vnit.ac.in/" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline">VNIT Nagpur</a>. All rights reserved. Managed by the ITE Program.</div>
</footer>`;
  }

  function render() {
    const startups = ITE.Data.getPrevStartups();
    const latest5 = startups.slice(0,5);
    document.getElementById('page-content').innerHTML = `
<div class="home-page">
<!-- NAVBAR -->
<nav class="home-nav">
  <div class="home-nav-logo">
    ${ITE.App.renderLogo(34)}
    <div><div class="home-nav-brand">ITE Startup Launch Pad</div><div class="home-nav-sub">VNIT Nagpur</div></div>
  </div>
  <div class="home-nav-links">
    <button class="home-nav-link" onclick="document.getElementById('about').scrollIntoView({behavior:'smooth'})">About</button>
    <button class="home-nav-link" onclick="document.getElementById('faculty').scrollIntoView({behavior:'smooth'})">Faculty</button>
    <button class="home-nav-link" onclick="document.getElementById('resources').scrollIntoView({behavior:'smooth'})">Resources</button>
    <button class="home-nav-link" onclick="document.getElementById('prev-startups').scrollIntoView({behavior:'smooth'})">Startups</button>
    ${_navThemeBtn()}
    <a href="#/login" class="btn btn-ghost btn-sm">Login</a>
    <a href="#/register" class="btn btn-primary btn-sm">Get Started</a>
  </div>
</nav>
<!-- HERO -->
<section class="hero-section">
  <div class="hero-bg"><div class="hero-blob hero-blob-1"></div><div class="hero-blob hero-blob-2"></div></div>
  <div class="hero-content">
    <div class="hero-badge">${ITE.App.renderLogo(18)} VNIT Nagpur &nbsp;·&nbsp; ITE Program 2024-25</div>
    <div class="hero-course-label">ITE – Introduction to Entrepreneurship</div>
    <h1 class="hero-title">Launch Your Venture<br>from VNIT</h1>
    <div class="hero-tagline">From Idea to Impact</div>
    <p class="hero-desc">A centralized management platform for the VNIT Introduction to Entrepreneurship course, streamlining student onboarding, team formation, mentorship, venture development, and final evaluations.</p>
    <div class="hero-cta">
      <a href="#/register" class="btn btn-primary btn-xl">Register for the Program</a>
      <a href="#/login" class="btn btn-ghost btn-xl">Sign In</a>
    </div>
    <div class="hero-stats">
      <div class="hero-stat text-center"><div class="hero-stat-val">7+</div><div class="hero-stat-lbl">Ventures Incubated</div></div>
      <div class="hero-stat text-center"><div class="hero-stat-val">50+</div><div class="hero-stat-lbl">Founders Guided</div></div>
      <div class="hero-stat text-center"><div class="hero-stat-val">4</div><div class="hero-stat-lbl">Cohorts Graduated</div></div>
      <div class="hero-stat text-center"><div class="hero-stat-val">₹2.5M+</div><div class="hero-stat-lbl">Capital Secured</div></div>
    </div>
  </div>
</section>
<!-- ABOUT -->
<section class="home-section" id="about">
  <div class="section-header">
    <div class="section-eyebrow">About the Program</div>
    <h2 class="section-heading">A Structured Pathway for Early-Stage Ventures</h2>
    <p class="section-desc">Introduction to Entrepreneurship (ITE) is VNIT's premier academic incubator, bridging engineering disciplines with corporate strategy through hands-on product design and advisory support.</p>
  </div>
  <div class="about-grid">
    <div class="about-card-stack">
      <div class="float-card"><div><div class="float-label">Venture Development</div><div class="float-sub">Six-stage structured development framework</div></div></div>
      <div class="float-card"><div><div class="float-label">Mentorship</div><div class="float-sub">One-on-one academic and industry advisory</div></div></div>
      <div class="float-card"><div><div class="float-label">Pitch Day</div><div class="float-sub">Evaluation by venture capitalists and industry leaders</div></div></div>
    </div>
    <div>
      <p style="color:var(--text-secondary);font-size:1rem;line-height:1.75;margin-bottom:14px;">The ITE curriculum transitions students from academic theory to commercial execution. Founders form interdisciplinary teams to ideate, validate, and build functional prototypes within a single academic term.</p>
      ${['A structured, six-stage development framework from ideation to investor presentation','Interdisciplinary teams with defined leadership roles (CEO, CTO, CFO, CMO)','Personalized guidance from dedicated faculty and industry mentors','Empirical market validation through customer development and prototype deployment','Direct access to seed capital opportunities during the final presentation'].map(f=>`<div class="about-feature"><div class="about-check">✓</div><div class="about-feature-text">${f}</div></div>`).join('')}
    </div>
  </div>
</section>
<!-- FACULTY -->
<section class="home-section alt-bg" id="faculty">
  <div class="section-header">
    <div class="section-eyebrow">Our Mentors</div>
    <h2 class="section-heading">Academic and Corporate Advisory</h2>
    <p class="section-desc">Distinguished faculty members and industry advisors guide each cohort through the development process.</p>
  </div>
  <div class="faculty-grid">
    ${[{n:'Prof. Anand Chaturvedi',t:'ITE Program Coordinator',d:'Management Studies',i:'AC',c:'#2563EB',e:'Entrepreneurship & Strategy'},{n:'Dr. Ravi Sharma',t:'Faculty Mentor',d:'Computer Science & Engg.',i:'RS',c:'#10B981',e:'Product & Market Strategy'},{n:'Dr. Priya Patel',t:'Faculty Mentor',d:'Management Studies',i:'PP',c:'#8B5CF6',e:'Finance & Operations'},{n:'Mr. Vikash Mehta',t:'Industry Expert',d:'Startup Ecosystem',i:'VM',c:'#F59E0B',e:'Angel Investor & Entrepreneur'}].map(f=>`<div class="faculty-card"><div class="faculty-av" style="background:${f.c}">${f.i}</div><div class="faculty-name">${f.n}</div><div class="faculty-title">${f.t}</div><div class="faculty-dept">${f.d}</div><div style="margin-top:8px;font-size:0.72rem;color:var(--text-muted)">${f.e}</div></div>`).join('')}
  </div>
</section>
<!-- RESOURCES -->
<section class="home-section" id="resources">
  <div class="section-header">
    <div class="section-eyebrow">Learning Resources</div>
    <h2 class="section-heading">Foundational Frameworks and Toolkits</h2>
    <p class="section-desc">Crucial materials to structure, validate, and scale your venture.</p>
  </div>
  <div class="resources-grid">
    ${[['📋','Investor Pitch Deck Template','A professional presentation framework modeled on successful early-stage ventures'],['📊','Market Analysis Framework','A systematic guide to evaluating Total Addressable Market (TAM) and target demographics'],['🎤','Customer Discovery Protocol','An empirical script designed for unbiased user research and qualitative interviews'],['💰','Financial Projections Worksheet','A structured template for three-year financial projections and cash flow analysis'],['📱','Product Development Canvas','A lean framework for scoping and building a Minimum Viable Product'],['⚖️','Regulatory and Legal Guide','A checklist of essential corporate registration steps for early-stage companies in India'],['🌐','Academic Cohort Syllabus','The official program handbook detailing evaluation milestones and timeline criteria'],['🤝','Venture Capital Primer','Strategic guidelines for engaging with angel networks and venture capitalists']].map(([ic,t,d])=>`<div class="resource-card"><div><div class="resource-title">${t}</div><div class="resource-desc">${d}</div></div></div>`).join('')}
  </div>
</section>
<!-- PREVIOUS STARTUPS -->
<section class="home-section alt-bg" id="prev-startups">
  <div class="startups-preview">
    <div class="startups-header">
      <div><div class="section-eyebrow">Portfolio Companies</div><h2 class="section-heading" style="margin-bottom:0">Featured Ventures</h2></div>
      <a href="#/all-startups" class="btn btn-primary">View All Startups</a>
    </div>
    <div class="startup-cards-row">
      ${latest5.map(s=>`<div class="startup-card"><div class="startup-card-top" style="background:linear-gradient(135deg,${s.color}22,${s.color}44)">${s.emoji}</div><div class="startup-card-body"><div class="startup-card-name">${s.name}</div><div class="startup-card-desc">${s.tagline}</div><div class="startup-card-footer"><span class="badge badge-blue">Batch ${s.batch}</span><span class="badge" style="background:${s.color}22;color:${s.color}">${s.stage}</span></div></div></div>`).join('')}
    </div>
  </div>
</section>
<!-- FOOTER -->
${_renderFooter()}
</div>`;
    ITE.App.applyTheme(localStorage.getItem('ite_theme') || 'light');
  }

  function renderLogin() {
    const el = document.getElementById('page-content');
    el.innerHTML = `<div class="auth-page">
<div class="auth-left">
  <div class="auth-left-content">
    ${ITE.App.renderLogo(64)}
    <div class="auth-left-title">ITE Startup<br>Launch Pad</div>
    <div class="auth-left-tagline">From Idea to Impact</div>
    <ul class="auth-features">
      <li>Manage your entire startup journey</li>
      <li>Connect with mentors &amp; teammates</li>
      <li>Track progress stage by stage</li>
      <li>Access resources &amp; announcements</li>
    </ul>
  </div>
</div>
<div class="auth-right">
  <div class="auth-form-wrap">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <a href="#/" class="btn btn-ghost btn-sm">Home</a>
      ${_navThemeBtn()}
    </div>
    <div class="auth-form-title">Welcome Back</div>
    <div class="auth-form-subtitle">Sign in to your ITE Startup Launch Pad account</div>
    <div id="login-err" class="form-error-box"></div>
    <form id="login-form">
      <div class="form-group"><label class="form-label">VNIT Email</label><input id="l-email" type="email" class="form-control" placeholder="yourname@vnit.ac.in" required autocomplete="email"></div>
      <div class="form-group"><label class="form-label">Password</label><input id="l-pass" type="password" class="form-control" placeholder="Enter your password" required autocomplete="current-password"></div>
      <button type="submit" id="l-btn" class="btn btn-primary w-full" style="justify-content:center;padding:13px;font-size:1rem;margin-top:6px;">Sign In</button>
    </form>
    <div class="auth-divider"><div class="auth-divider-line"></div><span class="auth-divider-text">Demo Accounts</span><div class="auth-divider-line"></div></div>
    <div style="display:grid;gap:6px;">
      ${[['Administrator','admin@vnit.ac.in','admin123'],['Faculty Mentor (Dr. Sharma)','dr.sharma@vnit.ac.in','mentor123'],['Student - CEO (Aarav)','aarav.mehta@students.vnit.ac.in','student123'],['Student - No Team (Pooja)','pooja.desai@students.vnit.ac.in','student123']].map(([l,e,p])=>`<button class="btn btn-ghost btn-sm" style="justify-content:flex-start;" onclick="document.getElementById('l-email').value='${e}';document.getElementById('l-pass').value='${p}'">${l}</button>`).join('')}
    </div>
    <div class="auth-footer">Don't have an account? <a href="#/register">Register here</a></div>
  </div>
</div></div>`;

    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const err = document.getElementById('login-err');
      const btn = document.getElementById('l-btn');
      btn.disabled = true; btn.textContent = 'Signing in...';
      setTimeout(() => {
        const res = ITE.Auth.login(document.getElementById('l-email').value.trim(), document.getElementById('l-pass').value);
        if (res.success) {
          ITE.App.toast('Welcome back, ' + res.user.name.split(' ')[0] + '.', 'success');
          document.getElementById('page-content').style.padding = '';
          ITE.App.route();
        } else {
          err.style.display='block'; err.textContent = res.error;
          btn.disabled=false; btn.textContent='Sign In';
        }
      }, 320);
    });
    ITE.App.applyTheme(localStorage.getItem('ite_theme') || 'light');
  }

  function renderRegister() {
    const el = document.getElementById('page-content');
    el.innerHTML = `<div class="auth-page">
<div class="auth-left">
  <div class="auth-left-content">
    ${ITE.App.renderLogo(64)}
    <div class="auth-left-title">Join ITE<br>Launch Pad</div>
    <div class="auth-left-tagline">Build Your Startup</div>
    <ul class="auth-features">
      <li>Registration restricted to approved students</li>
      <li>Use your VNIT email address</li>
      <li>Mentors assigned by coordinators</li>
      <li>Team formation guided by faculty</li>
    </ul>
    <div style="margin-top:20px;padding:14px;background:rgba(37,99,235,0.15);border-radius:10px;font-size:0.8rem;color:rgba(255,255,255,0.8);">
      <strong style="color:#FFF">Demo:</strong> Use aarav.mehta@students.vnit.ac.in or any other approved email.
    </div>
  </div>
</div>
<div class="auth-right">
  <div class="auth-form-wrap" style="max-width:460px">
    <a href="#/login" class="btn btn-ghost btn-sm" style="margin-bottom:8px;">Back to Login</a>
    <div class="auth-form-title">Create Account</div>
    <div class="auth-form-subtitle">Registration restricted to pre-approved VNIT students only.</div>
    <div id="reg-err" class="form-error-box"></div>
    <form id="reg-form">
      <div class="form-row"><div class="form-group"><label class="form-label">Full Name *</label><input id="r-name" type="text" class="form-control" placeholder="Aarav Mehta" required></div><div class="form-group"><label class="form-label">Roll Number *</label><input id="r-roll" type="text" class="form-control" placeholder="24BCE001" required></div></div>
      <div class="form-group"><label class="form-label">VNIT Email *</label><input id="r-email" type="email" class="form-control" placeholder="name@students.vnit.ac.in" required></div>
      <div class="form-group"><label class="form-label">Branch *</label><select id="r-branch" class="form-control" required><option value="">Select Branch</option>${['Computer Science','Electronics','Mechanical','Civil','Chemical','Electrical','Metallurgy','Mining'].map(b=>`<option>${b}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Skills <span style="font-weight:400;text-transform:none">(comma separated)</span></label><input id="r-skills" type="text" class="form-control" placeholder="Python, UI/UX Design, Financial Modeling"><div class="form-hint">List your technical and non-technical skills</div></div>
      <div class="form-group"><label class="form-label">Interests</label><input id="r-interests" type="text" class="form-control" placeholder="AgriTech, IoT, Sustainability"></div>
      <div class="form-group"><label class="form-label">Password *</label><input id="r-pass" type="password" class="form-control" placeholder="Create a strong password (min 6 chars)" required minlength="6"></div>
      <button type="submit" id="r-btn" class="btn btn-primary w-full" style="justify-content:center;padding:13px;font-size:1rem;margin-top:6px;">Create Account</button>
    </form>
    <div class="auth-footer">Already have an account? <a href="#/login">Sign in</a></div>
  </div>
</div></div>`;

    document.getElementById('reg-form').addEventListener('submit', e => {
      e.preventDefault();
      const err = document.getElementById('reg-err');
      const btn = document.getElementById('r-btn');
      btn.disabled=true; btn.textContent='Creating account...';
      setTimeout(() => {
        const res = ITE.Auth.register({
          name: document.getElementById('r-name').value.trim(),
          rollNo: document.getElementById('r-roll').value.trim(),
          email: document.getElementById('r-email').value.trim(),
          branch: document.getElementById('r-branch').value,
          skills: document.getElementById('r-skills').value,
          interests: document.getElementById('r-interests').value,
          password: document.getElementById('r-pass').value,
        });
        if (res.success) {
          ITE.App.toast('Account created successfully.', 'success');
          document.getElementById('page-content').style.padding='';
          ITE.App.route();
        } else {
          err.style.display='block'; err.textContent=res.error;
          btn.disabled=false; btn.textContent='Create Account';
        }
      }, 400);
    });
    ITE.App.applyTheme(localStorage.getItem('ite_theme') || 'light');
  }

  function renderAllStartups() {
    const el = document.getElementById('page-content');
    const all = ITE.Data.getPrevStartups();
    const batches = [...new Set(all.map(s=>s.batch))].sort().reverse();

    el.innerHTML = `<div class="all-startups-page">
<nav class="home-nav">
  <div class="home-nav-logo">${ITE.App.renderLogo(32)}<div class="home-nav-brand">ITE Startup Launch Pad</div></div>
  <div class="home-nav-links">
    ${_navThemeBtn()}
    <a href="#/" class="btn btn-ghost btn-sm">Home</a>
    <a href="#/login" class="btn btn-primary btn-sm">Sign In</a>
  </div>
</nav>
<div class="all-startups-hero">
  <h1>ITE Startup Ventures</h1>
  <p>Innovative startups built by VNIT students across ${batches.length} batches of the ITE program</p>
  <div class="hero-metrics">
    <div class="text-center"><div class="hero-metric-val">${all.length}</div><div class="hero-metric-lbl">Total Startups</div></div>
    <div class="text-center"><div class="hero-metric-val">${all.filter(s=>s.stage==='Funded').length}</div><div class="hero-metric-lbl">Funded</div></div>
    <div class="text-center"><div class="hero-metric-val">${all.filter(s=>s.stage==='Operating'||s.stage==='Scaling').length}</div><div class="hero-metric-lbl">Operating/Scaling</div></div>
    <div class="text-center"><div class="hero-metric-val">₹2.5M+</div><div class="hero-metric-lbl">Total Funding</div></div>
  </div>
</div>
<div class="filter-chips">
  <button class="batch-chip btn btn-primary btn-sm" data-batch="all">All Batches</button>
  ${batches.map(b=>`<button class="batch-chip btn btn-ghost btn-sm" data-batch="${b}">Batch ${b}</button>`).join('')}
</div>
<div class="all-startups-grid" id="as-grid">${all.map(s=>_startupCard(s)).join('')}</div>
${_renderFooter()}
</div>`;

    document.querySelectorAll('.batch-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.batch-chip').forEach(b => { b.className='batch-chip btn btn-ghost btn-sm'; });
        btn.className='batch-chip btn btn-primary btn-sm';
        const f = btn.dataset.batch;
        const filtered = f==='all' ? all : all.filter(s=>s.batch===f);
        document.getElementById('as-grid').innerHTML = filtered.map(s=>_startupCard(s)).join('');
      });
    });
    ITE.App.applyTheme(localStorage.getItem('ite_theme') || 'light');
  }

  function _startupCard(s) {
    return `<div class="startup-full-card">
  <div class="startup-full-header" style="background:linear-gradient(135deg,${s.color},${s.color}99)">
    <div class="startup-full-icon" style="color:#FFF;font-weight:800;font-family:var(--font-display);font-size:1.5rem">${s.name[0]}</div>
    <div><div class="startup-full-hname">${s.name}</div><div class="startup-full-hsub">Batch ${s.batch} &nbsp;·&nbsp; ${s.team}</div></div>
  </div>
  <div class="startup-full-body">
    <div class="detail-row"><div class="detail-lbl">Tagline</div><div class="detail-val" style="font-style:italic;color:var(--text-secondary)">&ldquo;${s.tagline}&rdquo;</div></div>
    <div class="detail-row"><div class="detail-lbl">About</div><div class="detail-val">${s.description}</div></div>
    <div class="detail-row"><div class="detail-lbl">Industry</div><div class="detail-val"><span class="badge badge-blue">${s.industry}</span></div></div>
    <div class="detail-row"><div class="detail-lbl">Achievement</div><div class="detail-val" style="color:var(--success);font-weight:600">${s.achievement}</div></div>
    <div class="detail-row"><div class="detail-lbl">Status</div><div class="detail-val"><span class="badge" style="background:${s.color}22;color:${s.color}">${s.stage}</span></div></div>
    <div class="detail-row" style="margin-bottom:0"><div class="detail-lbl">Team</div><div class="tag-list">${s.members.map(m=>`<span class="tag">${m}</span>`).join('')}</div></div>
  </div>
</div>`;
  }

  return { render, renderLogin, renderRegister, renderAllStartups };
})();
