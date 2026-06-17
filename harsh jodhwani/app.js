/* =====================================================
   ITE Startup Launch Pad — Application Logic
   ===================================================== */

'use strict';

// ── State ───────────────────────────────────────────
const state = {
  currentScreen: 'screen-landing',
  role: 'student',
  onboardStep: 1,
  selectedSkills: new Set(),
  selectedRole: null,
  invitations: { 'inv-1': true, 'inv-2': true, 'inv-3': true },
  invitedStudents: new Set(),
  adminTab: 'overview',
};

// ── Data ────────────────────────────────────────────
const SKILLS = [
  { id: 'react', label: 'React / Next.js', icon: '⚛️' },
  { id: 'nodejs', label: 'Node.js', icon: '🟩' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'ml', label: 'ML / AI', icon: '🤖' },
  { id: 'flutter', label: 'Flutter', icon: '💙' },
  { id: 'design', label: 'UI/UX Design', icon: '🎨' },
  { id: 'marketing', label: 'Digital Marketing', icon: '📱' },
  { id: 'finance', label: 'Finance / VC', icon: '💰' },
  { id: 'sales', label: 'Sales', icon: '🤝' },
  { id: 'devops', label: 'DevOps / Cloud', icon: '☁️' },
  { id: 'blockchain', label: 'Blockchain', icon: '⛓️' },
  { id: 'iot', label: 'IoT / Hardware', icon: '🔧' },
  { id: 'data', label: 'Data Analytics', icon: '📊' },
  { id: 'content', label: 'Content Writing', icon: '✍️' },
  { id: 'business', label: 'Business Dev', icon: '💼' },
  { id: 'legal', label: 'Legal / Compliance', icon: '⚖️' },
  { id: 'operations', label: 'Operations', icon: '🏭' },
  { id: 'research', label: 'Market Research', icon: '🔍' },
];

const ROLES = [
  { id: 'CEO', emoji: '👑', label: 'CEO', desc: 'Chief Executive Officer — Lead the vision, strategy, and team direction.' },
  { id: 'CTO', emoji: '⚙️', label: 'CTO', desc: 'Chief Technology Officer — Own the product architecture and tech stack.' },
  { id: 'COO', emoji: '🏭', label: 'COO', desc: 'Chief Operating Officer — Manage operations, logistics, and execution.' },
  { id: 'CFO', emoji: '💰', label: 'CFO', desc: 'Chief Financial Officer — Handle budgets, funding, and financial modeling.' },
  { id: 'CMO', emoji: '📣', label: 'CMO', desc: 'Chief Marketing Officer — Drive brand, growth, and customer acquisition.' },
];

const UNASSIGNED_STUDENTS = [
  { id: 's1', name: 'Riya Sharma', roll: 'ITE2021012', branch: 'CSE', role: 'CTO', skills: ['React', 'Node.js', 'MongoDB'], avatar: 'RS', color: 'from-indigo-400 to-indigo-600' },
  { id: 's2', name: 'Dev Khanna', roll: 'ITE2021019', branch: 'IT', role: 'COO', skills: ['Operations', 'Business Dev', 'Sales'], avatar: 'DK', color: 'from-emerald-400 to-emerald-600' },
  { id: 's3', name: 'Ananya Gupta', roll: 'ITE2021034', branch: 'BBA', role: 'CFO', skills: ['Finance', 'VC', 'Legal'], avatar: 'AG', color: 'from-purple-400 to-purple-600' },
  { id: 's4', name: 'Rohan Iyer', roll: 'ITE2021041', branch: 'ECE', role: 'CTO', skills: ['IoT', 'Python', 'ML/AI'], avatar: 'RI', color: 'from-amber-400 to-amber-600' },
  { id: 's5', name: 'Meera Patel', roll: 'ITE2021055', branch: 'BBA', role: 'CMO', skills: ['Marketing', 'Content Writing', 'Sales'], avatar: 'MP', color: 'from-rose-400 to-rose-600' },
  { id: 's6', name: 'Arnav Singh', roll: 'ITE2021063', branch: 'CSE', role: 'CTO', skills: ['React', 'Flutter', 'DevOps'], avatar: 'AS', color: 'from-teal-400 to-teal-600' },
  { id: 's7', name: 'Pooja Rao', roll: 'ITE2021072', branch: 'Design', role: 'CMO', skills: ['UI/UX Design', 'Content Writing', 'Marketing'], avatar: 'PR', color: 'from-pink-400 to-pink-600' },
];

