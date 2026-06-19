/* =====================================================
   ITE STARTUP LAUNCH PAD – ADMIN PAGES (admin.js)
   ===================================================== */
window.ITE = window.ITE || {};
ITE.Pages = ITE.Pages || {};

ITE.Pages.Admin = (function () {

  /* ---- Dashboard ---- */
  function renderDashboard() {
    const students = ITE.Data.getStudents();
    const mentors  = ITE.Data.getMentors();
    const teams    = ITE.Data.getTeams();
    const anns     = ITE.Data.getAnnouncements();
    const tasks    = ITE.Data.getTasks();
    const subs     = ITE.Data.getSubmissions();
    const stageCounts = ITE.App.STAGES.map((_,i) => teams.filter(t=>t.stage===i).length);

    ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">Admin Dashboard</div><div class="page-subtitle">${new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div></div>
<div class="stats-grid">
  ${[['👨‍🎓','Total Students',students.length,`${students.filter(s=>s.teamId).length} in teams`,'#2563EB'],
     ['🚀','Active Teams',teams.length,'Startup ventures','#10B981'],
     ['🧑‍🏫','Mentors',mentors.length,'Faculty & industry','#8B5CF6'],
     ['📣','Announcements',anns.length,'Total posted','#F59E0B'],
     ['📋','Tasks',tasks.length,`${subs.length} submissions`,'#EF4444']
  ].map(([ico,lbl,val,sub,col])=>`<div class="stat-card" style="--c:${col}"><div class="stat-icon" style="background:${col}20;color:${col}">${ico}</div><div class="stat-value">${val}</div><div class="stat-label">${lbl}</div><div class="stat-sub">${sub}</div></div>`).join('')}
</div>
<div class="two-col">
  <div class="card">
    <div class="card-header"><div class="card-title">Startup Stage Distribution</div></div>
    ${ITE.App.STAGES.map((s,i)=>`<div class="analytics-bar"><div class="analytics-bar-label"><span>${s.emoji} ${s.label}</span><span>${stageCounts[i]}</span></div><div class="analytics-bar-track"><div class="analytics-bar-fill" style="width:${teams.length?stageCounts[i]/teams.length*100:0}%;background:${i<2?'#10B981':i<4?'#2563EB':'#8B5CF6'}"></div></div></div>`).join('')}
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Recent Announcements</div><a href="#/admin/announcements" class="btn btn-ghost btn-sm">View All</a></div>
    ${anns.slice(0,4).map(a=>`<div class="ann-card ${a.createdByRole}-ann"><div class="ann-meta"><span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${a.createdByRole}</span><span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span></div><div class="ann-title">${a.title}</div><div class="ann-date">${new Date(a.createdAt).toLocaleDateString('en-IN')}</div></div>`).join('')}
  </div>
</div>
<div class="card mt-6">
  <div class="card-header"><div class="card-title">Team Rankings</div><a href="#/admin/startups" class="btn btn-ghost btn-sm">View All →</a></div>
  <div class="table-wrapper"><table class="data-table"><thead><tr><th>#</th><th>Startup</th><th>Industry</th><th>Mentor</th><th>Stage</th><th>Progress</th></tr></thead><tbody>
  ${[...teams].sort((a,b)=>b.stage-a.stage).map((t,i)=>{const m=ITE.Data.getUserById(t.mentorId);return`<tr><td><strong>#${i+1}</strong></td><td><div style="font-weight:600">${t.startupName}</div></td><td><span class="badge badge-blue">${t.industry.split(' ')[0]}</span></td><td>${m?m.name:'—'}</td><td><span class="badge ${t.stage>=4?'badge-green':'badge-blue'}">${ITE.App.STAGES[t.stage]?.emoji} ${ITE.App.STAGES[t.stage]?.label}</span></td><td><div class="mini-progress" style="min-width:90px">${ITE.App.STAGES.map((_,j)=>`<div class="mini-step ${j<t.stage?'done':j===t.stage?'active':''}"></div>`).join('')}</div></td></tr>`}).join('')}
  </tbody></table></div>
</div>`;
  }

  /* ---- Startups ---- */
  function renderStartups() {
    const teams = ITE.Data.getTeams();
    ITE.App.pc().innerHTML = `
<div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div><div class="page-title">Startups</div><div class="page-subtitle">${teams.length} startup ventures</div></div>
  <button class="btn btn-primary" onclick="ITE.Pages.Admin.showAddStartup()">+ Add Startup</button>
</div>
<div class="cards-grid">
  ${teams.length===0?`<div class="empty-state card"><div class="empty-state-icon">🚀</div><h3>No startups yet</h3></div>`:
  teams.map(t=>{const m=ITE.Data.getUserById(t.mentorId);const ceo=ITE.Data.getUserById(t.ceoId);return`
<div class="card" style="cursor:pointer" onclick="ITE.Pages.Admin.showTeamDetail('${t.id}')">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div style="width:48px;height:48px;border-radius:var(--radius-sm);background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:1.375rem">🚀</div>
    <div><div style="font-family:var(--font-display);font-size:1rem;font-weight:700">${t.startupName}</div><div style="font-size:.72rem;color:var(--text-muted)">${t.industry}</div></div>
  </div>
  <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:14px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${t.problemStatement}</p>
  <div style="margin-top:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <span style="font-size:.8rem;color:var(--text-muted)">👑 ${ceo?ceo.name:'No CEO'}</span>
      <span class="badge ${t.stage>=4?'badge-green':'badge-blue'}">${ITE.App.STAGES[t.stage]?.emoji} Stage ${t.stage+1}/6</span>
    </div>
    ${ITE.App.renderProgressTracker(t.stage)}
    <div class="divider"></div>
    <div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--text-muted)">
      <span>🧑‍🏫 ${m?m.name:'No Mentor'}</span><span>${t.members.length} members</span>
    </div>
  </div>
</div>`}).join('')}
</div>`;
  }

  function showTeamDetail(id) {
    const t = ITE.Data.getTeamById(id); if(!t) return;
    const m = ITE.Data.getUserById(t.mentorId);
    const members = t.members.map(mb=>({...mb, user:ITE.Data.getUserById(mb.userId)}));
    ITE.App.showModal(`<div class="modal modal-lg">
<div class="modal-header"><div class="modal-title">${t.startupName}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div style="display:grid;gap:14px">
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:4px">Industry</div><span class="badge badge-blue">${t.industry}</span></div>
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:4px">Problem Statement</div><p style="font-size:.9rem;line-height:1.6;color:var(--text-primary)">${t.problemStatement}</p></div>
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:4px">Description</div><p style="font-size:.875rem;line-height:1.6;color:var(--text-secondary)">${t.description||'Not provided.'}</p></div>
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Progress</div>${ITE.App.renderProgressTracker(t.stage)}</div>
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Team (${members.length})</div>
      <div style="display:grid;gap:7px">${members.map(mb=>`<div class="member-card"><div class="member-avatar" style="background:${ITE.App.roleColor(mb.role)}">${mb.user?.avatar||'?'}</div><div class="member-info"><div class="member-name">${mb.user?.name||'?'}</div><div class="member-sub">${mb.user?.rollNo||''} · ${mb.user?.branch||''}</div></div><span class="badge" style="background:${ITE.App.roleColor(mb.role)}20;color:${ITE.App.roleColor(mb.role)}">${mb.role}</span></div>`).join('')}</div>
    </div>
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:4px">Mentor</div><p style="font-size:.9rem">${m?m.name+' · '+(m.specialization||'Faculty'):'Unassigned'}</p></div>
    ${t.stage<5?`<button class="btn btn-primary btn-sm" onclick="ITE.Pages.Admin.advanceStage('${t.id}')">Advance Stage →</button>`:`<span class="badge badge-green">🏁 All Stages Complete!</span>`}
  </div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Close</button></div>
</div>`);
  }

  function advanceStage(id) {
    const t = ITE.Data.getTeamById(id); if(!t||t.stage>=5) return;
    ITE.Data.updateTeam(id,{stage:t.stage+1});
    ITE.App.toast(`${t.startupName} → ${ITE.App.STAGES[t.stage+1].label}!`,'success');
    ITE.App.closeModal(); renderStartups();
  }

  function showAddStartup() {
    const mentors = ITE.Data.getMentors();
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Add New Startup</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div id="as-err" class="form-error-box"></div>
  <div class="form-group"><label class="form-label">Startup Name *</label><input id="as-name" class="form-control" placeholder="AgriTech Connect"></div>
  <div class="form-group"><label class="form-label">Industry *</label><select id="as-ind" class="form-control"><option value="">Select…</option>${['Agriculture & Food Tech','Education Technology','Healthcare','Fintech','Sustainability','Safety Tech','Smart Cities','E-Commerce','SaaS','Other'].map(i=>`<option>${i}</option>`).join('')}</select></div>
  <div class="form-group"><label class="form-label">Problem Statement *</label><textarea id="as-prob" class="form-control" rows="3" placeholder="What problem does this startup solve?"></textarea></div>
  <div class="form-group"><label class="form-label">Description</label><textarea id="as-desc" class="form-control" rows="3" placeholder="Startup description…"></textarea></div>
  <div class="form-group"><label class="form-label">Assign Mentor</label><select id="as-mentor" class="form-control"><option value="">Select Mentor</option>${mentors.map(m=>`<option value="${m.id}">${m.name}</option>`).join('')}</select></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Admin._submitAddStartup()">Create</button></div>
</div>`);
  }

  function _submitAddStartup() {
    const name=document.getElementById('as-name')?.value?.trim();
    const ind=document.getElementById('as-ind')?.value;
    const prob=document.getElementById('as-prob')?.value?.trim();
    const desc=document.getElementById('as-desc')?.value?.trim();
    const mId=document.getElementById('as-mentor')?.value;
    if(!name||!ind||!prob){document.getElementById('as-err').style.display='block';document.getElementById('as-err').textContent='Fill required fields.';return;}
    const team=ITE.Data.createTeam({startupName:name,industry:ind,problemStatement:prob,description:desc,mentorId:mId,ceoId:null,members:[],stage:0});
    if(mId){const m=ITE.Data.getUserById(mId);if(m)ITE.Data.updateUser(mId,{assignedTeams:[...(m.assignedTeams||[]),team.id]});}
    ITE.App.toast('Startup created!','success'); ITE.App.closeModal(); renderStartups();
  }

  /* ---- Students ---- */
  function renderStudents() {
    const students = ITE.Data.getStudents();
    ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">Students</div><div class="page-subtitle">${students.length} enrolled</div></div>
<div class="card" style="margin-bottom:14px"><div class="search-bar" style="max-width:380px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" id="stu-search" placeholder="Search by name, roll no…" oninput="ITE.Pages.Admin._filterStudents()"></div></div>
<div class="card"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Student</th><th>Roll No.</th><th>Branch</th><th>Team</th><th>Role</th><th>Mentor</th><th>Status</th></tr></thead><tbody id="stu-tbody">${_studentRows(students)}</tbody></table></div></div>`;
  }

  function _studentRows(list) {
    return list.map(s=>{
      const team=s.teamId?ITE.Data.getTeamById(s.teamId):null;
      const mentor=s.mentorId?ITE.Data.getUserById(s.mentorId):null;
      return`<tr><td><div style="display:flex;align-items:center;gap:9px"><div style="width:34px;height:34px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:#FFF;flex-shrink:0">${s.avatar}</div><div><div style="font-weight:600">${s.name}</div><div style="font-size:.72rem;color:var(--text-muted)">${s.email}</div></div></div></td><td>${s.rollNo||'—'}</td><td>${s.branch||'—'}</td><td>${team?team.startupName:`<span style="color:var(--text-muted)">No Team</span>`}</td><td>${s.teamRole?`<span class="badge badge-blue">${s.teamRole}</span>`:'—'}</td><td>${mentor?mentor.name:`<span style="color:var(--text-muted)">Unassigned</span>`}</td><td><span class="badge ${s.teamId?'badge-green':'badge-yellow'}">${s.teamId?'In Team':'No Team'}</span></td></tr>`;
    }).join('');
  }

  function _filterStudents() {
    const q=document.getElementById('stu-search')?.value?.toLowerCase()||'';
    const f=ITE.Data.getStudents().filter(s=>s.name.toLowerCase().includes(q)||(s.rollNo||'').toLowerCase().includes(q)||(s.branch||'').toLowerCase().includes(q));
    const tb=document.getElementById('stu-tbody');
    if(tb) tb.innerHTML=_studentRows(f);
  }

  /* ---- Mentors ---- */
  function renderMentors() {
    const mentors=ITE.Data.getMentors();
    const teams=ITE.Data.getTeams();
    ITE.App.pc().innerHTML = `
<div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div><div class="page-title">Mentors</div><div class="page-subtitle">${mentors.length} faculty & industry mentors</div></div>
  <button class="btn btn-primary" onclick="ITE.Pages.Admin.showAddMentor()">+ Add Mentor</button>
</div>
<div class="cards-grid">
${mentors.map(m=>{const mteams=teams.filter(t=>t.mentorId===m.id);return`<div class="card">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><div style="width:50px;height:50px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#FFF">${m.avatar}</div><div><div style="font-family:var(--font-display);font-size:1rem;font-weight:700">${m.name}</div><div style="font-size:.8rem;color:var(--text-muted)">${m.specialization||'Faculty Mentor'}</div></div></div>
  <div style="font-size:.8rem;color:var(--text-secondary);margin-bottom:10px">📧 ${m.email}</div>
  <div style="margin-bottom:12px"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:5px">Teams (${mteams.length})</div>${mteams.length?mteams.map(t=>`<span class="badge badge-blue" style="margin:2px">${t.startupName}</span>`).join(''):`<span style="font-size:.8rem;color:var(--text-muted)">None assigned</span>`}</div>
  <div style="display:flex;gap:7px"><button class="btn btn-ghost btn-sm" onclick="ITE.Pages.Admin.showAssignTeam('${m.id}')">Assign Team</button><button class="btn btn-danger btn-sm" onclick="ITE.Pages.Admin._deleteMentor('${m.id}')">Remove</button></div>
</div>`}).join('')}
</div>`;
  }

  function showAddMentor() {
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Add Mentor</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Full Name</label><input id="nm-name" class="form-control" placeholder="Dr. Rajesh Kumar"></div>
  <div class="form-group"><label class="form-label">Email</label><input id="nm-email" class="form-control" type="email" placeholder="dr.kumar@vnit.ac.in"></div>
  <div class="form-group"><label class="form-label">Specialization</label><input id="nm-spec" class="form-control" placeholder="Product Strategy & Market Entry"></div>
  <div class="form-group"><label class="form-label">Initial Password</label><input id="nm-pass" class="form-control" type="password" value="mentor123"></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Admin._submitMentor()">Add</button></div>
</div>`);
  }

  function _submitMentor() {
    const name=document.getElementById('nm-name')?.value?.trim();
    const email=document.getElementById('nm-email')?.value?.trim();
    const spec=document.getElementById('nm-spec')?.value?.trim();
    const pass=document.getElementById('nm-pass')?.value;
    if(!name||!email){ITE.App.toast('Name & email required.','error');return;}
    if(ITE.Data.getUserByEmail(email)){ITE.App.toast('Email already registered.','error');return;}
    const av=name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    ITE.Data.createUser({name,email,password:pass||'mentor123',role:'mentor',avatar:av,specialization:spec,profileComplete:true,assignedTeams:[]});
    ITE.App.toast('Mentor added!','success'); ITE.App.closeModal(); renderMentors();
  }

  function showAssignTeam(mentorId) {
    const mentor=ITE.Data.getUserById(mentorId);
    const assigned=mentor?.assignedTeams||[];
    const available=ITE.Data.getTeams().filter(t=>!assigned.includes(t.id));
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Assign Team to ${mentor?.name}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body"><div class="form-group"><label class="form-label">Select Team</label><select id="at-team" class="form-control"><option value="">Choose…</option>${available.map(t=>`<option value="${t.id}">${t.startupName}</option>`).join('')}</select></div></div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Admin._submitAssign('${mentorId}')">Assign</button></div>
</div>`);
  }

  function _submitAssign(mId) {
    const tId=document.getElementById('at-team')?.value;
    if(!tId){ITE.App.toast('Select a team.','error');return;}
    const m=ITE.Data.getUserById(mId);
    ITE.Data.updateUser(mId,{assignedTeams:[...(m?.assignedTeams||[]),tId]});
    ITE.Data.updateTeam(tId,{mentorId:mId});
    const team=ITE.Data.getTeamById(tId);
    team?.members.forEach(mb=>ITE.Data.updateUser(mb.userId,{mentorId:mId}));
    ITE.App.toast('Team assigned!','success'); ITE.App.closeModal(); renderMentors();
  }

  function _deleteMentor(id) {
    if(!confirm('Remove this mentor?')) return;
    ITE.Data.deleteUser(id); ITE.App.toast('Mentor removed.','info'); renderMentors();
  }

  /* ---- Announcements ---- */
  function renderAnnouncements() {
    const user=ITE.Auth.getCurrentUser();
    const anns=ITE.Data.getAnnouncements();
    const teams=ITE.Data.getTeams();
    ITE.App.pc().innerHTML = `
<div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div><div class="page-title">Announcements</div><div class="page-subtitle">Broadcast updates to students and mentors</div></div>
  <button class="btn btn-primary" onclick="ITE.Pages.Admin.showAnnModal()">+ New Announcement</button>
</div>
<div class="two-col">
  <div>
    <div class="section-title">All (${anns.length})</div>
    ${anns.length===0?`<div class="empty-state card"><div class="empty-state-icon">📣</div><h3>No announcements yet</h3></div>`:
    anns.map(a=>`<div class="ann-card ${a.createdByRole}-ann">
      <div class="ann-meta"><span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${a.createdByRole.toUpperCase()}</span><span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span><span style="font-size:.72rem;color:var(--text-muted)">· ${_recipLabel(a.recipients,teams)}</span></div>
      <div class="ann-title">${a.title}</div><div class="ann-body">${a.content}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div><button class="btn btn-danger btn-sm" onclick="ITE.Pages.Admin._deleteAnn('${a.id}')">Delete</button></div>
    </div>`).join('')}
  </div>
  <div>
    <div class="section-title">Quick Stats</div>
    <div class="card">${[['Total',anns.length],['Admin',anns.filter(a=>a.createdByRole==='admin').length],['Mentor',anns.filter(a=>a.createdByRole==='mentor').length],['Team-specific',anns.filter(a=>a.recipients.startsWith('team-')).length]].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border-subtle)"><span style="font-size:.875rem;color:var(--text-secondary)">${l}</span><span style="font-weight:700">${v}</span></div>`).join('')}</div>
  </div>
</div>`;
  }

  function _recipLabel(r,teams) {
    if(r==='all-students') return '📢 All Students';
    if(r==='all-mentors')  return '🧑‍🏫 All Mentors';
    if(r.startsWith('team-')){const t=teams.find(t=>t.id===r.replace('team-',''));return`👥 ${t?t.startupName:'Team'}`;}
    return r;
  }

  function showAnnModal() {
    const teams=ITE.Data.getTeams();
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">New Announcement</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Title</label><input id="an-title" class="form-control" placeholder="Announcement title…"></div>
  <div class="form-group"><label class="form-label">Message</label><textarea id="an-body" class="form-control" rows="4" placeholder="Write your announcement…"></textarea></div>
  <div class="form-group"><label class="form-label">Recipients</label><select id="an-to" class="form-control"><option value="all-students">📢 All Students</option><option value="all-mentors">🧑‍🏫 All Mentors</option>${teams.map(t=>`<option value="team-${t.id}">👥 Team: ${t.startupName}</option>`).join('')}</select></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Admin._submitAnn()">Post</button></div>
</div>`);
  }

  function _submitAnn() {
    const title=document.getElementById('an-title')?.value?.trim();
    const content=document.getElementById('an-body')?.value?.trim();
    const recipients=document.getElementById('an-to')?.value;
    if(!title||!content){ITE.App.toast('Title & content required.','error');return;}
    const u=ITE.Auth.getCurrentUser();
    ITE.Data.createAnnouncement({title,content,recipients,createdBy:u.id,createdByName:u.name,createdByRole:'admin'});
    ITE.App.toast('Announcement posted!','success'); ITE.App.closeModal(); renderAnnouncements();
  }

  function _deleteAnn(id) {
    ITE.Data.deleteAnnouncement(id); ITE.App.toast('Deleted.','info'); renderAnnouncements();
  }

  /* ---- CSV Upload ---- */
  function renderCSVUpload() {
    const approved=ITE.Data.getApproved();
    ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">CSV Upload</div><div class="page-subtitle">Manage the approved student list for registration</div></div>
<div class="two-col">
  <div class="card">
    <div class="card-header"><div class="card-title">Upload Student CSV</div></div>
    <div style="margin-bottom:16px;padding:14px;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border)">
      <div style="font-size:.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:7px">📋 Expected CSV Format:</div>
      <code style="font-size:.75rem;color:var(--accent);background:var(--accent-light);padding:8px 12px;border-radius:4px;display:block;font-family:monospace;line-height:1.6">Name,RollNo,Email<br>Aarav Mehta,24BCE001,aarav.mehta@students.vnit.ac.in</code>
    </div>
    <div class="form-group"><label class="form-label">Select CSV File</label><input id="csv-file" type="file" accept=".csv" class="form-control"></div>
    <div style="display:flex;gap:9px;margin-top:14px">
      <button class="btn btn-primary" onclick="ITE.Pages.Admin._processCSV()">Upload & Process</button>
      <button class="btn btn-ghost" onclick="ITE.Pages.Admin._downloadSample()">Download Sample</button>
    </div>
    <div id="csv-result" style="margin-top:14px"></div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Approved Students (${approved.length})</div><button class="btn btn-danger btn-sm" onclick="ITE.Pages.Admin._clearApproved()">Clear All</button></div>
    <div style="max-height:380px;overflow-y:auto">
      ${approved.length===0?`<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No approved students</h3><p>Upload a CSV to allow student registration.</p></div>`:
      `<div class="table-wrapper"><table class="data-table"><thead><tr><th>Name</th><th>Roll No</th><th>Email</th></tr></thead><tbody>${approved.map(s=>`<tr><td>${s.name}</td><td>${s.rollNo}</td><td style="font-size:.8rem">${s.email}</td></tr>`).join('')}</tbody></table></div>`}
    </div>
  </div>
</div>`;
  }

  function _processCSV() {
    const file=document.getElementById('csv-file')?.files?.[0];
    if(!file){ITE.App.toast('Select a CSV file.','error');return;}
    const reader=new FileReader();
    reader.onload=e=>{
      const lines=e.target.result.split('\n').filter(l=>l.trim());
      const data=[];
      lines.slice(1).forEach(line=>{
        const parts=line.split(',').map(p=>p.trim().replace(/^["']|["']$/g,''));
        if(parts.length>=3) data.push({name:parts[0],rollNo:parts[1],email:parts[2]});
      });
      ITE.Data.saveApproved(data);
      const r=document.getElementById('csv-result');
      if(r)r.innerHTML=`<div class="info-box success">✅ Imported <strong>${data.length}</strong> students successfully.</div>`;
      ITE.App.toast(`${data.length} students imported!`,'success');
      renderCSVUpload();
    };
    reader.readAsText(file);
  }

  function _downloadSample() {
    const csv='Name,RollNo,Email\nAarav Mehta,24BCE001,aarav.mehta@students.vnit.ac.in\nDiya Singh,24BCE002,diya.singh@students.vnit.ac.in';
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download='ite_students_template.csv'; a.click();
  }

  function _clearApproved() {
    if(!confirm('Clear all approved students?')) return;
    ITE.Data.saveApproved([]); ITE.App.toast('Cleared.','info'); renderCSVUpload();
  }

  return {
    renderDashboard, renderStartups, renderStudents, renderMentors, renderAnnouncements, renderCSVUpload,
    showTeamDetail, advanceStage, showAddStartup, _submitAddStartup,
    showAddMentor, _submitMentor, showAssignTeam, _submitAssign, _deleteMentor,
    showAnnModal, _submitAnn, _deleteAnn,
    _processCSV, _downloadSample, _clearApproved, _filterStudents,
  };
})();
