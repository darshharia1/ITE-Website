/* =====================================================
   ITE STARTUP LAUNCH PAD – STUDENT PAGES (student.js)
   Dashboard, My Team, Tasks, Announcements,
   CEO flows (create startup, invite), Invitations
   ===================================================== */
window.ITE = window.ITE || {};
ITE.Pages = ITE.Pages || {};

ITE.Pages.Student = (function () {

  /* ---- Dashboard ---- */
  async function renderDashboard() {
    ITE.App.pc().innerHTML = '<div class="loading-state">Loading dashboard...</div>';
    
    try {
      const user = await ITE.Auth.getCurrentUser();
      if (!user) {
        ITE.App.pc().innerHTML = '<div class="error-state">Please log in to access the dashboard.</div>';
        return;
      }
      
      const team = user.teamId ? await ITE.Data.getTeamById(user.teamId) : null;
      const mentor = user.mentorId ? await ITE.Data.getUserById(user.mentorId) : null;
      const tasks = await ITE.Data.getTasks();
      const anns = await ITE.Data.getAnnouncementsForUser(user);
      const pendingInvites = await ITE.Data.getPendingInvites(user.id);
      const subs = await ITE.Data.getSubmissions();
      const mySubmissions = subs.filter(s => s.studentId === user.id);

      // Fetch name of inviter and startup name for pending invites
      const resolvedInvitesPromises = pendingInvites.map(async inv => {
        const invTeam = await ITE.Data.getTeamById(inv.teamId);
        const inviter = await ITE.Data.getUserById(inv.fromUserId);
        return {
          ...inv,
          teamName: invTeam?.startupName || 'Unknown Team',
          inviterName: inviter?.name || 'CEO'
        };
      });
      const resolvedInvites = await Promise.all(resolvedInvitesPromises);

      ITE.App.pc().innerHTML = `
<div class="page-header">
  <div class="page-title">Welcome, ${user.name.split(' ')[0]}</div>
  <div class="page-subtitle">${user.rollNo||''} · ${user.branch||''} ${user.teamRole?`· <span class="badge badge-blue">${user.teamRole}</span>`:''}</div>
</div>

${resolvedInvites.length > 0 ? `
<div class="card" style="border-color:var(--accent);margin-bottom:18px">
  <div class="card-header"><div class="card-title">Pending Team Invitations (${resolvedInvites.length})</div></div>
  ${resolvedInvites.map(inv => `
    <div class="invite-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-weight:600;color:var(--text-primary)">${inv.teamName}</div>
          <div style="font-size:.8rem;color:var(--text-secondary);margin-top:3px">
            Invitation to join by <strong>${inv.inviterName}</strong>
          </div>
        </div>
      </div>
      <div class="invite-actions">
        <button class="btn btn-success btn-sm" onclick="ITE.Pages.Student._respondInvite('${inv.id}','accepted')">Accept</button>
        <button class="btn btn-danger btn-sm" onclick="ITE.Pages.Student._respondInvite('${inv.id}','rejected')">Decline</button>
      </div>
    </div>`).join('')}
</div>` : ''}

<div class="stats-grid">
  ${[
    ['Tasks', tasks.length, `${mySubmissions.length} submitted`, '#2563EB'],
    ['My Team', team ? team.startupName : 'Unassigned', team ? ITE.App.STAGES[team.stage]?.label : '—', '#10B981'],
    ['Announcements', anns.length, 'Feed updates', '#8B5CF6'],
    ['My Role', user.teamRole || 'Student', user.isCEO ? 'CEO Privileges' : 'Member', '#F59E0B']
  ].map(([lbl, val, sub]) => `
    <div class="stat-card">
      <div class="stat-value" style="font-size:${String(val).length > 10 ? '1.1rem' : '1.875rem'}">${val}</div>
      <div class="stat-label">${lbl}</div>
      <div class="stat-sub">${sub}</div>
    </div>`).join('')}
</div>

<div class="two-col">
  <!-- Team Status -->
  <div class="card">
    <div class="card-header"><div class="card-title">Team Status</div><a href="#/student/my-team" class="btn btn-ghost btn-sm">View</a></div>
    ${!team ? `
      <div class="empty-state" style="padding:24px 0">
        <h3>No Team Assignment</h3>
        <p>Please wait for role assignment or team invitation.</p>
      </div>` : `
      <div>
        <div style="font-family:var(--font-display);font-size:1.125rem;font-weight:800;margin-bottom:5px">${team.startupName}</div>
        <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px;line-height:1.5">${team.problemStatement}</p>
        ${ITE.App.renderProgressTracker(team.stage)}
        ${mentor ? `<div style="margin-top:12px;font-size:.8rem;color:var(--text-muted)">Mentor: <strong style="color:var(--text-primary)">${mentor.name}</strong></div>` : ''}
      </div>`}
  </div>
  <!-- Recent Announcements -->
  <div class="card">
    <div class="card-header"><div class="card-title">Recent Announcements</div><a href="#/student/announcements" class="btn btn-ghost btn-sm">View All</a></div>
    ${anns.length === 0 ? `
      <div class="empty-state" style="padding:20px 0"><h3>No announcements</h3></div>` : 
      anns.slice(0, 3).map(a => `
        <div class="ann-card ${a.createdByRole}-ann">
          <div class="ann-meta">
            <span class="badge ${a.createdByRole === 'admin' ? 'badge-blue' : 'badge-green'}">${a.createdByRole.toUpperCase()}</span>
          </div>
          <div class="ann-title">${a.title}</div>
          <div class="ann-date">${new Date(a.createdAt).toLocaleDateString('en-IN')}</div>
        </div>`).join('')}
  </div>
</div>

${user.isCEO && team && !team.startupName ? `
  <div class="card mt-6" style="border-color:var(--accent)">
    <div class="card-header"><div class="card-title">Startup Profile Setup Required</div></div>
    <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px">As CEO, you are required to define the startup profile and invite team members.</p>
    <button class="btn btn-primary" onclick="ITE.Pages.Student.showCreateStartup()">Create Startup Profile</button>
  </div>` : ''}
`;
    } catch (err) {
      console.error(err);
      ITE.App.pc().innerHTML = '<div class="error-state">Failed to load dashboard. Please try reloading.</div>';
    }
  }

  /* ---- My Team ---- */
  async function renderMyTeam() {
    ITE.App.pc().innerHTML = '<div class="loading-state">Loading team details...</div>';

    try {
      const user = await ITE.Auth.getCurrentUser();
      if (!user) {
        ITE.App.pc().innerHTML = '<div class="error-state">Please log in to view your team.</div>';
        return;
      }
      
      const team = user.teamId ? await ITE.Data.getTeamById(user.teamId) : null;
      const mentor = user.mentorId ? await ITE.Data.getUserById(user.mentorId) : null;

      if (!team) {
        ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">My Team</div></div>
<div class="no-team-card">
  <h3 style="font-family:var(--font-display);font-size:1.25rem;font-weight:700;margin-bottom:8px">No Team Assignment</h3>
  <p style="font-size:.9rem;color:var(--text-secondary);max-width:380px;margin:0 auto 20px">Your mentor will assign you to a team or designate you as CEO. You may also check pending invitations on the dashboard.</p>
  <a href="#/student/dashboard" class="btn btn-primary">View Dashboard</a>
</div>`;
        return;
      }

      const allAnns = await ITE.Data.getAnnouncementsForUser(user);
      const anns = allAnns.filter(a => user.teamId && a.recipients === 'team-' + user.teamId);
      const pendingInvites = await ITE.Data.getPendingInvites(user.id);
      
      const resolvedPendingPromises = pendingInvites.map(async inv => {
        const invTeam = await ITE.Data.getTeamById(inv.teamId);
        const inviter = await ITE.Data.getUserById(inv.fromUserId);
        return {
          ...inv,
          teamName: invTeam?.startupName || 'Unknown Team',
          inviterName: inviter?.name || 'CEO'
        };
      });
      const resolvedPending = await Promise.all(resolvedPendingPromises);

      // Load user details for all team members
      const membersPromises = team.members.map(async m => {
        const u = await ITE.Data.getUserById(m.userId);
        return { ...m, user: u };
      });
      const members = await Promise.all(membersPromises);

      // Load sent invitations for CEO controls
      const allInvitations = await ITE.Data.getInvitations();
      const sentInvites = allInvitations.filter(i => i.fromUserId === user.id && i.status === 'pending');
      const allStudents = await ITE.Data.getStudents();
      const sentWithNames = sentInvites.map(inv => {
        const matchingStudent = allStudents.find(s => s.email.toLowerCase() === inv.invitee_email.toLowerCase());
        return {
          ...inv,
          recipientName: matchingStudent ? matchingStudent.name : inv.invitee_email
        };
      });

      ITE.App.pc().innerHTML = `
${resolvedPending.length > 0 ? `
<div style="margin-bottom:16px">
  ${resolvedPending.map(inv => `
    <div class="invite-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-weight:600">${inv.teamName} – Team Invitation</div>
          <div style="font-size:.8rem;color:var(--text-secondary);margin-top:2px">
            Invited by ${inv.inviterName}
          </div>
        </div>
      </div>
      <div class="invite-actions">
        <button class="btn btn-success btn-sm" onclick="ITE.Pages.Student._respondInvite('${inv.id}','accepted')">Accept</button>
        <button class="btn btn-danger btn-sm" onclick="ITE.Pages.Student._respondInvite('${inv.id}','rejected')">Decline</button>
      </div>
    </div>`).join('')}
</div>` : ''}

<!-- Hero banner -->
<div class="my-team-hero">
  <div class="my-team-name">${team.startupName}</div>
  <div class="my-team-tagline">${team.problemStatement}</div>
  <div class="my-team-meta">
    ${mentor ? `<div class="my-team-meta-item"><span>Mentor: ${mentor.name}</span></div>` : ''}
    <div class="my-team-meta-item"><span>${members.length} Members</span></div>
    <div class="my-team-meta-item"><span>Sector: ${team.industry}</span></div>
    <div class="my-team-meta-item"><span>Stage ${team.stage + 1}</span></div>
  </div>
</div>

<div class="two-col">
  <!-- Left column -->
  <div>
    <!-- Progress Tracker -->
    <div class="card mb-4" style="margin-bottom:16px">
      <div class="card-header"><div class="card-title">Venture Progress</div></div>
      ${ITE.App.renderProgressTracker(team.stage)}
      <div style="margin-top:14px;padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm)">
        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:4px">Current Stage</div>
        <div style="font-size:.9375rem;font-weight:600;color:var(--text-primary)">Stage ${team.stage + 1}: ${ITE.App.STAGES[team.stage]?.label}</div>
        <div style="font-size:.8rem;color:var(--text-secondary);margin-top:3px">${_stageHint(team.stage)}</div>
      </div>
    </div>

    <!-- Startup Details -->
    <div class="card mb-4" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-title">Venture Details</div>
        ${user.isCEO ? `<button class="btn btn-ghost btn-sm" onclick="ITE.Pages.Student.showEditStartup('${team.id}')">Edit</button>` : ''}
      </div>
      <div style="display:grid;gap:12px">
        <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:3px">Venture Name</div><div style="font-size:.9375rem;font-weight:600">${team.startupName}</div></div>
        <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:3px">Industry</div><span class="badge badge-blue">${team.industry}</span></div>
        <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:3px">Problem Statement</div><p style="font-size:.875rem;line-height:1.6;color:var(--text-secondary)">${team.problemStatement}</p></div>
        <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:3px">Description</div><p style="font-size:.875rem;line-height:1.6;color:var(--text-secondary)">${team.description||'Not provided.'}</p></div>
      </div>
    </div>

    <!-- Team Announcements -->
    <div class="card">
      <div class="card-header"><div class="card-title">Team Announcements</div></div>
      ${anns.length === 0 ? `<div class="empty-state" style="padding:20px 0"><h3>No team announcements</h3></div>` :
      anns.map(a => `
        <div class="ann-card mentor-ann">
          <div class="ann-meta">
            <span class="badge badge-green">MENTOR</span>
            <span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span>
          </div>
          <div class="ann-title">${a.title}</div>
          <div class="ann-body">${a.content}</div>
          <div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div>
        </div>`).join('')}
    </div>
  </div>

  <!-- Right column: Members + CEO actions -->
  <div>
    <div class="card mb-4" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-title">Team Directory</div>
        ${user.isCEO ? `<button class="btn btn-primary btn-sm" onclick="ITE.Pages.Student.showInviteMember()">Invite</button>` : ''}
      </div>
      <div style="display:grid;gap:8px">
        ${members.map(m => `
          <div class="member-card">
            <div class="member-avatar" style="background:${ITE.App.roleColor(m.role)}">${m.user?.avatar||'?'}</div>
            <div class="member-info">
              <div class="member-name">${m.user?.name||''} ${m.userId===user.id ? '<span style="font-size:.65rem;color:var(--accent)">(You)</span>' : ''}</div>
              <div class="member-sub">${m.user?.rollNo||''} · ${m.user?.branch||''}</div>
            </div>
            <span class="badge" style="background:${ITE.App.roleColor(m.role)}22;color:${ITE.App.roleColor(m.role)}">${m.role}</span>
          </div>`).join('')}
        ${members.length < 4 ? `<div style="padding:10px;text-align:center;border:1px dashed var(--border);border-radius:var(--radius-sm);font-size:.8rem;color:var(--text-muted)">${4-members.length} slot${4-members.length!==1?'s':''} available</div>` : ''}
      </div>
    </div>

    ${mentor ? `
      <div class="card mb-4" style="margin-bottom:16px">
        <div class="card-header"><div class="card-title">Dedicated Advisory</div></div>
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;color:#FFF">${mentor.avatar}</div>
          <div>
            <div style="font-weight:700;font-size:.9375rem">${mentor.name}</div>
            <div style="font-size:.8rem;color:var(--text-muted)">${mentor.specialization||'Faculty Mentor'}</div>
            <div style="font-size:.75rem;color:var(--text-muted);margin-top:2px">Email: ${mentor.email}</div>
          </div>
        </div>
      </div>` : ''}

    ${user.isCEO ? `
      <div class="card" style="border-color:var(--accent)">
        <div class="card-header"><div class="card-title">Executive Controls</div></div>
        <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:12px">Invite team members and manage venture details.</p>
        <div style="display:grid;gap:8px">
          <button class="btn btn-primary" onclick="ITE.Pages.Student.showInviteMember()">Invite Team Member</button>
          <button class="btn btn-ghost" onclick="ITE.Pages.Student.showEditStartup('${team.id}')">Edit Startup Profile</button>
        </div>
        <div style="margin-top:12px">
          <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:6px">Pending Sent Invitations (${sentWithNames.length})</div>
          ${sentWithNames.length === 0 ? `<div style="font-size:.8rem;color:var(--text-muted)">No pending invitations.</div>` : 
          sentWithNames.map(inv => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-subtle)">
              <span style="font-size:.8rem">${inv.recipientName}</span>
              <span class="badge badge-yellow">Pending</span>
            </div>`).join('')}
        </div>
      </div>` : ''}
  </div>
</div>`;
    } catch (err) {
      console.error(err);
      ITE.App.pc().innerHTML = '<div class="error-state">Failed to load team details. Please try reloading.</div>';
    }
  }

  function _stageHint(stage) {
    return ['Identify and validate your core problem with real users.',
            'Research your market size, competition, and customer segments.',
            'Conduct at least 20 interviews with potential customers.',
            'Build a minimum viable product to test with real users.',
            'Create a compelling pitch deck for investors.',
            'Final pitch to faculty and industry judges.'][stage]||'';
  }

  /* ---- CEO: Create/Edit Startup ---- */
  async function showCreateStartup() {
    try {
      const user = await ITE.Auth.getCurrentUser();
      if (!user.teamId) { ITE.App.toast('No team assigned yet.', 'warning'); return; }
      await showEditStartup(user.teamId);
    } catch (err) {
      ITE.App.toast('Failed to load profile creator.', 'error');
    }
  }

  async function showEditStartup(teamId) {
    try {
      const team = await ITE.Data.getTeamById(teamId);
      ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">${team?.startupName?'Edit':'Create'} Startup Profile</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Startup Name *</label><input id="sp-name" class="form-control" value="${team?.startupName||''}" placeholder="AgriTech Connect"></div>
  <div class="form-group"><label class="form-label">Industry *</label><select id="sp-ind" class="form-control">${['Agriculture & Food Tech','Education Technology','Healthcare','Fintech','Sustainability','Safety Tech','Smart Cities','E-Commerce','SaaS','Other'].map(i=>`<option ${team?.industry===i?'selected':''}>${i}</option>`).join('')}</select></div>
  <div class="form-group"><label class="form-label">Problem Statement *</label><textarea id="sp-prob" class="form-control" rows="3" placeholder="What problem does your startup solve?">${team?.problemStatement||''}</textarea></div>
  <div class="form-group"><label class="form-label">Startup Description *</label><textarea id="sp-desc" class="form-control" rows="4" placeholder="Describe your solution, value proposition, and how it works…">${team?.description||''}</textarea></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Student._submitStartup('${teamId}')">Save Profile</button></div>
</div>`);
    } catch (err) {
      ITE.App.toast('Failed to load startup details.', 'error');
    }
  }

  async function _submitStartup(teamId) {
    const name=document.getElementById('sp-name')?.value?.trim();
    const ind=document.getElementById('sp-ind')?.value;
    const prob=document.getElementById('sp-prob')?.value?.trim();
    const desc=document.getElementById('sp-desc')?.value?.trim();
    if(!name||!ind||!prob||!desc){ITE.App.toast('Fill all required fields.','error');return;}
    
    try {
      await ITE.Data.updateTeam(teamId, {startupName:name,industry:ind,problemStatement:prob,description:desc});
      ITE.App.toast('Startup profile saved!','success');
      ITE.App.closeModal(); 
      await renderMyTeam();
    } catch (err) {
      ITE.App.toast(err.message || 'Failed to save profile.', 'error');
    }
  }

  /* ---- CEO: Invite Members ---- */
  async function showInviteMember() {
    try {
      const user = await ITE.Auth.getCurrentUser();
      const team = await ITE.Data.getTeamById(user.teamId);
      if (!team) { ITE.App.toast('No team found.','warning'); return; }
      
      const existingRoles = team.members.map(m=>m.role);
      const availableRoles = ['CTO','CFO','CMO'].filter(r=>!existingRoles.includes(r));
      if (!availableRoles.length) { ITE.App.toast('All team roles are filled!','info'); return; }
      
      // Get students not already in team
      const allStudents = await ITE.Data.getStudents();
      const eligibleStudents = allStudents.filter(s=>s.id!==user.id && !team.members.some(m=>m.userId===s.id));
      
      ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Invite Team Member</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px">Invite a student to join your team. They'll receive an email notification.</p>
  <div class="form-group">
    <label class="form-label">Select Student</label>
    <select id="inv-stu" class="form-control">
      <option value="">Choose student…</option>
      ${eligibleStudents.map(s=>`<option value="${s.id}">${s.name} (${s.rollNo||'No Roll No'}) · ${s.branch||'No Branch'}</option>`).join('')}
    </select>
  </div>
  <div class="form-group"><label class="form-label">Role to Assign</label><select id="inv-role" class="form-control">${availableRoles.map(r=>`<option value="${r}">${r}</option>`).join('')}</select></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Student._submitInvite()">Send Invitation</button></div>
</div>`);
    } catch (err) {
      ITE.App.toast('Failed to load invitation form.', 'error');
    }
  }

  async function _submitInvite() {
    const stuId=document.getElementById('inv-stu')?.value;
    const role=document.getElementById('inv-role')?.value;
    if(!stuId||!role){ITE.App.toast('Select student and role.','error');return;}
    
    try {
      const user = await ITE.Auth.getCurrentUser();
      const existingInvites = await ITE.Data.getInvitations();
      
      // Look up candidate student email
      const targetUser = await ITE.Data.getUserById(stuId);
      if (!targetUser) {
        ITE.App.toast('Selected student not found.', 'error');
        return;
      }
      
      const existing = existingInvites.find(i => 
        i.invitee_email.toLowerCase() === targetUser.email.toLowerCase() && 
        i.teamId === user.teamId && 
        i.status === 'pending'
      );
      if(existing){ITE.App.toast('A pending invitation already exists for this student.','warning');return;}
      
      await ITE.Data.createInvitation({fromUserId:user.id,toUserId:stuId,teamId:user.teamId,role});
      ITE.App.toast(`Invitation sent to ${targetUser.name}!`,'success');
      ITE.App.closeModal(); 
      await renderMyTeam();
    } catch (err) {
      ITE.App.toast(err.message || 'Failed to send invitation.', 'error');
    }
  }

  async function _respondInvite(invId, status) {
    if (status === 'rejected') {
      try {
        await ITE.Data.respondToInvitation(invId, 'rejected');
        ITE.App.toast('Invitation declined.', 'info');
        ITE.App.route();
      } catch (err) {
        ITE.App.toast(err.message || 'Failed to reject invitation', 'error');
      }
      return;
    }

    try {
      const invites = await ITE.Data.getInvitations();
      const inv = invites.find(i => i.id === invId);
      if (!inv) {
        ITE.App.toast('Invitation not found.', 'error');
        return;
      }
      
      // Load filled roles
      const users = await ITE.Data.getUsers();
      const teamMembers = users.filter(u => u.teamId === inv.teamId);
      const filledRoles = teamMembers.map(m => m.teamRole).filter(Boolean);
      const availableRoles = ['CTO', 'CFO', 'CMO'].filter(r => !filledRoles.includes(r));
      
      if (availableRoles.length === 0) {
        ITE.App.toast('No executive roles available on this team!', 'error');
        return;
      }

      ITE.App.showModal(`<div class="modal">
        <div class="modal-header"><div class="modal-title">Accept Invitation</div><button class="modal-close btn">✕</button></div>
        <div class="modal-body">
          <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px">Select the role you will take on the team:</p>
          <div class="form-group">
            <label class="form-label">Role</label>
            <select id="accept-role" class="form-control">
              ${availableRoles.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="ITE.Pages.Student._submitAcceptInvitation('${invId}')">Accept & Join</button>
        </div>
      </div>`);
    } catch (err) {
      console.error(err);
      ITE.App.toast('Failed to load invitation acceptance options.', 'error');
    }
  }

  async function _submitAcceptInvitation(invId) {
    const role = document.getElementById('accept-role')?.value;
    if (!role) {
      ITE.App.toast('Please select a role.', 'error');
      return;
    }
    
    try {
      await ITE.Data.respondToInvitation(invId, 'accepted', role);
      ITE.App.toast('You have successfully joined the team!', 'success');
      ITE.App.closeModal();
      window.location.reload();
    } catch (err) {
      ITE.App.toast(err.message || 'Failed to accept invitation.', 'error');
    }
  }

  /* ---- Tasks ---- */
  async function renderTasks() {
    ITE.App.pc().innerHTML = '<div class="loading-state">Loading tasks...</div>';

    try {
      const user = await ITE.Auth.getCurrentUser();
      if (!user) {
        ITE.App.pc().innerHTML = '<div class="error-state">Please log in to view tasks.</div>';
        return;
      }
      
      const tasks = await ITE.Data.getTasks();
      const subs = await ITE.Data.getSubmissions();
      const mySubs = subs.filter(s => s.studentId === user.id);
      
      const getSubForTask = (taskId) => mySubs.find(s=>s.taskId===taskId);
      const submitted = mySubs.length;
      const total = tasks.length;

      ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">Tasks</div><div class="page-subtitle">${submitted}/${total} completed</div></div>
<div class="card" style="margin-bottom:16px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:.875rem;color:var(--text-secondary)">Overall Completion</span><span style="font-weight:700">${total?Math.round(submitted/total*100):0}%</span></div>
  <div class="analytics-bar-track" style="height:10px"><div class="analytics-bar-fill" style="width:${total?submitted/total*100:0}%"></div></div>
</div>
${tasks.length === 0 ? `<div class="empty-state card"><h3>No tasks assigned yet</h3></div>` :
tasks.map(task => {
  const sub = getSubForTask(task.id);
  const done = !!sub;
  return `<div class="task-card">
  <div class="task-check ${done?'done':''}"></div>
  <div style="flex:1">
    <div class="task-title">${task.title}</div>
    <div class="task-desc">${task.description}</div>
    <div style="display:flex;align-items:center;gap:12px;margin-top:7px;flex-wrap:wrap">
      <div class="task-due">Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN') : 'No due date'}</div>
      <span class="badge badge-blue">${task.category || 'Venture'}</span>
      ${done ? `<span class="badge badge-green">Submitted ${sub.grade ? `· Grade: ${sub.grade}` : ''}</span>` : `<span class="badge badge-yellow">Pending</span>`}
    </div>
    ${done ? `<div style="margin-top:10px;padding:10px;background:var(--success-light);border-radius:var(--radius-sm);font-size:.8rem;color:var(--success)">Submission: <a href="${sub.content}" target="_blank" style="color:var(--accent);text-decoration:underline">${sub.content}</a></div>` :
    `<div style="margin-top:10px"><button class="btn btn-primary btn-sm" onclick="ITE.Pages.Student.showSubmitTask('${task.id}','${task.title.replace(/'/g,"\\'")}')">Submit Task</button></div>`}
  </div>
</div>`;
}).join('')}`;
    } catch (err) {
      console.error(err);
      ITE.App.pc().innerHTML = '<div class="error-state">Failed to load tasks. Please try reloading.</div>';
    }
  }

  function showSubmitTask(taskId, taskTitle) {
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Submit: ${taskTitle}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group">
    <label class="form-label">Submission Link (Google Drive, GitHub, etc.) *</label>
    <input type="url" id="sub-link" class="form-control" placeholder="https://docs.google.com/presentation/d/.../edit" required>
    <div class="form-hint">Please enter a valid URL to your deliverables.</div>
  </div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Student._submitTask('${taskId}')">Submit</button></div>
</div>`);
  }

  async function _submitTask(taskId) {
    const link = document.getElementById('sub-link')?.value?.trim();
    if (!link) {
      ITE.App.toast('Please provide a submission link.', 'error');
      return;
    }
    
    try {
      new URL(link);
    } catch (_) {
      ITE.App.toast('Please enter a valid URL (starting with http:// or https://).', 'error');
      return;
    }
    
    try {
      await ITE.Data.createSubmission(taskId, link);
      ITE.App.toast('Task submitted successfully.', 'success');
      ITE.App.closeModal(); 
      await renderTasks();
    } catch (err) {
      ITE.App.toast(err.message || 'Failed to submit task.', 'error');
    }
  }

  /* ---- Announcements ---- */
  async function renderAnnouncements() {
    ITE.App.pc().innerHTML = '<div class="loading-state">Loading announcements...</div>';

    try {
      const user = await ITE.Auth.getCurrentUser();
      if (!user) {
        ITE.App.pc().innerHTML = '<div class="error-state">Please log in to view announcements.</div>';
        return;
      }
      
      const anns = await ITE.Data.getAnnouncementsForUser(user);
      
      ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">Announcements</div><div class="page-subtitle">${anns.length} total announcements · View-only</div></div>
${anns.length === 0 ? `<div class="empty-state card"><h3>No announcements</h3><p>Announcements from your admin and mentor will appear here.</p></div>` :
anns.map(a => `
  <div class="ann-card ${a.createdByRole}-ann">
    <div class="ann-meta">
      <span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${a.createdByRole.toUpperCase()}</span>
      <span style="font-size:.72rem;color:var(--text-muted)">by ${a.createdByName}</span>
      ${user.teamId&&a.recipients==='team-'+user.teamId?`<span class="badge badge-purple">Your Team</span>`:a.recipients==='all-students'?`<span class="badge badge-blue">All Students</span>`:''}
    </div>
    <div class="ann-title">${a.title}</div>
    <div class="ann-body">${a.content}</div>
    <div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div>
  </div>`).join('')}`;
    } catch (err) {
      console.error(err);
      ITE.App.pc().innerHTML = '<div class="error-state">Failed to load announcements. Please try reloading.</div>';
    }
  }

  return {
    renderDashboard, renderMyTeam, renderTasks, renderAnnouncements,
    showCreateStartup, showEditStartup, _submitStartup,
    showInviteMember, _submitInvite, _respondInvite,
    showSubmitTask, _submitTask, _submitAcceptInvitation
  };
})();
