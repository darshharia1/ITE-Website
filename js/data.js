/* =====================================================
   ITE STARTUP LAUNCH PAD – DATA LAYER (data.js)
   localStorage-backed data store with full seed data
   ===================================================== */
window.ITE = window.ITE || {};

ITE.Data = (function () {
  const K = {
    users: 'ite_users', approved: 'ite_approved', teams: 'ite_teams',
    announcements: 'ite_announcements', tasks: 'ite_tasks',
    submissions: 'ite_submissions', invitations: 'ite_invitations',
    prevStartups: 'ite_prev_startups', init: 'ite_initialized',
  };

  const get = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  /* ---- Seed ---- */
  function seed() {
    if (get(K.init)) return;

    const aId1 = uid(), aId2 = uid();
    const m1 = uid(), m2 = uid();
    const s = Array.from({length:10}, () => uid());
    const [s1,s2,s3,s4,s5,s6,s7,s8,s9,s10] = s;
    const t1 = uid(), t2 = uid();

    const users = [
      {id:aId1,email:'admin@vnit.ac.in',password:'admin123',role:'admin',name:'Prof. Anand Chaturvedi',avatar:'AC',profileComplete:true,createdAt:'2024-06-01'},
      {id:aId2,email:'mentor-admin@vnit.ac.in',password:'mentor123',role:'admin',name:'Coordinator Admin',avatar:'CA',profileComplete:true,createdAt:'2024-06-01'},
      {id:m1,email:'dr.sharma@vnit.ac.in',password:'mentor123',role:'mentor',name:'Dr. Ravi Sharma',avatar:'RS',specialization:'Product & Market Strategy',profileComplete:true,assignedTeams:[t1],createdAt:'2024-06-01'},
      {id:m2,email:'dr.patel@vnit.ac.in',password:'mentor123',role:'mentor',name:'Dr. Priya Patel',avatar:'PP',specialization:'Finance & Operations',profileComplete:true,assignedTeams:[t2],createdAt:'2024-06-01'},
      {id:s1,email:'aarav.mehta@students.vnit.ac.in',password:'student123',role:'student',name:'Aarav Mehta',avatar:'AM',rollNo:'24BCE001',branch:'Computer Science',skills:['Python','ML','Business Strategy'],interests:['AgriTech','IoT'],teamId:t1,teamRole:'CEO',isCEO:true,profileComplete:true,mentorId:m1,createdAt:'2024-06-10'},
      {id:s2,email:'diya.singh@students.vnit.ac.in',password:'student123',role:'student',name:'Diya Singh',avatar:'DS',rollNo:'24BCE002',branch:'Electronics',skills:['React','Node.js','System Design'],interests:['SaaS','EdTech'],teamId:t1,teamRole:'CTO',profileComplete:true,mentorId:m1,createdAt:'2024-06-10'},
      {id:s3,email:'rohan.kumar@students.vnit.ac.in',password:'student123',role:'student',name:'Rohan Kumar',avatar:'RK',rollNo:'24BCE003',branch:'Mechanical',skills:['Financial Modeling','Excel'],interests:['Fintech'],teamId:t1,teamRole:'CFO',profileComplete:true,mentorId:m1,createdAt:'2024-06-10'},
      {id:s4,email:'ananya.iyer@students.vnit.ac.in',password:'student123',role:'student',name:'Ananya Iyer',avatar:'AI',rollNo:'24BCE004',branch:'Chemical',skills:['Marketing','Social Media'],interests:['Branding'],teamId:t1,teamRole:'CMO',profileComplete:true,mentorId:m1,createdAt:'2024-06-10'},
      {id:s5,email:'karan.joshi@students.vnit.ac.in',password:'student123',role:'student',name:'Karan Joshi',avatar:'KJ',rollNo:'24BCE005',branch:'Electrical',skills:['Leadership','Data Analysis'],interests:['EdTech'],teamId:t2,teamRole:'CEO',isCEO:true,profileComplete:true,mentorId:m2,createdAt:'2024-06-10'},
      {id:s6,email:'nisha.verma@students.vnit.ac.in',password:'student123',role:'student',name:'Nisha Verma',avatar:'NV',rollNo:'24BCE006',branch:'Computer Science',skills:['Full Stack','AI/ML'],interests:['EdTech'],teamId:t2,teamRole:'CTO',profileComplete:true,mentorId:m2,createdAt:'2024-06-10'},
      {id:s7,email:'arjun.nair@students.vnit.ac.in',password:'student123',role:'student',name:'Arjun Nair',avatar:'AN',rollNo:'24BCE007',branch:'Civil',skills:['Finance','Fundraising'],interests:['Fintech'],teamId:t2,teamRole:'CFO',profileComplete:true,mentorId:m2,createdAt:'2024-06-10'},
      {id:s8,email:'pooja.desai@students.vnit.ac.in',password:'student123',role:'student',name:'Pooja Desai',avatar:'PD',rollNo:'24BCE008',branch:'Chemical',skills:['UI/UX','Figma'],interests:['HealthTech'],teamId:null,teamRole:null,profileComplete:true,mentorId:null,createdAt:'2024-06-10'},
      {id:s9,email:'vikram.rao@students.vnit.ac.in',password:'student123',role:'student',name:'Vikram Rao',avatar:'VR',rollNo:'24BCE009',branch:'Mechanical',skills:['IoT','Embedded'],interests:['AgriTech'],teamId:null,teamRole:null,profileComplete:true,mentorId:null,createdAt:'2024-06-10'},
      {id:s10,email:'priya.gupta@students.vnit.ac.in',password:'student123',role:'student',name:'Priya Gupta',avatar:'PG',rollNo:'24BCE010',branch:'Electronics',skills:['Marketing Analytics'],interests:['Consumer Tech'],teamId:null,teamRole:null,profileComplete:true,mentorId:null,createdAt:'2024-06-10'},
    ];

    const approved = [
      {name:'Aarav Mehta',rollNo:'24BCE001',email:'aarav.mehta@students.vnit.ac.in'},
      {name:'Diya Singh',rollNo:'24BCE002',email:'diya.singh@students.vnit.ac.in'},
      {name:'Rohan Kumar',rollNo:'24BCE003',email:'rohan.kumar@students.vnit.ac.in'},
      {name:'Ananya Iyer',rollNo:'24BCE004',email:'ananya.iyer@students.vnit.ac.in'},
      {name:'Karan Joshi',rollNo:'24BCE005',email:'karan.joshi@students.vnit.ac.in'},
      {name:'Nisha Verma',rollNo:'24BCE006',email:'nisha.verma@students.vnit.ac.in'},
      {name:'Arjun Nair',rollNo:'24BCE007',email:'arjun.nair@students.vnit.ac.in'},
      {name:'Pooja Desai',rollNo:'24BCE008',email:'pooja.desai@students.vnit.ac.in'},
      {name:'Vikram Rao',rollNo:'24BCE009',email:'vikram.rao@students.vnit.ac.in'},
      {name:'Priya Gupta',rollNo:'24BCE010',email:'priya.gupta@students.vnit.ac.in'},
    ];

    const teams = [
      {id:t1,startupName:'AgriTech Connect',problemStatement:'Small and marginal farmers lack access to real-time market prices, weather data, and expert guidance, leading to poor yields and financial losses.',description:'AgriTech Connect is an AI-powered mobile platform bridging the gap between farmers and modern agricultural resources, providing personalized crop advisories, live market prices, and direct buyer connections.',industry:'Agriculture & Food Tech',mentorId:m1,ceoId:s1,members:[{userId:s1,role:'CEO'},{userId:s2,role:'CTO'},{userId:s3,role:'CFO'},{userId:s4,role:'CMO'}],stage:2,createdAt:'2024-07-01'},
      {id:t2,startupName:'EduBridge',problemStatement:'Students in tier-2 and tier-3 cities lack access to quality personalized learning, leading to educational inequality.',description:'EduBridge is an adaptive learning platform using AI to personalize educational content and connect students with expert tutors across India.',industry:'Education Technology',mentorId:m2,ceoId:s5,members:[{userId:s5,role:'CEO'},{userId:s6,role:'CTO'},{userId:s7,role:'CFO'}],stage:4,createdAt:'2024-06-20'},
    ];

    const ann1 = uid(), ann2 = uid(), ann3 = uid(), ann4 = uid(), ann5 = uid();
    const announcements = [
      {id:ann1,title:'🎉 Welcome to ITE 2024-25!',content:'The ITE program officially kicks off! All sessions will be held on Tuesdays and Fridays 4-6 PM in Seminar Hall A. Please complete your profile on the platform.',createdBy:aId1,createdByName:'Prof. Anand Chaturvedi',createdByRole:'admin',recipients:'all-students',createdAt:'2024-07-01'},
      {id:ann2,title:'📋 Mentor Assignments Complete',content:'All student teams have been assigned mentors. Check your dashboard for your mentor\'s details. First mentor meeting is scheduled for next week.',createdBy:aId1,createdByName:'Prof. Anand Chaturvedi',createdByRole:'admin',recipients:'all-students',createdAt:'2024-07-05'},
      {id:ann3,title:'📊 Market Research Deadline',content:'Team AgriTech Connect – Please submit your Market Research Report by Friday. Include at least 50 survey responses and a competitive analysis. Reach out if you need help.',createdBy:m1,createdByName:'Dr. Ravi Sharma',createdByRole:'mentor',recipients:'team-'+t1,createdAt:'2024-07-10'},
      {id:ann4,title:'🚀 MVP Showcase – August 15th',content:'All teams must have a working prototype ready for the MVP Showcase on August 15th. Faculty and industry judges will be present. Business casual dress code.',createdBy:aId1,createdByName:'Prof. Anand Chaturvedi',createdByRole:'admin',recipients:'all-students',createdAt:'2024-07-15'},
      {id:ann5,title:'💡 Customer Interview Template',content:'EduBridge team – I have shared a customer interview template. Please conduct at least 20 interviews before our next session. Focus on pain points, not solutions.',createdBy:m2,createdByName:'Dr. Priya Patel',createdByRole:'mentor',recipients:'team-'+t2,createdAt:'2024-07-12'},
    ];

    const tk = Array.from({length:5}, () => uid());
    const tasks = [
      {id:tk[0],title:'Problem Statement Submission',description:'Write a clear problem statement (max 200 words) identifying the real-world problem your startup solves. Include who is affected and the scale of the problem.',dueDate:'2024-07-30',category:'Foundation',createdBy:aId1,createdAt:'2024-07-01'},
      {id:tk[1],title:'Market Research Report',description:'Conduct comprehensive market research covering TAM, target segments, competitive landscape, and primary research (min. 30 responses).',dueDate:'2024-08-15',category:'Research',createdBy:aId1,createdAt:'2024-07-05'},
      {id:tk[2],title:'Customer Interview Summary',description:'Conduct at least 20 customer interviews. Submit a structured summary covering key pain points, validated/invalidated assumptions, and pivots made.',dueDate:'2024-08-30',category:'Validation',createdBy:aId1,createdAt:'2024-07-10'},
      {id:tk[3],title:'MVP Prototype Submission',description:'Submit a working prototype or clickable mockup. Include a 3-minute demo video and README explaining how to run it.',dueDate:'2024-09-15',category:'Development',createdBy:aId1,createdAt:'2024-07-15'},
      {id:tk[4],title:'Pitch Deck Submission',description:'Create a 10-12 slide pitch deck covering Problem, Solution, Market Size, Business Model, Traction, Team, Financial Projections, and Funding Ask.',dueDate:'2024-09-30',category:'Pitching',createdBy:aId1,createdAt:'2024-07-20'},
    ];

    const submissions = [
      {id:uid(),taskId:tk[0],studentId:s1,content:'Small farmers lack real-time market data...',submittedAt:'2024-07-28',grade:'A'},
      {id:uid(),taskId:tk[0],studentId:s5,content:'Students in tier-2 cities lack quality education...',submittedAt:'2024-07-27',grade:'A+'},
      {id:uid(),taskId:tk[1],studentId:s1,content:'AgriTech market research – TAM ₹12,000 Cr...',submittedAt:'2024-08-14',grade:'B+'},
      {id:uid(),taskId:tk[1],studentId:s5,content:'EdTech 250M K-12 students in India...',submittedAt:'2024-08-12',grade:'A'},
      {id:uid(),taskId:tk[2],studentId:s5,content:'20 customer interviews – key pain: high cost...',submittedAt:'2024-08-29',grade:'A-'},
      {id:uid(),taskId:tk[3],studentId:s5,content:'EduBridge MVP – adaptive quiz engine live...',submittedAt:'2024-09-14',grade:'A'},
    ];

    const prevStartups = [
      {id:uid(),name:'EduTech Pro',tagline:'Democratizing quality education for rural India',description:'An AI-driven personalized learning platform that reached 50,000+ students in rural Maharashtra through vernacular language support and offline-first technology.',industry:'Education',emoji:'📚',color:'#2563EB',batch:'2023',team:'Team Alpha',achievement:'Raised ₹25L Seed Funding',members:['Rahul S.','Priya M.','Akash V.','Sneha P.'],stage:'Funded'},
      {id:uid(),name:'GreenCycle',tagline:'Closing the loop on urban waste management',description:'A circular economy platform connecting urban households with recyclers, creating a cashback incentive model that processed 200+ tonnes of recyclable waste.',industry:'Sustainability',emoji:'♻️',color:'#10B981',batch:'2023',team:'Team Evergreen',achievement:'NASSCOM Finalist 2023',members:['Kavya R.','Nikhil J.','Aditya B.'],stage:'Incubated'},
      {id:uid(),name:'HealthBridge',tagline:'Your digital health companion',description:'A telemedicine and health record management platform connecting rural patients with specialist doctors, processing 10,000+ consultations across Maharashtra.',industry:'Healthcare',emoji:'🏥',color:'#EF4444',batch:'2022',team:'Team Medics',achievement:'IIM Nagpur Social Impact Award',members:['Pooja D.','Aryan S.','Meera K.','Rohit P.'],stage:'Operating'},
      {id:uid(),name:'AgriSmart',tagline:'Precision farming for the modern era',description:'IoT-powered precision agriculture platform using drone imaging and soil sensors to optimize crop yields. Deployed across 500+ acres in Vidarbha.',industry:'Agriculture',emoji:'🌾',color:'#F59E0B',batch:'2022',team:'Team Harvest',achievement:'Agri-Innovation Challenge Winner',members:['Sanjay K.','Ritu V.','Manoj L.'],stage:'Scaling'},
      {id:uid(),name:'FinFlow',tagline:'Simplifying financial access for SMEs',description:'A fintech platform providing instant credit scoring and micro-loans to small businesses using alternative data analytics, disbursing ₹2Cr+ in loans.',industry:'Fintech',emoji:'💰',color:'#8B5CF6',batch:'2021',team:'Team Catalyst',achievement:'RBI Sandbox Participant',members:['Amit G.','Shruti T.','Vivek N.','Anita R.'],stage:'Funded'},
      {id:uid(),name:'SafePath',tagline:'Making cities safer for women',description:'A women safety platform with real-time location sharing, emergency alerts, and community watch features. Active in 5 cities with 15,000+ registered users.',industry:'Safety Tech',emoji:'🛡️',color:'#EC4899',batch:'2021',team:'Team Shield',achievement:'MeitY Selected Startup',members:['Divya S.','Lalit M.','Neha P.'],stage:'Operating'},
      {id:uid(),name:'WasteWise',tagline:'Smart waste collection for smarter cities',description:'An IoT-based smart waste management solution using sensor-equipped bins and optimal route planning, reducing collection costs by 35%.',industry:'Smart Cities',emoji:'🏙️',color:'#0D9488',batch:'2020',team:'Team Clean',achievement:'Smart City Mission Partner',members:['Rakesh B.','Sonali D.','Harsh V.','Preeti K.'],stage:'Incubated'},
    ];

    set(K.users, users); set(K.approved, approved); set(K.teams, teams);
    set(K.announcements, announcements); set(K.tasks, tasks);
    set(K.submissions, submissions); set(K.invitations, []);
    set(K.prevStartups, prevStartups); set(K.init, true);
  }

  /* ---- Users ---- */
  const getUsers  = () => get(K.users) || [];
  const saveUsers = (u) => set(K.users, u);
  const getUserById    = (id) => getUsers().find(u => u.id === id) || null;
  const getUserByEmail = (e)  => getUsers().find(u => u.email.toLowerCase() === e.toLowerCase()) || null;
  function createUser(data) { const us = getUsers(); const u = {id:uid(), createdAt: new Date().toISOString(), ...data}; us.push(u); saveUsers(us); return u; }
  function updateUser(id, upd) { const us = getUsers(); const i = us.findIndex(u => u.id === id); if (i<0) return null; us[i]={...us[i],...upd}; saveUsers(us); return us[i]; }
  function deleteUser(id) { saveUsers(getUsers().filter(u => u.id !== id)); }
  const getMentors  = () => getUsers().filter(u => u.role === 'mentor');
  const getStudents = () => getUsers().filter(u => u.role === 'student');

  /* ---- Approved Students ---- */
  const getApproved    = () => get(K.approved) || [];
  const saveApproved   = (a) => set(K.approved, a);
  const isApproved     = (email) => getApproved().some(s => s.email.toLowerCase() === email.toLowerCase());

  /* ---- Teams ---- */
  const getTeams  = () => get(K.teams) || [];
  const saveTeams = (t) => set(K.teams, t);
  const getTeamById = (id) => getTeams().find(t => t.id === id) || null;
  function createTeam(data) { const ts = getTeams(); const t = {id:uid(), stage:0, createdAt: new Date().toISOString(), ...data}; ts.push(t); saveTeams(ts); return t; }
  function updateTeam(id, upd) { const ts = getTeams(); const i = ts.findIndex(t => t.id === id); if (i<0) return null; ts[i]={...ts[i],...upd}; saveTeams(ts); return ts[i]; }

  /* ---- Announcements ---- */
  const getAnnouncements  = () => get(K.announcements) || [];
  const saveAnnouncements = (a) => set(K.announcements, a);
  function createAnnouncement(data) { const list = getAnnouncements(); const item = {id:uid(), createdAt: new Date().toISOString(), ...data}; list.unshift(item); saveAnnouncements(list); return item; }
  function deleteAnnouncement(id) { saveAnnouncements(getAnnouncements().filter(a => a.id !== id)); }
  function getAnnouncementsForUser(user) {
    const all = getAnnouncements();
    if (user.role === 'admin') return all;
    if (user.role === 'mentor') return all.filter(a => a.recipients === 'all-mentors' || a.createdBy === user.id || (user.assignedTeams||[]).some(tid => a.recipients === 'team-'+tid));
    if (user.role === 'student') return all.filter(a => a.recipients === 'all-students' || (user.teamId && a.recipients === 'team-'+user.teamId));
    return [];
  }

  /* ---- Tasks ---- */
  const getTasks  = () => get(K.tasks) || [];
  const saveTasks = (t) => set(K.tasks, t);
  function createTask(data) { const ts = getTasks(); const t = {id:uid(), createdAt: new Date().toISOString(), ...data}; ts.unshift(t); saveTasks(ts); return t; }
  function deleteTask(id) { saveTasks(getTasks().filter(t => t.id !== id)); }

  /* ---- Submissions ---- */
  const getSubmissions = () => get(K.submissions) || [];
  const saveSubmissions = (s) => set(K.submissions, s);
  const getSubByStudentTask = (sId, tId) => getSubmissions().find(s => s.studentId === sId && s.taskId === tId) || null;
  function createSubmission(data) { const ss = getSubmissions(); const s = {id:uid(), submittedAt: new Date().toISOString(), ...data}; ss.push(s); saveSubmissions(ss); return s; }

  /* ---- Invitations ---- */
  const getInvitations  = () => get(K.invitations) || [];
  const saveInvitations = (i) => set(K.invitations, i);
  function createInvitation(data) { const inv = getInvitations(); const item = {id:uid(), status:'pending', createdAt: new Date().toISOString(), ...data}; inv.push(item); saveInvitations(inv); return item; }
  function updateInvitation(id, upd) { const inv = getInvitations(); const i = inv.findIndex(x => x.id === id); if (i<0) return null; inv[i]={...inv[i],...upd}; saveInvitations(inv); return inv[i]; }
  const getPendingInvites = (userId) => getInvitations().filter(i => i.toUserId === userId && i.status === 'pending');

  /* ---- Previous Startups ---- */
  const getPrevStartups = () => get(K.prevStartups) || [];

  return {
    init: seed, uid,
    getUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser, getMentors, getStudents,
    getApproved, saveApproved, isApproved,
    getTeams, getTeamById, createTeam, updateTeam,
    getAnnouncements, createAnnouncement, deleteAnnouncement, getAnnouncementsForUser,
    getTasks, createTask, deleteTask,
    getSubmissions, getSubByStudentTask, createSubmission,
    getInvitations, createInvitation, updateInvitation, getPendingInvites,
    getPrevStartups,
  };
})();