const TEAMS_DATA = [
  {
    name: 'EduFlow', domain: 'EdTech',
    desc: 'AI-powered adaptive learning platform for tier-2 colleges, delivering personalized study paths and intelligent content recommendations via a mobile-first app.',
    members: [
      { initials: 'AK', name: 'Aarav Kumar', roll: 'ITE2021001', role: 'CEO', color: 'from-amber-400 to-amber-600' },
      { initials: 'PS', name: 'Priya Singh', roll: 'ITE2021024', role: 'CTO', color: 'from-indigo-400 to-indigo-600' },
      { initials: 'RM', name: 'Rahul Mehta', roll: 'ITE2021033', role: 'COO', color: 'from-emerald-400 to-emerald-600' },
      { initials: 'SA', name: 'Sneha Agarwal', roll: 'ITE2021045', role: 'CFO', color: 'from-purple-400 to-purple-600' },
      { initials: 'VP', name: 'Vikram Patel', roll: 'ITE2021058', role: 'CMO', color: 'from-rose-400 to-rose-600' },
    ],
    mentor: 'Dr. R. Verma', phase: 'MVP Build', phaseIndex: 3, progress: 67, status: 'active',
    gradient: 'from-indigo-400 to-indigo-600',
    checklist: ['Idea validated & approved', 'Market research completed', 'Customer interviews done', 'Frontend prototype built', 'Backend integration in progress', 'User testing pending'],
    completedItems: 4,
  },
  {
    name: 'GreenHarvest', domain: 'AgriTech',
    desc: 'IoT-enabled smart irrigation system empowering small farmers to reduce water waste by 40% through soil-sensor analytics and automated drip scheduling.',
    members: [
      { initials: 'RD', name: 'Rohan Desai', roll: 'ITE2021017', role: 'CEO', color: 'from-emerald-400 to-emerald-600' },
      { initials: 'AJ', name: 'Anika Joshi', roll: 'ITE2021029', role: 'CTO', color: 'from-teal-400 to-teal-600' },
      { initials: 'SP', name: 'Suresh Pillai', roll: 'ITE2021041', role: 'COO', color: 'from-amber-400 to-amber-600' },
      { initials: 'PR', name: 'Pooja Rane', roll: 'ITE2021053', role: 'CMO', color: 'from-pink-400 to-pink-600' },
    ],
    mentor: 'Prof. S. Mehta', phase: 'Market Research', phaseIndex: 1, progress: 35, status: 'active',
    gradient: 'from-emerald-400 to-emerald-600',
    checklist: ['Idea validated & approved', 'Competitor landscape mapped', 'Farmer survey started (30/60 done)', 'Customer interviews pending', 'MVP design pending', 'Pitch deck pending'],
    completedItems: 2,
  },
  {
    name: 'FinPulse', domain: 'FinTech',
    desc: 'AI-driven credit scoring engine for gig workers and freelancers, unlocking access to micro-loans through alternative financial data instead of traditional CIBIL scores.',
    members: [
      { initials: 'NS', name: 'Neel Shah', roll: 'ITE2021011', role: 'CEO', color: 'from-amber-400 to-amber-600' },
      { initials: 'KN', name: 'Kavya Nair', roll: 'ITE2021022', role: 'CTO', color: 'from-indigo-400 to-indigo-600' },
      { initials: 'JM', name: 'Jay Malhotra', roll: 'ITE2021034', role: 'COO', color: 'from-emerald-400 to-emerald-600' },
      { initials: 'TG', name: 'Tanvi Gupta', roll: 'ITE2021046', role: 'CFO', color: 'from-purple-400 to-purple-600' },
      { initials: 'OS', name: 'Om Soni', roll: 'ITE2021058', role: 'CMO', color: 'from-rose-400 to-rose-600' },
    ],
    mentor: 'Dr. A. Joshi', phase: 'Pitch Deck', phaseIndex: 4, progress: 82, status: 'active',
    gradient: 'from-amber-400 to-amber-600',
    checklist: ['Idea validated', 'Market research complete', 'Customer interviews done', 'MVP build complete', '14-slide pitch deck drafted', 'Investor Q&A preparation pending'],
    completedItems: 5,
  },
  {
    name: 'MediSwift', domain: 'HealthTech',
    desc: 'Prescription management and last-mile medicine delivery platform connecting pharmacists in tier-3 towns via a mobile-first logistics network.',
    members: [
      { initials: 'KA', name: 'Kavya Arora', roll: 'ITE2021031', role: 'CEO', color: 'from-purple-400 to-purple-600' },
      { initials: 'AT', name: 'Arjun Tiwari', roll: 'ITE2021043', role: 'CTO', color: 'from-indigo-400 to-indigo-600' },
      { initials: 'SR', name: 'Sona Rao', roll: 'ITE2021055', role: 'CMO', color: 'from-emerald-400 to-emerald-600' },
    ],
    mentor: 'Dr. N. Krishnan', phase: 'Cust. Interviews', phaseIndex: 2, progress: 50, status: 'active',
    gradient: 'from-purple-400 to-purple-600',
    checklist: ['Idea validated', 'Market research complete', 'Interview with 15 pharmacists done', 'Interview with 20 patients in progress', 'MVP wireframes pending', 'Pitch deck pending'],
    completedItems: 3,
  },
  {
    name: 'SkillLaunch', domain: 'EdTech',
    desc: 'Micro-credential platform enabling blue-collar workers to upskill through 15-minute daily lessons verified by employers — bridging the skills gap in India.',
    members: [
      { initials: 'AT', name: 'Arjun Tiwari', roll: 'ITE2021019', role: 'CEO', color: 'from-teal-400 to-teal-600' },
      { initials: 'RB', name: 'Ritika Bose', roll: 'ITE2021027', role: 'CTO', color: 'from-indigo-400 to-indigo-600' },
      { initials: 'DK', name: 'Dev Kumar', roll: 'ITE2021035', role: 'COO', color: 'from-amber-400 to-amber-600' },
      { initials: 'MP', name: 'Mira Pillai', roll: 'ITE2021049', role: 'CMO', color: 'from-rose-400 to-rose-600' },
    ],
    mentor: 'Ms. P. Pandey', phase: 'Idea Validation', phaseIndex: 0, progress: 18, status: 'pending',
    gradient: 'from-teal-400 to-teal-600',
    checklist: ['Problem statement submitted', 'Market size research in progress', 'Competitor analysis pending', 'Customer interviews pending', 'MVP pending', 'Pitch deck pending'],
    completedItems: 1,
  },
  {
    name: 'TechBridge', domain: 'SaaS',
    desc: 'B2B SaaS marketplace bridging rural artisans and urban buyers with a mobile-first platform, live chat, and integrated logistics for pan-India delivery.',
    members: [
      { initials: 'VK', name: 'Varun Kapoor', roll: 'ITE2021013', role: 'CEO', color: 'from-teal-400 to-teal-600' },
      { initials: 'IS', name: 'Isha Sharma', roll: 'ITE2021025', role: 'CTO', color: 'from-indigo-400 to-indigo-600' },
      { initials: 'RM', name: 'Rajan Mehta', roll: 'ITE2021037', role: 'COO', color: 'from-emerald-400 to-emerald-600' },
      { initials: 'AK', name: 'Ayesha Khan', roll: 'ITE2021049', role: 'CFO', color: 'from-purple-400 to-purple-600' },
      { initials: 'FZ', name: 'Farhan Zaidi', roll: 'ITE2021061', role: 'CMO', color: 'from-rose-400 to-rose-600' },
    ],
    mentor: 'Mr. V. Rao', phase: 'MVP Build', phaseIndex: 3, progress: 80, status: 'active',
    gradient: 'from-teal-400 to-teal-600',
    checklist: ['Idea validated', 'Market research complete', 'Customer interviews done', 'Frontend build 95% complete', 'Backend API integration done', 'User testing scheduled'],
    completedItems: 5,
  },
  {
    name: 'CleanSphere', domain: 'CleanTech',
    desc: 'Blockchain-verified carbon credit marketplace connecting Indian MSMEs with global ESG investors to monetize their green initiatives.',
    members: [
      { initials: 'PD', name: 'Priyanka Das', roll: 'ITE2021021', role: 'CEO', color: 'from-green-400 to-green-600' },
      { initials: 'HV', name: 'Harsh Verma', roll: 'ITE2021033', role: 'CTO', color: 'from-indigo-400 to-indigo-600' },
      { initials: 'NS', name: 'Nidhi Suri', roll: 'ITE2021045', role: 'CMO', color: 'from-rose-400 to-rose-600' },
    ],
    mentor: 'Dr. S. Chopra', phase: 'Market Research', phaseIndex: 1, progress: 42, status: 'active',
    gradient: 'from-green-400 to-green-600',
    checklist: ['Idea validated', 'ESG survey in progress (20/50 done)', 'MSME interviews pending', 'Customer interviews pending', 'MVP pending', 'Pitch deck pending'],
    completedItems: 2,
  },
  {
    name: 'FoodieHub', domain: 'FoodTech',
    desc: 'A cloud-kitchen aggregator for college campuses, enabling student food entrepreneurs to sell homemade food through a branded delivery app.',
    members: [
      { initials: 'AR', name: 'Aditya Rao', roll: 'ITE2021016', role: 'CEO', color: 'from-orange-400 to-orange-600' },
      { initials: 'SK', name: 'Simran Kaur', roll: 'ITE2021028', role: 'CTO', color: 'from-indigo-400 to-indigo-600' },
      { initials: 'MJ', name: 'Manish Jha', roll: 'ITE2021040', role: 'COO', color: 'from-emerald-400 to-emerald-600' },
      { initials: 'DS', name: 'Divya Singh', roll: 'ITE2021052', role: 'CMO', color: 'from-purple-400 to-purple-600' },
    ],
    mentor: 'Prof. S. Mehta', phase: 'Idea Validation', phaseIndex: 0, progress: 22, status: 'pending',
    gradient: 'from-orange-400 to-orange-600',
    checklist: ['Problem canvas submitted', 'Market sizing in progress', 'Competitor mapping pending', 'Customer interviews pending', 'MVP pending', 'Pitch deck pending'],
    completedItems: 1,
  },
];

