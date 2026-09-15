# Development Conventions

Agreed conventions for consistency across the OpsPilot codebase, from Sprint 0 onward.

| Item | Convention | Example |
|---|---|---|
| Branch naming | `feature/...`, `fix/...` | `feature/employee-crud`, `fix/login-redirect` |
| Commit format | [Conventional Commits](https://www.conventionalcommits.org/) | `feat: add employee list endpoint`, `fix: correct login redirect`, `chore: update dependencies`, `refactor: extract validation logic` |
| API routes | Versioned, plural, kebab-case | `/api/v1/employees`, `/api/v1/leave-requests` |
| Model naming | Singular PascalCase | `Employee`, `LeaveRequest` |
| Component naming | PascalCase | `EmployeeTable.tsx`, `LeaveRequestForm.tsx` |
| File naming (backend) | StudlyCase for classes, snake_case for migrations | `EmployeeController.php`, `2026_07_15_000000_create_employees_table.php` |

## Notes

- Conventional Commit prefixes in use: `feat:`, `fix:`, `chore:`, `refactor:` (extend as needed — `docs:`, `test:`, `style:` are also standard if useful later).
- API routes are not yet versioned in Sprint 0 (current test route is `/api/ping`, unversioned) — `v1` prefixing begins once real endpoints are built in Sprint 1.