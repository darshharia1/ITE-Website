# ITE Startup Launch Pad

<div align="center">

![ITE Startup Launch Pad](https://img.shields.io/badge/ITE-Startup%20Launch%20Pad-2563EB?style=for-the-badge&logo=rocket&logoColor=white)
![VNIT Nagpur](https://img.shields.io/badge/VNIT-Nagpur-0D1B3E?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-10B981?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)

**A centralized platform managing the entire ITE entrepreneurship journey at VNIT Nagpur.**

*From Idea to Impact*

</div>

---

## 📖 Overview

**ITE Startup Launch Pad** is a comprehensive web application built for the **Introduction to Entrepreneurship (ITE)** course at VNIT Nagpur. It replaces scattered spreadsheets, WhatsApp groups, and manual tracking with a single unified platform that handles:

- 🎓 Student onboarding & profile creation
- 👥 Team formation & role assignment
- 🧑‍🏫 Mentorship & mentor-team coordination
- 🚀 Startup development tracking (6-stage pipeline)
- 📋 Task management & submissions
- 📣 Role-based announcement broadcasting
- 🏁 Final pitch evaluation

---

## 🚀 Quick Start

This is a **pure frontend SPA** — no installation, no server, no build step required.

```bash
# 1. Clone or download the project
git clone <repo-url>

# 2. Open in browser directly
# Double-click index.html
# OR open with Live Server in VS Code for best experience
```

> **Note:** All data is stored in `localStorage`. The app seeds demo data automatically on first load.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| 👑 **Admin** | `admin@vnit.ac.in` | `admin123` | Faculty coordinator — full platform access |
| 📤 **Admin (CSV)** | `mentor-admin@vnit.ac.in` | `mentor123` | Coordinator for CSV upload |
| 🧑‍🏫 **Mentor** | `dr.sharma@vnit.ac.in` | `mentor123` | Manages Team AgriTech Connect |
| 🧑‍🏫 **Mentor** | `dr.patel@vnit.ac.in` | `mentor123` | Manages Team EduBridge |
| 👨‍🎓 **Student (CEO)** | `aarav.mehta@students.vnit.ac.in` | `student123` | CEO of AgriTech Connect |
| 👩‍🎓 **Student (Member)** | `diya.singh@students.vnit.ac.in` | `student123` | CTO of AgriTech Connect |
| 👨‍🎓 **Student (No Team)** | `pooja.desai@students.vnit.ac.in` | `student123` | Unassigned — for testing registration & invites |

---

## 🗂️ Project Structure

```
ITE2/
│
├── index.html                  # SPA entry point & shell
├── acm-chapter.html            # Standalone ACM student chapter & creators page
│
├── assets/
│   ├── acm-logo.png            # ACM Chapter logo
│   ├── image_2f40b9.png        # Transparent ACM Partner footer logo
│   ├── Main_Bldg_Final_1.jpg.jpeg # High-resolution main building image
│   └── vnit-logo.jpg           # VNIT institutional logo
│
├── css/
│   ├── main.css                # Design system: CSS variables, layout, animations
│   ├── components.css          # Reusable UI components
│   └── pages.css               # Page-specific layouts & styles
│
├── js/
│   ├── data.js                 # localStorage data layer + seed data
│   ├── auth.js                 # Authentication & session management
│   ├── app.js                  # SPA router, theme toggle, shell controller
│   │
│   └── pages/
│       ├── home.js             # Landing, Login, Register, All Startups
│       ├── admin.js            # Admin dashboard & all admin modules
│       ├── mentor.js           # Mentor dashboard & team management
│       └── student.js          # Student dashboard, My Team, Tasks
│
└── README.md                   # This file
```

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Structure** | Vanilla HTML5 | Semantic, zero-dependency |
| **Styling** | Vanilla CSS3 + CSS Variables | Full theming control, no build step |
| **Logic** | Vanilla JavaScript (ES6+) | IIFE module pattern, no bundler needed |
| **Routing** | Hash-based SPA router | Works on `file://` without a server |
| **Data** | `localStorage` | Persistent, simulates a real DB |
| **Fonts** | Google Fonts (Inter + Outfit) | Professional typography |

### Data Flow

```
User Action → SPA Router (app.js)
                    ↓
              Auth Guard Check
                    ↓
           Page Module (home/admin/mentor/student)
                    ↓
           Data Layer (data.js ↔ localStorage)
                    ↓
           DOM render → User sees updated UI
```

### Module Pattern

All JS files use the **IIFE (Immediately Invoked Function Expression)** module pattern, namespaced under `window.ITE`:

```javascript
window.ITE.Data   // Data layer
window.ITE.Auth   // Authentication
window.ITE.App    // Router & shell
window.ITE.Pages.Home    // Home page
window.ITE.Pages.Admin   // Admin pages
window.ITE.Pages.Mentor  // Mentor pages
window.ITE.Pages.Student // Student pages
```

---

## ✨ Recent UX & Layout Enhancements

To deliver a premium, production-grade visual experience, several UX improvements and responsive design fixes have been implemented:

- **📱 Mobile Responsiveness (Under 768px)**:
  - **Header Nav wrapping**: Header links wrap cleanly on mobile viewports so that they remain fully visible and accessible without overflow.
  - **Footer Stack**: Stacks the collaborator items (ITE brand, VNIT logo, ACM chapter) into a clean vertical alignment on mobile. Normalized all logo widths to `44px` so that the logos and text blocks line up perfectly.
  - **Two-Column Collapse**: Automatically collapses `.two-col` layouts across the site into a single column with a `20px` gap on mobile.
  - **Overflow Lock**: Implemented viewport locks (`max-width: 100vw; overflow-x: hidden`) on `html` and `body` tags to prevent horizontal scrolling.

- **📐 Dynamic Header Offset (Overlap Fix)**:
  - Replaced hardcoded CSS offset margins with a dynamic JavaScript utility that calculates the header height (`offsetHeight`) and sets a `--nav-height` CSS root variable. Hero sections and containers dynamically recalculate spacing using `calc(var(--nav-height) + offset)`, resolving overlap bugs when nav menus wrap.

- **🎬 Smooth Page Transitions**:
  - Implemented a lightweight CSS/JS animation class `.page-fade` to introduce smooth fade-in and fade-out animations. Link click interceptors apply transitions seamlessly when routing inside the SPA or redirecting to static pages like `acm-chapter.html`.

---

## 👤 User Roles & Capabilities

### 👑 Admin
- View analytics dashboard (students, teams, stages, submission stats)
- Upload CSV to approve students for registration
- Add/remove mentors and assign them to teams
- Broadcast announcements to all students, all mentors, or specific teams
- View all startup details and advance team stages
- Manage the entire platform

### 🧑‍🏫 Mentor
- View dashboard with assigned teams and their progress
- Assign a student as **CEO** of a team (unlocks team creation powers)
- Advance team stages through the 6-stage pipeline
- Send announcements to specific assigned teams
- View team member profiles and startup details

### 👨‍🎓 Student (Default)
- Create a profile (name, roll no., branch, skills, interests)
- View tasks and submit responses
- View announcements (read-only)
- Accept or decline team invitations

### 👑 Student (CEO — elevated role)
All default student capabilities **plus**:
- Create and edit the startup profile (name, problem statement, description, industry)
- Invite other approved students to join as **CTO, CFO, or CMO**
- View pending invitation status

---

## 🗺️ Core Workflows

### 1. Student Registration
```
Admin uploads CSV → Student visits /register
→ Email validated against approved list
→ Profile created (name, roll no., branch, skills, interests)
→ Redirected to Student Dashboard
```

### 2. Team Formation
```
Mentor reviews students → Assigns CEO role to a student
→ CEO logs in and sees "Create Startup Profile" prompt
→ CEO fills startup name, problem, description, industry
→ CEO invites students (CTO / CFO / CMO)
→ Invited student receives notification → Accepts/Declines
→ Team is fully formed
```

### 3. Startup Development Pipeline
```
💡 Idea Validation
      ↓
📊 Market Research
      ↓
🎤 Customer Interviews
      ↓
🛠️ MVP Development
      ↓
📋 Pitch Deck
      ↓
🚀 Final Pitch
```
Mentor advances the team stage after reviewing progress.

### 4. Announcement Flow
```
Admin creates announcement → Select recipients:
  ├── All Students    → visible to all students
  ├── All Mentors     → visible to all mentors
  └── Specific Team   → visible only to that team

Mentor creates announcement → Select from assigned teams only
```

---

## 🎨 Design System

### Color Palette (from logo)

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#2563EB` | Primary buttons, active states, highlights |
| `--navy` | `#0D1B3E` | Headers, sidebar background, footers |
| `--success` | `#10B981` | Completed states, CTO role |
| `--warning` | `#F59E0B` | CFO role, pending states |
| `--purple` | `#8B5CF6` | CMO role, purple badges |

### Theming

The app supports **Light** and **Dark** mode via CSS custom properties. Theme is toggled via the sun/moon button in the navbar or sidebar topbar, and persisted in `localStorage`.

```css
/* Light mode (default) */
:root {
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --text-primary: #0D1B3E;
}

/* Dark mode */
[data-theme="dark"] {
  --bg: #0C0C14;
  --card: #181828;
  --text-primary: #F0F4FF;
}
```

### Typography
- **Headings / Display**: `Outfit` — Bold, modern, impactful
- **Body / UI**: `Inter` — Clean, highly readable, professional

---

## 📊 Seed Data

The app automatically seeds the following on first load:

| Category | Count | Details |
|----------|-------|---------|
| Admin accounts | 2 | `admin@vnit.ac.in`, `mentor-admin@vnit.ac.in` |
| Mentor accounts | 2 | Dr. Ravi Sharma, Dr. Priya Patel |
| Student accounts | 10 | Pre-registered with profiles |
| Approved student list | 10 | Matches all student accounts |
| Startup teams | 2 | AgriTech Connect (Stage 3), EduBridge (Stage 5) |
| Announcements | 5 | Mix of admin and mentor announcements |
| Tasks | 5 | Problem Statement → Market Research → Interviews → MVP → Pitch |
| Task submissions | 6 | Demo submissions for various students |
| Previous startups | 7 | Historical startups from batches 2020–2023 |

---

## 📋 CSV Upload Format

Admins can upload a CSV to approve students for registration. The expected format is:

```csv
Name,RollNo,Email
Aarav Mehta,24BCE001,aarav.mehta@students.vnit.ac.in
Diya Singh,24BCE002,diya.singh@students.vnit.ac.in
Rohan Kumar,24BCE003,rohan.kumar@students.vnit.ac.in
```

> A sample CSV template can be downloaded directly from the **Admin → CSV Upload** page.

---

## 🌐 Pages & Routes

| Hash Route | Page | Access |
|------------|------|--------|
| `#/` | Home / Landing | Public |
| `#/login` | Login | Public |
| `#/register` | Student Registration | Public (approved emails only) |
| `#/all-startups` | All Previous Startups | Public |
| `#/admin/dashboard` | Admin Dashboard | Admin only |
| `#/admin/startups` | Startup Management | Admin only |
| `#/admin/students` | Student List | Admin only |
| `#/admin/mentors` | Mentor Management | Admin only |
| `#/admin/announcements` | Announcements | Admin only |
| `#/admin/csv-upload` | CSV Upload | Admin only |
| `#/mentor/dashboard` | Mentor Dashboard | Mentor only |
| `#/mentor/teams` | Team Management | Mentor only |
| `#/mentor/announcements` | Mentor Announcements | Mentor only |
| `#/student/dashboard` | Student Dashboard | Student only |
| `#/student/my-team` | My Team Hub | Student only |
| `#/student/tasks` | Task List | Student only |
| `#/student/announcements` | Announcements Feed | Student only |

---

## 🔒 Security Notes

> This is a **frontend-only prototype** using `localStorage`. It is designed for demonstration and internal academic use only.

- Passwords are stored in plain text in `localStorage` — **do not use real passwords**
- There is no backend, so all data is client-side only
- For production deployment, replace the data layer with a real backend API (Node.js/Django/etc.) and a proper database
- Add JWT-based authentication for production use

---

## 🧪 Testing Scenarios

### Scenario 1: Full Student Journey
1. Login as **Admin** → Upload a new student CSV entry
2. Login as **Mentor** (Dr. Sharma) → Assign a student as CEO
3. Login as the **CEO student** → Create startup profile
4. CEO invites another student as CTO
5. Login as the **invited student** → Accept the invitation
6. Verify both appear in the team on **My Team** page

### Scenario 2: Admin Broadcast
1. Login as **Admin**
2. Go to **Announcements** → Create announcement for "All Students"
3. Login as any student → Verify announcement appears

### Scenario 3: Stage Progression
1. Login as **Mentor** → Go to Teams
2. Click **Advance Stage** for a team
3. Login as a team member → Go to **My Team** and verify the progress tracker updated

### Scenario 4: View All Startups
1. Visit the **Home page** (no login required)
2. Scroll to the **Previous Startups** section
3. Click **View All Startups →**
4. Use batch filters to filter by year

---

## 🔄 Resetting Data

To reset all data and start fresh:

```javascript
// Open browser console and run:
localStorage.clear();
location.reload();
```

This will clear all data including the seed flag, and the app will re-seed all demo data on next load.

---

## 🛣️ Roadmap / Future Enhancements

- [ ] **Backend Integration** — Node.js + Express + PostgreSQL
- [ ] **Real Authentication** — JWT tokens, email verification
- [ ] **File Uploads** — PDF pitch deck, prototype demo video submissions
- [ ] **Email Notifications** — Nodemailer for announcements & invitations
- [ ] **Evaluation Module** — Rubric-based scoring by judges on Pitch Day
- [ ] **Analytics Charts** — Chart.js integration for visual stage distribution
- [ ] **Mobile App** — React Native wrapper for iOS/Android
- [ ] **Export Reports** — PDF/Excel export for admin analytics

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 🙌 Acknowledgements

- **VNIT Nagpur** — For the ITE program and entrepreneurship ecosystem
- **Google Fonts** — Inter & Outfit typefaces
- **ITE Coordinator** — Prof. Anand Chaturvedi and all faculty mentors

---

<div align="center">

Engineered with 🩵 by [ACM Student Chapter, VNIT](acm-chapter.html)

**ITE Startup Launch Pad** · *From Idea to Impact*

</div>
