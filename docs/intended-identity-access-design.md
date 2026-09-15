# OpsPilot — Intended Identity, Access & Company Flow

**Status:** Target product design (not current implementation)  
**Audience:** Product + engineering  
**Last updated:** 2026-08-11

This document captures the **intended** end-to-end flow you described: one user table, platform operators, company managers, company creation wizard, default company roles, and unified login with optional multi-company selection.

It also records how the **current codebase differs** and what must change to reach this design.

---

## 1. Product intent (one paragraph)

OpsPilot is a multi-tenant operations platform. A **Platform Super Admin** creates **Platform Managers**. A Super Admin or Manager creates **Companies**, each with **exactly one assigned Manager**. During company creation, the wizard also creates the company’s first **Company Super Admin** (full tenant access). That company admin then manages users, roles, and permissions inside the company. **Every person** (platform operator or company user) lives in **one `users` table**, can sign in from the **main platform URL**, and—if they belong to companies—is routed to the right company (or asked to pick one). Company-specific URLs remain available as an alternate entry point.

---

## 2. Actors

| Actor | Where they work | Who creates them | Core powers |
|-------|-----------------|------------------|-------------|
| **Platform Super Admin** | Platform console | Seeded / bootstrap | Create platform managers; create companies; assign/reassign company managers; manage platform roles & defaults |
| **Platform Manager** | Platform console | Platform Super Admin | Create companies (within policy); manage assigned companies; assign/reassign managers if permitted |
| **Company Super Admin** | Company portal | Created in company wizard (step after company details) | Full company access; create custom roles; manage users/permissions beyond defaults |
| **Company role users** (e.g. HR, Employee, custom) | Company portal | Company Super Admin (or delegated admins) | Whatever their company role allows |

### Rules that must stay true

1. A **company has exactly one Manager** (platform-side owner of that company).
2. A **Manager can own many companies**.
3. **Company Super Admin** is a *tenant* role, not the same person-type as Platform Super Admin (though one human could later hold both via membership + platform role).
4. **All login identities** are rows in **`users`**.

---

## 3. High-level architecture (target)

```
                    ┌─────────────────────────────────────┐
                    │           users (ONE table)         │
                    │  email unique · password · status   │
                    └───────────────┬─────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
           ▼                        ▼                        ▼
  platform_memberships     company_memberships        (optional) employees
  · platform roles         · company_id               HR record linked
  · Super Admin / Manager  · company roles            to user_id
                           · is_active
                           · is company Super Admin

  companies
  · assigned_manager_id → users.id (platform manager)
  · subdomain / slug
  · status
```

**Key idea:** “Platform operator” vs “company user” is **not** two tables. It is:

- whether the user has **platform roles**, and/or
- whether the user has **company memberships**.

A person may have:

- only platform access (rare),
- only company access (most users),
- both (e.g. a Manager who is also invited into a company portal).

---

## 4. Intended login & routing flow

### 4.1 Entry points

| Entry | URL example | Purpose |
|-------|-------------|---------|
| **Main platform login** | `https://app.opspilot.test/login` or `https://opspilot.test/login` | Single primary login for everyone |
| **Company login** (optional) | `https://{company}.opspilot.test/login` | Direct tenant entry; still same `users` table |

### 4.2 Main platform login decision tree

```
User submits email + password on MAIN login
        │
        ▼
Authenticate against users (global)
        │
        ▼
Load platform roles + company memberships (active only)
        │
        ├── Has platform Super Admin or Manager role?
        │         │
        │         ├── YES + also has company memberships?
        │         │         → Land on platform home with
        │         │           ability to open Platform Console
        │         │           OR switch into a company
        │         │
        │         └── YES + no company memberships?
        │                   → Platform Console only
        │
        └── No platform role (company-only user)
                  │
                  ├── 0 active companies → error / contact admin
                  ├── 1 active company  → redirect to that company URL/session
                  └── N active companies → company picker, then redirect
```

### 4.3 Company URL login

```
User opens {company}.opspilot.test/login
        │
        ▼
Authenticate against users
        │
        ▼
Require active membership in THIS company
        │
        ├── No membership → reject (“no access to this portal”)
        └── Has membership → enter company session scoped to this company
              (optional: still show switcher if user has other companies)
```

### 4.4 Multi-company switch

After login, if the user has multiple active company memberships:

- Show a **company switcher**.
- Switching may be:

  - same-host context change (if using path-based tenancy), or
  - redirect to `{other-company}.domain` with a short-lived switch token (current pattern), or
  - session context switch on the main app with `current_company_id`.

**Recommended for your stated UX:** prefer **main login + company selection**, with company subdomain as optional deep-link. Keep one session model and one password.

### 4.5 Redirect rules (explicit)

