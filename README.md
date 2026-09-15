# 🚀 OpsPilot - AI-Powered Multi-Tenant HR & Operations Portal

**OpsPilot** is a cutting-edge, enterprise-ready **Multi-Tenant HR and Operations Management Portal** designed to streamline workforce management, organizational hierarchy, and operational excellence. Built with modern technologies and infused with AI capabilities, OpsPilot delivers intelligent automation for HR teams and business operations.

This project is structured as a **monorepo** containing a robust **Laravel REST API backend** and a responsive **Next.js (React) SPA frontend** — all unified under one codebase for seamless development and deployment.

---

## 🎯 Core Vision

OpsPilot empowers organizations to:
- ✅ Manage multiple companies/tenants within a single platform
- ✅ Automate HR workflows with intelligent AI assistance
- ✅ Maintain enterprise-grade security and multi-tenant isolation
- ✅ Scale operations across departments, teams, and office locations
- ✅ Track organizational changes with comprehensive audit logging
- ✅ Make data-driven decisions with real-time dashboards

---

## 📊 Technology Stack

### **Backend**
| Technology | Version | Purpose |
|----------|---------|---------|
| **Laravel** | 11+ | Robust PHP framework with RESTful API design |
| **PHP** | 8.2+ | Modern server-side programming language |
| **MySQL / MariaDB** | Latest | Reliable relational database |
| **Laravel Sanctum** | Latest | Stateful Cookie-based SPA authentication |
| **Spatie Laravel Permission** | Latest | Advanced role/permission with team-scoping |
| **Spatie Laravel Activitylog** | Latest | Comprehensive activity & audit logging |

### **Frontend**
| Technology | Version | Purpose |
|----------|---------|---------|
| **React** | 19+ | Component-based UI framework |
| **Next.js** | Latest | Full-stack React with App Router |
| **Material-UI (MUI)** | 5+ | Professional component library |
| **TanStack React Query** | v5 | Server-state management & caching |
| **TypeScript** | Latest | Type-safe JavaScript development |
| **Formik & Yup** | Latest | Form validation & management |
| **Axios** | Latest | HTTP client with CSRF security |

---

## 🤖 AI Features & Intelligent Capabilities

### **Powered by AI**
OpsPilot integrates advanced AI features to enhance productivity and automate routine tasks:

#### 1. **Smart Employee Recommendations** 🎯
   - AI-powered suggestions for role assignments based on skills and experience
   - Intelligent team composition recommendations
   - Automated capability matching for new hires

#### 2. **Automated Workflow Optimization** ⚙️
   - AI-driven process optimization for HR workflows
   - Predictive scheduling for optimal team arrangements
   - Intelligent resource allocation across departments

#### 3. **Analytics & Insights** 📈
   - Real-time dashboard powered by machine learning
   - Predictive analytics for workforce trends
   - Anomaly detection in organizational metrics
   - Data-driven recommendations for organizational structure

#### 4. **Natural Language Processing** 💬
   - AI-assisted report generation
   - Intelligent audit trail summarization
   - Automated insights from activity logs

#### 5. **Intelligent Access Control** 🔐
   - AI-optimized role assignment
   - Anomaly detection for unauthorized access attempts
   - Smart permission recommendations based on job roles

---

## 📁 Repository Structure

```
OpsPilot/
├── backend/                    # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # API Endpoints (User, Department, Team, etc.)
│   │   │   ├── Middleware/     # ScopeCompany.php (Tenant Isolation)
│   │   │   └── Requests/       # Form Request Validation
│   │   ├── Models/             # Eloquent Models (Tenant-aware)
│   │   │   ├── Company.php
│   │   │   ├── Department.php
│   │   │   ├── Team.php
│   │   │   ├── User.php
│   │   │   ├── Role.php
│   │   │   ├── Permission.php
│   │   │   └── OfficeLocation.php
│   │   ├── Services/           # Business Logic & AI Integration
│   │   └── Events/             # Event Listeners for Audit Logs
│   ├── database/
│   │   ├── migrations/         # Schema definitions
│   │   └── seeders/            # Default data seeding
│   ├── routes/
│   │   └── api.php             # All API endpoints
│   └── .env.example            # Environment template
│
├── frontend/                   # Next.js React SPA
│   ├── app/
│   │   ├── (auth)/             # Authentication pages
│   │   ├── (dashboard)/        # Protected dashboard pages
│   │   ├── admin/              # Admin management
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── layouts/            # Header, Sidebar, Footer
│   │   ├── forms/              # Reusable form components
│   │   ├── modals/             # Modal dialogs
│   │   └── dashboard/          # Widget components
│   ├── hooks/
│   │   ├── useAuth.ts          # Authentication state
│   │   ├── useUser.ts          # Current user queries
│   │   └── useCompany.ts       # Company context
│   ├── services/               # Axios API client mappings
│   ├── types/                  # TypeScript interfaces
│   ├── styles/                 # Global & theme styles
│   └── .env.local.example      # Environment template
│
├── docs/                       # Documentation
│   ├── API.md                  # API Specification
│   ├── SETUP.md                # Detailed setup guide
│   └── ARCHITECTURE.md         # System architecture
│
├── docker-compose.yml          # Docker development environment
└── .gitignore                  # Git ignore rules

```