const SYSTEM_LOGS = [
  { time: '09:42 AM', type: 'submission', icon: '📄', text: 'EduFlow submitted MVP Build deliverable', color: 'indigo' },
  { time: '09:15 AM', type: 'approval', icon: '✅', text: 'Prof. Kumar approved GreenHarvest Market Research', color: 'emerald' },
  { time: '08:53 AM', type: 'login', icon: '🔐', text: 'Dr. R. Verma logged in — Mentor Portal', color: 'slate' },
  { time: '08:31 AM', type: 'team', icon: '👥', text: 'SkillLaunch team formed — 4 members confirmed', color: 'indigo' },
  { time: '08:12 AM', type: 'submission', icon: '📄', text: 'FinPulse submitted Pitch Deck for review', color: 'amber' },
  { time: 'Yesterday', type: 'approval', icon: '✅', text: 'EduFlow Market Research approved by Dr. Verma', color: 'emerald' },
  { time: 'Yesterday', type: 'alert', icon: '⚠️', text: 'TechBridge MVP deadline in 2 days — auto-reminder sent', color: 'amber' },
  { time: 'Yesterday', type: 'login', icon: '🔐', text: '12 students logged in for onboarding session', color: 'slate' },
  { time: '2 days ago', type: 'submission', icon: '📄', text: 'MediSwift submitted Customer Interview transcripts', color: 'indigo' },
  { time: '2 days ago', type: 'team', icon: '👥', text: 'CleanSphere team formation complete — mentor assigned', color: 'emerald' },
  { time: '3 days ago', type: 'announcement', icon: '📣', text: 'Prof. Kumar sent MVP deadline extension announcement', color: 'purple' },
];

