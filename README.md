# CareerBridge AI

> **AI-Powered Campus-to-Employment Opportunity Matcher**  
> Democratizing student careers through explainable AI recommendations, skills-based verification, and prioritized pathways for underserved talent.

---

## 1. Project Overview

**CareerBridge AI** connects students with relevant internships, jobs, and skill-development opportunities based on verified skills, qualifications, project portfolios, and career preferences.

Conventional campus recruitment is frequently hampered by pedigree bias, lack of transparency in candidate filtering, and severe barriers for students from underrepresented or tier-2/tier-3 backgrounds. CareerBridge AI addresses these inequities through:

- **Explainable Recommendations:** Transparent match rationale showing exact skill overlap and actionable pathway milestones.
- **Fairness & Underserved Student Priority:** Audited matching algorithms designed to remove pedigree prejudice, featuring dedicated pipelines for first-generation and underserved students.
- **Accessibility by Design:** High-contrast, clean UI with assistive technology considerations and accommodation requests for recruitment workflows.
- **Skills-Over-Pedigree Matching:** Evaluating students on demonstrated code, projects, and competencies rather than brand-name college labels.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server-first React 19 architecture, SSR/SSG, API routes |
| **Language** | TypeScript (Strict Mode) | Full type safety across client and server boundaries |
| **Styling** | Tailwind CSS v4 | Modern, high-performance utility-first design system |
| **Database** | MongoDB | Document database for agile and scalable data persistence |
| **ODM** | Mongoose | Typed schemas, validation, and connection pooling |
| **Authentication** | Better Auth | Secure session handling, email/password credentials |
| **AI Integration** | Google Gemini API (`@google/genai`) | LLM-powered matching and career roadmaps |
| **Validation** | Zod | Runtime schema validation for forms and environment |
| **Form Management** | React Hook Form | High-performance, unopinionated form handling |
| **Icons** | Lucide React | Accessible, modern iconography |
| **Notifications** | Sonner | Opinionated, accessible toast notification stack |
| **Analytics/Charts** | Recharts | Skill gap and match score visualizations |

---

## 3. Project Architecture & Stage 1 Implementation

```text
├── app/                              # Next.js 16 App Router
│   ├── api/
│   │   ├── auth/[...all]/route.ts    # Better Auth catch-all endpoint
│   │   ├── health/route.ts           # System, DB, & AI service health check
│   │   └── student/profile/route.ts  # GET & PUT Student Profile API (authenticated)
│   ├── dashboard/page.tsx            # Student Dashboard (completion score, skills, projects)
│   ├── login/page.tsx                # Student & user login with visibility toggle
│   ├── profile/page.tsx              # Student Profile Management (multi-section)
│   ├── register/page.tsx             # Student registration with visibility toggle
│   ├── student/                      # Redirect aliases (/student/* -> /dashboard, /profile)
│   ├── globals.css                   # Tailwind v4 configuration, theme colors, CSS tokens
│   ├── layout.tsx                    # Global layout with navigation & toast provider
│   └── page.tsx                      # Landing page
├── components/                       # Shared UI & Layout Components
│   ├── layout/                       # Navbar, Footer, Container, StudentSidebar, StudentPortalLayout
│   ├── providers/                    # ToasterProvider (Sonner)
│   └── ui/                           # Button, Input, Card, Badge, Avatar, Alert
├── config/                           # Configuration & Environment Validation
│   ├── env.ts                        # Zod-validated environment variables
│   └── site.ts                       # Site metadata, navigation links, and constants
├── features/                         # Modular domain features (UI + schemas)
│   ├── auth/                         # LoginForm, RegisterForm, AuthCard, schemas
│   ├── dashboard/                    # DashboardHeader, MetricCard
│   └── profile/                      # StudentProfileForm, ProfileOverviewCard, schemas
├── hooks/                            # Reusable React Hooks (useAuth, useMediaQuery)
├── lib/                              # Core Utilities & Integrations (Better Auth, Mongoose, Gemini)
├── models/                           # Mongoose Models (User, StudentProfile)
├── services/                         # Server-side Business Logic (userService, studentProfileService)
├── types/                            # TypeScript Type Definitions (user, student, api)
├── scripts/                          # Automated test suites
│   └── test-stage1.mjs               # 25-point automated verification for Stage 1
└── public/                           # Static assets & icons
```

---

## 4. Environment Configuration

Copy the example environment configuration to create your local `.env.local`:

```bash
cp .env.example .env.local
```

### Required Variables:

```env
# Database Configuration (MongoDB)
MONGODB_URI=mongodb://localhost:27017/careerbridge-ai

# Better Auth Configuration
BETTER_AUTH_SECRET=your_better_auth_secret_minimum_32_characters_here
BETTER_AUTH_URL=http://localhost:3000

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 5. Development & Testing Commands

| Command | Action |
|---|---|
| `npm run dev` | Starts local Next.js development server at `http://localhost:3000` |
| `npm run build` | Compiles production build and validates routes and types |
| `npm run start` | Starts the production server |
| `npm run type-check` | Runs TypeScript compiler checks without emitting output |
| `npm run lint` | Runs ESLint 9 checks across the codebase |
| `npm run test:stage1` | Executes Stage 1 automated test suite (25/25 checks) |

---

## 6. Profile Completion Formula (Weighted 100%)

The student profile completion percentage is dynamically calculated on the server and in the UI using the following criteria:

- **Personal Information (20%):** Full Name (10%), Email (5%), Phone Number / Photo (5%)
- **Academic Information (20%):** College (5%), Degree (5%), Branch (5%), Year & Graduation Year (5%)
- **Technical Skills (25%):** 1+ Skill (10%), 3+ Skills (20%), 5+ Skills across multiple categories (25%)
- **Projects (20%):** 1+ Valid Project (15%), 2+ Valid Projects with code/demo links (20%)
- **Career Preferences (15%):** Preferred Role (5%), Employment Type & Work Mode (5%), Location (5%)
