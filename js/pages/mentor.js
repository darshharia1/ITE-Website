/* =====================================================
   ITE STARTUP LAUNCH PAD – MENTOR PAGES (mentor.js)
   ===================================================== */
window.ITE = window.ITE || {};
ITE.Pages = ITE.Pages || {};

ITE.Pages.Mentor = (function () {

  function _rc() { return ITE.App.roleColor; }

  function renderDashboard() {
    const user = ITE.Auth.getCurrentUser();
    const teamIds = user.assignedTeams || [];
    const teams = teamIds.map(id => ITE.Data.getTeamById(id)).filter(Boolean);
    const students = ITE.Data.getStudents().filter(s => s.mentorId === user.id);
    const anns = ITE.Data.getAnnouncementsForUser(user);
    const myAnns = anns.filter(a => a.createdBy === user.id);

    ITE.App.pc().innerHTML = `
<div class="page-header">
  <div class="page-title">Welcome, ${user.name.split(' ').slice(0,2).join(' ')} 👋</div>
  <div class="page-subtitle">${user.specialization||'Faculty Mentor'} · ${teams.length} team${teams.length!==1?'s':''} assigned</div>
</div>
<div class="stats-grid">
  ${[['🚀','My Teams',teams.length,'#2563EB'],['👨‍🎓','Students',students.length,'#10B981'],['📣','Announcements Sent',myAnns.length,'#8B5CF6'],['📊','Avg Stage',teams.length?(teams.reduce((a,t)=>a+t.stage,0)/teams.length).toFixed(1):'—','#F59E0B']].map(([ico,lbl,val,col])=>`<div class="stat-card"><div class="stat-icon" style="background:${col}20;color:${col}">${ico}</div><div class="stat-value">${val}</div><div class="stat-label">${lbl}</div></div>`).join('')}
</div>

<div class="section-title">My Teams</div>
${teams.length===0?`<div class="empty-state card"><div class="empty-state-icon">🚀</div><h3>No teams assigned yet</h3><p>Contact admin to get teams assigned.</p></div>`:
`<div class="cards-grid">${teams.map(t=>_teamCard(t)).join('')}</div>`}

<div class="section-title mt-6">Recent Announcements</div>
${anns.length===0?`<p style="color:var(--text-muted);font-size:.875rem">No announcements yet.</p>`:
anns.slice(0,3).map(a=>`<div class="ann-card ${a.createdByRole}-ann"><div class="ann-meta"><span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${a.createdByRole.toUpperCase()}</span><span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span></div><div class="ann-title">${a.title}</div><div class="ann-body">${a.content}</div><div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div></div>`).join('')}`;
  }

  function _teamCard(team) {
    const ceo = ITE.Data.getUserById(team.ceoId);
    return `<div class="team-card" onclick="ITE.Pages.Mentor.showTeamDetail('${team.id}')">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:42px;height:42px;border-radius:var(--radius-sm);background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:1.25rem">🚀</div>
      <div><div style="font-family:var(--font-display);font-weight:700;font-size:.9375rem">${team.startupName}</div><div style="font-size:.72rem;color:var(--text-muted)">${team.industry}</div></div>
    </div>
    <span class="badge ${team.stage>=4?'badge-green':'badge-blue'}">S${team.stage+1}</span>
  </div>
  <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${team.problemStatement}</p>
  <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:10px">👑 ${ceo?ceo.name:'No CEO'} · 👥 ${team.members.length} members</div>
  <div style="margin-top:auto"><div style="font-size:.72rem;color:var(--text-muted);margin-bottom:5px">${ITE.App.STAGES[team.stage]?.emoji} ${ITE.App.STAGES[team.stage]?.label}</div><div class="mini-progress">${ITE.App.STAGES.map((_,i)=>`<div class="mini-step ${i<team.stage?'done':i===team.stage?'active':''}"></div>`).join('')}</div></div>
</div>`;
  }

  function renderTeams() {
    const user = ITE.Auth.getCurrentUser();
    const teamIds = user.assignedTeams || [];
    const teams = teamIds.map(id => ITE.Data.getTeamById(id)).filter(Boolean);
    ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">My Teams</div><div class="page-subtitle">${teams.length} startup${teams.length!==1?'s':''} under your mentorship</div></div>
${teams.length===0?`<div class="empty-state card"><div class="empty-state-icon">🚀</div><h3>No teams assigned</h3></div>`:
teams.map(t=>_fullTeamView(t, user)).join('')}`;
  }

  function _fullTeamView(team, user) {
    const members = team.members.map(m=>({...m, user:ITE.Data.getUserById(m.userId)}));
    const ceo = ITE.Data.getUserById(team.ceoId);
    const students = ITE.Data.getStudents().filter(s=>s.mentorId===user.id);

    return `<div class="card mb-4" style="margin-bottom:20px">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px">
    <div>
      <h2 style="font-family:var(--font-display);font-size:1.375rem;font-weight:800;margin-bottom:5px">${team.startupName}</h2>
      <div style="display:flex;gap:7px;flex-wrap:wrap"><span class="badge badge-blue">${team.industry}</span><span class="badge ${team.stage>=4?'badge-green':'badge-blue'}">${ITE.App.STAGES[team.stage]?.emoji} ${ITE.App.STAGES[team.stage]?.label}</span></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="ITE.Pages.Mentor.showAssignCEO('${team.id}')">👑 Assign CEO</button>
      <button class="btn btn-primary btn-sm" onclick="ITE.Pages.Mentor._advanceStage('${team.id}')">Advance Stage →</button>
    </div>
  </div>
  <div class="two-col" style="margin-bottom:18px">
    <div style="padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm)"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:5px">Problem Statement</div><p style="font-size:.875rem;color:var(--text-secondary);line-height:1.6">${team.problemStatement}</p></div>
    <div style="padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm)"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:5px">Description</div><p style="font-size:.875rem;color:var(--text-secondary);line-height:1.6">${team.description||'Not provided yet.'}</p></div>
  </div>
  <div style="margin-bottom:18px"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Startup Progress</div>${ITE.App.renderProgressTracker(team.stage)}</div>
  <div>
    <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Team Members (${members.length})</div>
    ${members.length===0?`<p style="color:var(--text-muted);font-size:.875rem">No members yet. Assign a CEO first.</p>`:
    `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px">${members.map(m=>`<div class="member-card"><div class="member-avatar" style="background:${ITE.App.roleColor(m.role)}">${m.user?.avatar||'?'}</div><div class="member-info"><div class="member-name">${m.user?.name||'?'}</div><div class="member-sub">${m.user?.rollNo||''} · ${m.user?.branch||''}</div></div><span class="badge" style="background:${ITE.App.roleColor(m.role)}22;color:${ITE.App.roleColor(m.role)}">${m.role}</span></div>`).join('')}</div>`}
  </div>
</div>`;
  }

  function showTeamDetail(teamId) {
    const user = ITE.Auth.getCurrentUser();
    const team = ITE.Data.getTeamById(teamId); if(!team) return;
    const members = team.members.map(m=>({...m, user:ITE.Data.getUserById(m.userId)}));
    ITE.App.showModal(`<div class="modal modal-lg">
<div class="modal-header"><div class="modal-title">${team.startupName}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div style="display:grid;gap:14px">
    <div><span class="badge badge-blue">${team.industry}</span></div>
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:4px">Problem</div><p style="font-size:.9rem;line-height:1.6">${team.problemStatement}</p></div>
    ${ITE.App.renderProgressTracker(team.stage)}
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Members</div><div style="display:grid;gap:7px">${members.map(m=>`<div class="member-card"><div class="member-avatar" style="background:${ITE.App.roleColor(m.role)}">${m.user?.avatar||'?'}</div><div class="member-info"><div class="member-name">${m.user?.name}</div><div class="member-sub">${m.user?.rollNo} · ${m.user?.branch}</div></div><span class="badge" style="background:${ITE.App.roleColor(m.role)}22;color:${ITE.App.roleColor(m.role)}">${m.role}</span></div>`).join('')}</div></div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-ghost btn-sm" onclick="ITE.App.closeModal();ITE.Pages.Mentor.showAssignCEO('${team.id}')">👑 Assign CEO</button>
      ${team.stage<5?`<button class="btn btn-primary btn-sm" onclick="ITE.App.closeModal();ITE.Pages.Mentor._advanceStage('${team.id}')">Advance Stage →</button>`:`<span class="badge badge-green">🏁 Complete!</span>`}
    </div>
  </div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Close</button></div>
</div>`);
  }

  function showAssignCEO(teamId) {
    const user = ITE.Auth.getCurrentUser();
    const team = ITE.Data.getTeamById(teamId);
    const eligible = ITE.Data.getStudents().filter(s=>s.mentorId===user.id && (!s.teamId||s.teamId===teamId));
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Assign CEO – ${team?.startupName}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px">The selected student will receive CEO privileges and can create the startup profile and invite teammates.</p>
  ${eligible.length===0?`<div class="empty-state"><p>No eligible students. Students must be under your mentorship first.</p></div>`:
  `<div class="form-group"><label class="form-label">Select Student</label><select id="ceo-sel" class="form-control"><option value="">Choose…</option>${eligible.map(s=>`<option value="${s.id}">${s.name} (${s.rollNo}) · ${s.branch}</option>`).join('')}</select></div>`}
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Mentor._submitCEO('${teamId}')">Assign CEO</button></div>
</div>`);
  }

  function _submitCEO(teamId) {
    const sId = document.getElementById('ceo-sel')?.value;
    if(!sId){ITE.App.toast('Select a student.','error');return;}
    const team = ITE.Data.getTeamById(teamId);
    const student = ITE.Data.getUserById(sId);
    // Remove previous CEO if exists
    if(team.ceoId && team.ceoId!==sId){
      const prevCeo=ITE.Data.getUserById(team.ceoId);
      if(prevCeo){ITE.Data.updateUser(team.ceoId,{isCEO:false,teamId:null,teamRole:null});}
    }
    // Update team
    const members=[...(team.members.filter(m=>m.userId!==sId)),{userId:sId,role:'CEO'}];
    ITE.Data.updateTeam(teamId,{ceoId:sId,members});
    ITE.Data.updateUser(sId,{isCEO:true,teamId,teamRole:'CEO',mentorId:ITE.Auth.getCurrentUser().id});
    ITE.App.toast(`${student.name} assigned as CEO!`,'success');
    ITE.App.closeModal(); renderTeams();
  }

  function _advanceStage(teamId) {
    const t=ITE.Data.getTeamById(teamId);
    if(!t||t.stage>=5){ITE.App.toast('Already at final stage.','warning');return;}
    ITE.Data.updateTeam(teamId,{stage:t.stage+1});
    ITE.App.toast(`${t.startupName} → ${ITE.App.STAGES[t.stage+1].label}!`,'success');
    renderTeams();
  }

  function renderAnnouncements() {
    const user = ITE.Auth.getCurrentUser();
    const teamIds = user.assignedTeams || [];
    const teams = teamIds.map(id=>ITE.Data.getTeamById(id)).filter(Boolean);
    const anns = ITE.Data.getAnnouncementsForUser(user);
    ITE.App.pc().innerHTML = `
<div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div><div class="page-title">Announcements</div><div class="page-subtitle">View and send announcements to your teams</div></div>
  <button class="btn btn-primary" onclick="ITE.Pages.Mentor.showMentorAnnModal()">+ New Announcement</button>
</div>
<div class="two-col">
  <div>
    <div class="section-title">Feed (${anns.length})</div>
    ${anns.length===0?`<div class="empty-state card"><div class="empty-state-icon">📣</div><h3>No announcements</h3></div>`:
    anns.map(a=>`<div class="ann-card ${a.createdByRole}-ann"><div class="ann-meta"><span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${a.createdByRole.toUpperCase()}</span><span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span></div><div class="ann-title">${a.title}</div><div class="ann-body">${a.content}</div><div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div></div>`).join('')}
  </div>
  <div>
    <div class="section-title">My Teams</div>
    ${teams.map(t=>`<div class="card" style="margin-bottom:10px"><div style="font-weight:600;margin-bottom:4px">${t.startupName}</div><div style="font-size:.8rem;color:var(--text-muted)">${ITE.App.STAGES[t.stage]?.emoji} ${ITE.App.STAGES[t.stage]?.label} · ${t.members.length} members</div><div class="mini-progress" style="margin-top:8px">${ITE.App.STAGES.map((_,i)=>`<div class="mini-step ${i<t.stage?'done':i===t.stage?'active':''}"></div>`).join('')}</div></div>`).join('')}
  </div>
</div>`;
  }

  function showMentorAnnModal() {
    const user=ITE.Auth.getCurrentUser();
    const teams=(user.assignedTeams||[]).map(id=>ITE.Data.getTeamById(id)).filter(Boolean);
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">New Announcement</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Title</label><input id="ma-title" class="form-control" placeholder="Announcement title…"></div>
  <div class="form-group"><label class="form-label">Message</label><textarea id="ma-body" class="form-control" rows="4" placeholder="Write your message…"></textarea></div>
  <div class="form-group"><label class="form-label">Send To</label><select id="ma-to" class="form-control">${teams.map(t=>`<option value="team-${t.id}">👥 ${t.startupName}</option>`).join('')}</select></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Mentor._submitMentorAnn()">Send</button></div>
</div>`);
  }

  function _submitMentorAnn() {
    const title=document.getElementById('ma-title')?.value?.trim();
    const content=document.getElementById('ma-body')?.value?.trim();
    const recipients=document.getElementById('ma-to')?.value;
    if(!title||!content){ITE.App.toast('Title & message required.','error');return;}
    const u=ITE.Auth.getCurrentUser();
    ITE.Data.createAnnouncement({title,content,recipients,createdBy:u.id,createdByName:u.name,createdByRole:'mentor'});
    ITE.App.toast('Announcement sent!','success'); ITE.App.closeModal(); renderAnnouncements();
  }

  return {
    renderDashboard, renderTeams, renderAnnouncements,
    showTeamDetail, showAssignCEO, _submitCEO, _advanceStage,
    showMentorAnnModal, _submitMentorAnn,
  };
})();
