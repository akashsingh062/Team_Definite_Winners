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
| `npm run test:stage2` | Executes Stage 2 automated test suite (20/20 checks) |
| `npm run test:stage3` | Executes Stage 3 automated test suite (21/21 checks) |
| `npm run seed:opportunities` | Seeds 35 verified demo opportunities (15 internships, 10 jobs, 10 skill programs) |
| `npm run promote:admin -- user@email.com` | Securely provisions an existing user with administrator role |

---

## 6. Profile Completion Formula (Weighted 100%)

The student profile completion percentage is dynamically calculated on the server and in the UI using the following criteria:

- **Personal Information (20%):** Full Name (10%), Email (5%), Phone Number / Photo (5%)
- **Academic Information (20%):** College (5%), Degree (5%), Branch (5%), Year & Graduation Year (5%)
- **Technical Skills (25%):** 1+ Skill (10%), 3+ Skills (20%), 5+ Skills across multiple categories (25%)
- **Projects (20%):** 1+ Valid Project (15%), 2+ Valid Projects with code/demo links (20%)
- **Career Preferences (15%):** Preferred Role (5%), Employment Type & Work Mode (5%), Location (5%)


---

## 7. Stage 2: Opportunity Management & Admin Governance

CareerBridge AI Stage 2 introduces full lifecycle opportunity management with strict role-based access control (RBAC), verification auditing, and public student discovery.

### Opportunity Categories
- **Internships:** Hands-on industry projects for college students (stipend-backed, duration, mentor support).
- **Full-Time Jobs:** Entry-level graduate placement roles with transparent compensation bands.
- **Skill Development:** Bootcamps, verified technical courses, open-source cohorts, and certifications.

### Admin Provisioning & Security
- Public registration creates accounts with `role: "student"`. The role field is configured with `input: false` in Better Auth, preventing client privilege escalation.
- Admin privileges are provisioned securely server-side via CLI:
  ```bash
  npm run promote:admin -- admin@college.edu
  ```

### Verification & Public Visibility Invariant
- **Draft & Pending Listings:** Kept completely hidden from public queries and students.
- **Public Visibility Invariant:** Only opportunities where `status === "published"` AND `verificationStatus === "verified"` appear on the `/opportunities` student browsing portal and API.
- **Audit Workflow:** `draft` -> `pending` -> `verified` / `rejected` -> `published`.

### Key Routes
- `/opportunities` — Public student discovery (search, multi-facet filtering, sorting, pagination).
- `/opportunities/[id]` — Opportunity detail view with verified badge, specs, and direct application routing.
- `/admin/dashboard` — Governance metrics, aggregate statistics, and recent opportunity review queue.
- `/admin/opportunities` — Complete catalog with quick verification, publishing, editing, and delete modals.
- `/admin/opportunities/create` — Zod-validated creation form with tag inputs for skills and benefits.
- `/admin/opportunities/[id]` — Detailed verification audit trail with review/reject/publish actions.
- `/admin/opportunities/[id]/edit` — Edit existing opportunity data.


---

## 8. Stage 3: AI Resume Analyzer

Stage 3 adds an AI-powered resume parsing and analysis engine for authenticated students, built with Next.js 16, `@google/genai` (Gemini API), and `pdf-parse`.

### Features & Security
- **PDF Extraction:** Server-side PDF parsing supporting multi-page documents.
- **Scanned PDF Detection:** Rejects image-based/scanned PDFs with informative feedback noting that OCR support is not available in this stage.
- **Prompt Injection Defense:** Strict system instructions treating resume text strictly as untrusted data, ignoring embedded prompts or score manipulation attempts.
- **Private Document Storage:** Resumes are stored privately on the server (`storage/resumes/<studentId>/...`) and never exposed publicly.
- **Student Sovereignty (Zero Silent Overwrite):** Extracted data is saved as a reviewable draft. The student profile is NEVER updated until the student explicitly clicks "Approve and Update Profile" with customized merge preferences.

### Key Routes & Endpoints
- `/dashboard/resume` — Upload drag-and-drop zone, processing indicators, and current resume overview.
- `/dashboard/resume/review` — Multi-section interactive review and editing interface (skills, education, projects, certifications, AI quality suggestions).
- `POST /api/resume/upload` — Uploads and analyzes PDF resume.
- `GET /api/resume` — Fetches active resume and parsed insights.
- `PUT /api/resume` — Updates draft parsed data.
- `POST /api/resume/approve` — Merges approved credentials into `StudentProfile` non-destructively.
- `DELETE /api/resume` — Deletes active resume and private storage file.