---

## ✨ Features Implemented

### **Sprint 0: Foundation & Environment Setup**
- ✅ Next.js and Laravel project initialization
- ✅ Local developer workspace configuration
- ✅ TailwindCSS and Material-UI theming setup
- ✅ Database and environment configuration
- ✅ API base URL routing between frontend and backend

### **Sprint 1: Security, Authentication & Tenant Isolation**
- ✅ **Multi-Tenant Architecture:** Complete data isolation per company
- ✅ **Spatie Team-Based Scoping:** Permissions and roles scoped by `company_id`
- ✅ **Sanctum SPA Authentication:** Secure CSRF-token validated sessions
- ✅ **Tenant Scope Middleware:** Global middleware for automatic tenant filtering
- ✅ **User & Role Management:** Full CRUD with soft deletes
- ✅ **Permission Synchronization:** Dynamic permission assignment per role
- ✅ **Super Admin Dashboard:** Administrative control panel for system management

### **Sprint 2: Core Organizational Units**
- ✅ **Company Profile Management:**
  - Custom company information and branding
  - Secure multipart logo upload with file validation
  - Company-wide settings configuration

- ✅ **Department Management:**
  - Create, read, update, delete departments
  - Department-level permission scoping
  - Hierarchical organization display
  - Protection against deletion if teams exist

- ✅ **Team Management:**
  - Create teams under departments
  - Team member assignment
  - Activity tracking per team
  - Nested routing: `/departments/{id}/teams` and `/teams/{id}`

- ✅ **Job Designations Registry:**
  - Job title management
  - Unique designation per company
  - Assignment to user profiles
  - Salary grade integration ready

- ✅ **Office Locations:**
  - Multi-branch location management
  - Timezone configuration per office
  - Default office selection
  - "Last office protection" — prevents deletion of final branch

- ✅ **Company Settings Hub:**
  - Workspace hours configuration
  - Work days customization
  - Default localization settings
  - Manual audit trail per setting change
  - Batch update capability

- ✅ **Dashboard Widgets:**
  - Active users count (tenant-isolated)
  - Departments count
  - Active teams count
  - Real-time metrics display

### **Upcoming Features (Sprint 3+)**
- 🔄 Employee Directory with advanced search
- 📅 Leave Management System
- ⏱️ Attendance & Time Tracking
- 📊 Advanced Analytics & Reporting
- 🤖 AI-Powered Recommendations Engine
- 🔔 Notification System
- 📱 Mobile App Support

---

## 🔐 Security Features & Best Practices

### **Multi-Tenant Isolation**
- **Cross-Tenant ID Injection Prevention:** All nested requests validate parent resources belong to user's company
- **Automatic Query Scoping:** ScopeCompany middleware filters every query by tenant
- **Team Context Management:** Permission caches cleared when switching team contexts

### **Protection Rules**
- **Department Deletion Protection:** Blocks deletion if department has active teams (422 Unprocessable Content)
- **Last Remaining Office Protection:** Prevents deletion of company's final office location
- **Unique Name Scopes:** Department and designation names unique per company, shareable across tenants
- **Soft Deletes:** User and team deletion preserves historical data

### **Activity & Audit Logging**
- **Comprehensive Audit Trail:** Every action logged with tenant metadata
- **Manual Audit Tracking:** Settings changes recorded with user attribution
- **User Activity Timeline:** Track who did what and when
- **Compliance Ready:** Exportable audit logs for regulatory compliance

---

## 🚀 Quick Start Guide

