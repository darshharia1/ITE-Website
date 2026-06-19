/* =====================================================
   ITE STARTUP LAUNCH PAD – AUTH (auth.js)
   ===================================================== */
window.ITE = window.ITE || {};

ITE.Auth = (function () {
  const SESSION_KEY = 'ite_session';

  function login(email, password) {
    const user = ITE.Data.getUserByEmail(email);
    if (!user) return { success: false, error: 'No account found with this email address.' };
    if (user.password !== password) return { success: false, error: 'Incorrect password. Please try again.' };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    return { success: true, user };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.hash = '/';
    window.location.reload();
  }

  function getCurrentUser() {
    const s = sessionStorage.getItem(SESSION_KEY);
    if (!s) return null;
    try { const { userId } = JSON.parse(s); return ITE.Data.getUserById(userId); } catch { return null; }
  }

  function isLoggedIn() { return !!getCurrentUser(); }

  function register(data) {
    const { email, password, name, rollNo, branch, skills, interests } = data;
    if (!ITE.Data.isApproved(email)) return { success: false, error: 'This email is not on the approved student list. Contact your ITE coordinator.' };
    if (ITE.Data.getUserByEmail(email)) return { success: false, error: 'An account with this email already exists. Please log in instead.' };
    if (!name || !email || !password || !branch) return { success: false, error: 'Please fill in all required fields.' };
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    const user = ITE.Data.createUser({
      email, password, name, rollNo, branch,
      skills: skills ? skills.split(',').map(s=>s.trim()).filter(Boolean) : [],
      interests: interests ? interests.split(',').map(s=>s.trim()).filter(Boolean) : [],
      role: 'student', avatar, teamId: null, teamRole: null, isCEO: false, profileComplete: true, mentorId: null,
    });
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    return { success: true, user };
  }

  return { login, logout, getCurrentUser, isLoggedIn, register };
})();