---

## 9. Stage 4: Intelligent Opportunity Matching Engine

Stage 4 introduces a deterministic, explainable, and skill-first recommendation engine that connects authenticated students with suitable campus opportunities (internships, full-time jobs, and skill-development programs).

### 7-Component Weighted Scoring Formula (Sum: 100%)

The core matching engine calculates an explainable compatibility score out of 100 using fixed deterministic weights:

$$\text{Overall Score} = 0.40 \cdot S_{\text{req}} + 0.15 \cdot S_{\text{pref}} + 0.15 \cdot S_{\text{proj}} + 0.10 \cdot S_{\text{edu}} + 0.10 \cdot S_{\text{role}} + 0.05 \cdot S_{\text{loc}} + 0.05 \cdot S_{\text{comp}}$$

1. **Required Technical Skills (40%):** Core non-negotiable competencies $(\text{Matched} / \text{Total}) \times 100$.
2. **Preferred Technical Skills (15%):** Value-add technologies that increase candidate competitiveness.
3. **Projects & Relevant Experience (15%):** Concrete portfolio proof where verified projects demonstrate required technologies.
4. **Academic Eligibility (10%):** Degree compatibility, branch alignment, graduation timeline, and minimum CGPA.
5. **Career Role Alignment (10%):** Semantic congruence between the student's target career role and opportunity title.
6. **Work Mode & Location (5%):** Alignment with Remote, Hybrid, or On-site preference.
7. **Compensation Alignment (5%):** Stipend or salary compatibility with student expectations.

### Architectural Invariants & Fairness Safeguards

- **Deterministic Core Calculation:** Matching scores are computed via transparent algorithms rather than arbitrary or non-deterministic AI outputs. AI is used solely for narrative synthesis and evidence-based explanations.
- **Skill Normalization & Alias Engine:** Cleans whitespace and maps synonyms (e.g., `ReactJS` $\to$ `React`, `Node` $\to$ `Node.js`, `Postgres` $\to$ `PostgreSQL`, `JS` $\to$ `JavaScript`) while enforcing a strict boundary between `Java` and `JavaScript`.
- **Mandatory Failure Invariant:** If a student strictly fails a mandatory eligibility criterion (e.g. CGPA is below the employer cutoff), the overall score is capped at **45%** to ensure students are never presented with misleading high matches.
- **Pedigree Neutrality:** University ranking, college tier, caste, religion, gender, and socio-economic indicators are strictly absent from the matching equations. Two students with identical skills and projects from different institutions receive identical match scores.
- **Cache Strategy:** In-memory 5-minute TTL caching prevents redundant re-computations while supporting instant cache busting via the "Recalculate Matches" endpoint.

### Key Routes & Endpoints

- `/dashboard/recommendations` — Student recommendation feed with metric cards, multi-facet filtering (category, work mode, eligibility), score sorting, and pagination.
- `/dashboard/recommendations/[opportunityId]` — Deep-dive compatibility analysis with full 7-component breakdown, skills matrix, portfolio proof, and actionable feedback.
- `GET /api/matching/recommendations` — Authenticated recommendation feed with filtering, sorting, and pagination.
- `GET /api/matching/recommendations/[opportunityId]` — Detailed single-opportunity match breakdown.
- `GET /api/matching/summary` — Aggregate statistics (total matches, top score, eligible count, category distribution).
- `GET /api/matching/refresh` — Clears cached matches and forces instant recalculation from latest profile updates.

---

## 10. Verification & Automated Testing

CareerBridge AI maintains comprehensive end-to-end automated verification suites across all stages:

```bash
# Stage 1: Auth & Student Profile Management (25 assertions)
npm run test:stage1

# Stage 2: Opportunity Management & Admin RBAC (20 assertions)
npm run test:stage2

# Stage 3: AI Resume Analyzer & Non-Destructive Sync (21 assertions)
npm run test:stage3

# Stage 4: Intelligent Matching Engine & Fairness Invariants (24 assertions)
npm run test:stage4

# Strict TypeScript compilation check
npm run type-check

# Next.js code quality & accessibility linting
npm run lint

# Production Next.js 16 build verification
npm run build
```

