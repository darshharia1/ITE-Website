/* =====================================================
   ITE STARTUP LAUNCH PAD – MENTOR PAGES (mentor.js)
   Refactored for Asynchronous API Integrations
   ===================================================== */
window.ITE = window.ITE || {};
ITE.Pages = ITE.Pages || {};

ITE.Pages.Mentor = (function () {

  async function renderDashboard() {
    ITE.App.pc().innerHTML = '<div class="loading-state">Loading dashboard...</div>';

    try {
      const user = await ITE.Auth.getCurrentUser();
      if (!user) {
        ITE.App.pc().innerHTML = '<div class="error-state">Please log in to access the dashboard.</div>';
        return;
      }
      
      const allTeams = await ITE.Data.getTeams();
      const teams = allTeams.filter(t => t.mentorId === user.id);
      
      const allStudents = await ITE.Data.getStudents();
      const students = allStudents.filter(s => s.mentorId === user.id);
      
      const anns = await ITE.Data.getAnnouncementsForUser(user);
      const myAnns = anns.filter(a => a.createdByRole === 'mentor');

      // Resolve CEO details and member count for team cards
      const teamCardDataPromises = teams.map(async t => {
        const ceo = t.ceoId ? await ITE.Data.getUserById(t.ceoId) : null;
        const teamDetails = await ITE.Data.getTeamById(t.id);
        return {
          ...t,
          ceoName: ceo ? ceo.name : 'Unassigned',
          membersCount: teamDetails ? teamDetails.members.length : 0
        };
      });
      const resolvedTeams = await Promise.all(teamCardDataPromises);

      ITE.App.pc().innerHTML = `
<div class="page-header">
  <div class="page-title">Welcome, ${user.name.split(' ').slice(0,2).join(' ')}</div>
  <div class="page-subtitle">${user.specialization||'Faculty Mentor'} · ${teams.length} team${teams.length!==1?'s':''} assigned</div>
</div>
<div class="stats-grid">
  ${[
    ['My Teams', teams.length],
    ['Students', students.length],
    ['Announcements Sent', myAnns.length],
    ['Avg Stage', teams.length ? (teams.reduce((sum, t) => sum + t.stage, 0) / teams.length).toFixed(1) : '—']
  ].map(([lbl, val]) => `<div class="stat-card"><div class="stat-value">${val}</div><div class="stat-label">${lbl}</div></div>`).join('')}
</div>

<div class="section-title">My Teams</div>
${resolvedTeams.length === 0 ? `
  <div class="empty-state card">
    <h3>No teams assigned yet</h3>
    <p>Contact the administrator to assign teams under your mentorship.</p>
  </div>` : `
  <div class="cards-grid">${resolvedTeams.map(t => _teamCard(t)).join('')}</div>`}

<div class="section-title mt-6">Recent Announcements</div>
${anns.length === 0 ? `<p style="color:var(--text-muted);font-size:.875rem;padding: 10px 0">No announcements yet.</p>` :
anns.slice(0, 3).map(a => `
  <div class="ann-card ${a.createdByRole}-ann">
    <div class="ann-meta">
      <span class="badge ${a.createdByRole === 'admin' ? 'badge-blue' : 'badge-green'}">${a.createdByRole.toUpperCase()}</span>
      <span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span>
    </div>
    <div class="ann-title">${a.title}</div>
    <div class="ann-body">${a.content}</div>
    <div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div>
  </div>`).join('')}`;
    } catch (err) {
      console.error(err);
      ITE.App.pc().innerHTML = '<div class="error-state">Failed to load dashboard. Please try reloading.</div>';
    }
  }

  function _teamCard(team) {
    return `<div class="team-card" onclick="ITE.Pages.Mentor.showTeamDetail('${team.id}')">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:42px;height:42px;border-radius:var(--radius-sm);background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:1.25rem;color:var(--accent);font-weight:800;font-family:var(--font-display)">${team.startupName ? team.startupName[0] : 'T'}</div>
      <div><div style="font-family:var(--font-display);font-weight:700;font-size:.9375rem">${team.startupName}</div><div style="font-size:.72rem;color:var(--text-muted)">${team.industry}</div></div>
    </div>
    <span class="badge ${team.stage>=4?'badge-green':'badge-blue'}">S${team.stage+1}</span>
  </div>
  <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${team.problemStatement}</p>
  <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:10px">CEO: ${team.ceoName} · Members: ${team.membersCount}</div>
  <div style="margin-top:auto"><div style="font-size:.72rem;color:var(--text-muted);margin-bottom:5px">Stage ${team.stage+1}: ${ITE.App.STAGES[team.stage]?.label}</div><div class="mini-progress">${ITE.App.STAGES.map((_,i)=>`<div class="mini-step ${i<team.stage?'done':i===team.stage?'active':''}"></div>`).join('')}</div></div>
</div>`;
  }

  async function renderTeams() {
    ITE.App.pc().innerHTML = '<div class="loading-state">Loading assigned teams...</div>';

    try {
      const user = await ITE.Auth.getCurrentUser();
      if (!user) {
        ITE.App.pc().innerHTML = '<div class="error-state">Please log in to view your teams.</div>';
        return;
      }
      
      const allTeams = await ITE.Data.getTeams();
      const teams = allTeams.filter(t => t.mentorId === user.id);

      if (teams.length === 0) {
        ITE.App.pc().innerHTML = `
          <div class="page-header"><div class="page-title">My Teams</div></div>
          <div class="empty-state card"><h3>No teams assigned</h3><p>Contact admin to assign teams under your advisory.</p></div>`;
        return;
      }

      // Render full team views asynchronously
      const teamViewsPromises = teams.map(async t => {
        const teamDetails = await ITE.Data.getTeamById(t.id);
        const membersPromises = teamDetails.members.map(async m => {
          const u = await ITE.Data.getUserById(m.userId);
          return { ...m, user: u };
        });
        const members = await Promise.all(membersPromises);
        
        return `<div class="card mb-4" style="margin-bottom:20px">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px">
    <div>
      <h2 style="font-family:var(--font-display);font-size:1.375rem;font-weight:800;margin-bottom:5px">${t.startupName}</h2>
      <div style="display:flex;gap:7px;flex-wrap:wrap"><span class="badge badge-blue">${t.industry}</span><span class="badge ${t.stage>=4?'badge-green':'badge-blue'}">Stage ${t.stage + 1}: ${ITE.App.STAGES[t.stage]?.label}</span></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="ITE.Pages.Mentor.showAssignCEO('${t.id}')">Assign CEO</button>
      ${t.stage < 5 ? `<button class="btn btn-primary btn-sm" onclick="ITE.Pages.Mentor._advanceStage('${t.id}')">Advance Stage</button>` : ''}
    </div>
  </div>
  <div class="two-col" style="margin-bottom:18px">
    <div style="padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm)"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:5px">Problem Statement</div><p style="font-size:.875rem;color:var(--text-secondary);line-height:1.6">${t.problemStatement}</p></div>
    <div style="padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm)"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:5px">Description</div><p style="font-size:.875rem;color:var(--text-secondary);line-height:1.6">${t.description||'Not provided.'}</p></div>
  </div>
  <div style="margin-bottom:18px"><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Venture Progress</div>${ITE.App.renderProgressTracker(t.stage)}</div>
  <div>
    <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Team Members (${members.length})</div>
    ${members.length === 0 ? `<p style="color:var(--text-muted);font-size:.875rem">No members assigned. Appoint a CEO to initiate recruitment.</p>` :
    `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px">${members.map(m=>`<div class="member-card"><div class="member-avatar" style="background:${ITE.App.roleColor(m.role)}">${m.user?.avatar||'?'}</div><div class="member-info"><div class="member-name">${m.user?.name||''}</div><div class="member-sub">${m.user?.rollNo||''} · ${m.user?.branch||''}</div></div><span class="badge" style="background:${ITE.App.roleColor(m.role)}22;color:${ITE.App.roleColor(m.role)}">${m.role}</span></div>`).join('')}</div>`}
  </div>
</div>`;
      });
      const teamViews = await Promise.all(teamViewsPromises);

      ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">My Teams</div><div class="page-subtitle">${teams.length} venture${teams.length!==1?'s':''} under your mentorship</div></div>
${teamViews.join('')}`;
    } catch (err) {
      console.error(err);
      ITE.App.pc().innerHTML = '<div class="error-state">Failed to load teams list. Please try reloading.</div>';
    }
  }

  async function showTeamDetail(teamId) {
    try {
      const team = await ITE.Data.getTeamById(teamId); 
      if(!team) return;
      
      const membersPromises = team.members.map(async m => {
        const u = await ITE.Data.getUserById(m.userId);
        return { ...m, user: u };
      });
      const members = await Promise.all(membersPromises);

      ITE.App.showModal(`<div class="modal modal-lg">
<div class="modal-header"><div class="modal-title">${team.startupName}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div style="display:grid;gap:14px">
    <div><span class="badge badge-blue">${team.industry}</span></div>
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:4px">Problem</div><p style="font-size:.9rem;line-height:1.6">${team.problemStatement}</p></div>
    ${ITE.App.renderProgressTracker(team.stage)}
    <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:8px">Members</div><div style="display:grid;gap:7px">${members.map(m=>`<div class="member-card"><div class="member-avatar" style="background:${ITE.App.roleColor(m.role)}">${m.user?.avatar||'?'}</div><div class="member-info"><div class="member-name">${m.user?.name}</div><div class="member-sub">${m.user?.rollNo} · ${m.user?.branch}</div></div><span class="badge" style="background:${ITE.App.roleColor(m.role)}22;color:${ITE.App.roleColor(m.role)}">${m.role}</span></div>`).join('')}</div></div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-ghost btn-sm" onclick="ITE.App.closeModal();ITE.Pages.Mentor.showAssignCEO('${team.id}')">Assign CEO</button>
      ${team.stage < 5 ? `<button class="btn btn-primary btn-sm" onclick="ITE.App.closeModal();ITE.Pages.Mentor._advanceStage('${team.id}')">Advance Stage</button>` : `<span class="badge badge-green">Complete</span>`}
    </div>
  </div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Close</button></div>
</div>`);
    } catch (err) {
      ITE.App.toast('Failed to load team details.', 'error');
    }
  }

  async function showAssignCEO(teamId) {
    try {
      const user = await ITE.Auth.getCurrentUser();
      const team = await ITE.Data.getTeamById(teamId);
      const allStudents = await ITE.Data.getStudents();
      const eligible = allStudents.filter(s => s.mentorId === user.id && (!s.teamId || s.teamId === teamId));
      
      ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Assign CEO – ${team?.startupName}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px">The selected student will be granted CEO privileges to configure the startup profile and invite team members.</p>
  ${eligible.length===0?`<div class="empty-state"><p>No eligible students. Students must be assigned under your mentorship.</p></div>`:
  `<div class="form-group"><label class="form-label">Select Student</label><select id="ceo-sel" class="form-control"><option value="">Choose student…</option>${eligible.map(s=>`<option value="${s.id}">${s.name} (${s.rollNo}) · ${s.branch}</option>`).join('')}</select></div>`}
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Mentor._submitCEO('${teamId}')">Assign CEO</button></div>
</div>`);
    } catch (err) {
      ITE.App.toast('Failed to load eligible students.', 'error');
    }
  }

  async function _submitCEO(teamId) {
    const sId = document.getElementById('ceo-sel')?.value;
    if(!sId){ITE.App.toast('Select a student.','error');return;}
    
    try {
      const student = await ITE.Data.getUserById(sId);
      const currentUser = await ITE.Auth.getCurrentUser();
      
      // Update team CEO
      await ITE.Data.updateTeam(teamId, { ceoId: sId });
      
      // Update user details
      try {
        await ITE.Data.updateUser(sId, { teamId, teamRole: 'CEO', mentorId: currentUser.id });
      } catch (_) {
        // Fallback gracefully if users table columns are strictly constrained
      }
      
      ITE.App.toast(`${student.name} assigned as CEO.`,'success');
      ITE.App.closeModal(); 
      await renderTeams();
    } catch (err) {
      ITE.App.toast(err.message || 'Failed to assign CEO.', 'error');
    }
  }

  async function _advanceStage(teamId) {
    try {
      const t = await ITE.Data.getTeamById(teamId);
      if(!t||t.stage>=5){ITE.App.toast('Already at final stage.','warning');return;}
      await ITE.Data.updateTeam(teamId, { stage: t.stage + 1 });
      ITE.App.toast(`${t.startupName} advanced to Stage ${t.stage+2}.`,'success');
      await renderTeams();
    } catch (err) {
      ITE.App.toast(err.message || 'Failed to advance stage.', 'error');
    }
  }

  async function renderAnnouncements() {
    ITE.App.pc().innerHTML = '<div class="loading-state">Loading announcements...</div>';

    try {
      const user = await ITE.Auth.getCurrentUser();
      if (!user) {
        ITE.App.pc().innerHTML = '<div class="error-state">Please log in to view announcements.</div>';
        return;
      }
      
      const allTeams = await ITE.Data.getTeams();
      const teams = allTeams.filter(t => t.mentorId === user.id);
      const anns = await ITE.Data.getAnnouncementsForUser(user);

      ITE.App.pc().innerHTML = `
<div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div><div class="page-title">Announcements</div><div class="page-subtitle">View and distribute announcements to assigned teams</div></div>
  <button class="btn btn-primary" onclick="ITE.Pages.Mentor.showMentorAnnModal()">New Announcement</button>
</div>
<div class="two-col">
  <div>
    <div class="section-title">Feed (${anns.length})</div>
    ${anns.length === 0 ? `<div class="empty-state card"><h3>No announcements</h3></div>` :
    anns.map(a => `
      <div class="ann-card ${a.createdByRole}-ann">
        <div class="ann-meta">
          <span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${a.createdByRole.toUpperCase()}</span>
          <span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span>
        </div>
        <div class="ann-title">${a.title}</div>
        <div class="ann-body">${a.content}</div>
        <div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div>
      </div>`).join('')}
  </div>
  <div>
    <div class="section-title">My Teams</div>
    ${teams.map(t => `
      <div class="card" style="margin-bottom:10px">
        <div style="font-weight:600;margin-bottom:4px">${t.startupName}</div>
        <div style="font-size:.8rem;color:var(--text-muted)">Stage ${t.stage+1}: ${ITE.App.STAGES[t.stage]?.label}</div>
        <div class="mini-progress" style="margin-top:8px">${ITE.App.STAGES.map((_,i)=>`<div class="mini-step ${i<t.stage?'done':i===t.stage?'active':''}"></div>`).join('')}</div>
      </div>`).join('')}
  </div>
</div>`;
    } catch (err) {
      console.error(err);
      ITE.App.pc().innerHTML = '<div class="error-state">Failed to load announcements. Please try reloading.</div>';
    }
  }

  async function showMentorAnnModal() {
    try {
      const user = await ITE.Auth.getCurrentUser();
      const allTeams = await ITE.Data.getTeams();
      const teams = allTeams.filter(t => t.mentorId === user.id);
      
      if (teams.length === 0) {
        ITE.App.toast('You have no assigned teams to send announcements to.', 'warning');
        return;
      }

      ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">New Announcement</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Title</label><input id="ma-title" class="form-control" placeholder="Announcement title…"></div>
  <div class="form-group"><label class="form-label">Message</label><textarea id="ma-body" class="form-control" rows="4" placeholder="Write announcement content…"></textarea></div>
  <div class="form-group"><label class="form-label">Send To</label><select id="ma-to" class="form-control">${teams.map(t=>`<option value="team-${t.id}">Team: ${t.startupName}</option>`).join('')}</select></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Mentor._submitMentorAnn()">Send</button></div>
</div>`);
    } catch (err) {
      ITE.App.toast('Failed to initialize announcement modal.', 'error');
    }
  }

  async function _submitMentorAnn() {
    const title=document.getElementById('ma-title')?.value?.trim();
    const content=document.getElementById('ma-body')?.value?.trim();
    const recipients=document.getElementById('ma-to')?.value;
    if(!title||!content){ITE.App.toast('Title & message required.','error');return;}
    
    try {
      const u = await ITE.Auth.getCurrentUser();
      await ITE.Data.createAnnouncement({title,content,recipients,createdBy:u.id,createdByName:u.name,createdByRole:'mentor'});
      ITE.App.toast('Announcement sent!','success'); 
      ITE.App.closeModal(); 
      await renderAnnouncements();
    } catch (err) {
      ITE.App.toast(err.message || 'Failed to send announcement.', 'error');
    }
  }

  return {
    renderDashboard, renderTeams, renderAnnouncements,
    showTeamDetail, showAssignCEO, _submitCEO, _advanceStage,
    showMentorAnnModal, _submitMentorAnn,
  };
})();
