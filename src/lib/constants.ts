// ===========================================
// Application Constants
// ===========================================

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "City Survey System";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const DEFAULT_CITY_NAME = process.env.NEXT_PUBLIC_CITY_NAME || "Bhatkal";

// ─── User Roles ──────────────────────────────────────

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  CITY_ADMIN: "CITY_ADMIN",
  RESIDENT: "RESIDENT",
  PUBLIC: "PUBLIC",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

// ─── Income Ranges ───────────────────────────────────

export const INCOME_RANGES = [
  { value: "PREFER_NOT_TO_DISCLOSE", label: "Prefer Not To Disclose" },
  { value: "NO_INCOME", label: "No Income" },
  { value: "BELOW_1_LAKH", label: "Below ₹1 Lakh" },
  { value: "ONE_TO_THREE_LAKH", label: "₹1–3 Lakh" },
  { value: "THREE_TO_FIVE_LAKH", label: "₹3–5 Lakh" },
  { value: "FIVE_TO_TEN_LAKH", label: "₹5–10 Lakh" },
  { value: "TEN_TO_TWENTY_LAKH", label: "₹10–20 Lakh" },
  { value: "ABOVE_TWENTY_LAKH", label: "Above ₹20 Lakh" },
] as const;

// ─── Gender ──────────────────────────────────────────

export const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
] as const;

// ─── Marital Status ──────────────────────────────────

export const MARITAL_STATUSES = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "WIDOWED", label: "Widowed" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "SEPARATED", label: "Separated" },
] as const;

// ─── Employment Status ───────────────────────────────

export const EMPLOYMENT_STATUSES = [
  { value: "EMPLOYED", label: "Employed" },
  { value: "SELF_EMPLOYED", label: "Self Employed" },
  { value: "UNEMPLOYED", label: "Unemployed" },
  { value: "RETIRED", label: "Retired" },
  { value: "STUDENT", label: "Student" },
  { value: "HOMEMAKER", label: "Homemaker" },
  { value: "OTHER", label: "Other" },
] as const;

// ─── Education Levels ────────────────────────────────

export const EDUCATION_LEVELS = [
  { value: "ILLITERATE", label: "Illiterate" },
  { value: "PRIMARY", label: "Primary (1-5)" },
  { value: "UPPER_PRIMARY", label: "Upper Primary (6-8)" },
  { value: "SECONDARY", label: "Secondary (9-10)" },
  { value: "HIGHER_SECONDARY", label: "Higher Secondary (11-12)" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "GRADUATE", label: "Graduate" },
  { value: "POST_GRADUATE", label: "Post Graduate" },
  { value: "DOCTORATE", label: "Doctorate" },
  { value: "OTHER", label: "Other" },
] as const;

// ─── Relationships ───────────────────────────────────

export const RELATIONSHIPS = [
  { value: "HEAD", label: "Head of Family" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "SON", label: "Son" },
  { value: "DAUGHTER", label: "Daughter" },
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "BROTHER", label: "Brother" },
  { value: "SISTER", label: "Sister" },
  { value: "GRANDFATHER", label: "Grandfather" },
  { value: "GRANDMOTHER", label: "Grandmother" },
  { value: "GRANDSON", label: "Grandson" },
  { value: "GRANDDAUGHTER", label: "Granddaughter" },
  { value: "UNCLE", label: "Uncle" },
  { value: "AUNT", label: "Aunt" },
  { value: "NEPHEW", label: "Nephew" },
  { value: "NIECE", label: "Niece" },
  { value: "COUSIN", label: "Cousin" },
  { value: "SON_IN_LAW", label: "Son-in-Law" },
  { value: "DAUGHTER_IN_LAW", label: "Daughter-in-Law" },
  { value: "FATHER_IN_LAW", label: "Father-in-Law" },
  { value: "MOTHER_IN_LAW", label: "Mother-in-Law" },
  { value: "OTHER", label: "Other" },
] as const;

// ─── Survey Status ───────────────────────────────────

export const SURVEY_STATUSES = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "VERIFIED", label: "Verified", color: "bg-emerald-100 text-emerald-800" },
] as const;

// ─── Correction Status ───────────────────────────────

export const CORRECTION_STATUSES = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "APPROVED", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800" },
] as const;

// ─── Report Types ────────────────────────────────────