const MENTORS_DATA = {
  rv: {
    id: 'rv', initials: 'RV', name: 'Dr. Rajesh Verma',
    title: 'EdTech & Product Strategy Expert',
    institution: 'IIT Bombay · Ex-Google PM · Founder, LearnLabs',
    gradient: 'from-slate-600 to-slate-800',
    available: true,
    nextSlot: 'Thu, Jun 19 · 3:00 PM',
    teams: 3, sessions: 24, rating: '4.9★',
    bio: 'Dr. Rajesh Verma is a serial entrepreneur and former Google Product Manager with 14+ years in EdTech. He co-founded LearnLabs, which was acquired by BYJU\'S in 2021. He specializes in helping student founders nail their product-market fit and build scalable learning platforms.',
    expertise: ['Product Strategy', 'Fundraising', 'EdTech', 'User Research', 'Growth Loops', 'Pitch Coaching', 'MVP Design'],
    currentTeams: ['EduFlow', 'SkillLaunch', 'FoodieHub'],
    highlights: [
      '14+ years in Product Management at Google, India',
      'Co-founded LearnLabs — acquired by BYJU\'S (2021) for ₹42Cr',
      'Angel investor in 8 EdTech & SaaS startups',
      'Speaker at TechSparks 2023 & Nasscom Product Conclave',
    ],
  },
  sm: {
    id: 'sm', initials: 'SM', name: 'Prof. Sunita Mehta',
    title: 'Market Strategy & GTM Expert',
    institution: 'IIM Ahmedabad · Ex-McKinsey · Author, "Rural Disruption"',
    gradient: 'from-emerald-500 to-emerald-700',
    available: true,
    nextSlot: 'Fri, Jun 20 · 11:00 AM',
    teams: 2, sessions: 18, rating: '4.8★',
    bio: 'Prof. Sunita Mehta brings 18 years of management consulting and academic experience, having advised Fortune 500 companies and government bodies on rural market penetration and sustainable agriculture innovation. She has authored two books on emerging market strategy.',
    expertise: ['Market Research', 'GTM Strategy', 'AgriTech', 'Rural Markets', 'Business Model Design', 'Consumer Interviews', 'Sustainability'],
    currentTeams: ['GreenHarvest', 'FoodieHub'],
    highlights: [
      'Principal Consultant at McKinsey & Co. — Rural India Practice (2006–2016)',
      'Author: "Rural Disruption" (Penguin) — bestseller in 3 countries',
      'Led Agri-digitisation project for Maharashtra Govt. (₹80Cr scope)',
      'TEDx speaker — "Why Rural Tech is India\'s Next Unicorn Sector"',
    ],
  },
  aj: {
    id: 'aj', initials: 'AJ', name: 'Dr. Ankit Joshi',
    title: 'VC & Pitch Deck Expert',
    institution: 'IIT Delhi · Ex-Sequoia Capital India · Partner, Inflection VC',
    gradient: 'from-amber-500 to-amber-700',
    available: true,
    nextSlot: 'Wed, Jun 18 · 4:00 PM',
    teams: 3, sessions: 31, rating: '5.0★',
    bio: 'Dr. Ankit Joshi has deployed ₹120Cr+ in early-stage FinTech and SaaS startups as a venture partner at Sequoia Capital India. He now runs Inflection VC, a pre-seed fund focused on Tier-2 India founders. He is renowned for his pitch coaching, having helped 40+ startups close their seed rounds.',
    expertise: ['VC Funding', 'Pitch Coaching', 'FinTech', 'Term Sheets', 'Cap Table', 'Financial Modelling', 'Investor Relations'],
    currentTeams: ['FinPulse', 'CleanSphere', 'TechBridge'],
    highlights: [
      'Former Partner at Sequoia Capital India — sourced 6 unicorns',
      'Founding Partner at Inflection VC (₹50Cr AUM)',
      'Coached 40+ founders to close their first institutional round',
      'Board observer: Slice, Open, and 4 other FinTech startups',
    ],
  },
  nk: {
    id: 'nk', initials: 'NK', name: 'Dr. Nandita Krishnan',
    title: 'HealthTech & Clinical Innovation Expert',
    institution: 'AIIMS Delhi · Founder, MedKart · WHO Consultant',
    gradient: 'from-purple-500 to-purple-700',
    available: true,
    nextSlot: 'Mon, Jun 23 · 10:00 AM',
    teams: 3, sessions: 22, rating: '4.9★',
    bio: 'Dr. Nandita Krishnan is a practising physician turned entrepreneur who founded MedKart, a last-mile pharmacy delivery platform serving 500+ towns. She consults with the WHO on digital health infrastructure for developing nations and has deep expertise in regulatory navigation for HealthTech startups.',
    expertise: ['HealthTech', 'Clinical Operations', 'Biotech', 'Regulatory Affairs', 'Digital Health', 'Last-Mile Logistics', 'User Empathy Research'],
    currentTeams: ['MediSwift', 'EduFlow', 'SkillLaunch'],
    highlights: [
      'Founded MedKart — serving 2M+ patients in rural India',
      'WHO Digital Health Consultant — South Asia Region (2020–present)',
      'Named "40 Under 40 Healthcare Innovators" by Forbes India',
      'Led India\'s first telemedicine pilot in Madhya Pradesh (2019)',
    ],
  },
  pp: {
    id: 'pp', initials: 'PP', name: 'Ms. Prerna Pandey',
    title: 'EdTech Growth & D2C Expert',
    institution: 'ISB Hyderabad · Ex-Unacademy VP · Advisor, 3 EdTech Startups',
    gradient: 'from-rose-500 to-rose-700',
    available: false,
    nextSlot: 'Next Mon, Jun 24 · 2:00 PM',
    teams: 1, sessions: 14, rating: '4.7★',
    bio: 'Ms. Prerna Pandey served as VP Growth at Unacademy, scaling the platform from 2M to 50M learners in 18 months. She now advises early-stage EdTech and D2C startups on customer acquisition strategies, retention mechanics, and content-led growth. She is particularly passionate about blue-collar upskilling.',
    expertise: ['EdTech', 'Growth Hacking', 'D2C Marketing', 'Content Strategy', 'Cohort Retention', 'Community Building', 'Performance Marketing'],
    currentTeams: ['SkillLaunch'],
    highlights: [
      'VP Growth at Unacademy — scaled from 2M to 50M learners (2019–2022)',
      'Led Unacademy\'s expansion into 8 new languages and 15 cities',
      'ISB Young Alumni Achievement Award 2023',
      'Guest Lecturer: XLRI Jamshedpur, IIM Calcutta (Growth Strategy)',
    ],
  },
  vr: {
    id: 'vr', initials: 'VR', name: 'Mr. Vivek Rao',
    title: 'SaaS & B2B Product Expert',
    institution: 'NIT Trichy · Founder & CEO, SaaSify · Ex-Freshworks',
    gradient: 'from-teal-500 to-teal-700',
    available: true,
    nextSlot: 'Thu, Jun 19 · 5:30 PM',
    teams: 2, sessions: 19, rating: '4.8★',
    bio: 'Mr. Vivek Rao is the founder of SaaSify, a no-code workflow automation platform serving 3,000+ SMEs across India and Southeast Asia. Previously, he led product growth at Freshworks for 5 years. He specialises in product-led growth strategies, API ecosystem design, and B2B sales motions for early-stage SaaS companies.',
    expertise: ['SaaS', 'Product-Led Growth', 'B2B Sales', 'API Ecosystem', 'No-Code Platforms', 'Customer Success', 'SME Markets'],
    currentTeams: ['TechBridge', 'GreenHarvest'],
    highlights: [
      'Founded SaaSify — $2M ARR, 3,000+ SME customers across India & SEA',
      'Former Product Growth Lead at Freshworks (2016–2021)',
      'Speaker at SaaStr India 2022 — "PLG for Emerging Markets"',
      'Mentor at Antler India & 100X.VC Cohort 2023',
    ],
  },
  sc: {
    id: 'sc', initials: 'SC', name: 'Dr. Sneha Chopra',
    title: 'CleanTech & Deep Tech Expert',
    institution: 'IIT Madras · Ex-Tesla Energy · Co-Founder, GreenGrid',
    gradient: 'from-indigo-500 to-indigo-700',
    available: true,
    nextSlot: 'Tue, Jun 18 · 6:00 PM',
    teams: 2, sessions: 16, rating: '4.9★',
    bio: 'Dr. Sneha Chopra is a clean energy researcher and entrepreneur with a PhD in Sustainable Systems Engineering from IIT Madras. After leading battery R&D at Tesla Energy\'s India lab, she co-founded GreenGrid, a blockchain-based carbon credit marketplace. She mentors teams on ESG compliance, impact measurement, and deep-tech commercialisation.',
    expertise: ['CleanTech', 'ESG / Impact Investing', 'Deep Tech', 'Carbon Credits', 'Blockchain', 'Sustainable Systems', 'Grant Writing'],
    currentTeams: ['CleanSphere', 'MediSwift'],
    highlights: [
      'PhD in Sustainable Systems Engineering — IIT Madras (Gold Medal)',
      'Led Battery R&D at Tesla Energy India Lab (2018–2022)',
      'Co-Founded GreenGrid — raised $1.2M Seed from Climate Tech VC',
      'UN Climate Innovation Challenge Winner 2022 (South Asia)',
    ],
  },
};

// ── Theme Toggle ─────────────────────────────────────

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.theme = isDark ? 'dark' : 'light';
}

// ── Navigation ───────────────────────────────────────

