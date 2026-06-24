/* =====================================================
   ITE STARTUP LAUNCH PAD – ADMIN PAGES (admin.js)
   ===================================================== */
window.ITE = window.ITE || {};
ITE.Pages = ITE.Pages || {};

ITE.Pages.Admin = (function () {

  /* ---- Dashboard ---- */
  async function renderDashboard() {
    try {
      const teams_raw    = ITE.Data.getTeams();
      const teams = Array.isArray(teams_raw) ? teams_raw : (teams_raw?.items || []);
      const STAGES = ITE.App.STAGES || [];
      const stageCounts = STAGES.map((_,i) => teams.filter(t=>t?.stage===i).length);

      ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">Admin Dashboard</div><div class="page-subtitle">${new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div></div>
<div class="stats-grid">
  <div class="stat-card" style="--c:#2563EB"><div class="stat-value" id="dash-stat-students">-</div><div class="stat-label">Total Students</div><div class="stat-sub" id="dash-sub-students">Loading...</div></div>
  <div class="stat-card" style="--c:#10B981"><div class="stat-value" id="dash-stat-teams">-</div><div class="stat-label">Active Teams</div><div class="stat-sub">Startup ventures</div></div>
  <div class="stat-card" style="--c:#8B5CF6"><div class="stat-value" id="dash-stat-mentors">-</div><div class="stat-label">Mentors</div><div class="stat-sub">Faculty & industry</div></div>
  <div class="stat-card" style="--c:#F59E0B"><div class="stat-value" id="dash-stat-anns">-</div><div class="stat-label">Announcements</div><div class="stat-sub">Total posted</div></div>
  <div class="stat-card" style="--c:#EF4444"><div class="stat-value" id="dash-stat-tasks">-</div><div class="stat-label">Tasks</div><div class="stat-sub" id="dash-sub-tasks">Loading...</div></div>
</div>
<div class="two-col">
  <div class="card">
    <div class="card-header"><div class="card-title">Startup Stage Distribution</div></div>
    ${STAGES.map((s,i)=>`<div class="analytics-bar"><div class="analytics-bar-label"><span>${s?.label||'Stage'}</span><span>${stageCounts[i]||0}</span></div><div class="analytics-bar-track"><div class="analytics-bar-fill" style="width:${teams.length?((stageCounts[i]||0)/teams.length*100):0}%;background:${i<2?'#10B981':i<4?'#2563EB':'#8B5CF6'}"></div></div></div>`).join('')}
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Recent Announcements</div><a href="#/admin/announcements" class="btn btn-ghost btn-sm">View All</a></div>
    <div id="dash-recent-anns"><div style="padding:20px;text-align:center;color:var(--text-muted);font-size:.85rem">Loading live announcements...</div></div>
  </div>
</div>
<div class="card mt-6">
  <div class="card-header"><div class="card-title">Team Rankings</div><a href="#/admin/startups" class="btn btn-ghost btn-sm">View All</a></div>
  <div class="table-wrapper"><table class="data-table"><thead><tr><th>Rank</th><th>Startup</th><th>Industry</th><th>Mentor</th><th>Stage</th><th>Progress</th></tr></thead><tbody>
  ${[...teams].sort((a,b)=>(b?.stage||0)-(a?.stage||0)).map((t,i)=>{const m=ITE.Data.getUserById(t?.mentorId);return`<tr><td><strong>#${i+1}</strong></td><td><div style="font-weight:600">${t?.startupName||'Unnamed'}</div></td><td><span class="badge badge-blue">${(t?.industry||'').split(' ')[0]||'Other'}</span></td><td>${m?m.name:'—'}</td><td><span class="badge ${(t?.stage||0)>=4?'badge-green':'badge-blue'}">${STAGES[t?.stage||0]?.label||'Stage'}</span></td><td><div class="mini-progress" style="min-width:90px">${STAGES.map((_,j)=>`<div class="mini-step ${j<(t?.stage||0)?'done':j===(t?.stage||0)?'active':''}"></div>`).join('')}</div></td></tr>`}).join('')}
  </tbody></table></div>
</div>`;

      // Fire both API calls concurrently — single source of truth for announcements
      fetchDashboardStats();
      fetchRecentAnnouncements();
    } catch (e) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;"><h3>Error boundary caught error:</h3><pre>${e.stack}</pre></div>`;
      console.error(e);
    }
  }

  async function fetchRecentAnnouncements() {
    const container = document.getElementById('dash-recent-anns');
    if (!container) return;
    try {
      // Same endpoint used by the main Announcements page — single source of truth
      const anns = await ITE.API.get('/announcements');
      // Sort newest-first and take top 4
      const recent = (Array.isArray(anns) ? anns : [])
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 4);
      if (recent.length === 0) {
        container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:.85rem">No announcements yet.</div>`;
        return;
      }
      container.innerHTML = recent.map(a => `
        <div class="ann-card ${a?.createdByRole}-ann">
          <div class="ann-meta">
            <span class="badge ${a?.createdByRole==='admin'?'badge-blue':'badge-green'}">${(a?.createdByRole||'unknown').toUpperCase()}</span>
            <span style="font-size:.72rem;color:var(--text-muted)">${a?.createdByName||'Unknown'}</span>
          </div>
          <div class="ann-title">${a?.title||'Untitled'}</div>
          <div class="ann-date">${a?.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : ''}</div>
        </div>`).join('');
    } catch(err) {
      console.error('Failed to load recent announcements:', err);
      if (container) container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:.85rem">Could not load announcements.</div>`;
    }
  }

  async function fetchDashboardStats() {
    try {
      const stats = await ITE.API.get('/admin/stats-summary');
      if(stats) {
        document.getElementById('dash-stat-students').textContent = stats.students.total;
        document.getElementById('dash-sub-students').textContent = `${stats.students.in_teams} in teams`;
        document.getElementById('dash-stat-teams').textContent = stats.teams;
        document.getElementById('dash-stat-mentors').textContent = stats.mentors;
        document.getElementById('dash-stat-anns').textContent = stats.announcements;
        document.getElementById('dash-stat-tasks').textContent = stats.tasks.total;
        document.getElementById('dash-sub-tasks').textContent = `${stats.tasks.submissions} submissions`;
      }
    } catch(err) {
      console.error('Failed to load dashboard stats:', err);
      document.getElementById('dash-stat-students').textContent = "0";
      document.getElementById('dash-sub-students').textContent = "Error loading";
      document.getElementById('dash-stat-teams').textContent = "0";
      document.getElementById('dash-stat-mentors').textContent = "0";
      document.getElementById('dash-stat-anns').textContent = "0";
      document.getElementById('dash-stat-tasks').textContent = "0";
      document.getElementById('dash-sub-tasks').textContent = "Error loading";
    }
  }

  /* ---- Startups ---- */
  function renderStartups() {
    try {
      const teams_raw = ITE.Data.getTeams();
      const teams = Array.isArray(teams_raw) ? teams_raw : (teams_raw?.items || []);
      ITE.App.pc().innerHTML = `
<div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div><div class="page-title">Startups</div><div class="page-subtitle">${teams.length} startup ventures registered</div></div>
  <button class="btn btn-primary" onclick="ITE.Pages.Admin.showAddStartup()">Add Startup</button>
</div>
<div class="cards-grid">
  ${teams.length===0?`<div class="empty-state card"><h3>No startups registered yet</h3></div>`:
  teams.map(t=>{const m=ITE.Data.getUserById(t?.mentorId);const ceo=ITE.Data.getUserById(t?.ceoId);return`
<div class="card" style="cursor:pointer" onclick="ITE.Pages.Admin.showTeamDetail('${t?.id}')">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div style="width:48px;height:48px;border-radius:50%;background:var(--accent-light);color:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:1.25rem">${(t?.startupName||'?')[0]}</div>
    <div><div style="font-family:var(--font-display);font-size:1rem;font-weight:700">${t?.startupName||'Unnamed'}</div><div style="font-size:.72rem;color:var(--text-muted)">${t?.industry||'Other'}</div></div>
  </div>
  <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:14px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${t?.problemStatement||'No description'}</p>
  <div style="margin-top:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <span style="font-size:.8rem;color:var(--text-muted)">CEO: ${ceo?ceo.name:'Unassigned'}</span>
      <span class="badge ${(t?.stage||0)>=4?'badge-green':'badge-blue'}">Stage ${(t?.stage||0)+1} of 6</span>
    </div>
    ${ITE.App.renderProgressTracker(t?.stage||0)}
    <div class="divider"></div>
    <div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--text-muted)">
      <span>Mentor: ${m?m.name:'Unassigned'}</span><span>${(t?.members||[]).length} members</span>
    </div>
  </div>
</div>`}).join('')}
</div>`;
    } catch (e) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;"><h3>Error boundary caught error:</h3><pre>${e.stack}</pre></div>`;
      console.error(e);
    }
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
    ${t.stage<5?`<button class="btn btn-primary btn-sm" onclick="ITE.Pages.Admin.advanceStage('${t.id}')">Advance Stage</button>`:`<span class="badge badge-green">All Stages Completed</span>`}
  </div>
