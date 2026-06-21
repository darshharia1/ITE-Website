# Session Context & Implementation Summary

This document summarizes the development tasks, architectural refactoring, bug fixes, database operations, and hosting integrations completed in this pair programming session.

---

## 1. Winston Logger Crash Safeguard & Git Configurations
* **Objective**: Prevent backend crashes in production environments when the Winston file transport attempts to write logs to a non-existent `logs/` directory.
* **Changes**:
  * **File Modified**: `backend/src/utils/logger.js`
  * **Logic**: Imported native `fs` and defined `logDir` at the module level. Added a synchronous boot check: if the directory is missing, it is created immediately using `fs.mkdirSync(logDir, { recursive: true })` before Winston's file transports are initialized.
  * **Git Tracking**: Created a `backend/logs/.gitkeep` file so Git tracks the directory empty state.
  * **Ignore Rules**: Appended `logs/*.log` to `backend/.gitignore` to prevent massive local log dumps from being committed.

---

## 2. Local Development Database Seeding
* **Objective**: Replace local storage mock states with a realistic, database-backed dataset.
* **Changes**:
  * **File Created**: `backend/src/db/seedDevData.js`
  * **Database Reset**: Executes `TRUNCATE CASCADE` on all core database tables to ensure clean, consistent seeding.
  * **Password Cryptography**: Generates secure bcrypt hashes using the correct project dependency (`bcryptjs`).
  * **Seeded Entities**:
    * Pre-approves student emails in `approved_students`.
    * Seeds **1 Admin**, **2 Mentors**, and **4 Students**.
    * Seeds **2 Teams/Startups** (*Solaris Energy* and *MedTech AI*) with assigned CEOs, Mentors, and Stages.
    * Sets up junction records mapping students to their executive roles (`CEO`, `CTO`).
    * Inserts **3 Milestone Tasks** with varying past and future due dates.
    * Inserts **2 Submissions** (one ungraded/pending review and one graded/approved).
  * **Execution Command**: `node src/db/seedDevData.js`

---

## 3. Announcements Permission Mismatch Fix
* **Objective**: Resolve the permissions mismatch where the frontend allowed mentors to broadcast updates, but the backend restricted `POST /api/announcements` exclusively to admins.
* **Changes**:
  * **File Modified**: `backend/src/routes/announcements.js`
  * **Auth Extension**: Updated the auth middleware on the endpoint to permit both `admin` and `mentor` roles:
    ```javascript
    router.post('/', authenticateToken, requireRole(['admin', 'mentor']), ...)
    ```
  * **Mentor Access Enforcement**: 
    * Strictly restricts mentors to the `team` audience scope. Mentors cannot perform global blasts (`all-students` or `all-mentors`) and are blocked with a `403 Forbidden` response.
    * Queries the database to verify that the target `team_id` belongs to the requesting mentor's assigned roster (`mentor_id = req.user.id`). Unauthorized cross-team broadcasts return a `403 Forbidden` error.
  * **Admin Access**: Retains unrestricted access to all announcement scopes.

---

## 4. Combined Frontend & Backend Local Hosting
* **Objective**: Simplify local hosting and eliminate CORS/multi-port overhead by combining the frontend UI and the backend API onto a single port.
* **Changes**:
  * **File Modified**: `backend/src/app.js`
  * **Static File Serving**: Serves styles, scripts, and media resources directly using standard Express static middleware:
    ```javascript
    app.use('/css', express.static(path.join(frontendDir, 'css')));
    app.use('/js', express.static(path.join(frontendDir, 'js')));
    app.use('/assets', express.static(path.join(frontendDir, 'assets')));
    ```
  * **High-Performance HTML Streams**: Serves the core HTML files using high-performance `fs.createReadStream().pipe(res)` to avoid path-traversal/dot-dot folder restrictions in `res.sendFile()`, keeping backend source modules secure.
  * **Harmonized Port**: Both layers run on **`http://localhost:3002`**, resolving CORS issues dynamically since they share the same origin.
  * **Server Cleanup**: Decommissioned the separate python server on port `3000`.

---

## 5. Seeding Credentials for Local Login
All seeded testing accounts use the default password: **`password123`**

| Role | Account Email | Password | Context |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@vnit.ac.in` | `password123` | Can post global student/mentor broadcasts, approve emails, manage deliverables. |
| **Mentor 1** | `mentor1@vnit.ac.in` | `password123` | Mentors *Solaris Energy*. Can review Solaris tasks and post announcements to them. |
| **Mentor 2** | `mentor2@vnit.ac.in` | `password123` | Mentors *MedTech AI*. Can review MedTech tasks. |
| **Student 1 (CEO)** | `bt25min036@students.vnit.ac.in` | `password123` | CEO of *Solaris Energy*. |
| **Student 2 (CTO)** | `bt25eee085@students.vnit.ac.in` | `password123` | CTO of *Solaris Energy*. |
| **Student 3 (CEO)** | `bt23eee026@students.vnit.ac.in` | `password123` | CEO of *MedTech AI*. |
| **Student 4 (CTO)** | `bt24eee010@students.vnit.ac.in` | `password123` | CTO of *MedTech AI*. |

---

## 6. GitHub Branch Updates
* **Action**: Committed all modifications and new code entities, and pushed them to the remote GitHub branch.
* **Repository**: `github.com:parthlande24/ITE-Website.git`
* **Branch**: `BACKEND`
* **Commit Reference**: `569dd9a..7414999`