| Situation after main login | Result |
|----------------------------|--------|
| Platform role only | Platform dashboard |
| 1 company membership, no platform role | Redirect to that company |
| N company memberships, no platform role | Company picker → then company |
| Platform role + companies | Platform home; user can open console or pick a company |
| Suspended company | Hidden from picker; blocked if forced via company URL |

---

## 5. Platform layer — roles, users, companies

### 5.1 Platform roles (default)

| Platform role | Permissions (conceptual) |
|---------------|--------------------------|
| **Super Admin** | Full platform: manage platform users, roles, settings, all companies, assign managers, suspend companies, manage default company permission catalog / role templates |
| **Manager** | Create companies (if allowed), view/update **assigned** companies, invite/replace company manager assignment only if granted, view activity for assigned companies |

Permissions should be **permission strings**, not hardcoded `hasRole('Admin')` checks. Roles are bundles of permissions.

Suggested platform permission catalog:

```
platform.users.view | create | update | disable
platform.roles.manage
platform.settings.manage
platform.activity.view
companies.view | create | update | suspend
companies.assign-manager
company-templates.manage          # default roles/permissions for new companies
```

### 5.2 Platform Super Admin creates Managers

**Flow**

1. Super Admin opens Platform → Users.
2. Creates user (or attaches existing email from `users`).
3. Assigns platform role **Manager**.
4. Optionally assigns one or more companies later.

**Rules**

- Email is globally unique in `users`.
- Creating a Manager does **not** automatically create company memberships.
- Manager cannot create other Super Admins.

### 5.3 Create company / assign manager

**Who can create a company**

- Platform Super Admin: always.
- Platform Manager: if they have `companies.create`.

**Company invariants**

- `companies.assigned_manager_id` → exactly one `users.id` (that user must hold platform Manager or Super Admin).
- One manager → many companies (no unique constraint on manager).
- Changing manager updates the single FK (and access list if you keep a support-access table).

**Assign / reassign manager**

- Super Admin (and Managers with `companies.assign-manager`) can set `assigned_manager_id`.
- When manager changes: previous manager loses ownership; new manager becomes owner.
- Optional: keep a separate “support access” list for extra platform operators without making them *the* manager.

### 5.4 Default company permissions & roles (templates)

Platform maintains **global templates** used when a company is created:

| Default company role | Purpose | Typical permissions |
|----------------------|---------|---------------------|
| **Super Admin** | First company owner (created in wizard) | All company permissions |
| **Admin** (optional default) | Day-to-day company admin | Most management perms except some destructive ones |
| **HR** | People ops | employees.*, limited users.view, etc. |
| **Employee** | Standard staff | dashboard.view, profile.update |

Platform Super Admin can edit these templates (`company-templates.manage`).  
**Cloning happens once at company creation**; later company-specific role edits do not change the global templates.

---

## 6. Company creation — step wizard (main flow)

You described company creation as a **multi-step process**. Target UX:

### Step 1 — Company details

- Name, subdomain/slug, contact, plan, timezone, etc.
- Assigned Manager (defaults to current Manager if they are creating it; Super Admin must pick a Manager).

### Step 2 — Company Super Admin (required)

After company details are saved (or in the same transaction before “Finish”):

- Collect the **Company Super Admin** identity:
  - name, email, password (if new user), **or**
  - “Use existing user” by email if already in `users`.
- System actions on Finish:

  1. Create `companies` row with `assigned_manager_id`.
  2. Clone **default company roles + permissions** from templates into this company.
  3. Ensure Company Super Admin user exists in `users`.
  4. Create `company_memberships` row for that user + company.
  5. Assign company role **Super Admin** (all company permissions).
  6. Mark membership active.
  7. Send invite / credentials notification.

**That’s the core completion criteria you stated:**  
after company details → add company user as Super Admin with all access → done.

### Step 3 (optional later) — extras

Not required for v1 of your flow, but common:

- Seed first departments/offices.
- Link first employee HR record to the Super Admin user.
- Upload logo.

### Post-creation company autonomy

The Company Super Admin can:

- Create additional **custom roles** (e.g. Finance, Auditor).
- Assign permissions to those roles from the **company permission catalog**.
- Invite users into the company (same `users` table; attach membership + roles).
- Keep or customize default roles (HR, Employee, etc.), subject to system-role protection rules (e.g. cannot delete last Super Admin).

Platform operators do **not** need to manage day-to-day company roles after handoff, except via support tools if permitted.

---

## 7. Company layer — membership, roles, permissions

### 7.1 Membership model

Table: **`company_memberships`** (rename of today’s confusing `tenant_company_user`)

| Field | Meaning |
|-------|---------|
| `user_id` | FK → `users` |
| `company_id` | FK → `companies` |
| `status` / `is_active` | Access for this company only |
| timestamps | |

Unique `(user_id, company_id)`.

**Do not store authoritative company on `users.company_id`.**  
Current company context comes from:

