# OpsPilot - Multi-Tenant HR & Operations Portal

OpsPilot is a modern, enterprise-ready Multi-Tenant HR and Operations Management Portal. It is structured as a monorepo containing a Laravel REST API backend and a Next.js (React) SPA frontend.

---

## 🚀 Tech Stack

### Backend
- **Framework:** Laravel 11 (PHP 8.2+)
- **Database:** MySQL / MariaDB
- **Authentication:** Laravel Sanctum (Stateful Cookie-based SPA Auth)
- **Role/Permission Management:** Spatie Laravel Permission (with Team/Tenant-scoping enabled)
- **Activity & Audit Logging:** Spatie Laravel Activitylog (stamped with tenant metadata)

### Frontend
- **Framework:** React 19 / Next.js (App Router, styled using Material UI)
- **State Management & Fetching:** TanStack React Query v5
- **Form Validation:** Formik & Yup
- **HTTP Client:** Axios (configured with CSRF/XSRF cookie exchange support)

---

## 📂 Repository Structure

```
OpsPilot/
├── backend/            # Laravel 11 REST API Application
│   ├── app/
│   │   ├── Http/Middleware/ScopeCompany.php # Tenant Isolation Middleware
│   │   └── Models/     # Tenant-aware Eloquent models
│   ├── database/       # Migrations and Seeders
│   └── routes/         # API Route definitions
└── frontend/           # Next.js SPA Application
    ├── app/            # Next.js App Router Pages
    ├── components/     # Shared layout & form components
    ├── hooks/          # React hooks (Authentication, state queries)
    └── services/       # Axios API client mappings
```

---

## 🛠️ Features Implemented (Up to Sprint 2)

### Sprint 0: Foundation & Environment Setup
- Next.js and Laravel project initialization.
- Local developer workspace customization (Horizon/Redis removal for lightweight development).
- TailwindCSS and standard layout setups.

### Sprint 1: Security, Authentication & Tenant Isolation
- **Spatie Team-Based Scoping:** Permissions, roles, and authorization gates are isolated by `company_id`.
- **Sanctum SPA Authentication:** CSRF cookie-secured session exchange.
- **Tenant Scope Middleware:** Global `ScopeCompany` middleware dynamically filters all queries and sets active Spatie team scopes per request.
- **User & Role Management:** CRUD operations for administrators with soft deletes and permission synchronization.

### Sprint 2: Core Organizational Units
- **Company Profile:** Profile forms and secure multipart logo upload system.
- **Departments & Teams:** Shallow-nested RESTful hierarchy (`/departments/{id}/teams` and `/teams/{id}`).
- **Job Designations:** Job title registers with unique title-within-company database constraints.
- **Office Locations:** Multi-branch timezone settings with "last remaining office" protection.
- **Company Settings:** Batch-updated workspace hours, work days, and default localization keys, recording manual audit trails per changed key.
- **Dashboard Widgets:** Tenancy-isolated counters for users, departments, and active teams.

---

## 🔧 Installation & Local Setup

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Composer dependencies:
   ```bash
   composer install
   ```
3. Set up the environment file:
   ```bash
   cp .env.example .env
   ```
   *Configure your database settings (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) inside the `.env` file.*
4. Generate the application key:
   ```bash
   php artisan key:generate
   ```
5. Run migrations and seed the default multi-tenant setup:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *(This creates the default company, default roles/permissions, and the `admin@opspilot.test` Super Admin account).*
6. Start the local server:
   ```bash
   php artisan serve
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Edge Cases & Security Rules Enforced

- **Cross-Tenant ID Injection Prevention:** Nested requests (such as creating a team under a department) validate that the parent resource belongs to the logged-in user's company before allowing creation.
- **Department Deletion Protection:** Deleting a department is blocked (returns `422 Unprocessable Content`) if it has active operational teams grouped under it.
- **Last Remaining Office Protection:** A company must have at least one office location; deleting the last remaining branch is blocked.
- **Role/Permission Dynamic Cache Clearing:** When Spatie's team ID context is switched mid-request, cached user permissions are automatically cleared and reloaded fresh to prevent unauthorized privilege leakage.
- **Unique Name Scopes:** Department and Designation names must be unique within the same company but are allowed to overlap between different companies.

---

## 🌿 Git Branching & Workflow

To maintain a clean merge history on GitHub:
1. **Feature Branches:** Always branch from `development`.
2. **Naming Convention:** Use `sprint-[X]` or `feature/[name]` for active work.
3. **Pull Requests (PRs):** Merge PRs sequentially into `development` in chronological order:
   - **Step 1:** Merge `feature/project-setup` (Sprint 0)
   - **Step 2:** Merge `sprint-1` (Sprint 1)
   - **Step 3:** Merge `sprint-2` (Sprint 2)
   This ensures a clean, fast-forward merge history with **zero merge conflicts**.
