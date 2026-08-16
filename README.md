# 🏛️ City Population & Household Survey System

A modern, production-ready full-stack web application for collecting and managing household and population survey data. Built with Next.js 16, TypeScript, Prisma 7, and Supabase PostgreSQL.

---

## ✨ Features

### 🌐 Public Portal
- **Home Page** — Hero section, live stats counter, feature cards
- **City Statistics** — Interactive real-time charts (gender, age, employment)
- **Ward Statistics** — Per-ward comparison charts & cards
- **Survey Progress** — Overall and ward-wise completion tracking
- **About & Contact** — Mission, values, contact form

### 👤 Resident Dashboard
- **Household Overview** — Survey status, family details
- **Family Members** — View all household members with demographics
- **Corrections** — Submit data correction requests
- **Notifications** — Receive updates from administration
- **Profile Management** — Update personal information

### 🏢 City Admin Dashboard
- **Dashboard** — Real-time stats, gender/age charts
- **Households CRUD** — Create, search, filter, view households
- **Residents** — Manage family members across all households
- **Wards / Areas / Streets / Buildings** — Full geographic hierarchy
- **Survey Records** — Track all survey submissions
- **Analytics** — Advanced charts and computed metrics
- **Reports & Export** — Generate PDF, Excel, CSV reports
- **Search** — Unified cross-entity search
- **Notifications** — Send targeted notifications
- **Corrections** — Review and approve/reject correction requests

### 🛡️ Super Admin Dashboard
- **System Overview** — Global stats and quick actions
- **City Admins** — Manage admin accounts
- **Roles & Permissions** — View role definitions
- **Audit Logs** — Complete activity tracking
- **Security** — Password policies, session management
- **Backup & Restore** — Database backup management
- **Branding** — Customize app appearance
- **Email Config** — SMTP settings
- **System Settings** — Feature toggles, general config

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Database** | Supabase PostgreSQL |
| **ORM** | Prisma 7 |
| **Auth** | Auth.js (NextAuth v5) |
| **Validation** | Zod + React Hook Form |
| **Tables** | TanStack Table v8 |
| **Charts** | Recharts |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 📦 Getting Started

### Prerequisites
- Node.js 22+
- Supabase Project (PostgreSQL)
- npm

### 1. Clone & Install

```bash
git clone <repo-url>
cd city-survey
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase PostgreSQL credentials (from Supabase Dashboard -> Project Settings -> Database):

```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@citysurvey.local` | `Admin@123456` |
| City Admin | `cityadmin@citysurvey.local` | `Admin@123456` |
| Resident | `resident@citysurvey.local` | `Admin@123456` |

---

## 📁 Project Structure

```
city-survey/
├── prisma/
│   ├── schema.prisma          # Supabase PostgreSQL schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── (public)/          # Public pages (home, stats, auth)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   ├── admin/         # City admin pages
│   │   │   ├── resident/      # Resident pages
│   │   │   └── super-admin/   # Super admin pages
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── layout/            # Header, footer, sidebar, topbar
│   │   ├── shared/            # StatCard, DataTable, PageHeader
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom hooks
│   ├── i18n/                  # Multilingual support (EN, HI, KN)
│   ├── lib/                   # Auth, Prisma, utils, validations
│   └── types/                 # TypeScript types
├── .github/workflows/         # CI/CD
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Postgres + App services
└── package.json
```

---

## 🔒 Security

- Password hashing with bcrypt (12 salt rounds)
- JWT-based session management (Auth.js)
- Role-based access control (RBAC)
- Input validation with Zod schemas
- Audit logging for all mutations
- CSRF protection (built-in Next.js)
- Soft deletes for data integrity

---

## 📄 License

MIT License

---

Built with ❤️ for smart governance.