</div>
<div class="modal-footer">
  <button class="btn btn-ghost" onclick="ITE.App.closeModal()">Close</button>
  <button class="btn btn-ghost" onclick="ITE.Pages.Admin.showEditStartup('${t.id}')">Edit</button>
  <button class="btn btn-danger" onclick="ITE.Pages.Admin.deleteStartup('${t.id}')">Delete</button>
</div>
</div>`);
  }

  async function deleteStartup(id) {
    if(!confirm('Are you sure you want to delete this startup?')) return;
    try {
      await ITE.API.del('/teams/' + id);
      // Fallback for local UI state
      const ts = ITE.Data.getTeams().filter(t => t.id !== id);
      localStorage.setItem('ite_teams', JSON.stringify(ts));
      ITE.App.toast('Startup successfully deleted.','info');
      ITE.App.closeModal(); renderStartups();
    } catch(e) {
      ITE.App.toast(e.message, 'error');
    }
  }

  function showEditStartup(id) {
    const t = ITE.Data.getTeamById(id); if(!t) return;
    const mentors = ITE.Data.getMentors();
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Edit Startup</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div id="es-err" class="form-error-box"></div>
  <div class="form-group"><label class="form-label">Startup Name *</label><input id="es-name" class="form-control" value="${t.startupName}"></div>
  <div class="form-group"><label class="form-label">Industry *</label><select id="es-ind" class="form-control"><option value="${t.industry}">${t.industry}</option>${['Agriculture & Food Tech','Education Technology','Healthcare','Fintech','Sustainability','Safety Tech','Smart Cities','E-Commerce','SaaS','Other'].map(i=>`<option>${i}</option>`).join('')}</select></div>
  <div class="form-group"><label class="form-label">Problem Statement *</label><textarea id="es-prob" class="form-control" rows="3">${t.problemStatement||''}</textarea></div>
  <div class="form-group"><label class="form-label">Assign Mentor</label><select id="es-mentor" class="form-control"><option value="">Select mentor</option>${mentors.map(m=>`<option value="${m.id}" ${t.mentorId===m.id?'selected':''}>${m.name}</option>`).join('')}</select></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Admin._submitEditStartup('${t.id}')">Save</button></div>
</div>`);
  }

  async function _submitEditStartup(id) {
    const name=document.getElementById('es-name')?.value?.trim();
    const ind=document.getElementById('es-ind')?.value;
    const prob=document.getElementById('es-prob')?.value?.trim();
    const mId=document.getElementById('es-mentor')?.value;
    if(!name||!ind||!prob){document.getElementById('es-err').style.display='block';document.getElementById('es-err').textContent='Please fill in all required fields.';return;}
    try {
      await ITE.API.patch('/teams/' + id, { startupName: name, industry: ind, problemStatement: prob, mentorId: mId });
      ITE.Data.updateTeam(id, { startupName: name, industry: ind, problemStatement: prob, mentorId: mId });
      ITE.App.toast('Startup successfully updated.','success'); ITE.App.closeModal(); renderStartups();
    } catch(e) {
      ITE.App.toast(e.message, 'error');
    }
  }

  function advanceStage(id) {
    const t = ITE.Data.getTeamById(id); if(!t||t.stage>=5) return;
    ITE.Data.updateTeam(id,{stage:t.stage+1});
    ITE.App.toast(`${t.startupName} advanced to ${ITE.App.STAGES[t.stage+1].label}`,'success');
    ITE.App.closeModal(); renderStartups();
  }

  function showAddStartup() {
    const mentors = ITE.Data.getMentors();
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Add New Startup</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div id="as-err" class="form-error-box"></div>
  <div class="form-group"><label class="form-label">Startup Name *</label><input id="as-name" class="form-control" placeholder="Enter startup name"></div>
  <div class="form-group"><label class="form-label">Industry *</label><select id="as-ind" class="form-control"><option value="">Select industry</option>${['Agriculture & Food Tech','Education Technology','Healthcare','Fintech','Sustainability','Safety Tech','Smart Cities','E-Commerce','SaaS','Other'].map(i=>`<option>${i}</option>`).join('')}</select></div>
  <div class="form-group"><label class="form-label">Problem Statement *</label><textarea id="as-prob" class="form-control" rows="3" placeholder="Describe the problem this startup addresses"></textarea></div>
  <div class="form-group"><label class="form-label">Description</label><textarea id="as-desc" class="form-control" rows="3" placeholder="Enter detailed description"></textarea></div>
  <div class="form-group"><label class="form-label">Assign Mentor</label><select id="as-mentor" class="form-control"><option value="">Select mentor</option>${mentors.map(m=>`<option value="${m.id}">${m.name}</option>`).join('')}</select></div>
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
    if(!name||!ind||!prob){document.getElementById('as-err').style.display='block';document.getElementById('as-err').textContent='Please fill in all required fields.';return;}
    const team=ITE.Data.createTeam({startupName:name,industry:ind,problemStatement:prob,description:desc,mentorId:mId,ceoId:null,members:[],stage:0});
    if(mId){const m=ITE.Data.getUserById(mId);if(m)ITE.Data.updateUser(mId,{assignedTeams:[...(m.assignedTeams||[]),team.id]});}
    ITE.App.toast('Startup successfully created.','success'); ITE.App.closeModal(); renderStartups();
  }

  /* ---- Students ---- */
  function renderStudents() {
    const students = ITE.Data.getStudents();
    ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">Students</div><div class="page-subtitle">${students.length} enrolled students</div></div>
<div class="card" style="margin-bottom:14px"><div class="search-bar" style="max-width:380px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" id="stu-search" placeholder="Search by name, roll number, or branch..." oninput="ITE.Pages.Admin._filterStudents()"></div></div>
<div class="card"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Student</th><th>Roll Number</th><th>Branch</th><th>Team</th><th>Role</th><th>Mentor</th><th>Status</th><th>Actions</th></tr></thead><tbody id="stu-tbody">${_studentRows(students)}</tbody></table></div></div>`;
  }

  function _studentRows(list) {
    return list.map(s=>{
      const team=s.teamId?ITE.Data.getTeamById(s.teamId):null;
      const mentor=s.mentorId?ITE.Data.getUserById(s.mentorId):null;
      return`<tr><td><div style="display:flex;align-items:center;gap:9px"><div style="width:34px;height:34px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:#FFF;flex-shrink:0">${s.avatar}</div><div><div style="font-weight:600">${s.name}</div><div style="font-size:.72rem;color:var(--text-muted)">${s.email}</div></div></div></td><td>${s.rollNo||'—'}</td><td>${s.branch||'—'}</td><td>${team?team.startupName:`<span style="color:var(--text-muted)">Unassigned</span>`}</td><td>${s.teamRole?`<span class="badge badge-blue">${s.teamRole}</span>`:'—'}</td><td>${mentor?mentor.name:`<span style="color:var(--text-muted)">Unassigned</span>`}</td><td><span class="badge ${s.teamId?'badge-green':'badge-yellow'}">${s.teamId?'Assigned':'Unassigned'}</span></td><td><button class="btn btn-ghost btn-sm" onclick="ITE.Pages.Admin.showEditStudent('${s.id}')">Edit</button></td></tr>`;
    }).join('');
  }

  function _filterStudents() {
    const q=document.getElementById('stu-search')?.value?.toLowerCase()||'';
    const f=ITE.Data.getStudents().filter(s=>s.name.toLowerCase().includes(q)||(s.rollNo||'').toLowerCase().includes(q)||(s.branch||'').toLowerCase().includes(q));
    const tb=document.getElementById('stu-tbody');
    if(tb) tb.innerHTML=_studentRows(f);
  }

  function showEditStudent(id) {
    const s = ITE.Data.getUserById(id); if(!s) return;
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Edit Student</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Full Name</label><input id="est-name" class="form-control" value="${s.name}"></div>
  <div class="form-group"><label class="form-label">Roll Number</label><input id="est-roll" class="form-control" value="${s.rollNo||''}"></div>
  <div class="form-group"><label class="form-label">Branch</label><input id="est-branch" class="form-control" value="${s.branch||''}"></div>
  <div class="form-group"><label class="form-label">Email</label><input id="est-email" class="form-control" value="${s.email}" disabled></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Admin._submitEditStudent('${s.id}')">Save</button></div>
</div>`);
  }

  function _submitEditStudent(id) {
    const name=document.getElementById('est-name')?.value?.trim();
    const rollNo=document.getElementById('est-roll')?.value?.trim();
    const branch=document.getElementById('est-branch')?.value?.trim();
    if(!name){ITE.App.toast('Name is required.','error');return;}
    ITE.Data.updateUser(id, { name, rollNo, branch });
    ITE.App.toast('Student successfully updated.','success'); ITE.App.closeModal(); renderStudents();
  }

  /* ---- Mentors ---- */
  async function renderMentors() {
    ITE.App.pc().innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading live mentor data...</div>`;
    try {
      const mentors = await ITE.API.get('/users/mentors');
      const teams_raw = ITE.Data.getTeams();
      const teams = Array.isArray(teams_raw) ? teams_raw : (teams_raw?.items || []);
      ITE.App.pc().innerHTML = `
<div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div><div class="page-title">Mentors</div><div class="page-subtitle">${mentors.length} faculty and industry mentors</div></div>
  <button class="btn btn-primary" onclick="ITE.Pages.Admin.showAddMentor()">Add Mentor</button>
</div>
<div class="cards-grid">
${mentors.length===0?`<div class="empty-state card"><h3>No mentors added yet</h3></div>`:mentors.map(m=>{const mteams=teams.filter(t=>t.mentorId===m.id);return`<div class="card">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><div style="width:50px;height:50px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#FFF">${m.avatar}</div><div><div style="font-family:var(--font-display);font-size:1rem;font-weight:700">${m.name}</div><div style="font-size:.8rem;color:var(--text-muted)">${m.specialization||'Faculty Mentor'}</div></div></div>
  <div style="font-size:.8rem;color:var(--text-secondary);margin-bottom:10px">${m.email}</div>
  <div style="margin-bottom:12px"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:5px">Teams (${mteams.length})</div>${mteams.length?mteams.map(t=>`<span class="badge badge-blue" style="margin:2px">${t.startupName}</span>`).join(''):`<span style="font-size:.8rem;color:var(--text-muted)">No assigned teams</span>`}</div>
  <div style="display:flex;gap:7px"><button class="btn btn-ghost btn-sm" onclick="ITE.Pages.Admin.showAssignTeam('${m.id}')">Assign Team</button><button class="btn btn-ghost btn-sm" onclick="ITE.Pages.Admin.showEditMentor('${m.id}','${(m.name||'').replace(/'/g,'')}','${(m.email||'').replace(/'/g,'')}','${(m.specialization||'').replace(/'/g,'')}')" >Edit</button><button class="btn btn-danger btn-sm" onclick="ITE.Pages.Admin._deleteMentor('${m.id}')">Remove</button></div>
</div>`}).join('')}
</div>`;
    } catch(err) {
      ITE.App.pc().innerHTML = `<div class="empty-state card"><h3>Failed to load mentors</h3><p>${err.message}</p></div>`;
    }
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

  async function _submitMentor() {
    const name=document.getElementById('nm-name')?.value?.trim();
    const email=document.getElementById('nm-email')?.value?.trim();
    const spec=document.getElementById('nm-spec')?.value?.trim();
    const pass=document.getElementById('nm-pass')?.value;
    if(!name||!email){ITE.App.toast('Name and email are required.','error');return;}
    try {
      await ITE.API.post('/users/mentors', { name, email, password: pass||'mentor123', specialization: spec });
      ITE.App.toast('Mentor successfully added to live database.','success'); 
      ITE.App.closeModal(); 
      renderMentors();
    } catch(err) {
      ITE.App.toast(err.message,'error');
    }
  }

  function showEditMentor(id, name='', email='', spec='') {
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Edit Mentor</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Full Name</label><input id="em-name" class="form-control" value="${name}"></div>
  <div class="form-group"><label class="form-label">Email</label><input id="em-email" class="form-control" value="${email}" disabled></div>
  <div class="form-group"><label class="form-label">Specialization</label><input id="em-spec" class="form-control" value="${spec}"></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Admin._submitEditMentor('${id}')">Save</button></div>
</div>`);
  }

  async function _submitEditMentor(id) {
    const name=document.getElementById('em-name')?.value?.trim();
    const spec=document.getElementById('em-spec')?.value?.trim();
    if(!name){ITE.App.toast('Name is required.','error');return;}
    try {
      await ITE.API.patch('/users/' + id, { name, specialization: spec });
      ITE.App.toast('Mentor successfully updated in live database.','success'); 
      ITE.App.closeModal(); 
      renderMentors();
    } catch(err) {
      ITE.App.toast(err.message,'error');
    }
  }

  function showAssignTeam(mentorId) {
    const mentor=ITE.Data.getUserById(mentorId);
    const assigned=mentor?.assignedTeams||[];
    const available=ITE.Data.getTeams().filter(t=>!assigned.includes(t.id));
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Assign Team to ${mentor?.name}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  ${available.length === 0 
    ? `<div style="text-align:center; padding: 20px; color: var(--text-secondary);">No more unassigned teams available.</div>` 
    : `<div class="form-group"><label class="form-label">Select Team</label><select id="at-team" class="form-control"><option value="">Choose...</option>${available.map(t=>`<option value="${t.id}">${t.startupName}</option>`).join('')}</select></div>`
  }
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button>${available.length > 0 ? `<button class="btn btn-primary" onclick="ITE.Pages.Admin._submitAssign('${mentorId}')">Assign</button>` : ''}</div>
</div>`);
  }

  async function _submitAssign(mId) {
    const tId=document.getElementById('at-team')?.value;
    if(!tId){ITE.App.toast('Please select a team.','error');return;}
    try {
      await ITE.API.patch(`/users/${mId}/assign-team?team_id=${tId}`, {});
      ITE.App.toast('Team successfully assigned in live database.','success'); 
      ITE.App.closeModal(); 
      renderMentors();
    } catch(err) {
      ITE.App.toast(err.message,'error');
    }
  }

  async function _deleteMentor(id) {
    if(!confirm('Are you sure you want to remove this mentor? Their team assignments will be cleared.')) return;
    try {
      await ITE.API.del('/users/' + id);
      ITE.App.toast('Mentor successfully removed from live database.','info'); 
      renderMentors();
    } catch(err) {
      ITE.App.toast(err.message,'error');
    }
  }

  /* ---- Announcements ---- */
  async function renderAnnouncements() {
    try {
      ITE.App.pc().innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">Loading live announcements...</div>`;
      const user_raw=ITE.Auth.getCurrentUser();
      const user = user_raw || {};
      let anns = [];
      try {
        anns = await ITE.API.get('/announcements');
      } catch (err) {
        console.error('Failed to fetch live announcements:', err);
        ITE.App.toast('Failed to load live announcements.', 'error');
      }
      const teams_raw=ITE.Data.getTeams();
      const teams = Array.isArray(teams_raw) ? teams_raw : (teams_raw?.items || []);
      ITE.App.pc().innerHTML = `
<div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div><div class="page-title">Announcements</div><div class="page-subtitle">Broadcast updates to students and mentors</div></div>
  <button class="btn btn-primary" onclick="ITE.Pages.Admin.showAnnModal()">New Announcement</button>
</div>
<div class="two-col">
  <div>
    <div class="section-title">Announcements (${anns.length})</div>
    ${anns.length===0?`<div class="empty-state card"><h3>No announcements posted yet</h3></div>`:
    anns.map(a=>`<div class="ann-card ${a?.createdByRole}-ann">
      <div class="ann-meta"><span class="badge ${a?.createdByRole==='admin'?'badge-blue':'badge-green'}">${(a?.createdByRole||'unknown').toUpperCase()}</span><span style="font-size:.72rem;color:var(--text-muted)">${a?.createdByName||'Unknown'}</span><span style="font-size:.72rem;color:var(--text-muted)">· ${_recipLabel(a?.recipients||'',teams)}</span></div>
      <div class="ann-title">${a?.title||'Untitled'}</div><div class="ann-body">${a?.body||a?.content||''}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><div class="ann-date">${a?.createdAt ? new Date(a.createdAt).toLocaleString('en-IN') : ''}</div><button class="btn btn-danger btn-sm" onclick="ITE.Pages.Admin._deleteAnn('${a?.id}')">Delete</button></div>
    </div>`).join('')}
  </div>
  <div>
    <div class="section-title">Quick Stats</div>
    <div class="card">${[['Total',anns.length],['Admin',anns.filter(a=>a?.createdByRole==='admin').length],['Mentor',anns.filter(a=>a?.createdByRole==='mentor').length],['Team-specific',anns.filter(a=>(a?.recipients||'').startsWith('team-')).length]].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border-subtle)"><span style="font-size:.875rem;color:var(--text-secondary)">${l}</span><span style="font-weight:700">${v}</span></div>`).join('')}</div>
  </div>