- subdomain, or
- selected company after main login / picker.

### 7.2 Company roles & permissions

- Permissions are a **global catalog** for the `company` (web) space, e.g. `users.view`, `employees.create`, `roles.manage`.
- Roles are **per company** (same role name “HR” can exist in many companies with possibly different permission sets after customization).
- Users get roles **through membership context** (Spatie team = `company_id`, or equivalent).

**Recommended RBAC simplicity for v1**

- Roles grant permissions.
- Users receive one or more roles in a company.
- Avoid direct grants + denials unless you truly need them later.
- One effective-permissions API used by backend and frontend.

### 7.3 Example: HR and Employee

At company creation, templates create:

- Role **HR** with employee/user viewing & HR operations.
- Role **Employee** with self-service only.

Company Super Admin may later:

- Edit HR’s permission matrix.
- Add role **Payroll**.
- Invite `jane@acme.com` → membership + HR role.

Jane still has **one** `users` row. If she is also in another company, she picks at login or uses that company’s URL.

---

## 8. Target data model (detailed)

### 8.1 Core tables

#### `users` (single identity table)

| Column | Notes |
|--------|-------|
| `id` | PK |
| `name` | |
| `email` | **UNIQUE** globally |
| `password` | hashed |
| `account_status` | `active` / `disabled` (global lock) |
| `email_verified_at` | optional |
| `avatar`, `preferences` | optional |
| `remember_token` | |
| soft deletes | optional |
| timestamps | |

No `company_id` on users.

#### `companies`

| Column | Notes |
|--------|-------|
| `id` | PK |
| `name`, `subdomain` UNIQUE | |
| `assigned_manager_id` | FK → `users.id` (platform manager) **required** |
| `plan_id` | optional |
| `platform_status` | `active` / `suspended` |
| other profile fields | |
| timestamps | |

#### `company_memberships`

| Column | Notes |
|--------|-------|
| `user_id`, `company_id` | unique pair |
| `is_active` | per-company access |
| timestamps | |

#### Platform role assignment

Either:

- Spatie roles with a dedicated **platform team id** (e.g. `0`) and guard `platform`, **on the same `users` model**, or
- simpler `platform_role_user` pivot if you want less Spatie complexity for platform.

Same `users` model; different role namespace.

#### Company RBAC (Spatie teams OK)

- `roles` with `company_id` (team)
- `permissions` (global names, company guard)
- `model_has_roles`, `role_has_permissions`

#### Templates

- `company_role_templates`
- `company_role_template_permissions`

Used only at company create clone time.

#### Optional HR

- `employees` remains a **company HR record**, optionally linked via `employees.user_id → users.id`.
- Employee ≠ login by itself.

### 8.2 What to remove / rename vs today’s codebase

| Current | Target |
|---------|--------|
| `platform_users` table | **Remove** — merge into `users` |
| `company_user` (platform ↔ company) | Replace with `companies.assigned_manager_id` (+ optional support-access table with clear name) |
| `tenant_company_user` | Rename → `company_memberships` |
| `users.company_id` | **Remove** |
| Dual `is_active` confusion | Global `account_status` + membership `is_active` |
| Direct permission denials | Defer / remove for v1 |
| Duplicate auth routes | One auth surface |

---

## 9. Authorization rules (target)

### Platform console

- Middleware: authenticated user **has at least one platform permission/role**.
- Company list:
  - Super Admin: all companies.
  - Manager: companies where `assigned_manager_id = self` (and any explicit support access).

### Company portal

- Middleware: authenticated + active `company_memberships` for resolved company.
- Suspended company: block all company portal access.
- Policies use `current_company_id` from context service (never stale DB column on user).

### Hierarchy inside company

- Company Super Admin can manage lower roles.
- Cannot remove the last Company Super Admin.
- Platform Manager owning the company may have break-glass tools (create/reset company Super Admin) via platform permissions—not via company roles.

---

## 10. End-to-end scenarios

### Scenario A — Bootstrap

1. Seed Platform Super Admin in `users` with platform Super Admin role.
2. Seed platform permissions + company role templates (Super Admin, HR, Employee, …).

### Scenario B — Add a Manager

1. Super Admin creates `alex@ops.com` in `users`, assigns platform Manager.
2. Alex logs in at main URL → Platform Console (no companies yet).

### Scenario C — Manager creates a company

1. Alex starts company wizard.
2. Step 1: Acme details; manager defaults to Alex.
3. Step 2: Company Super Admin `owner@acme.com` + password.
4. Finish → company created, defaults cloned, `owner@acme.com` membership + Company Super Admin role.
5. Owner logs in:
   - via main URL → redirected to Acme (only one company), or
   - via `acme.opspilot.test`.

### Scenario D — Company admin sets up HR