export const REPORT_TYPES = [
  { value: "POPULATION", label: "Population Report" },
  { value: "STUDENTS", label: "Students Report" },
  { value: "EMPLOYMENT", label: "Employment Report" },
  { value: "ABROAD", label: "Abroad Population Report" },
  { value: "WARD", label: "Ward Report" },
  { value: "HOUSEHOLDS", label: "Households Report" },
  { value: "SURVEY_PROGRESS", label: "Survey Progress Report" },
  { value: "AGE", label: "Age Distribution Report" },
  { value: "GENDER", label: "Gender Distribution Report" },
  { value: "EDUCATION", label: "Education Report" },
] as const;

// ─── Pagination ──────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ─── World Countries (Living Abroad Selection) ────────

export const WORLD_COUNTRIES = [
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Oman",
  "Bahrain",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Malaysia",
  "Singapore",
  "New Zealand",
  "Japan",
  "China",
  "South Korea",
  "Turkey",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Norway",
  "Ireland",
  "Switzerland",
  "South Africa",
  "Egypt",
  "Jordan",
  "Lebanon",
  "Other Overseas Country",
] as const;

// ─── Grouped Navigation Interfaces ──────────────────

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const SUPER_ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/super-admin", label: "Dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    title: "City Infrastructure",
    items: [
      { href: "/admin/wards", label: "Wards", icon: "Map" },
      { href: "/admin/streets", label: "Streets", icon: "Navigation" },
    ],
  },
  {
    title: "Survey & Population",
    items: [
      { href: "/admin/households", label: "Households", icon: "Home" },
      { href: "/admin/residents", label: "Residents", icon: "Users" },
      { href: "/admin/survey", label: "Survey Records", icon: "ClipboardList" },
      { href: "/admin/reports", label: "Reports", icon: "FileBarChart" },
      { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
      { href: "/admin/corrections", label: "Corrections", icon: "FileEdit" },
    ],
  },
  {
    title: "Admin & Security",
    items: [
      { href: "/super-admin/city-admins", label: "City Admins", icon: "Shield" },
      { href: "/admin/users", label: "All Users", icon: "UserCog" },
      { href: "/super-admin/roles", label: "Roles & Security", icon: "Key" },
      { href: "/super-admin/audit-logs", label: "Audit Logs", icon: "ScrollText" },
      { href: "/super-admin/backup", label: "Backup & Restore", icon: "Database" },
      { href: "/super-admin/settings", label: "Settings", icon: "Settings" },
    ],
  },
];

export const CITY_ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    title: "City Infrastructure",
    items: [
      { href: "/admin/wards", label: "Wards", icon: "Map" },
      { href: "/admin/streets", label: "Streets", icon: "Navigation" },
    ],
  },
  {
    title: "Survey Operations",
    items: [
      { href: "/admin/households", label: "Households", icon: "Home" },
      { href: "/admin/residents", label: "Residents", icon: "Users" },
      { href: "/admin/survey", label: "Survey Records", icon: "ClipboardList" },
      { href: "/admin/corrections", label: "Corrections", icon: "FileEdit" },
      { href: "/admin/reports", label: "Reports", icon: "FileBarChart" },
      { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
    ],
  },
];

export const RESIDENT_NAV_SECTIONS: NavSection[] = [
  {
    title: "My Portal",
    items: [
      { href: "/resident", label: "Dashboard", icon: "LayoutDashboard" },
      { href: "/resident/household", label: "My Household", icon: "Home" },
      { href: "/resident/family", label: "Family Members", icon: "Users" },
      { href: "/resident/corrections", label: "Correction Requests", icon: "FileEdit" },
      { href: "/resident/notifications", label: "Notifications", icon: "Bell" },
      { href: "/resident/profile", label: "My Profile", icon: "UserCircle" },
    ],
  },
];

export const PUBLIC_ROUTES = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/statistics", label: "City Statistics" },
  { href: "/ward-statistics", label: "Ward Statistics" },
  { href: "/survey-progress", label: "Survey Progress" },
] as const;

export const RESIDENT_ROUTES = RESIDENT_NAV_SECTIONS.flatMap(s => s.items);
export const ADMIN_ROUTES = CITY_ADMIN_NAV_SECTIONS.flatMap(s => s.items);
export const SUPER_ADMIN_ROUTES = SUPER_ADMIN_NAV_SECTIONS.flatMap(s => s.items);

// ─── Age Categories ──────────────────────────────────

export const AGE_CATEGORIES = {
  CHILD: { min: 0, max: 14, label: "Children (0-14)" },
  YOUTH: { min: 15, max: 24, label: "Youth (15-24)" },
  ADULT: { min: 25, max: 59, label: "Adults (25-59)" },
  SENIOR: { min: 60, max: 150, label: "Senior Citizens (60+)" },
} as const;
