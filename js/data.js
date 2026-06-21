/* =====================================================
   ITE STARTUP LAUNCH PAD – DATA LAYER (data.js)
   Refactored for Asynchronous API Fetch Connections
   ===================================================== */
window.ITE = window.ITE || {};

ITE.Data = (function () {
  
  // Helper to parse responses
  async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'API Request failed');
    }
    return data;
  }

  /* ---- Mappers to align backend schema with frontend structure ---- */
  
  function mapUser(u) {
    if (!u) return null;
    const nameVal = u.name || u.full_name || '';
    return {
      id: u.id,
      email: u.email,
      name: nameVal,
      rollNo: u.rollNo || u.roll_no || '',
      branch: u.branch || '',
      role: u.role || 'student',
      skills: u.skills || [],
      teamId: u.teamId || u.team_id || null,
      teamRole: u.teamRole || u.team_role || null,
      mentorId: u.mentorId || u.mentor_id || null,
      avatar: u.avatar || nameVal.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      specialization: u.specialization || '',
      isCEO: u.role === 'CEO' || u.teamRole === 'CEO' || u.team_role === 'CEO' || u.is_ceo || false
    };
  }

  function mapTeam(t) {
    if (!t) return null;
    return {
      id: t.id,
      startupName: t.startupName || t.startup_name || t.team_name || '',
      problemStatement: t.problemStatement || t.problem_statement || t.startup_idea_description || '',
      description: t.description || '',
      industry: t.industry || '',
      mentorId: t.mentorId || t.mentor_id || null,
      ceoId: t.ceoId || t.ceo_id || null,
      stage: typeof t.stage === 'number' ? t.stage : 0,
      members: t.members || []
    };
  }

  function mapAnnouncement(a) {
    if (!a) return null;
    const isTeam = a.audience_scope === 'team';
    return {
      id: a.id,
      title: a.title,
      content: a.content,
      recipients: isTeam ? `team-${a.team_id}` : a.audience_scope,
      createdByRole: isTeam ? 'mentor' : 'admin',
      createdByName: isTeam ? 'Faculty Mentor' : 'ITE Coordinator',
      createdAt: a.created_at
    };
  }

  function mapInvitation(i) {
    if (!i) return null;
    return {
      id: i.id,
      teamId: i.team_id,
      fromUserId: i.inviter_id,
      invitee_email: i.invitee_email,
      status: i.status,
      createdAt: i.created_at,
      role: i.role || 'CTO'
    };
  }

  /* ---- Users ---- */
  async function getUsers() {
    const res = await ITE.Auth.fetchWithAuth('/api/users');
    const list = await handleResponse(res);
    return list.map(mapUser);
  }

  async function getUserById(id) {
    const res = await ITE.Auth.fetchWithAuth(`/api/users/${id}`);
    const u = await handleResponse(res);
    return mapUser(u);
  }

  async function getUserByEmail(email) {
    const users = await getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async function createUser(data) {
    const mappedData = {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || 'student',
      rollNo: data.rollNo || '',
      branch: data.branch || '',
      skills: data.skills || [],
      teamId: data.teamId || null,
      mentorId: data.mentorId || null
    };
    const res = await ITE.Auth.fetchWithAuth('/api/users', {
      method: 'POST',
      body: JSON.stringify(mappedData)
    });
    const u = await handleResponse(res);
    return mapUser(u);
  }

  async function updateUser(id, upd) {
    const mappedUpd = { ...upd };
    if (upd.name) {
      mappedUpd.name = upd.name;
    }
    const res = await ITE.Auth.fetchWithAuth(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mappedUpd)
    });
    const u = await handleResponse(res);
    return mapUser(u);
  }

  async function deleteUser(id) {
    const res = await ITE.Auth.fetchWithAuth(`/api/users/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }

  async function getMentors() {
    const users = await getUsers();
    return users.filter(u => u.role === 'mentor');
  }

  async function getStudents() {
    const users = await getUsers();
    return users.filter(u => u.role === 'student');
  }

  /* ---- Teams / Startups ---- */
  async function getTeams() {
    const res = await ITE.Auth.fetchWithAuth('/api/startups');
    const list = await handleResponse(res);
    return list.map(mapTeam);
  }

  async function getTeamById(id) {
    const res = await ITE.Auth.fetchWithAuth(`/api/startups/${id}`);
    const t = await handleResponse(res);
    const team = mapTeam(t);
    if (team) {
      // Resolve members from the users list (junction table data is mapped to user properties)
      const users = await getUsers();
      const members = users.filter(u => u.teamId === id);
      team.members = members.map(m => ({
        userId: m.id,
        role: m.teamRole || 'CTO'
      }));
    }
    return team;
  }

  async function createTeam(data) {
    const res = await ITE.Auth.fetchWithAuth('/api/startups', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const t = await handleResponse(res);
    return mapTeam(t);
  }

  async function updateTeam(id, upd) {
    const res = await ITE.Auth.fetchWithAuth(`/api/startups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(upd)
    });
    const t = await handleResponse(res);
    return mapTeam(t);
  }

  /* ---- Announcements ---- */
  async function getAnnouncements() {
    const res = await ITE.Auth.fetchWithAuth('/api/announcements');
    const list = await handleResponse(res);
    return list.map(mapAnnouncement);
  }

  async function createAnnouncement(data) {
    const audience_scope = data.recipients.startsWith('team-') ? 'team' : data.recipients;
    const team_id = audience_scope === 'team' ? data.recipients.replace('team-', '') : null;
    
    const mappedData = {
      title: data.title,
      content: data.content,
      audience_scope,
      team_id
    };

    const res = await ITE.Auth.fetchWithAuth('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(mappedData)
    });
    const a = await handleResponse(res);
    return mapAnnouncement(a);
  }

  async function deleteAnnouncement(id) {
    const res = await ITE.Auth.fetchWithAuth(`/api/announcements/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }

  async function getAnnouncementsForUser() {
    return getAnnouncements();
  }

  /* ---- Tasks & Submissions ---- */
  async function getTasks() {
    const res = await ITE.Auth.fetchWithAuth('/api/tasks');
    return handleResponse(res);
  }

  async function createSubmission(taskId, submissionLink) {
    const res = await ITE.Auth.fetchWithAuth(`/api/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ submission_link: submissionLink })
    });
    return handleResponse(res);
  }

  async function getSubmissions() {
    const tasks = await getTasks();
    const currentUser = await ITE.Auth.getCurrentUser();
    if (!currentUser) return [];
    
    return tasks
      .filter(t => t.submission_link)
      .map(t => ({
        id: t.id + '_sub',
        taskId: t.id,
        studentId: currentUser.id,
        content: t.submission_link,
        grade: t.graded_status === 'graded' ? 'A' : null,
        submittedAt: t.submitted_at
      }));
  }

  async function getSubByStudentTask(sId, tId) {
    const subs = await getSubmissions();
    return subs.find(s => s.studentId === sId && s.taskId === tId) || null;
  }

  /* ---- Invitations ---- */
  async function getInvitations() {
    try {
      const res = await ITE.Auth.fetchWithAuth('/api/teams/invitations');
      const list = await handleResponse(res);
      return list.map(mapInvitation);
    } catch (err) {
      console.error('Failed to get invitations:', err);
      return [];
    }
  }

  async function createInvitation(data) {
    const user = await getUserById(data.toUserId);
    if (!user) {
      throw new Error('Target student not found');
    }

    const res = await ITE.Auth.fetchWithAuth('/api/teams/invitations', {
      method: 'POST',
      body: JSON.stringify({ 
        team_id: data.teamId, 
        invitee_email: user.email 
      })
    });
    const i = await handleResponse(res);
    return mapInvitation(i);
  }

  async function respondToInvitation(inviteId, status, role) {
    const res = await ITE.Auth.fetchWithAuth(`/api/teams/invitations/${inviteId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status, role })
    });
    return handleResponse(res);
  }

  async function getPendingInvites(userId) {
    const list = await getInvitations();
    const currentUser = await ITE.Auth.getCurrentUser();
    if (!currentUser) return [];
    
    return list.filter(i => 
      i.invitee_email.toLowerCase() === currentUser.email.toLowerCase() && 
      i.status === 'pending'
    );
  }

  /* ---- Previous Startups ---- */
  async function getPrevStartups() {
    const res = await ITE.Auth.fetchWithAuth('/api/startups/previous-startups');
    return handleResponse(res);
  }

  /* ---- Approved whitelist management (Admin only) ---- */
  async function getApproved() {
    const res = await ITE.Auth.fetchWithAuth('/api/admin/approved');
    const list = await handleResponse(res);
    return list.map(item => ({
      id: item.id,
      name: item.name || '',
      rollNo: item.roll_no || '',
      email: item.email,
      approvedAt: item.approved_at
    }));
  }

  async function uploadApprovedCSV(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const baseUrl = window.ITE.Config?.API_BASE_URL || 'http://localhost:3002';
    const res = await fetch(`${baseUrl}/api/admin/upload-approved`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    return handleResponse(res);
  }

  async function clearApproved() {
    const res = await ITE.Auth.fetchWithAuth('/api/admin/approved', {
      method: 'DELETE'
    });
    return handleResponse(res);
  }

  return {
    init: () => {},
    getUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser, getMentors, getStudents,
    getTeams, getTeamById, createTeam, updateTeam,
    getAnnouncements, createAnnouncement, deleteAnnouncement, getAnnouncementsForUser,
    getTasks, createSubmission, getSubmissions, getSubByStudentTask,
    getInvitations, createInvitation, respondToInvitation, getPendingInvites,
    getPrevStartups,
    getApproved, uploadApprovedCSV, clearApproved
  };
})();
