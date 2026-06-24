/* =====================================================
   ITE STARTUP LAUNCH PAD – STUDENT PAGES (student.js)
   Dashboard, My Team, Tasks, Announcements,
   CEO flows (create startup, invite), Invitations
   ===================================================== */
window.ITE = window.ITE || {};
ITE.Pages = ITE.Pages || {};

ITE.Pages.Student = (function () {

  async function renderDashboard() {
    ITE.App.pc().innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading student dashboard...</div>`;
    try {
      let user = ITE.Auth.getCurrentUser();
      
      // Refresh local user context to ensure sync with mentor/admin assignments
      const updatedUser = await ITE.API.get('/auth/me');
      if (updatedUser) {
        ITE.Auth.updateCurrentUser(updatedUser);
        user = updatedUser;
      }
      const [teams, students, mentors, tasks, anns, pendingInvites, mySubmissions] = await Promise.all([
        ITE.API.get('/teams'),
        ITE.API.get('/users/students'),
        ITE.API.get('/users/mentors'),
        ITE.API.get('/tasks'),
        ITE.API.get('/announcements'),
        ITE.API.get('/invitations/pending'),
        ITE.API.get('/submissions/my')
      ]);

      const team = user.teamId ? teams.find(t => t.id === user.teamId) : null;
      const mentor = user.mentorId ? mentors.find(m => m.id === user.mentorId) : null;
      
      const feedAnns = anns.filter(a => a.recipients === 'all' || a.recipients === 'students' || a.recipients === 'all-students' || (user.teamId && a.recipients === 'team-' + user.teamId));

      ITE.App.pc().innerHTML = `
<div class="page-header">
  <div class="page-title">Welcome, ${user.name.split(' ')[0]}</div>
  <div class="page-subtitle">${user.rollNo||''} · ${user.branch||''} ${user.teamRole?`· <span class="badge badge-blue">${user.teamRole}</span>`:''}</div>
</div>

${pendingInvites.length>0?`
<div class="card" style="border-color:var(--accent);margin-bottom:18px">
  <div class="card-header"><div class="card-title">Pending Team Invitations (${pendingInvites.length})</div></div>
  ${pendingInvites.map(inv=>{
    const fromUser = students.find(s => s.id === inv.fromUserId);
    const invTeam = teams.find(t => t.id === inv.teamId);
    return `<div class="invite-card"><div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px"><div><div style="font-weight:600;color:var(--text-primary)">${invTeam?.startupName||'Unknown Team'}</div><div style="font-size:.8rem;color:var(--text-secondary);margin-top:3px">Invitation to join as <strong>${inv.role}</strong> by ${fromUser?.name||'CEO'}</div></div><span class="badge badge-blue">${inv.role}</span></div><div class="invite-actions"><button class="btn btn-success btn-sm" onclick="ITE.Pages.Student._respondInvite('${inv.id}','accepted')">Accept</button><button class="btn btn-danger btn-sm" onclick="ITE.Pages.Student._respondInvite('${inv.id}','rejected')">Decline</button></div></div>`;
  }).join('')}
</div>`:''}

<div class="stats-grid">
  ${[['Tasks',tasks.length,`${mySubmissions.length} submitted`,'#2563EB'],
     ['My Team',team?team.startupName:'Unassigned',team?ITE.App.STAGES[team.stage||0]?.label:'—','#10B981'],
     ['Announcements',feedAnns.length,'Unread feed','#8B5CF6'],
     ['My Role',user.teamRole||'Student',user.isCEO?'CEO Privileges':'Member','#F59E0B']
  ].map(([lbl,val,sub,col])=>`<div class="stat-card"><div class="stat-value" style="font-size:${String(val).length>10?'1.1rem':'1.875rem'}">${val}</div><div class="stat-label">${lbl}</div><div class="stat-sub">${sub}</div></div>`).join('')}
</div>

<div class="two-col">
  <!-- Team Status -->
  <div class="card">
    <div class="card-header"><div class="card-title">Team Status</div><a href="#/student/my-team" class="btn btn-ghost btn-sm">View</a></div>
    ${!team?`<div class="empty-state" style="padding:24px 0"><h3>No Team Assignment</h3><p>Please wait for role assignment or team invitation.</p></div>`:
    `<div>
      <div style="font-family:var(--font-display);font-size:1.125rem;font-weight:800;margin-bottom:5px">${team.startupName||'Unnamed Startup'}</div>
      <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px;line-height:1.5">${team.problemStatement||'No problem statement defined'}</p>
      ${ITE.App.renderProgressTracker(team.stage||0)}
      ${mentor?`<div style="margin-top:12px;font-size:.8rem;color:var(--text-muted)">Mentor: <strong style="color:var(--text-primary)">${mentor.name}</strong></div>`:''}
    </div>`}
  </div>
  <!-- Recent Announcements -->
  <div class="card">
    <div class="card-header"><div class="card-title">Recent Announcements</div><a href="#/student/announcements" class="btn btn-ghost btn-sm">View All</a></div>
    ${feedAnns.length===0?`<div class="empty-state" style="padding:20px 0"><h3>No announcements</h3></div>`:
    feedAnns.slice(0,3).map(a=>`<div class="ann-card ${a.createdByRole}-ann"><div class="ann-meta"><span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${a.createdByRole.toUpperCase()}</span></div><div class="ann-title">${a.title}</div><div class="ann-date">${new Date(a.createdAt).toLocaleDateString('en-IN')}</div></div>`).join('')}
  </div>
</div>

${user.isCEO&&team&&!team.startupName?`<div class="card mt-6" style="border-color:var(--accent)"><div class="card-header"><div class="card-title">Startup Profile Setup Required</div></div><p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px">As CEO, you are required to define the startup profile and invite team members.</p><button class="btn btn-primary" onclick="ITE.Pages.Student.showCreateStartup()">Create Startup Profile</button></div>`:''}`;
    } catch (err) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;">Error: ${err.message}</div>`;
    }
  }

  /* ---- My Team ---- */
  async function renderMyTeam() {
    ITE.App.pc().innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading team...</div>`;
    try {
      let user = ITE.Auth.getCurrentUser();
      
      // Refresh local user context to ensure sync with mentor/admin assignments
      const updatedUser = await ITE.API.get('/auth/me');
      if (updatedUser) {
        ITE.Auth.updateCurrentUser(updatedUser);
        user = updatedUser;
      }
      if (!user.teamId) {
        ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">My Team</div></div>
<div class="no-team-card">
  <h3 style="font-family:var(--font-display);font-size:1.25rem;font-weight:700;margin-bottom:8px">No Team Assignment</h3>
  <p style="font-size:.9rem;color:var(--text-secondary);max-width:380px;margin:0 auto 20px">Your mentor will assign you to a team or designate you as CEO. You may also check pending invitations on the dashboard.</p>
  <a href="#/student/dashboard" class="btn btn-primary">View Dashboard</a>
</div>`;
        return;
      }

      const [team, students, mentors, anns, pendingInvites, sentInvites] = await Promise.all([
        ITE.API.get(`/teams/${user.teamId}`),
        ITE.API.get('/users/students'),
        ITE.API.get('/users/mentors'),
        ITE.API.get('/announcements'),
        ITE.API.get('/invitations/pending'),
        ITE.API.get('/invitations/sent')
      ]);

      const mentor = user.mentorId ? mentors.find(m => m.id === user.mentorId) : null;
      const teamAnns = anns.filter(a => a.recipients === 'team-' + user.teamId);
      const members = (team.members || []).map(m => {
        const s = students.find(st => st.id === m.userId);
        return { ...m, name: s?.name || 'Unknown', avatar: s?.avatar || '?', rollNo: s?.rollNo || '', branch: s?.branch || '' };
      });

      ITE.App.pc().innerHTML = `
${pendingInvites.length>0?`<div style="margin-bottom:16px">${pendingInvites.map(inv=>{
  return `<div class="invite-card"><div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px"><div><div style="font-weight:600">Invitation to join as ${inv.role}</div><div style="font-size:.8rem;color:var(--text-secondary);margin-top:2px">Invited by another CEO</div></div><span class="badge badge-blue">${inv.role}</span></div><div class="invite-actions"><button class="btn btn-success btn-sm" onclick="ITE.Pages.Student._respondInvite('${inv.id}','accepted')">Accept</button><button class="btn btn-danger btn-sm" onclick="ITE.Pages.Student._respondInvite('${inv.id}','rejected')">Decline</button></div></div>`;
}).join('')}</div>`:''}

<!-- Hero banner -->
<div class="my-team-hero">
  <div class="my-team-name">${team.startupName || 'Unnamed Venture'}</div>
  <div class="my-team-tagline">${team.problemStatement || 'No problem statement defined'}</div>
  <div class="my-team-meta">
    ${mentor?`<div class="my-team-meta-item"><span>Mentor: ${mentor.name}</span></div>`:''}
    <div class="my-team-meta-item"><span>${members.length} Members</span></div>
    <div class="my-team-meta-item"><span>Sector: ${team.industry || 'Unknown'}</span></div>
    <div class="my-team-meta-item"><span>Stage ${(team.stage||0) + 1}</span></div>
  </div>
</div>

<div class="two-col">
  <!-- Left column -->
  <div>
    <!-- Progress Tracker -->
    <div class="card mb-4" style="margin-bottom:16px">
      <div class="card-header"><div class="card-title">Venture Progress</div></div>
      ${ITE.App.renderProgressTracker(team.stage||0)}
      <div style="margin-top:14px;padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm)">
        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:4px">Current Stage</div>
        <div style="font-size:.9375rem;font-weight:600;color:var(--text-primary)">Stage ${(team.stage||0) + 1}: ${ITE.App.STAGES[team.stage||0]?.label}</div>
        <div style="font-size:.8rem;color:var(--text-secondary);margin-top:3px">${_stageHint(team.stage||0)}</div>
      </div>
    </div>

    <!-- Startup Details -->
    <div class="card mb-4" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-title">Venture Details</div>
        ${user.isCEO?`<button class="btn btn-ghost btn-sm" onclick="ITE.Pages.Student.showEditStartup('${team.id}')">Edit</button>`:''}
      </div>
      <div style="display:grid;gap:12px">
        <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:3px">Venture Name</div><div style="font-size:.9375rem;font-weight:600">${team.startupName||''}</div></div>
        <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:3px">Industry</div><span class="badge badge-blue">${team.industry||''}</span></div>
        <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:3px">Problem Statement</div><p style="font-size:.875rem;line-height:1.6;color:var(--text-secondary)">${team.problemStatement||''}</p></div>
        <div><div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:3px">Description</div><p style="font-size:.875rem;line-height:1.6;color:var(--text-secondary)">${team.solution||team.description||'Not provided.'}</p></div>
      </div>
    </div>

    <!-- Team Announcements -->
    <div class="card">
      <div class="card-header"><div class="card-title">Team Announcements</div></div>
      ${teamAnns.length===0?`<div class="empty-state" style="padding:20px 0"><h3>No team announcements</h3></div>`:
      teamAnns.map(a=>`<div class="ann-card mentor-ann"><div class="ann-meta"><span class="badge badge-green">${(a.createdByRole||'mentor').toUpperCase()}</span><span style="font-size:.72rem;color:var(--text-muted)">${a.createdByName}</span></div><div class="ann-title">${a.title}</div><div class="ann-body">${a.body||a.content||''}</div><div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div></div>`).join('')}
    </div>
  </div>

  <!-- Right column: Members + CEO actions -->
  <div>
    <div class="card mb-4" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-title">Team Directory</div>
        ${user.isCEO?`<button class="btn btn-primary btn-sm" onclick="ITE.Pages.Student.showInviteMember()">Invite</button>`:''}
      </div>
      <div style="display:grid;gap:8px">
        ${members.map(m=>`<div class="member-card"><div class="member-avatar" style="background:${ITE.App.roleColor(m.teamRole)}">${m.avatar||'?'}</div><div class="member-info"><div class="member-name">${m.name||''} ${m.userId===user.id?'<span style="font-size:.65rem;color:var(--accent)">(You)</span>':''}</div><div class="member-sub">${m.rollNo||''} · ${m.branch||''}</div></div><span class="badge" style="background:${ITE.App.roleColor(m.teamRole)}22;color:${ITE.App.roleColor(m.teamRole)}">${m.teamRole}</span></div>`).join('')}
        ${members.length<4?`<div style="padding:10px;text-align:center;border:1px dashed var(--border);border-radius:var(--radius-sm);font-size:.8rem;color:var(--text-muted)">${4-members.length} slot${4-members.length!==1?'s':''} available</div>`:''}
      </div>
    </div>

    ${mentor?`<div class="card mb-4" style="margin-bottom:16px">
      <div class="card-header"><div class="card-title">Dedicated Advisory</div></div>
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;color:#FFF">${mentor.avatar||'?'}</div>
        <div><div style="font-weight:700;font-size:.9375rem">${mentor.name}</div><div style="font-size:.8rem;color:var(--text-muted)">${mentor.specialization||'Faculty Mentor'}</div><div style="font-size:.75rem;color:var(--text-muted);margin-top:2px">Email: ${mentor.email}</div></div>
      </div>
    </div>`:''}

    ${user.isCEO?`<div class="card" style="border-color:var(--accent)">
      <div class="card-header"><div class="card-title">Executive Controls</div></div>
      <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:12px">Invite team members and manage venture details.</p>
      <div style="display:grid;gap:8px">
        <button class="btn btn-primary" onclick="ITE.Pages.Student.showInviteMember()">Invite Team Member</button>
        <button class="btn btn-ghost" onclick="ITE.Pages.Student.showEditStartup('${team.id}')">Edit Startup Profile</button>
      </div>
      ${_pendingInvitesSentHtml(sentInvites, students)}
    </div>`:''}
  </div>
</div>`;
    } catch(err) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;">Error: ${err.message}</div>`;
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

  function _pendingInvitesSentHtml(sentInvites, students) {
    const pending = sentInvites.filter(i => i.status === 'pending');
    if (!pending.length) return '';
    return `<div style="margin-top:12px"><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:6px">Pending Invitations (${pending.length})</div>${pending.map(inv=>{
      const toUser = students.find(s => s.id === inv.toUserId);
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-subtle)"><span style="font-size:.8rem">${toUser?.name||'?'} → ${inv.role}</span><span class="badge badge-yellow">Pending</span></div>`;
    }).join('')}</div>`;
  }

  /* ---- CEO: Create/Edit Startup ---- */
  function showCreateStartup() {
    const user = ITE.Auth.getCurrentUser();
    if (!user.teamId) { ITE.App.toast('No team assigned yet.','warning'); return; }
    showEditStartup(user.teamId);
  }

  async function showEditStartup(teamId) {
    try {
      const team = await ITE.API.get(`/teams/${teamId}`);
      ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">${team?.startupName?'Edit':'Create'} Startup Profile</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Startup Name *</label><input id="sp-name" class="form-control" value="${team?.startupName||''}" placeholder="AgriTech Connect"></div>
  <div class="form-group"><label class="form-label">Industry *</label><select id="sp-ind" class="form-control">${['Agriculture & Food Tech','Education Technology','Healthcare','Fintech','Sustainability','Safety Tech','Smart Cities','E-Commerce','SaaS','Other'].map(i=>`<option ${team?.industry===i?'selected':''}>${i}</option>`).join('')}</select></div>
  <div class="form-group"><label class="form-label">Problem Statement *</label><textarea id="sp-prob" class="form-control" rows="3" placeholder="What problem does your startup solve?">${team?.problemStatement||''}</textarea></div>
  <div class="form-group"><label class="form-label">Startup Description *</label><textarea id="sp-desc" class="form-control" rows="4" placeholder="Describe your solution, value proposition, and how it works…">${team?.description||team?.solution||''}</textarea></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Student._submitStartup('${teamId}')">Save Profile</button></div>
</div>`);
    } catch(err) {
      ITE.App.toast('Failed to load startup details', 'error');
    }
  }

  async function _submitStartup(teamId) {
    const name=document.getElementById('sp-name')?.value?.trim();
    const ind=document.getElementById('sp-ind')?.value;
    const prob=document.getElementById('sp-prob')?.value?.trim();
    const desc=document.getElementById('sp-desc')?.value?.trim();
    if(!name||!ind||!prob||!desc){ITE.App.toast('Fill all required fields.','error');return;}
    
    try {
      await ITE.API.patch(`/teams/${teamId}`, { startupName: name, industry: ind, problemStatement: prob, description: desc });
      ITE.App.toast('Startup profile saved!','success');
      ITE.App.closeModal(); 
      renderMyTeam();
    } catch(err) {
      ITE.App.toast(err.message, 'error');
    }
  }

  /* ---- CEO: Invite Members ---- */
  async function showInviteMember() {
    try {
      const user = ITE.Auth.getCurrentUser();
      const [team, allStudents] = await Promise.all([
        ITE.API.get(`/teams/${user.teamId}`),
        ITE.API.get('/users/students')
      ]);
      if (!team) { ITE.App.toast('No team found.','warning'); return; }
      const existingRoles = (team.members || []).map(m=>m.teamRole||m.role);
      const availableRoles = ['CTO','CFO','CMO'].filter(r=>!existingRoles.includes(r));
      if (!availableRoles.length) { ITE.App.toast('All executive roles are filled!','info'); return; }
      
      const eligibleStudents = allStudents.filter(s=>s.id!==user.id && !(team.members||[]).some(m=>m.userId===s.id) && !s.teamId);
      
      ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Invite Team Member</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:14px">Invite a student to join your team. They'll receive an invitation they can accept or decline.</p>
  <div class="form-group"><label class="form-label">Select Student</label><select id="inv-stu" class="form-control"><option value="">Choose student…</option>${eligibleStudents.map(s=>`<option value="${s.id}">${s.name} (${s.rollNo}) · ${s.branch}</option>`).join('')}</select><div class="form-hint">You can invite any registered ITE student not already in a team.</div></div>
  <div class="form-group"><label class="form-label">Role to Assign</label><select id="inv-role" class="form-control">${availableRoles.map(r=>`<option value="${r}">${r}</option>`).join('')}</select></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Student._submitInvite()">Send Invitation</button></div>
</div>`);
    } catch(err) {
      ITE.App.toast('Failed to load eligible students', 'error');
    }
  }

  async function _submitInvite() {
    const stuId=document.getElementById('inv-stu')?.value;
    const role=document.getElementById('inv-role')?.value;
    if(!stuId||!role){ITE.App.toast('Select student and role.','error');return;}
    
    try {
      await ITE.API.post('/invitations', { toUserId: stuId, role });
      ITE.App.toast(`Invitation sent successfully!`,'success');
      ITE.App.closeModal(); 
      renderMyTeam();
    } catch(err) {
      ITE.App.toast(err.message, 'error');
    }
  }

  async function _respondInvite(invId, status) {
    try {
      await ITE.API.patch(`/invitations/${invId}`, { status });
      if (status === 'accepted') {
        ITE.App.toast(`You have joined the team.`,'success');
      } else {
        ITE.App.toast('Invitation declined.','info');
      }
      
      // Update local user context since they might have a new team assigned
      const updatedUser = await ITE.API.get('/auth/me');
      if (updatedUser) ITE.Auth.updateCurrentUser(updatedUser);
      
      ITE.App.route();
    } catch(err) {
      ITE.App.toast(err.message, 'error');
    }
  }

  /* ---- Tasks ---- */
  async function renderTasks() {
    ITE.App.pc().innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading tasks...</div>`;
    try {
      const [tasks, subs] = await Promise.all([
        ITE.API.get('/tasks'),
        ITE.API.get('/submissions/my')
      ]);
      const getSubForTask = (taskId) => subs.find(s=>s.taskId===taskId);
      const submitted = subs.length;
      const total = tasks.length;

      ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">Tasks</div><div class="page-subtitle">${submitted}/${total} completed</div></div>
<div class="card" style="margin-bottom:16px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:.875rem;color:var(--text-secondary)">Overall Completion</span><span style="font-weight:700">${total?Math.round(submitted/total*100):0}%</span></div>
  <div class="analytics-bar-track" style="height:10px"><div class="analytics-bar-fill" style="width:${total?submitted/total*100:0}%"></div></div>
</div>
${tasks.length===0?`<div class="empty-state card"><h3>No tasks assigned yet</h3></div>`:
tasks.map(task=>{
  const sub=getSubForTask(task.id);
  const done=!!sub;
  return`<div class="task-card">
  <div class="task-check ${done?'done':''}"></div>
  <div style="flex:1">
    <div class="task-title">${task.title}</div>
    <div class="task-desc">${task.description}</div>
    <div style="display:flex;align-items:center;gap:12px;margin-top:7px;flex-wrap:wrap">
      <div class="task-due">Due: ${new Date(task.dueDate).toLocaleDateString('en-IN')}</div>
      <span class="badge badge-blue">${task.category}</span>
      ${done?`<span class="badge badge-green">Submitted ${sub.grade?`· Grade: ${sub.grade}`:''}</span>`:`<span class="badge badge-yellow">Pending</span>`}
    </div>
    ${done?`<div style="margin-top:10px;padding:10px;background:var(--success-light);border-radius:var(--radius-sm);font-size:.8rem;color:var(--success)">Submitted: "${sub.content?.slice(0,80)||''}…"</div>`:
    `<div style="margin-top:10px"><button class="btn btn-primary btn-sm" onclick="ITE.Pages.Student.showSubmitTask('${task.id}','${task.title.replace(/'/g,"\\'")}')">Submit Task</button></div>`}
  </div>
</div>`;
}).join('')}`;
    } catch(err) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;">Error: ${err.message}</div>`;
    }
  }

  function showSubmitTask(taskId, taskTitle) {
    ITE.App.showModal(`<div class="modal">
<div class="modal-header"><div class="modal-title">Submit: ${taskTitle}</div><button class="modal-close btn">✕</button></div>
<div class="modal-body">
  <div class="form-group"><label class="form-label">Your Submission</label><textarea id="sub-content" class="form-control" rows="5" placeholder="Write your submission here. Be thorough and specific…"></textarea><div class="form-hint">Minimum 50 characters. Be detailed and clear.</div></div>
</div>
<div class="modal-footer"><button class="btn btn-ghost" onclick="ITE.App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="ITE.Pages.Student._submitTask('${taskId}', '${taskTitle.replace(/'/g,"\\'")}')">Submit</button></div>
</div>`);
  }

  async function _submitTask(taskId, taskTitle) {
    const content=document.getElementById('sub-content')?.value?.trim();
    if(!content||content.length<10){ITE.App.toast('Please write a proper submission.','error');return;}
    try {
      await ITE.API.post('/submissions', { taskId, title: taskTitle, content });
      ITE.App.toast('Task submitted successfully.','success');
      ITE.App.closeModal(); 
      renderTasks();
    } catch(err) {
      ITE.App.toast(err.message, 'error');
    }
  }

  /* ---- Announcements ---- */
  async function renderAnnouncements() {
    ITE.App.pc().innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading announcements...</div>`;
    try {
      const user = ITE.Auth.getCurrentUser();
      const allAnns = await ITE.API.get('/announcements');
      
      const anns = allAnns.filter(a => a.recipients === 'all' || a.recipients === 'students' || a.recipients === 'all-students' || (user.teamId && a.recipients === 'team-' + user.teamId));

      ITE.App.pc().innerHTML = `
<div class="page-header"><div class="page-title">Announcements</div><div class="page-subtitle">${anns.length} total announcements · View-only</div></div>
${anns.length===0?`<div class="empty-state card"><h3>No announcements</h3><p>Announcements from your admin and mentor will appear here.</p></div>`:
anns.map(a=>`<div class="ann-card ${a.createdByRole}-ann"><div class="ann-meta"><span class="badge ${a.createdByRole==='admin'?'badge-blue':'badge-green'}">${(a.createdByRole||'mentor').toUpperCase()}</span><span style="font-size:.72rem;color:var(--text-muted)">by ${a.createdByName}</span>${user.teamId&&a.recipients==='team-'+user.teamId?`<span class="badge badge-purple">Your Team</span>`:a.recipients==='all-students'?`<span class="badge badge-blue">All Students</span>`:''}</div><div class="ann-title">${a.title}</div><div class="ann-body">${a.body||a.content||''}</div><div class="ann-date">${new Date(a.createdAt).toLocaleString('en-IN')}</div></div>`).join('')}`;
    } catch(err) {
      ITE.App.pc().innerHTML = `<div style="color:red; padding:20px; background:white;">Error: ${err.message}</div>`;
    }
  }

  return {
    renderDashboard, renderMyTeam, renderTasks, renderAnnouncements,
    showCreateStartup, showEditStartup, _submitStartup,
    showInviteMember, _submitInvite, _respondInvite,
    showSubmitTask, _submitTask,
  };
})();