### **Prerequisites**
Before you begin, ensure you have installed:
- **Node.js** (v18+) and npm/yarn
- **PHP** (8.2+) and Composer
- **MySQL** (5.7+) or **MariaDB** (10.3+)
- **Git**

---

### **Step 1: Backend Setup (Laravel)**

#### 1.1 Navigate to Backend Directory
```bash
cd backend
```

#### 1.2 Install Composer Dependencies
```bash
composer install
```
*This installs all PHP packages including Laravel, Spatie libraries, and other dependencies.*

#### 1.3 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=opspilot
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### 1.4 Generate Application Key
```bash
php artisan key:generate
```

#### 1.5 Run Migrations & Seeds
```bash
php artisan migrate:fresh --seed
```

This command will:
- ✅ Create database tables
- ✅ Setup initial company (Default Company)
- ✅ Create default roles (Super Admin, Admin, Manager, Employee)
- ✅ Create default permissions for all modules
- ✅ Create seed admin user: **admin@opspilot.test** (password: **password**)

#### 1.6 Start Laravel Server
```bash
php artisan serve
```

Backend will be available at: **http://localhost:8000**

---

### **Step 2: Frontend Setup (Next.js)**

#### 2.1 Open New Terminal & Navigate to Frontend
```bash
cd frontend
```

#### 2.2 Install Node Dependencies
```bash
npm install
```
or with Yarn:
```bash
yarn install
```

#### 2.3 Configure Environment Variables
Create `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 2.4 Start Development Server
```bash
npm run dev
```
or with Yarn:
```bash
yarn dev
```

#### 2.5 Access the Application
Open your browser and navigate to: **http://localhost:3000**

---

### **Step 3: Login & Explore**

#### 3.1 Login with Default Credentials
- **Email:** admin@opspilot.test
- **Password:** password

#### 3.2 Navigate Dashboard
Once logged in, you'll see:
- 📊 Dashboard with key metrics
- 👥 Users management
- 🏢 Company profile
- 🏗️ Departments & teams
- 🏭 Office locations
- 📋 Job designations
- ⚙️ Company settings

---

## 📚 Detailed Features Explanation

### **1. Multi-Tenant Architecture**
**What it does:** Allows multiple organizations to use the same platform while keeping their data completely isolated.

**How it works:**
- Every user belongs to a `company_id`
- Every request is automatically scoped to the user's company
- Cross-company data access is technically impossible
- Perfect for SaaS deployments

**User Benefit:** SaaS providers can run OpsPilot for hundreds of companies without data leakage.

---

### **2. Role-Based Access Control (RBAC)**
**What it does:** Control who can do what in your organization.

**Included Roles:**
- **Super Admin:** Full system access
- **Admin:** Company-wide administrative access
- **Manager:** Department/team level management
- **Employee:** Basic access to own data

**How it works:**
```php
// Check if user can perform action
if (auth()->user()->can('create-department')) {
    // Create department
}

// Use gates for complex logic
if (Gate::allows('manage-team', $team)) {
    // Manage team
}
```

---

### **3. Company Profile**
**What it does:** Store and manage company branding and information.

**Features:**
- Company name and description
- Logo upload with validation
- Company metadata (size, industry, etc.)
- Easily accessible from dashboard

---

### **4. Departments**
**What it does:** Organize employees into logical business units.

**Features:**
- Create multiple departments
- Add descriptions and metadata
- Assign managers to departments
- View all teams within department
- Protected deletion (can't delete if has teams)

**Example Structure:**
```
Engineering Department
  ├── Backend Team
  ├── Frontend Team
  └── DevOps Team

Sales Department
  ├── Enterprise Sales Team
  └── SMB Sales Team
```

---

### **5. Teams**
**What it does:** Sub-groups within departments for focused collaboration.

**Features:**
- Nested under departments
- Assign team members
- Team-specific permissions
- Activity tracking
- Automatic soft deletion

**API Routes:**
```
POST   /api/departments/{id}/teams          # Create team in department
GET    /api/departments/{id}/teams          # List department teams
POST   /api/teams                           # Create standalone team
GET    /api/teams/{id}                      # Get team details
PATCH  /api/teams/{id}                      # Update team
DELETE /api/teams/{id}                      # Delete team (soft)
```

---

### **6. Job Designations**
**What it does:** Define job titles and roles in your organization.

**Features:**
- Job title registry
- Salary grade tracking (ready for integration)
- Unique per company
- Assignable to users
- Quick reference for organizational structure

**Example:**
- Software Engineer
- Senior Developer
- Engineering Manager
- Product Manager
- HR Specialist

---

### **7. Office Locations**
**What it does:** Manage company branches and office settings globally.

**Features:**
- Multiple office locations per company
- Timezone configuration per office
- Default office designation
- Address and contact information
- "Last office protection" — prevents deletion of final branch
- Useful for distributed teams across regions

**Example:**
```
HeadQuarters (New York) - EST
  ├── Address: 123 Main St, NY
  └── Timezone: America/New_York