function navigate(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });

  // Show target screen
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
    target.style.animation = 'fadeIn 0.3s ease';
  }

  state.currentScreen = screenId;
  window.scrollTo(0, 0);

  // Init screens that need data
  if (screenId === 'screen-student-ceo') initCeoDashboard();
  if (screenId === 'screen-admin') initAdminDashboard();
  if (screenId === 'screen-onboarding') initOnboarding();
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Auth ─────────────────────────────────────────────
function setRole(role) {
  state.role = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`role-${role}`).classList.add('active');

  const labels = { student: 'Student', mentor: 'Mentor', admin: 'Admin' };
  document.getElementById('login-btn-text').textContent = `Sign In as ${labels[role]}`;
}

function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Signing in...';

  setTimeout(() => {
    btn.innerHTML = '<span>Sign In</span><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';
    if (state.role === 'student') navigate('screen-student-member');
    else if (state.role === 'mentor' || state.role === 'admin') navigate('screen-admin');
    showToast('success', 'Welcome back! Logged in successfully.');
  }, 1200);
}

function demoLogin(type) {
  const destinations = {
    'student-ceo': 'screen-student-ceo',
    'student-member': 'screen-student-member',
    'mentor': 'screen-admin',
    'admin': 'screen-admin',
  };
  navigate(destinations[type] || 'screen-admin');
  showToast('success', `Demo: ${type.replace('-', ' ')} view loaded!`);
}

// ── Onboarding ───────────────────────────────────────
function initOnboarding() {
  state.onboardStep = 1;
  renderOnboardStep(1);

  // Init skills grid
  const grid = document.getElementById('skills-grid');
  grid.innerHTML = SKILLS.map(s => `
    <button class="skill-chip" data-skill="${s.id}" onclick="toggleSkill('${s.id}', this)">
      <span>${s.icon}</span> ${s.label}
    </button>
  `).join('');

  // Init roles grid
  const rolesGrid = document.getElementById('roles-grid');
  rolesGrid.innerHTML = ROLES.map(r => `
    <div class="role-card" data-role="${r.id}" onclick="selectRole('${r.id}', this)">
      <div class="role-emoji">${r.emoji}</div>
      <div class="role-name">${r.label}</div>
      <div class="role-desc">${r.desc}</div>
    </div>
  `).join('');
}

function renderOnboardStep(step) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`onboard-step-${i}`);
    if (el) el.classList.toggle('hidden', i !== step);
  });

  document.getElementById('current-step-label').textContent = step;

  // Step circles & labels
  [1, 2, 3].forEach(i => {
    const circle = document.getElementById(`step-circle-${i}`);
    const label = document.getElementById(`step-label-${i}`);
    if (!circle) return;

    if (i < step) {
      circle.className = 'w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold';
      circle.innerHTML = '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
      if (label) label.className = 'text-xs font-medium text-indigo-600 mt-1.5 text-center';
    } else if (i === step) {
      circle.className = 'w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold shadow-glow';
      circle.textContent = i;
      if (label) label.className = 'text-xs font-medium text-indigo-600 mt-1.5 text-center';
    } else {
      circle.className = 'w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-semibold';
      circle.textContent = i;
      if (label) label.className = 'text-xs font-medium text-slate-400 mt-1.5 text-center';
    }

    // Update line colours
    const line = document.getElementById(`step-line-${i}`);
    if (line) {
      line.className = i < step
        ? 'h-0.5 w-16 bg-indigo-400 mx-2 mt-0 mb-5 transition-all duration-500'
        : 'h-0.5 w-16 bg-slate-200 mx-2 mt-0 mb-5 transition-all duration-500';
    }
  });

  // Show/hide previous button
  const prev = document.getElementById('onboard-prev');
  if (prev) prev.classList.toggle('hidden', step === 1);

  // Update next button
  const next = document.getElementById('onboard-next');
  if (next) {
    if (step === 3) {
      next.textContent = '🚀 Complete Registration';
      next.className = 'px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all shadow-glow-emerald active:scale-95';
    } else {
      next.textContent = 'Continue →';
      next.className = 'px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-all shadow-glow active:scale-95';
    }
  }
}

function onboardNext() {
  if (state.onboardStep === 3) {
    showToast('success', '🎉 Registration complete! Welcome to ITE LaunchPad!');
    setTimeout(() => navigate('screen-student-member'), 800);
    return;
  }
  state.onboardStep++;
  renderOnboardStep(state.onboardStep);
}

function onboardPrev() {
  if (state.onboardStep > 1) {
    state.onboardStep--;
    renderOnboardStep(state.onboardStep);
  }
}

function toggleSkill(skillId, el) {
  if (state.selectedSkills.has(skillId)) {
    state.selectedSkills.delete(skillId);
    el.classList.remove('selected');
  } else {
    state.selectedSkills.add(skillId);
    el.classList.add('selected');
  }
}