</div>`;
    } catch (e) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;"><h3>Error boundary caught error:</h3><pre>${e.stack}</pre></div>`;
      console.error(e);
    }
  }

  function _recipLabel(r,teams) {
    if(!r) return '';
    if(r==='all') return 'Everyone';
    if(r==='all-students' || r==='students') return 'All Students';
    if(r==='all-mentors' || r==='mentors')  return 'All Mentors';
    if(typeof r === 'string' && r.startsWith('team-')){const t=teams.find(t=>t?.id===r.replace('team-',''));return`Team: ${t?t.startupName:'Team'}`;}
    return r;
  }

  function showAnnModal() {
    const teams=ITE.Data.getTeams();
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">New Announcement</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Title</label><input id="an-title" class="form-control" placeholder="Announcement title"></div>
  <div class="form-group"><label class="form-label">Message</label><textarea id="an-body" class="form-control" rows="4" placeholder="Write your announcement message here"></textarea></div>
  <div class="form-group"><label class="form-label">Recipients</label><select id="an-to" class="form-control"><option value="all">Everyone</option><option value="students">All Students</option><option value="mentors">All Mentors</option>${teams.map(t=>`<option value="team-${t.id}">Team: ${t.startupName}</option>`).join('')}</select></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Admin._submitAnn()">Post</button></div>
</div>`);
  }

  async function _submitAnn() {
    const title=document.getElementById('an-title')?.value?.trim();
    const content=document.getElementById('an-body')?.value?.trim();
    let recipients=document.getElementById('an-to')?.value;
    if(!title||!content){ITE.App.toast('Title and content are required.','error');return;}
    try {
      let teamId = null;
      if(recipients.startsWith('team-')) {
        teamId = recipients.replace('team-', '');
      }
      await ITE.API.post('/announcements', { title: title, body: content, recipients: recipients, teamId: teamId });
      ITE.App.toast('Announcement successfully posted to live database.','success'); 
      ITE.App.closeModal(); 
      renderAnnouncements();
    } catch(err) {
      ITE.App.toast('Failed to post: ' + err.message, 'error');
    }
  }

  async function _deleteAnn(id) {
    if(!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await ITE.API.del('/announcements/' + id);
      ITE.App.toast('Announcement successfully deleted from live database.','info'); 
      renderAnnouncements();
    } catch(err) {
      ITE.App.toast('Failed to delete: ' + err.message, 'error');
    }
  }

  /* ---- CSV Upload ---- */
  function renderCSVUpload() {
    try {
      const approved_raw=ITE.Data.getApproved();
      const approved = Array.isArray(approved_raw) ? approved_raw : (approved_raw?.items || []);
      ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">CSV Upload</div><div class="page-subtitle">Manage the approved student list for registration</div></div>
<div class="two-col">
  <div class="card">
    <div class="card-header"><div class="card-title">Upload Student CSV</div></div>
    <div style="margin-bottom:16px;padding:14px;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border)">
      <div style="font-size:.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:7px">Expected CSV Format:</div>
      <code style="font-size:.75rem;color:var(--accent);background:var(--accent-light);padding:8px 12px;border-radius:4px;display:block;font-family:monospace;line-height:1.6">Name,RollNo,Email<br>Aarav Mehta,24BCE001,aarav.mehta@students.vnit.ac.in</code>
    </div>
    <div class="form-group"><label class="form-label">Select CSV File</label><input id="csv-file" type="file" accept=".csv" class="form-control"></div>
    <div style="display:flex;gap:9px;margin-top:14px">
      <button class="btn btn-primary" onclick="ITE.Pages.Admin._processCSV()">Upload and Process</button>
      <button class="btn btn-ghost" onclick="ITE.Pages.Admin._downloadSample()">Download Sample</button>
    </div>
    <div id="csv-result" style="margin-top:14px"></div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Approved Students (${approved.length})</div><button class="btn btn-danger btn-sm" onclick="ITE.Pages.Admin._clearApproved()">Clear All</button></div>
    <div style="max-height:380px;overflow-y:auto">
      ${approved.length===0?`<div class="empty-state"><h3>No approved students list found</h3><p>Upload a CSV file to authorize student registration.</p></div>`:
      `<div class="table-wrapper"><table class="data-table"><thead><tr><th>Name</th><th>Roll Number</th><th>Email</th></tr></thead><tbody>${approved.map(s=>`<tr><td>${s?.name||''}</td><td>${s?.rollNo||''}</td><td style="font-size:.8rem">${s?.email||''}</td></tr>`).join('')}</tbody></table></div>`}
    </div>
  </div>
</div>`;
    } catch (e) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;"><h3>Error boundary caught error:</h3><pre>${e.stack}</pre></div>`;
      console.error(e);
    }
  }

  async function _processCSV() {
    const file=document.getElementById('csv-file')?.files?.[0];
    if(!file){ITE.App.toast('Please select a CSV file.','error');return;}
    
    // Upload to backend
    try {
      const formData = new FormData();
      formData.append("file", file);
      await ITE.API.upload('/users/approved', formData);
    } catch(err) {
      console.error(err);
      ITE.App.toast('Failed to upload to backend: ' + err.message, 'error');
      return;
    }

    const reader=new FileReader();
    reader.onload=e=>{
      const lines=e.target.result.split('\n').filter(l=>l.trim());
      const data=[];
      lines.slice(1).forEach(line=>{
        const parts=line.split(',').map(p=>p.trim().replace(/^["']|["']$/g,''));
        if(parts.length>=3) {
          // Check if parts[2] looks like an email. If parts has 4 (S.No included), email is parts[3]
          let email = parts[2];
          let name = parts[0];
          let rollNo = parts[1];
          if(parts.length === 4 && parts[3].includes('@')) {
            name = parts[1]; rollNo = parts[2]; email = parts[3];
          }
          data.push({name, rollNo, email});
        }
      });
      ITE.Data.saveApproved(data);
      const r=document.getElementById('csv-result');
      if(r)r.innerHTML=`<div class="info-box success">Imported <strong>${data.length}</strong> students successfully.</div>`;
      ITE.App.toast(`${data.length} students successfully imported.`,'success');
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
    if(!confirm('Are you sure you want to clear all approved students?')) return;
    ITE.Data.saveApproved([]); ITE.App.toast('Approved student list cleared.','info'); renderCSVUpload();
  }

  return {
    renderDashboard, renderStartups, renderStudents, renderMentors, renderAnnouncements, renderCSVUpload,
    showTeamDetail, advanceStage, showAddStartup, _submitAddStartup, deleteStartup, showEditStartup, _submitEditStartup,
    showAddMentor, _submitMentor, showAssignTeam, _submitAssign, _deleteMentor, showEditMentor, _submitEditMentor,
    showEditStudent, _submitEditStudent,
    showAnnModal, _submitAnn, _deleteAnn,
    _processCSV, _downloadSample, _clearApproved, _filterStudents,
  };
})();