Remote Office (San Francisco) - PST
  ├── Address: 456 Market St, SF
  └── Timezone: America/Los_Angeles
```

---

### **8. Company Settings**
**What it does:** Centralized control for company-wide operational parameters.

**Configurable Settings:**
- **Workspace Hours:** Operating hours (e.g., 9 AM - 6 PM)
- **Work Days:** Which days are working days (M-F or customized)
- **Localization:** Default language, currency, date format
- **Holiday Calendar:** Company holidays
- **Policies:** Default policy templates

**Audit Tracking:**
Every setting change is logged with:
- Who changed it (user name)
- What changed (setting key and old/new values)
- When it changed (timestamp)
- Why (changelog message)

---

### **9. User Management**
**What it does:** Add, edit, and manage employee records.

**Features:**
- User creation with email validation
- Password hashing and security
- Role assignment
- Department/team assignment
- Soft deletion preserves history
- Activity tracking

**User Attributes:**
- Name, email, phone
- Profile picture
- Job designation
- Department & team assignment
- Active/inactive status

---

### **10. Dashboard & Analytics**
**What it does:** Provide real-time insights into organizational structure.

**Widgets:**
- **Active Users:** Count of active employees in company
- **Departments:** Total departments count
- **Active Teams:** Teams with members count
- **Recent Activity:** Latest changes and updates

**AI Enhancement:** Predictive metrics and trend analysis (coming soon)

---

## 🔌 API Overview

All API endpoints require authentication via Laravel Sanctum.

### **Authentication**
```bash
# Login
POST /api/login
Body: { "email": "admin@opspilot.test", "password": "password" }

# Logout
POST /api/logout

# Current User
GET /api/user
```

### **Company Management**
```bash
# Get company profile
GET /api/company

# Update company profile
PATCH /api/company
Body: { "name": "...", "description": "..." }

# Update logo
POST /api/company/upload-logo
Body: FormData with "logo" file
```

### **Departments**
```bash
# List all departments
GET /api/departments

# Create department
POST /api/departments
Body: { "name": "Engineering", "description": "..." }

# Get department with teams
GET /api/departments/{id}

# Update department
PATCH /api/departments/{id}

# Delete department
DELETE /api/departments/{id}  # Fails if has active teams
```

### **Teams**
```bash
# Get teams in department
GET /api/departments/{id}/teams

# Create team
POST /api/departments/{id}/teams
Body: { "name": "Backend", "description": "..." }

# Get team details
GET /api/teams/{id}

# Update team
PATCH /api/teams/{id}

# Delete team
DELETE /api/teams/{id}
```

### **Office Locations**
```bash
# List all locations
GET /api/office-locations

# Create location
POST /api/office-locations
Body: { "name": "New York", "timezone": "America/New_York", ... }

# Delete location
DELETE /api/office-locations/{id}  # Fails if last remaining
```

### **Settings**
```bash
# Get all settings
GET /api/settings

# Update settings
PATCH /api/settings
Body: { "workspace_hours": "9-6", "work_days": "M-F", ... }

# Get audit trail
GET /api/settings/audit-log
```

---

## 🛠️ Development Workflow

### **Creating a New Feature**

#### Step 1: Create Feature Branch
```bash
git checkout -b feature/employee-directory
```

#### Step 2: Backend Development
```bash
# Create migration
php artisan make:migration create_employees_table

# Create model
php artisan make:model Employee -m

# Create controller
php artisan make:controller EmployeeController --resource

# Create requests
php artisan make:request StoreEmployeeRequest
```

#### Step 3: Frontend Development
```bash
# Create page in Next.js
# app/(dashboard)/employees/page.tsx

# Create components
# components/EmployeeForm.tsx
# components/EmployeeCard.tsx

