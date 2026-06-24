/* =====================================================
   ITE STARTUP LAUNCH PAD – MENTOR PAGES (mentor.js)
   ===================================================== */
window.ITE = window.ITE || {};
ITE.Pages = ITE.Pages || {};

ITE.Pages.Mentor = (function () {

  function _rc() { return ITE.App.roleColor; }

  async function renderDashboard() {
    ITE.App.pc().innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading mentor dashboard...</div>`;
    try {
      const user = ITE.Auth.getCurrentUser();
      const [teams, students, anns] = await Promise.all([
        ITE.API.get('/teams'),
        ITE.API.get('/users/students'),
        ITE.API.get('/announcements')
      ]);

      const myTeams = teams.filter(t => t.mentorId === user.id);
      const myStudents = students.filter(s => s.mentorId === user.id);
      const myAnns = anns.filter(a => a.recipients === 'all' || a.recipients === 'mentors' || a.createdBy === user.id || myTeams.some(t => a.recipients === 'team-' + t.id));
      const annsSent = anns.filter(a => a.createdBy === user.id);

      ITE.App.pc().innerHTML = `
<div class="page-header">
  <div class="page-title">Welcome, ${user.name.split(' ').slice(0,2).join(' ')}</div>
  <div class="page-subtitle">${user.specialization||'Faculty Mentor'} · ${myTeams.length} team${myTeams.length!==1?'s':''} assigned</div>
</div>
<div class="stats-grid">
  ${[['My Teams',myTeams.length,'#2563EB'],['Students',myStudents.length,'#10B981'],['Announcements Sent',annsSent.length,'#8B5CF6'],['Avg Stage',myTeams.length?(myTeams.reduce((a,t)=>a+(t.stage||0),0)/myTeams.length).toFixed(1):'—','#F59E0B']].map(([lbl,val,col])=>`<div class="stat-card"><div class="stat-value">${val}</div><div class="stat-label">${lbl}</div></div>`).join('')}
</div>

<div class="section-title">My Teams</div>
${myTeams.length===0?`<div class="empty-state card"><h3>No teams assigned yet</h3><p>Contact the administrator to assign teams.</p></div>`:
`<div class="cards-grid">${myTeams.map(t=>_teamCard(t)).join('')}</div>`}

<div class="section-title mt-6">Recent Announcements</div>
${myAnns.length===0?`<p style="color:var(--text-muted);font-size:.875rem">No announcements yet.</p>`:
myAnns.slice(0,3).map(a=>`<div class="ann-card ${a.createdByRole}-ann"><div class="ann-meta"><span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${a.createdByRole.toUpperCase()}</span><span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span></div><div class="ann-title">${a.title}</div><div class="ann-body">${a.content}</div><div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div></div>`).join('')}`;
    } catch(err) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;">Error: ${err.message}</div>`;
    }
  }

  function _teamCard(team) {
    return `<div class="team-card" onclick="ITE.Pages.Mentor.showTeamDetail('${team.id}')">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:42px;height:42px;border-radius:var(--radius-sm);background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:1.25rem;color:var(--accent);font-weight:800;font-family:var(--font-display)">${team.startupName[0]}</div>
      <div><div style="font-family:var(--font-display);font-weight:700;font-size:.9375rem">${team.startupName}</div><div style="font-size:.72rem;color:var(--text-muted)">${team.industry}</div></div>
    </div>
    <span class="badge ${(team.stage||0)>=4?'badge-green':'badge-blue'}">S${(team.stage||0)+1}</span>
  </div>
  <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${team.problemStatement}</p>
  <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:10px">CEO: ${team.ceoName||'Unassigned'} · Members: ${team.members.length}</div>
  <div style="margin-top:auto"><div style="font-size:.72rem;color:var(--text-muted);margin-bottom:5px">Stage ${(team.stage||0)+1}: ${ITE.App.STAGES[team.stage||0]?.label}</div><div class="mini-progress">${ITE.App.STAGES.map((_,i)=>`<div class="mini-step ${i<(team.stage||0)?'done':i===(team.stage||0)?'active':''}"></div>`).join('')}</div></div>
</div>`;
  }

  async function renderTeams() {
    ITE.App.pc().innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading live teams...</div>`;
    try {
      const user = ITE.Auth.getCurrentUser();
      const [teams, students] = await Promise.all([
        ITE.API.get('/teams'),
        ITE.API.get('/users/students')
      ]);
      const myTeams = teams.filter(t => t.mentorId === user.id);
      
      ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">My Teams</div><div class="page-subtitle">${myTeams.length} venture${myTeams.length!==1?'s':''} under your mentorship</div></div>
${myTeams.length===0?`<div class="empty-state card"><h3>No teams assigned</h3></div>`:
myTeams.map(t=>_fullTeamView(t, user, students)).join('')}`;
    } catch(err) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;">Error: ${err.message}</div>`;
    }
  }

  function _fullTeamView(team, user, students) {
    const members = team.members || [];
    // Populate member details from students list if available locally, otherwise use fallback from live DB if we fetch it there
    const populatedMembers = members.map(m => {
      const s = students.find(st => st.id === m.userId);
      return { ...m, name: s?.name || 'Unknown', avatar: s?.avatar || '?', rollNo: s?.rollNo || '', branch: s?.branch || '' };
    });

    return `<div class="card mb-4" style="margin-bottom:20px">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px">
    <div>
      <h2 style="font-family:var(--font-display);font-size:1.375rem;font-weight:800;margin-bottom:5px">${team.startupName}</h2>
      <div style="display:flex;gap:7px;flex-wrap:wrap"><span class="badge badge-blue">${team.industry}</span><span class="badge ${(team.stage||0)>=4?'badge-green':'badge-blue'}">Stage ${(team.stage||0) + 1}: ${ITE.App.STAGES[team.stage||0]?.label}</span></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="ITE.Pages.Mentor.showAssignCEO('${team.id}')">Assign CEO</button>
      <button class="btn btn-primary btn-sm" onclick="ITE.Pages.Mentor._advanceStage('${team.id}', ${team.stage||0})">Advance Stage</button>
    </div>
  </div>
  <div class="two-col" style="margin-bottom:18px">
    <div style="padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm)"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:5px">Problem Statement</div><p style="font-size:.875rem;color:var(--text-secondary);line-height:1.6">${team.problemStatement}</p></div>
    <div style="padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm)"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:5px">Description</div><p style="font-size:.875rem;color:var(--text-secondary);line-height:1.6">${team.solution||'Not provided.'}</p></div>
  </div>
  <div style="margin-bottom:18px"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Venture Progress</div>${ITE.App.renderProgressTracker(team.stage||0)}</div>
  <div>
    <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Team Members (${populatedMembers.length})</div>
    ${populatedMembers.length===0?`<p style="color:var(--text-muted);font-size:.875rem">No members assigned. Appoint a CEO to initiate recruitment.</p>`:
    `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px">${populatedMembers.map(m=>`<div class="member-card"><div class="member-avatar" style="background:${ITE.App.roleColor(m.teamRole)}">${m.avatar}</div><div class="member-info"><div class="member-name">${m.name}</div><div class="member-sub">${m.rollNo} · ${m.branch}</div></div><span class="badge" style="background:${ITE.App.roleColor(m.teamRole)}22;color:${ITE.App.roleColor(m.teamRole)}">${m.teamRole}</span></div>`).join('')}</div>`}
  </div>
</div>`;
  }

  async function showTeamDetail(teamId) {
    try {
      const team = await ITE.API.get('/teams/' + teamId);
      const students = await ITE.API.get('/users/students');
      
      const members = (team.members || []).map(m => {
        const s = students.find(st => st.id === m.userId);
        return { ...m, name: s?.name || 'Unknown', avatar: s?.avatar || '?', rollNo: s?.rollNo || '', branch: s?.branch || '' };
      });

      ITE.App.showModal(`<div class="modal modal-lg">
<div class="modal-header"><div class="modal-title">${team.startupName}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div style="display:grid;gap:14px">
    <div><span class="badge badge-blue">${team.industry}</span></div>
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:4px">Problem</div><p style="font-size:.9rem;line-height:1.6">${team.problemStatement}</p></div>
    ${ITE.App.renderProgressTracker(team.stage||0)}
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Members</div><div style="display:grid;gap:7px">${members.map(m=>`<div class="member-card"><div class="member-avatar" style="background:${ITE.App.roleColor(m.teamRole)}">${m.avatar}</div><div class="member-info"><div class="member-name">${m.name}</div><div class="member-sub">${m.rollNo} · ${m.branch}</div></div><span class="badge" style="background:${ITE.App.roleColor(m.teamRole)}22;color:${ITE.App.roleColor(m.teamRole)}">${m.teamRole}</span></div>`).join('')}</div></div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-ghost btn-sm" onclick="ITE.App.closeModal();ITE.Pages.Mentor.showAssignCEO('${team.id}')">Assign CEO</button>
      ${(team.stage||0)<4?`<button class="btn btn-primary btn-sm" onclick="ITE.App.closeModal();ITE.Pages.Mentor._advanceStage('${team.id}', ${team.stage||0})">Advance Stage</button>`:`<span class="badge badge-green">Complete</span>`}
    </div>
  </div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Close</button></div>
</div>`);
    } catch(err) {
      ITE.App.toast('Failed to load team details', 'error');
    }
  }

  async function showAssignCEO(teamId) {
    try {
      const user = ITE.Auth.getCurrentUser();
      const team = await ITE.API.get('/teams/' + teamId);
      const students = await ITE.API.get('/users/students');
      const eligible = students.filter(s=>s.mentorId===user.id && (!s.teamId||s.teamId===teamId));
      
      ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Assign CEO – ${team?.startupName}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px">The selected student will be granted executive privileges to configure the startup profile and invite team members.</p>
  ${eligible.length===0?`<div class="empty-state"><p>No eligible students. Students must be assigned under your mentorship.</p></div>`:
  `<div class="form-group"><label class="form-label">Select Student</label><select id="ceo-sel" class="form-control"><option value="">Choose student…</option>${eligible.map(s=>`<option value="${s.id}">${s.name} (${s.rollNo}) · ${s.branch}</option>`).join('')}</select></div>`}
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Mentor._submitCEO('${teamId}')">Assign CEO</button></div>
</div>`);
    } catch(err) {
      ITE.App.toast('Failed to load eligible students', 'error');
    }
  }

  async function _submitCEO(teamId) {
    const sId = document.getElementById('ceo-sel')?.value;
    if(!sId){ITE.App.toast('Select a student.','error');return;}
    try {
      const user = ITE.Auth.getCurrentUser();
      const team = await ITE.API.get('/teams/' + teamId);
      
      // Remove previous CEO if exists
      if(team.ceoId && team.ceoId!==sId){
        await ITE.API.patch(`/users/${team.ceoId}`, { teamId: null, teamRole: null });
      }
      
      // Update team members array + ceoId
      const members = [...(team.members||[]).filter(m=>m.userId!==sId), {userId:sId, teamRole:'CEO'}];
      await ITE.API.patch(`/teams/${teamId}`, { ceoId: sId, members });
      
      // Update new CEO user
      await ITE.API.patch(`/users/${sId}`, { teamId, teamRole: 'CEO', mentorId: user.id });
      
      ITE.App.toast(`CEO successfully assigned.`, 'success');
      ITE.App.closeModal(); 
      renderTeams();
    } catch (err) {
      ITE.App.toast(err.message, 'error');
    }
  }

  async function _advanceStage(teamId, currentStage) {
    if(currentStage>=4){ITE.App.toast('Already at final stage.','warning');return;}
    try {
      await ITE.API.patch(`/teams/${teamId}/stage`, { stage: currentStage + 1 });
      ITE.App.toast(`Team successfully advanced to Stage ${currentStage + 2}.`, 'success');
      renderTeams();
    } catch(err) {
      ITE.App.toast(err.message, 'error');
    }
  }

  async function renderAnnouncements() {
    ITE.App.pc().innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading live announcements...</div>`;
    try {
      const user = ITE.Auth.getCurrentUser();
      const [teams, anns] = await Promise.all([
        ITE.API.get('/teams'),
        ITE.API.get('/announcements')
      ]);
      const myTeams = teams.filter(t => t.mentorId === user.id);
      
      const feedAnns = anns.filter(a => a.recipients === 'all' || a.recipients === 'mentors' || a.createdById === user.id || myTeams.some(t => a.recipients === 'team-' + t.id));

      ITE.App.pc().innerHTML = `
<div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div><div class="page-title">Announcements</div><div class="page-subtitle">View and distribute announcements to assigned teams</div></div>
  <button class="btn btn-primary" onclick="ITE.Pages.Mentor.showMentorAnnModal()">New Announcement</button>
</div>
<div class="two-col">
  <div>
    <div class="section-title">Feed (${feedAnns.length})</div>
    ${feedAnns.length===0?`<div class="empty-state card"><h3>No announcements</h3></div>`:
    feedAnns.map(a=>`<div class="ann-card ${a.createdByRole}-ann"><div class="ann-meta"><span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${a.createdByRole.toUpperCase()}</span><span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span></div><div class="ann-title">${a.title}</div><div class="ann-body">${a.body||a.content||''}</div><div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div></div>`).join('')}
  </div>
  <div>
    <div class="section-title">My Teams</div>
    ${myTeams.map(t=>`<div class="card" style="margin-bottom:10px"><div style="font-weight:600;margin-bottom:4px">${t.startupName}</div><div style="font-size:.8rem;color:var(--text-muted)">Stage ${(t.stage||0)+1}: ${ITE.App.STAGES[t.stage||0]?.label} · ${t.members.length} members</div><div class="mini-progress" style="margin-top:8px">${ITE.App.STAGES.map((_,i)=>`<div class="mini-step ${i<(t.stage||0)?'done':i===(t.stage||0)?'active':''}"></div>`).join('')}</div></div>`).join('')}
  </div>
</div>`;
    } catch(err) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;">Error: ${err.message}</div>`;
    }
  }

  async function showMentorAnnModal() {
    try {
      const user = ITE.Auth.getCurrentUser();
      const teams = await ITE.API.get('/teams');
      const myTeams = teams.filter(t => t.mentorId === user.id);
      
      ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">New Announcement</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Title</label><input id="ma-title" class="form-control" placeholder="Announcement title…"></div>
  <div class="form-group"><label class="form-label">Message</label><textarea id="ma-body" class="form-control" rows="4" placeholder="Write announcement content…"></textarea></div>
  <div class="form-group"><label class="form-label">Send To</label><select id="ma-to" class="form-control">${myTeams.map(t=>`<option value="team-${t.id}">Team: ${t.startupName}</option>`).join('')}</select></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Mentor._submitMentorAnn()">Send</button></div>
</div>`);
    } catch(err) {
      ITE.App.toast('Failed to load teams for announcement', 'error');
    }
  }

  async function _submitMentorAnn() {
    const title = document.getElementById('ma-title')?.value?.trim();
    const content = document.getElementById('ma-body')?.value?.trim();
    const recipients = document.getElementById('ma-to')?.value;
    if(!title||!content){ITE.App.toast('Title & message required.','error');return;}
    
    try {
      const user = ITE.Auth.getCurrentUser();
      await ITE.API.post('/announcements', {
        title, body: content, recipients, teamId: recipients.replace('team-', ''),
        createdByRole: 'mentor',
        createdByName: user.name,
      });
      ITE.App.toast('Announcement sent!','success'); 
      ITE.App.closeModal(); 
      renderAnnouncements();
    } catch (err) {
      ITE.App.toast(err.message, 'error');
    }
  }

  return {
    renderDashboard, renderTeams, renderAnnouncements,
    showTeamDetail, showAssignCEO, _submitCEO, _advanceStage,
    showMentorAnnModal, _submitMentorAnn,
  };
})();