function selectRole(roleId, el) {
  state.selectedRole = roleId;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// ── Invitations ──────────────────────────────────────
function acceptInvitation(id) {
  const card = document.getElementById(id);
  if (!card) return;

  const teamName = card.querySelector('h3').textContent;
  card.classList.add('accepted');

  // Show accepted state
  const buttons = card.querySelector('.flex.gap-3');
  buttons.innerHTML = `
    <div class="flex-1 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center justify-center gap-2">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      Accepted! Joining ${teamName}...
    </div>
  `;

  showToast('success', `🎉 You've joined ${teamName}!`);

  setTimeout(() => {
    navigate('screen-student-team');
  }, 1500);
}

function rejectInvitation(id) {
  const card = document.getElementById(id);
  if (!card) return;

  const teamName = card.querySelector('h3').textContent;
  card.classList.add('rejected');

  delete state.invitations[id];
  showToast('info', `Declined invitation from ${teamName}`);

  const remaining = Object.keys(state.invitations).filter(k => state.invitations[k]);
  if (remaining.length === 0) {
    setTimeout(() => {
      document.getElementById('invitations-list').classList.add('hidden');
      document.getElementById('no-invitations').classList.remove('hidden');
    }, 400);
  }
}

// ── CEO Dashboard ─────────────────────────────────────
function initCeoDashboard() {
  renderStudents(UNASSIGNED_STUDENTS);
}

function renderStudents(students) {
  const container = document.getElementById('student-results');
  if (!container) return;

  if (students.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <div class="text-4xl mb-3">🔍</div>
        <p class="text-slate-500 text-sm">No students match your search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = students.map((s, i) => `
    <div class="student-card ${state.invitedStudents.has(s.id) ? 'invited' : ''}" style="animation-delay: ${i * 60}ms" id="student-${s.id}">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${s.avatar}</div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold text-slate-800">${s.name}</div>
        <div class="text-xs text-slate-500">${s.roll} · ${s.branch}</div>
        <div class="flex flex-wrap gap-1 mt-1.5">
          ${s.skills.map(sk => `<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">${sk}</span>`).join('')}
        </div>
      </div>
      <div class="flex flex-col items-end gap-2 flex-shrink-0">
        <span class="pill ${s.role === 'CTO' ? 'pill-indigo' : s.role === 'CMO' ? 'pill-amber' : s.role === 'CFO' ? 'pill-purple' : 'pill-emerald'}">${s.role}</span>
        ${state.invitedStudents.has(s.id) 
          ? `<span class="text-xs text-emerald-600 font-semibold">✓ Invited</span>` 
          : `<button onclick="inviteStudent('${s.id}')" class="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600 transition-all active:scale-95">Invite</button>`
        }
      </div>
    </div>
  `).join('');
}

function searchStudents(query) {
  const q = query.toLowerCase();
  const filtered = UNASSIGNED_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.skills.some(sk => sk.toLowerCase().includes(q)) ||
    s.branch.toLowerCase().includes(q) ||
    s.role.toLowerCase().includes(q)
  );
  renderStudents(filtered);
}

function filterStudents(role) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');

  const filtered = role === 'all' ? UNASSIGNED_STUDENTS :
    UNASSIGNED_STUDENTS.filter(s => s.role.toLowerCase() === role.toLowerCase());
  renderStudents(filtered);
}

function inviteStudent(id) {
  state.invitedStudents.add(id);
  const student = UNASSIGNED_STUDENTS.find(s => s.id === id);
  renderStudents(UNASSIGNED_STUDENTS);
  showToast('success', `Invitation sent to ${student.name}!`);
}

// ── Admin Dashboard ───────────────────────────────────
function initAdminDashboard() {
  renderTeamsTable();
  renderSubmissions();
  renderSystemLogs();
}

function adminTab(tab) {
  state.adminTab = tab;

  // Update nav
  document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
  const navBtn = document.getElementById(`admin-nav-${tab}`);
  if (navBtn) navBtn.classList.add('active');

  // Update content
  document.querySelectorAll('[id^="admin-tab-"]').forEach(t => t.classList.add('hidden'));
  const tabEl = document.getElementById(`admin-tab-${tab}`);
  if (tabEl) {
    tabEl.classList.remove('hidden');
    tabEl.style.animation = 'fadeInUp 0.3s ease';
  }

  // Update page title
  const titles = {
    overview: 'Program Overview',
    teams: 'Team Tracking',
    submissions: 'Submissions',
    announcements: 'Announcements',
    logs: 'System Logs',
  };
  const titleEl = document.getElementById('admin-page-title');
  if (titleEl) titleEl.textContent = titles[tab] || 'Dashboard';

  // Render data for teams tab
  if (tab === 'teams') renderTeamsTable('teams-table-body-2');
  if (tab === 'logs') renderSystemLogs();
}

function renderTeamsTable(bodyId = 'teams-table-body') {
  const tbody = document.getElementById(bodyId);
  if (!tbody) return;

  const phaseColorMap = {
    'Idea Validation': 'pill-emerald',
    'Market Research': 'pill-indigo',
    'Cust. Interviews': 'pill-indigo',
    'MVP Build': 'pill-indigo',
    'Pitch Deck': 'pill-amber',
    'Final Pitch': 'pill-purple',
  };

  tbody.innerHTML = TEAMS_DATA.map((t, i) => `
    <tr class="hover:bg-indigo-50/50 transition-colors cursor-pointer" style="animation: fadeInUp 0.3s ease ${i * 60}ms both" onclick="showStartupDetail(${i})">
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br ${getTeamGradient(t.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            ${t.name.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-800">${t.name}</div>
            <div class="text-xs text-slate-400">${t.domain}</div>
          </div>
        </div>
      </td>
      <td class="px-4 py-4">
        <div class="flex -space-x-2">
          ${t.members.slice(0, 4).map((m, mi) => `
            <div class="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br ${getAvatarGradient(mi)} flex items-center justify-center text-white text-xs font-bold" title="${m.name || m}">${(m.initials || m).charAt(0)}</div>
          `).join('')}
          ${t.members.length > 4 ? `<div class="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">+${t.members.length - 4}</div>` : ''}
        </div>
        <div class="text-xs text-slate-400 mt-1">${t.members.length} members</div>
      </td>
      <td class="px-4 py-4">
        <div class="text-xs font-medium text-slate-700">${t.mentor}</div>
      </td>
      <td class="px-4 py-4">
        <span class="pill ${phaseColorMap[t.phase] || 'pill-slate'}">${t.phase}</span>
      </td>
      <td class="px-4 py-4 w-32">
        <div class="flex items-center gap-2">
          <div class="progress-bar flex-1">
            <div class="progress-bar-fill ${t.progress > 60 ? 'bg-emerald-500' : t.progress > 30 ? 'bg-indigo-500' : 'bg-amber-400'}" style="width: ${t.progress}%"></div>
          </div>
          <span class="text-xs font-semibold text-slate-600 w-8">${t.progress}%</span>
        </div>
      </td>
      <td class="px-4 py-4">
        <span class="pill ${t.status === 'active' ? 'pill-emerald' : 'pill-amber'}">
          ${t.status === 'active' ? '● Active' : '● Pending'}
        </span>
      </td>
    </tr>
  `).join('');
}

function getTeamGradient(name) {
  const gradients = [
    'from-indigo-400 to-indigo-600',
    'from-emerald-400 to-emerald-600',
    'from-amber-400 to-amber-600',
    'from-purple-400 to-purple-600',
    'from-teal-400 to-teal-600',
    'from-rose-400 to-rose-600',
    'from-blue-400 to-blue-600',
    'from-orange-400 to-orange-600',
  ];
  return gradients[name.charCodeAt(0) % gradients.length];
}

function getAvatarGradient(index) {
  const gradients = [
    'from-indigo-400 to-indigo-600',
    'from-emerald-400 to-emerald-600',
    'from-amber-400 to-amber-600',
    'from-purple-400 to-purple-600',
    'from-rose-400 to-rose-600',
  ];
  return gradients[index % gradients.length];
}

function renderSubmissions() {
  const container = document.getElementById('submissions-list');
  if (!container) return;
  // Submissions already rendered in HTML, this just adds animation
}

function renderSystemLogs() {
  const container = document.getElementById('system-logs');
  if (!container) return;

  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  };

  container.innerHTML = SYSTEM_LOGS.map((log, i) => {
    const c = colorMap[log.color] || colorMap.slate;
    return `
      <div class="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors" style="animation: slideInLeft 0.3s ease ${i * 50}ms both">
        <div class="w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0 text-sm">${log.icon}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-slate-700">${log.text}</p>
          <p class="text-xs text-slate-400 mt-0.5">${log.time}</p>
        </div>
        <span class="text-xs ${c.text} font-medium capitalize flex-shrink-0">${log.type}</span>
      </div>
    `;
  }).join('');
}

// ── Submission Actions ────────────────────────────────
function approveSubmission(btn) {
  const card = btn.closest('.submission-review-card');
  const teamName = card.querySelector('.font-semibold').textContent;

  card.classList.add('approved');
  const actions = card.querySelector('.flex.gap-2');
  actions.innerHTML = `
    <div class="w-full py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      Approved
    </div>
  `;
  card.querySelector('[class*="amber"]').classList.remove('bg-amber-50', 'text-amber-700');
  card.querySelector('[class*="amber"]').classList.add('bg-emerald-50', 'text-emerald-700');
  card.querySelector('[class*="amber"]').textContent = 'Approved';

  showToast('success', `✅ ${teamName} submission approved!`);
}

function requestChanges(btn) {
  const card = btn.closest('.submission-review-card');
  const teamName = card.querySelector('.font-semibold').textContent;

  card.classList.add('changes-requested');
  const actions = card.querySelector('.flex.gap-2');
  actions.innerHTML = `
    <div class="w-full py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center justify-center gap-1.5">
      ↩ Changes Requested
    </div>
  `;
  const statusPill = card.querySelector('[class*="amber"]');
  if (statusPill) { statusPill.textContent = 'Changes Req.'; }

  showToast('info', `↩ Requested changes from ${teamName}`);
}

// ── Startup Detail Modal ──────────────────────────────
const PHASES = [
  { label: 'Idea Validation', emoji: '💡', short: 'Idea' },
  { label: 'Market Research', emoji: '🔍', short: 'Research' },
  { label: 'Cust. Interviews', emoji: '🎤', short: 'Interviews' },
  { label: 'MVP Build', emoji: '🛠️', short: 'MVP' },
  { label: 'Pitch Deck', emoji: '📊', short: 'Pitch Deck' },
  { label: 'Final Pitch', emoji: '🚀', short: 'Final Pitch' },
];

function showStartupDetail(index) {
  const t = TEAMS_DATA[index];
  if (!t) return;

  const modal = document.getElementById('startup-modal');
  const panel = document.getElementById('startup-modal-panel');

  // Fill header
  const logo = document.getElementById('modal-logo');
  logo.textContent = t.name.slice(0, 2).toUpperCase();
  logo.className = `w-12 h-12 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-lg font-syne`;
  document.getElementById('modal-name').textContent = t.name;
  document.getElementById('modal-meta').textContent = `${t.domain} · ${t.members.length} members · ${t.status === 'active' ? '● Active' : '⏳ Pending'}`;

  // Progress percentage
  document.getElementById('modal-progress-pct').textContent = `${t.progress}%`;

  // Build step progress bar
  const stepsRow = document.getElementById('modal-steps-row');
  stepsRow.innerHTML = PHASES.map((ph, i) => {
    const isDone = i < t.phaseIndex;
    const isCurrent = i === t.phaseIndex;
    const isLocked = i > t.phaseIndex;
    const circleClass = isDone
      ? 'w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl shadow-md'
      : isCurrent
        ? 'w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xl shadow-glow ring-4 ring-indigo-200'
        : 'w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xl';
    const labelClass = isDone ? 'text-xs font-semibold text-emerald-600 mt-2 text-center'
      : isCurrent ? 'text-xs font-bold text-indigo-600 mt-2 text-center'
      : 'text-xs text-slate-400 mt-2 text-center';
    const badge = isCurrent ? `<div class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center"><div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div></div>` : '';
    return `
      <div class="flex flex-col items-center" style="width: ${100/PHASES.length}%">
        <div class="relative">
          <div class="${circleClass}">
            ${isDone ? '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ph.emoji}
          </div>
          ${badge}
        </div>
        <div class="${labelClass}">${ph.short}</div>
        ${isDone ? '<div class="text-xs text-emerald-500 font-medium">Done</div>' : isCurrent ? '<div class="text-xs text-indigo-500 font-medium">Active</div>' : '<div class="text-xs text-slate-300">—</div>'}
      </div>
    `;
  }).join('');

  // Animate the track fill after slight delay
  const trackFill = document.getElementById('modal-track-fill');
  trackFill.style.width = '0%';
  const fillPct = Math.min(((t.phaseIndex) / (PHASES.length - 1)) * 100 + (t.progress / (PHASES.length * 100) * 100), 100);
  setTimeout(() => { trackFill.style.width = `${fillPct}%`; }, 150);

  // Phase & mentor
  document.getElementById('modal-current-phase').textContent = `Phase ${t.phaseIndex + 1}: ${t.phase}`;
  document.getElementById('modal-mentor').textContent = t.mentor;

  // Details
  document.getElementById('modal-domain').textContent = t.domain;
  const statusEl = document.getElementById('modal-status');
  statusEl.textContent = t.status === 'active' ? '● Active' : '⏳ Pending';
  statusEl.className = `text-sm font-semibold ${t.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`;
  document.getElementById('modal-team-size').textContent = `${t.members.length} members`;
  document.getElementById('modal-overall').textContent = `${t.progress}% complete`;

  // Members
  const membersEl = document.getElementById('modal-members');
  membersEl.innerHTML = t.members.map(m => `
    <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
      <div class="w-9 h-9 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${m.initials}</div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-slate-800 truncate">${m.name}</div>
        <div class="text-xs text-slate-400">${m.roll}</div>
      </div>
      <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">${m.role}</span>
    </div>
  `).join('');

  // Milestone checklist
  const checklistEl = document.getElementById('modal-checklist');
  checklistEl.innerHTML = t.checklist.map((item, ci) => {
    const done = ci < t.completedItems;
    return `
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl ${done ? 'bg-emerald-50' : 'bg-slate-50'}">
        <div class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${done ? 'bg-emerald-500' : 'bg-slate-200 border-2 border-slate-300'}">
          ${done ? '<svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
        </div>
        <span class="text-sm ${done ? 'text-emerald-700 font-medium' : 'text-slate-500'}">${item}</span>
      </div>
    `;
  }).join('');

  // Show modal with animation
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    panel.style.transform = 'translateX(0)';
  });
}

function closeStartupModal() {
  const modal = document.getElementById('startup-modal');
  const panel = document.getElementById('startup-modal-panel');
  panel.style.transform = 'translateX(100%)';
  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }, 400);
}