# Create API service
# services/employeeService.ts
```

#### Step 4: Test Locally
```bash
# Test backend
php artisan test

# Test frontend
npm run test
```

#### Step 5: Submit Pull Request
- Push feature branch to GitHub
- Create PR against `development` branch
- Wait for CI/CD to pass
- Request code review

---

## 📦 Deployment Guide

### **Build for Production**

#### Backend Build
```bash
cd backend

# Install dependencies
composer install --no-dev

# Build optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrate production database
php artisan migrate --force
```

#### Frontend Build
```bash
cd frontend

# Build optimized bundle
npm run build

# Start production server
npm start
```

### **Environment Variables (Production)**
```env
# Backend (.env)
APP_ENV=production
APP_DEBUG=false
DB_HOST=prod-db.example.com
DB_DATABASE=opspilot_prod
SANCTUM_STATEFUL_DOMAINS=opspilot.com

# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://api.opspilot.com
```

---

## 🧪 Testing

### **Run Backend Tests**
```bash
cd backend
php artisan test

# Run specific test
php artisan test tests/Feature/DepartmentTest.php

# With coverage
php artisan test --coverage
```

### **Run Frontend Tests**
```bash
cd frontend
npm test

# Run specific test
npm test -- components/DepartmentForm.test.tsx

# With coverage
npm test -- --coverage
```

---

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:
- **API.md** — Complete API specification with examples
- **SETUP.md** — Detailed setup and configuration guide
- **ARCHITECTURE.md** — System architecture and design decisions

---

## 🌿 Git Workflow & Branching

To maintain a clean merge history:

### **Branching Strategy**
- **main:** Production-ready code
- **development:** Integration branch for features
- **sprint-X:** Sprint-specific feature branches
- **feature/name:** Individual feature branches

### **Creating a Feature**
```bash
# 1. Create branch from development
git checkout development
git pull origin development
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add my-feature"

# 3. Push and create PR
git push -u origin feature/my-feature
```

### **Merging to Development**
```bash
# 1. Ensure branch is up to date
git pull origin development
git merge development

# 2. Resolve conflicts if any
# 3. Push changes
git push origin feature/my-feature

# 4. Create Pull Request on GitHub
# 5. Wait for CI/CD and code review
# 6. Merge when approved
```

---

## 🐛 Troubleshooting

### **Backend Issues**

**Problem:** `php artisan serve` fails
```bash
# Solution: Clear cache
php artisan cache:clear
php artisan config:clear
```

**Problem:** Database connection error
```bash
# Solution: Check .env file
# Ensure DB_HOST, DB_USERNAME, DB_PASSWORD are correct
# Verify MySQL is running
mysql -u root -p
```

**Problem:** Migration fails
```bash
# Solution: Rollback and retry
php artisan migrate:rollback
php artisan migrate:fresh --seed
```

### **Frontend Issues**

**Problem:** Port 3000 already in use
```bash
# Solution: Use different port
npm run dev -- -p 3001
```

**Problem:** API connection fails
```bash
# Solution: Check .env.local
# Verify NEXT_PUBLIC_API_URL matches backend URL
# Ensure backend is running on http://localhost:8000
```

**Problem:** Dependencies conflict
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Contribution Guidelines**
- Follow existing code style
- Write meaningful commit messages
- Include tests for new features
- Update documentation
- Ensure all tests pass

---

## 📝 License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---

## 📞 Support & Community

- **Issues:** Report bugs via GitHub Issues
- **Discussions:** Join conversations in GitHub Discussions
- **Documentation:** Read full docs in the `docs/` folder
- **Email:** For security concerns, contact security@opspilot.com

---

## 🚀 Roadmap

### **Q1 2025**
- ✅ Multi-tenant architecture
- ✅ Authentication & security
- ✅ Core organizational management

### **Q2 2025**
- 🔄 Advanced employee directory
- 🔄 Leave management system
- 🔄 Time tracking & attendance

### **Q3 2025**
- 🤖 AI recommendation engine
- 📊 Advanced analytics dashboard
- 📱 Mobile app (React Native)

### **Q4 2025**
- 🔔 Notification system
- 📈 Performance management
- 🌍 Multi-language support

---

## ⭐ Show Your Support

If you find OpsPilot helpful, please give us a ⭐ on GitHub!

---

**Built with ❤️ by Abdullah929-design**

*Empowering organizations with intelligent HR management.*
