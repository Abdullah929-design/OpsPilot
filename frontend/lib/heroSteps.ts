export interface FeatureCardData {
  side: 'left' | 'right' | 'center-left';
  eyebrow: string;
  headline: string;
  desc?: string;
  bullets?: string[];
  iconName: string;
  cta?: {
    primary?: { text: string; href: string };
    secondary?: { text: string; href: string };
  };
  subnote?: string;
}

export interface FeatureStep {
  id: number;
  phase: string;
  range: [number, number]; // [startProgress, endProgress]
  cards: FeatureCardData[];
}

export const FEATURE_STEPS: FeatureStep[] = [
  {
    id: 1,
    phase: 'isolation',
    range: [0.0, 0.125],
    cards: [
      {
        side: 'left',
        eyebrow: 'Multi-Tenant Platform',
        headline: 'One platform. Every company, fully isolated.',
        desc: 'Run hundreds of organizations side by side with zero data leakage.',
        bullets: [
          'Automatic tenant scoping',
          'Cross-tenant injection prevention',
          'Per-company workspaces',
        ],
        iconName: 'Building2',
      },
      {
        side: 'right',
        eyebrow: 'Enterprise Security',
        headline: 'Secure by design',
        desc: 'Zero-trust architecture guaranteeing continuous operational safety.',
        bullets: [
          'Sanctum cookie-based auth',
          'CSRF-protected sessions',
          'Tenant-aware middleware',
        ],
        iconName: 'ShieldCheck',
      },
    ],
  },
  {
    id: 2,
    phase: 'access',
    range: [0.125, 0.25],
    cards: [
      {
        side: 'left',
        eyebrow: 'Roles & Permissions',
        headline: 'Control who can do what',
        desc: 'Team-scoped RBAC with Super Admin, Admin, Manager and Employee roles.',
        bullets: [
          'Dynamic permission sync',
          'Per-company role scoping',
          'Super Admin console',
        ],
        iconName: 'KeyRound',
      },
      {
        side: 'right',
        eyebrow: 'User Management',
        headline: 'Your people, organized',
        desc: 'Manage personnel lifecycles seamlessly across every business branch.',
        bullets: [
          'Full user CRUD',
          'Soft deletes keep history',
          'Active/inactive status',
        ],
        iconName: 'Users',
      },
    ],
  },
  {
    id: 3,
    phase: 'structure',
    range: [0.25, 0.375],
    cards: [
      {
        side: 'left',
        eyebrow: 'Company Profile',
        headline: 'Your brand, your workspace',
        desc: 'Custom company info, logo upload and company-wide settings.',
        bullets: [
          'Secure logo upload',
          'Company metadata',
          'Branded workspace',
        ],
        iconName: 'Briefcase',
      },
      {
        side: 'right',
        eyebrow: 'Departments',
        headline: 'Structure that scales',
        desc: 'Model organizational hierarchies tailored to corporate divisions.',
        bullets: [
          'Create and manage departments',
          'Assign department managers',
          'Protected deletion when teams exist',
        ],
        iconName: 'Network',
      },
    ],
  },
  {
    id: 4,
    phase: 'collaboration',
    range: [0.375, 0.5],
    cards: [
      {
        side: 'left',
        eyebrow: 'Teams',
        headline: 'Collaboration, nested and clear',
        desc: 'Build teams under departments and assign members in seconds.',
        bullets: [
          'Department to team hierarchy',
          'Member assignment',
          'Activity tracking per team',
        ],
        iconName: 'UserCheck',
      },
      {
        side: 'right',
        eyebrow: 'Job Designations',
        headline: 'Every role, defined',
        desc: 'Standardize compensation, titles, and managerial authorizations.',
        bullets: [
          'Unique titles per company',
          'Assign to user profiles',
          'Salary-grade ready',
        ],
        iconName: 'BadgeCheck',
      },
    ],
  },
  {
    id: 5,
    phase: 'operations',
    range: [0.5, 0.625],
    cards: [
      {
        side: 'left',
        eyebrow: 'Office Locations',
        headline: 'Every branch, one view',
        desc: 'Manage multiple offices with their own timezones and a default HQ.',
        bullets: [
          'Timezone per office',
          'Default office selection',
          'Last-office deletion protection',
        ],
        iconName: 'MapPin',
      },
      {
        side: 'right',
        eyebrow: 'Company Settings',
        headline: 'Operations, your way',
        desc: 'Define custom workspace rhythms, holidays, and localized formats.',
        bullets: [
          'Workspace hours',
          'Custom work days',
          'Localization defaults',
        ],
        iconName: 'Sliders',
      },
    ],
  },
  {
    id: 6,
    phase: 'insights',
    range: [0.625, 0.75],
    cards: [
      {
        side: 'left',
        eyebrow: 'Live Dashboard',
        headline: 'Real-time organizational insight',
        desc: 'See active users, departments and teams at a glance, always tenant-isolated.',
        bullets: [
          'Active users count',
          'Departments and teams metrics',
          'Recent activity feed',
        ],
        iconName: 'LayoutDashboard',
      },
      {
        side: 'right',
        eyebrow: 'AI Insights',
        headline: 'Intelligence built in',
        desc: 'Continuous machine learning that surfaces anomalies and projections.',
        bullets: [
          'Predictive workforce trends',
          'Anomaly detection',
          'Smart role recommendations',
        ],
        iconName: 'Sparkles',
      },
    ],
  },
  {
    id: 7,
    phase: 'automation',
    range: [0.75, 0.875],
    cards: [
      {
        side: 'left',
        eyebrow: 'AI Automation',
        headline: 'Let AI handle the busywork',
        desc: 'Workflow optimization, smart team composition and natural-language report summaries.',
        bullets: [
          'Employee recommendations',
          'Predictive scheduling',
          'AI-written audit summaries',
        ],
        iconName: 'Bot',
      },
      {
        side: 'right',
        eyebrow: 'Audit & Compliance',
        headline: 'Every action, on record',
        desc: 'Immutable trail of events ensuring compliance across audits.',
        bullets: [
          'Full activity logging',
          'Settings change history',
          'Exportable audit trails',
        ],
        iconName: 'FileCheck',
      },
    ],
  },
  {
    id: 8,
    phase: 'unified platform',
    range: [0.875, 1.0],
    cards: [
      {
        side: 'center-left',
        eyebrow: 'Unified Enterprise Portal',
        headline: 'Run your entire organization from one intelligent portal.',
        desc: 'OpsPilot: the Business CRM built for multi-company operations.',
        bullets: [
          'Instant company onboarding',
          'Enterprise single-sign-on ready',
          'High performance cloud infrastructure',
        ],
        iconName: 'Rocket',
        cta: {
          primary: { text: 'Get Started', href: '/login' },
          secondary: { text: 'Book a Demo', href: '#contact' },
        },
        subnote:
          'Coming soon: Leave Management, Attendance, Notifications and Mobile App',
      },
    ],
  },
];