// ── Mentor Modal ───────────────────────────────────────
function showMentorDetail(mentorId) {
  const m = MENTORS_DATA[mentorId];
  if (!m) return;

  const modal = document.getElementById('mentor-modal');
  const card = document.getElementById('mentor-modal-card');

  // Banner
  document.getElementById('mentor-banner').className = `relative px-8 pt-8 pb-16 overflow-hidden bg-gradient-to-br ${m.gradient}`;
  const avatar = document.getElementById('mentor-avatar');
  avatar.textContent = m.initials;
  avatar.className = `w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl font-syne shadow-xl flex-shrink-0 bg-white/20`;
  document.getElementById('mentor-title-badge').textContent = m.title;
  document.getElementById('mentor-fullname').textContent = m.name;
  document.getElementById('mentor-institution').textContent = m.institution;

  // Stats
  document.getElementById('mentor-stat-teams').textContent = m.teams;
  document.getElementById('mentor-stat-sessions').textContent = m.sessions;
  document.getElementById('mentor-stat-rating').textContent = m.rating;

  // Bio
  document.getElementById('mentor-bio').textContent = m.bio;

  // Availability
  const availDot = document.getElementById('mentor-avail-dot');
  const availLabel = document.getElementById('mentor-avail-label');
  const availSub = document.getElementById('mentor-avail-sub');
  if (m.available) {
    availDot.className = 'w-3 h-3 rounded-full animate-pulse flex-shrink-0 bg-emerald-500';
    availLabel.textContent = 'Accepting New Sessions';
    availLabel.className = 'text-sm font-semibold text-emerald-700';
    availSub.textContent = 'Usually responds in 24h';
  } else {
    availDot.className = 'w-3 h-3 rounded-full flex-shrink-0 bg-amber-400';
    availLabel.textContent = 'Currently Busy';
    availLabel.className = 'text-sm font-semibold text-amber-700';
    availSub.textContent = 'Expect delayed responses';
  }
  document.getElementById('mentor-next-slot').textContent = m.nextSlot;

  // Expertise Tags
  document.getElementById('mentor-expertise').innerHTML = m.expertise.map(tag => 
    `<span class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">${tag}</span>`
  ).join('');

  // Teams Mentoring
  document.getElementById('mentor-teams').innerHTML = m.currentTeams.map(team => 
    `<div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium">
      <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      ${team}
    </div>`
  ).join('');

  // Highlights
  document.getElementById('mentor-highlights').innerHTML = m.highlights.map(item => 
    `<div class="flex items-start gap-3">
      <div class="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></div>
      <div class="text-sm text-slate-600 leading-relaxed">${item}</div>
    </div>`
  ).join('');

  // Show Modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    card.style.transform = 'translateY(0)';
  });
}