1. Owner creates custom tweaks or uses default HR role.
2. Invites `hr@acme.com` → membership + HR.
3. HR logs in via main URL → lands in Acme.

### Scenario E — Multi-company user

1. `hr@acme.com` is later invited to Beta company as Employee.
2. Main login → company picker (Acme / Beta).
3. Company URL `beta..../login` → only if membership exists for Beta.

### Scenario F — Reassign company manager

1. Super Admin sets Acme’s manager from Alex to Sam.
2. Alex loses ownership listing; Sam sees Acme in platform console.
3. Company portal users unchanged (memberships untouched).

---

## 11. UX surfaces

### Platform console (main app)

- Login
- Dashboard
- Platform users (Managers / Super Admins)
- Companies list + wizard
- Assign manager
- Suspend/activate company
- Role templates / default company permissions
- Platform activity / settings

### Company portal

- Login (company URL or post-redirect from main)
- Company dashboard
- Users & memberships
- Roles & permissions
- Org structure / employees / etc.
- Company switcher (if multi-membership)

### Shared

- Profile, change password (one password for the human)
- Forgot/reset password (global email)

---

## 12. Gap vs current OpsPilot implementation

| Your intended design | Current codebase |
|----------------------|------------------|
| One `users` table | Split `users` + `platform_users` |
| Main URL login + company select / redirect | Separate platform host + tenant subdomain auth |
| Company wizard ends with Company Super Admin | Company create clones roles; **does not** force first company Super Admin step as first-class wizard |
| One manager per company, many companies per manager | Exists partly (`assigned_manager_id` + `company_user`) but naming/overlap is confusing |
| Defaults for new companies | Templates exist but **drift** from seeders (e.g. missing `employees.*`) |
| Simple role model | Roles + direct grants + denials (over-complex) |
| Clear membership table name | `tenant_company_user` vs `company_user` (easy to confuse) |
| Single source of company context | `users.company_id` leftover + in-memory overwrite |

**Verdict:** Your intended flow is coherent and simpler than today’s dual-identity model. The current app is a partial, evolved approximation—not the target.

---

## 13. Recommended delivery phases

### Phase 0 — Align product decisions (no code)

Confirm:

1. Main login host name/path.
2. Whether platform operators may also be company members (recommend: **yes**).
3. Whether company subdomain login stays required or becomes optional.
4. Exact default company roles (Super Admin + HR + Employee? include Admin?).
5. Whether Managers can create companies without Super Admin approval.

### Phase 1 — Domain model cleanup

- Design migrations toward single `users`.
- Introduce `company_memberships` naming (or alias).
- Make `assigned_manager_id` the only “company manager” source of truth.
- Remove reliance on `users.company_id`.
- Unify password policy endpoints.

### Phase 2 — Company wizard

- Multi-step create: Details → Company Super Admin → Confirm.
- Atomic create: company + template clone + membership + Super Admin role.
- Tests for “new company always has exactly one Company Super Admin with all permissions”.

### Phase 3 — Unified login routing

- One login API against `users`.
- Post-login router: platform / single company / picker.
- Company URL login as membership-scoped alternate.
- Suspended company enforcement on every request.

### Phase 4 — Simplify RBAC

- One template source of truth.
- Role-based only inside companies (defer denials).
- Platform checks via permissions, not role-name hardcoding.
- Frontend receives **effective** permissions; page guards mirror backend.

### Phase 5 — Hardening

- Isolation tests (cross-company).
- Last Super Admin protections.
- Orphan cleanup on membership detach.
- Audit logs for platform vs company actions.

---

## 14. Open questions to confirm with you

1. **Can a Platform Manager also be Company Super Admin** of a company they manage? (Recommended: allowed but not automatic.)
2. **Must every company always have a Manager?** (Recommended: yes, required FK.)
3. **Default roles list:** Super Admin + HR + Employee only, or also Admin / Manager inside company?
4. **Main login URL:** apex `opspilot.test`, `app.`, or `platform.` renamed?
5. **If a user has platform role AND one company:** land on platform home or auto-enter company? (Recommended: platform home with clear “Open company”.)
6. **Employees without login:** keep HR-only employee records with no `users` row? (Recommended: yes.)

---

## 15. Summary

Your target system is:

1. **Platform Super Admin** manages platform users (Managers) and global defaults.  
2. **Manager / Super Admin** creates companies; each company has **one** Manager; Managers have **many** companies.  
3. Company creation wizard: **details → Company Super Admin with full access → finish**, while cloning default company roles/permissions.  
4. Company Super Admin then builds the rest (HR, Employee, custom roles).  
5. **One `users` table**, one password, main login with smart redirect/picker, optional company URL login for direct access.

That model is the right long-term design for the flow you want. The existing dual-table / dual-pivot setup should be treated as transitional debt to migrate toward this document—not as the final architecture.