function closeMentorModal() {
  const modal = document.getElementById('mentor-modal');
  const card = document.getElementById('mentor-modal-card');
  card.style.transform = 'translateY(100%)';
  setTimeout(() => {
    modal.classList.add('hidden');
    // Only clear body overflow if startup modal is also hidden
    if (document.getElementById('startup-modal').classList.contains('hidden')) {
      document.body.style.overflow = '';
    }
  }, 400);
}

// ── Carousel ─────────────────────────────────────────
const carousel = { current: 0, total: 3, autoPlayTimer: null };

function carouselUpdate() {
  const track = document.getElementById('carousel-track');
  const cards = track ? track.querySelectorAll('.startup-slide') : [];
  if (!track || cards.length === 0) return;
  const cardWidth = cards[0].offsetWidth + 24; // 24 = gap-6
  track.style.transform = `translateX(-${carousel.current * cardWidth}px)`;

  // Update dots
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.className = `carousel-dot transition-all rounded-full ${
      i === carousel.current ? 'w-6 h-2 bg-indigo-500' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
    }`;
  });
}

function carouselNext() {
  carousel.current = (carousel.current + 1) % carousel.total;
  carouselUpdate();
  resetCarouselTimer();
}

function carouselPrev() {
  carousel.current = (carousel.current - 1 + carousel.total) % carousel.total;
  carouselUpdate();
  resetCarouselTimer();
}

function carouselGoTo(index) {
  carousel.current = index;
  carouselUpdate();
  resetCarouselTimer();
}

function resetCarouselTimer() {
  clearInterval(carousel.autoPlayTimer);
  carousel.autoPlayTimer = setInterval(carouselNext, 4500);
}

// ── Toast ─────────────────────────────────────────────
function showToast(type, msg) {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const msgEl = document.getElementById('toast-msg');

  const configs = {
    success: { bg: 'bg-emerald-500', icon: '<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' },
    info: { bg: 'bg-indigo-500', icon: '<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
    error: { bg: 'bg-red-500', icon: '<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>' },
  };

  const config = configs[type] || configs.info;
  icon.className = `w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`;
  icon.innerHTML = config.icon;
  msgEl.textContent = msg;

  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Keyboard shortcuts ────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close mentor modal first
    const mentorModal = document.getElementById('mentor-modal');
    if (mentorModal && !mentorModal.classList.contains('hidden')) {
      closeMentorModal();
      return;
    }
    // Close startup modal next
    const startupModal = document.getElementById('startup-modal');
    if (startupModal && !startupModal.classList.contains('hidden')) {
      closeStartupModal();
      return;
    }
    if (state.currentScreen === 'screen-auth') navigate('screen-landing');
    if (state.currentScreen === 'screen-onboarding') navigate('screen-auth');
  }
});

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Make landing active
  const landing = document.getElementById('screen-landing');
  if (landing) {
    landing.classList.remove('hidden');
    landing.classList.add('active');
  }

  // Start carousel auto-play
  carousel.autoPlayTimer = setInterval(carouselNext, 4500);

  // Animate metrics on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.step-card, .p-8').forEach(el => observer.observe(el));

  // Animate progress bars when admin dashboard loads
  setTimeout(() => {
    document.querySelectorAll('.progress-bar-fill').forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => bar.style.width = width, 100);
    });
  }, 500);

  console.log('%cITE LaunchPad Frontend', 'color: #4F46E5; font-size: 18px; font-weight: bold;');
  console.log('%cBuilt with ❤️ — Premium UI/UX', 'color: #64748B;');
});
