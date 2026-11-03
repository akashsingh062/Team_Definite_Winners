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
| `npm run test:stage4` | Executes Stage 4 automated test suite (24/24 checks) |
| `npm run test:stage5` | Executes Stage 5 automated test suite (26/26 checks) |
| `npm run test:stage6` | Executes Stage 6 automated test suite (29/29 checks) |
| `npm run test:stage7` | Executes Stage 7 automated test suite (38/38 checks) |
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

## 10. Stage 5: AI-Powered Skill Gap Analyzer

Stage 5 bridges the gap between where a student currently stands and what high-value opportunities require. It synthesizes student profile skills, approved resume data, and portfolio project technologies to compute multi-opportunity skill demand, coverage statistics, and personalized learning priorities.

### Skill Coverage Formula
Skill coverage evaluates technical readiness across target opportunities:

$$\text{Coverage}_{\text{req}} = \left( \frac{|\text{Possessed} \cap \text{Required}|}{|\text{Required}|} \right) \times 100$$

$$\text{Coverage}_{\text{overall}} = 0.70 \cdot \text{Coverage}_{\text{req}} + 0.30 \cdot \text{Coverage}_{\text{pref}}$$

### Multi-Opportunity Demand & Priority Scoring
When analyzing gaps across multiple target opportunities (or top recommendations for the student's target role):

$$\text{Demand Percentage}(s) = \left( \frac{\text{Count of Opportunities Requiring } s}{\text{Total Opportunities Analyzed}} \right) \times 100$$

- **High Priority:** Required in $\ge 60\%$ of opportunities analyzed, or marked as a required foundational skill in top-ranked roles.
- **Medium Priority:** Required in $30\% - 59\%$ of opportunities, or listed as a preferred skill in multiple listings.
- **Low Priority:** Required or preferred in $< 30\%$ of opportunities.

### Key Features
- **Deterministic Skill Comparator:** Exact matches, case-insensitive mapping, and synonym normalization (e.g. `React.js` $\to$ `React`, `PostgreSQL` $\to$ `Postgres`).
- **Learning Resource Integration:** High-quality vetted courses, official documentation, and free certifications mapped to missing skills with difficulty ratings and time estimates.
- **Skill Progress Tracking:** State machine (`not_started` $\to$ `learning` $\to$ `practicing` $\to$ `completed`) with timestamp auditing (`startedAt`, `completedAt`).
- **Pedigree Neutrality:** Coverage percentages and priority rankings depend exclusively on demonstrated skills and target opportunity requirements.

### Key Routes & Endpoints
- `/dashboard/skill-gap` — Comprehensive skill gap overview with Recharts radar and bar visualizers, priority queues, and target role benchmarks.
- `/dashboard/skill-gap/[skillId]` — Deep-dive skill view with market demand rationale, curated courses, and progress tracker.
- `GET /api/skill-gap/overview` — Aggregated metrics and priority skill breakdowns.
- `POST /api/skill-gap/analyze` — On-demand multi-opportunity skill gap analysis.
- `GET /api/skill-gap/resources` — Catalog of curated learning resources.
- `GET / POST / PATCH /api/skill-gap/progress` — Student skill learning lifecycle management.

---

## 11. Stage 6: Personalized AI Learning Roadmap

Stage 6 transforms the missing skills and priorities identified in Stage 5 into actionable, milestone-driven learning roadmaps structured specifically for student schedules (study hours/day and study days/week).

### Skill Dependency Resolver & Topological Ordering
To ensure foundational skills are mastered before advanced frameworks:
1. **Dependency Graph:** Directed acyclic graph (DAG) enforcing industry-standard prerequisites:
   - `HTML/CSS` $\to$ `JavaScript` $\to$ `React` / `TypeScript` $\to$ `Next.js`
   - `Python` $\to$ `Django` / `FastAPI` / `Machine Learning` $\to$ `Deep Learning`
   - `SQL` / `Databases` $\to$ `Backend Engineering`
2. **Cycle Detection (DFS):** Detects circular dependencies (e.g., $A \to B \to C \to A$) and breaks loops gracefully.
3. **Priority-Weighted Kahn's Algorithm:** Resolves ties among zero-indegree skills by prioritizing foundational skills with higher downstream impact.

### Milestone & Study Time Allocation
Weekly milestones adapt dynamically to student availability:

$$\text{Weekly Study Capacity} = \text{Study Hours/Day} \times \text{Study Days/Week}$$

$$\text{Estimated Weeks per Skill} = \max\left(1, \text{round}\left(\frac{\text{Estimated Hours}}{\text{Weekly Study Capacity}}\right)\right)$$

### Comprehensive Progress Formula (0-100%)
Roadmap progress combines task checklist progress and milestone lifecycle states:

$$\text{Roadmap Progress} = \text{round}\left(0.50 \cdot P_{\text{milestones}} + 0.50 \cdot P_{\text{tasks}}\right)$$

Where:
- $P_{\text{milestones}} = \frac{100 \times \text{Completed Milestones} + 50 \times \text{In-Progress Milestones}}{\text{Total Milestones}}$
- $P_{\text{tasks}} = \left( \frac{\text{Completed Subtasks across all milestones}}{\text{Total Subtasks}} \right) \times 100$

### Adaptive Recalculation & History Preservation
- When a student updates their schedule or requests an adjustment, **completed and skipped milestones are strictly preserved** along with their historical timestamps.
- Only future pending milestones (`not_started`, `in_progress`) are recalculated and rescheduled, preventing loss of student effort.
- Completing a milestone automatically updates the student's `StudentSkillProgress` record to `completed`.

### AI Integration & Deterministic Fallback Invariant
- Roadmaps can be generated via Google Gemini API (`@google/genai`) using structured prompts.
- All AI responses are validated via strict Zod schema (`geminiRoadmapAiOutputSchema`).
- In case of API quota limits, network timeouts, or invalid JSON, the system transparently activates the 100% deterministic fallback generator, guaranteeing zero service interruption.

### Key Routes & Endpoints
- `/dashboard/roadmap` — Main student roadmap timeline with overall progress bar, weekly milestones, actionable checklists, practical assignments, and adjustment controls.
- `/dashboard/roadmap/[roadmapId]` — Detailed milestone view for active and archived roadmaps.
- `POST /api/roadmap/generate` — Generates a new personalized roadmap from Stage 5 skill gaps.
- `GET /api/roadmap` — Retrieves the active roadmap.
- `GET /api/roadmap/[roadmapId]` — Retrieves specific roadmap.
- `PATCH /api/roadmap/[roadmapId]/milestones/[milestoneId]` — Updates milestone status and reflection notes.
- `POST /api/roadmap/[roadmapId]/milestones/[milestoneId]/tasks` — Toggles subtask completion and syncs skill progress.
- `POST /api/roadmap/[roadmapId]/adjust` — Adapts schedule and re-sequences future milestones while preserving completed history.

---

## 12. Stage 7: Explainable AI Recommendations

Stage 7 transforms the black-box matching scores of conventional platforms into completely transparent, evidence-based explainability reports. Students can inspect exactly why an opportunity was recommended, verify evidence sources, review academic criteria satisfaction, evaluate data completeness, and follow actionable next steps linked to Stages 5 and 6.

### 7-Factor Match Score Breakdown
Every point awarded is mathematically derived from the Stage 4 scoring engine with fixed transparent weights:

| Matching Factor | Weight | Evaluation Method & Evidence Sources |
|---|---:|---|
| **Required Technical Skills** | 40% | Mandatory skills matched vs total required $(\text{Matched} / \text{Total}) \times 100$ |
| **Preferred Technical Skills** | 15% | Bonus skills matched vs total preferred $(\text{Matched} / \text{Total}) \times 100$ |
| **Projects & Experience** | 15% | Portfolio projects showcasing stack overlap + tenure verification |
| **Education & Eligibility** | 10% | Degree, branch, and minimum CGPA satisfaction |
| **Career Role Alignment** | 10% | Semantic congruence with student's preferred job role |
| **Work Mode & Location** | 5% | Remote, Hybrid, or On-site preference compatibility |
| **Compensation** | 5% | Stipend or salary alignment against student career expectations |

### Skills Analysis & Verification Policy
Skills are systematically classified into four categories:
1. **Matching Skills:** Possessed competencies directly confirmed via profile, approved resume, or project code proof.
2. **Missing Required Skills:** Mandatory employer requirements not yet demonstrated, prioritized with direct links to the Stage 5 Skill Gap Analyzer (`/dashboard/skill-gap/[skillId]`).
3. **Missing Preferred Skills:** Optional bonus technologies that enhance candidate competitiveness.
4. **Skills Requiring Verification:** Ambiguous, partial, or unassessed skills. **Invariant:** The system never assumes a skill is absent simply because it was not detected in a resume.

### Eligibility Transparency & Mandatory Failure Policy
- Criteria evaluated: Minimum CGPA, degree requirements, academic branch/major, minimum experience, and graduation timeline.
- **Invariant:** Mandatory eligibility failures (e.g. CGPA below cutoff) cap the overall match score at **45%** and are clearly flagged with explicit explanations rather than misleading the student.
- Unavailable student data is explicitly marked as "Unknown Data" rather than penalized as a failure.

### Data Completeness Indicator (Separate from Match Score)
A dedicated 0-100% data completeness indicator evaluates whether the recommendation has sufficient information (skills, academic background, portfolio projects, approved resume, career preferences). It is **strictly distinct from the match score** and is never represented as hiring probability or model confidence.

### Actionable Next Steps
Generates specific improvement recommendations connected directly to:
- **Stage 5 Skill Gap Analyzer:** View course recommendations and market demand for missing skills.
- **Stage 6 Personalized Learning Roadmap:** Advance active roadmap milestones or generate a personalized study plan.
- **Profile Management:** Update academic records, CGPA, or add portfolio projects.

### Responsible AI & Fairness Safeguards
- **Deterministic Source of Truth:** Mathematical calculations and database records govern all scores, eligibility statuses, and classifications.
- **Gemini API Role:** LLM converts structured data into student-friendly explanatory language. It is strictly prohibited from altering scores or inventing qualifications.
- **100% Deterministic Fallback:** Automatically activates if Gemini API encounters network timeouts, quota limits, or invalid responses.
- **Pedigree Neutrality:** University prestige, brand names, gender, caste, religion, and socio-economic indicators are completely excluded from matching formulas.
- **Student Sovereignty & Feedback:** Students can submit "Helpful" or "Not Helpful" audits stored in MongoDB (`ExplanationFeedback`), preventing duplicate spam.

### Key Routes & Endpoints
- `/dashboard/recommendations/[opportunityId]` — Comprehensive explainability page with 10 interactive sections.
- `GET /api/explanations/opportunities/[opportunityId]` — Full structured explanation and AI narrative.
- `GET /api/explanations/methodology` — Transparent methodology overview, exact factor weights, and fairness guarantees.
- `POST /api/explanations/feedback` — Submits student feedback on explanation quality.
- `GET /api/explanations/feedback` — Retrieves existing student feedback for an opportunity.

---

## 13. Stage 8: Application Tracking System (ATS)

Stage 8 equips students with a recruitment tracking workspace to manage the entire application journey—from initial bookmarked interests to final offers and onboarding confirmations.

### Recruitment Status Lifecycle
The tracking system models 10 realistic recruitment states:
- `saved` — Bookmarked to review or apply later. Saving an opportunity never marks it as applied.
- `planning` — Active preparation (customizing resume, building portfolio proof, securing referrals).
- `applied` — Official application recorded by the student with date, submission method, and URL.
- `assessment` — Online coding test, screening task, or take-home technical challenge.
- `interview` — Technical interviews, recruiter screenings, or hiring manager rounds.
- `offer_received` — Formal internship or job offer received with compensation details.
- `selected` — Offer accepted and onboarding milestones confirmed.
- `rejected` — Application not selected for this hiring cycle.
- `withdrawn` — Application voluntarily withdrawn by candidate.
- `expired` — Application window passed without student action.

### Single Tracking Record Invariant
Enforced via a compound unique index `{ userId: 1, opportunityId: 1 }` in MongoDB (`models/Application.ts`). A student can have at most one tracking record per opportunity. Status updates, note additions, and follow-up schedules modify this document in-place.

### Append-Only Activity History
Every recruitment milestone transition, status update, and note change automatically records an immutable event in `models/ApplicationActivity.ts`:
- Captures `previousStatus`, `newStatus`, `note`, and `createdAt`.
- Preserves a permanent chronological audit trail, ensuring historical data remains intact even if a student corrects an accidental status change (e.g. `interview` -> `rejected` -> `selected`).

### Deadlines & Follow-Up Reminders
- Calculates exact days remaining until opportunity application deadlines.
- Distinguishes upcoming deadlines from passed deadlines with high-contrast color badges (`danger`, `amber`, `slate`).
- Allows setting custom follow-up reminder dates (`nextFollowUpDate`) with countdown indicators.

### Key Routes & Endpoints
- `/dashboard/applications` — Centralized application tracking dashboard with overview cards, pipeline funnel bar, upcoming follow-ups, and paginated filterable applications list.
- `/dashboard/applications/[applicationId]` — Dedicated application detail page featuring opportunity specs, status progression controls, notes editor, follow-up calendar, and full activity timeline.
- `GET /api/applications` — Paginated list of student applications with status, category, search, and sort filters.
- `POST /api/applications` — Save opportunities or record confirmed applications ("I Have Applied").
- `GET /api/applications/statistics` — Aggregated application metrics, response rate, pipeline stage counts, and upcoming follow-ups.
- `GET /api/applications/check` — Real-time tracking status check for any opportunity.
- `GET, PATCH, DELETE /api/applications/[applicationId]` — Fetch detail, update metadata/notes/status, or delete application record.
- `GET, POST /api/applications/[applicationId]/activities` — Retrieve chronological activity history or append manual notes.

---

## 14. Stage 9 Implementation – Admin Analytics & Fairness Dashboard

Stage 9 introduces an enterprise-grade administrative analytics and responsible AI monitoring command center situated at `/admin/analytics`. It empowers platform administrators, institutional career officers, and accreditation bodies to monitor student engagement, hiring pipelines, skill demand trends, and algorithmic non-discrimination metrics in real time.

```text
app/
├── admin/
│   └── analytics/page.tsx               # Main Dashboard with 8 tabs & global date filters
├── api/admin/
│   ├── analytics/
│   │   ├── overview/route.ts            # Platform-wide KPIs & tool interaction stats
│   │   ├── students/route.ts            # Registration velocity, profiles, & skills
│   │   ├── opportunities/route.ts       # Postings inventory, categories, & demand
│   │   ├── matching/route.ts            # Recommendation scores & eligibility breakdowns
│   │   ├── applications/route.ts        # 6-stage recruitment funnel & conversion rates
│   │   ├── skills/route.ts              # Skill triangulation & market deficits
│   │   ├── learning/route.ts            # Roadmap completions & targeted career roles
│   │   ├── fairness/route.ts            # Non-discrimination audit & quality indicators
│   │   └── export/route.ts              # Secure sanitized CSV dataset generation
│   └── audit-logs/route.ts              # Paginated immutable admin action logs
features/analytics/components/
├── AnalyticsHeader.tsx                  # Global date filter & CSV export menu
├── OverviewCardsSection.tsx             # 4 primary KPI card groups
├── StudentAnalyticsSection.tsx          # Line, bar, and donut charts for student trends
├── OpportunityAnalyticsSection.tsx      # Category, work mode, and skill demand charts
├── MatchingAnalyticsSection.tsx         # Score histograms & top recommended postings
├── ApplicationAnalyticsSection.tsx      # Visual recruitment funnel & status distribution
├── SkillGapLearningSection.tsx          # Demand vs Gap vs Active learning triangulation
├── FairnessMonitoringSection.tsx        # 7-factor formula audit & responsible AI notice
└── AuditLogsSection.tsx                 # Searchable immutable administrative audit trail
models/
├── AdminAuditLog.ts                     # Schema for tracking admin verifications & edits
└── AnalyticsEvent.ts                    # Schema for logging lightweight analytics events
services/analytics/
├── dateFilterHelper.ts                  # Date boundaries (today, 7d, 30d, 90d, year, custom)
├── auditLogService.ts                   # Immutable administrative action logging service
└── analytics.service.ts                 # MongoDB aggregation pipelines & CSV generator
```

### Core Capabilities

1. **Strict Server-Side Authorization (`requireAdmin`)**:
   Every admin analytics and audit log endpoint validates session authenticity and confirms the user possesses the `admin` role. Non-authenticated calls return `401 Unauthorized`; student accounts return `403 Forbidden`.

2. **Real-Time MongoDB Aggregations**:
   All metrics are computed on-the-fly using MongoDB aggregation pipelines (`$group`, `$cond`, `$dateToString`, `$match`, `$sort`) across `users`, `student_profiles`, `opportunities`, `resumes`, `opportunity_explanations`, `applications`, and `roadmaps`. Zero hardcoded statistics.

3. **Global Temporal Filtering & Boundaries**:
   Supports standard presets (`today`, `7d`, `30d`, `90d`, `this_year`, `all`) as well as `custom` ISO date ranges with validation ($start \le end$). Safe handling ensures clean numerical reporting (0%, no `NaN` or divide-by-zero errors) even for empty datasets.

4. **Normalized Skill Demand & Strict Java ≠ JavaScript Distinction**:
   Aggregates employer required and preferred skills using the Stage 4 semantic normalizer (`services/matching/skill-normalizer.ts`), preserving strict boundaries between distinct technologies (e.g. `Java` is never conflated with `JavaScript` or `TypeScript`).

5. **Recruitment Funnel Progression**:
   Visualizes student application progression across 6 standardized milestones:
   $$\text{Saved} \longrightarrow \text{Applied} \longrightarrow \text{Under Review} \longrightarrow \text{Interview} \longrightarrow \text{Offer} \longrightarrow \text{Selected}$$
   Computes both stage-to-stage conversion and initial-to-stage conversion rates alongside a saved-to-applied conversion indicator.

6. **Skill Triangulation**:
   Correlates real employer demand with diagnosed student deficits and active learning engagements:
   $$\text{Employer Postings Count} \longleftrightarrow \text{Student Gaps Diagnosed} \longleftrightarrow \text{Actively Learning In Roadmaps}$$
   Automatically flags "High Deficit" skills where employer demand outstrips qualified candidate availability.

7. **Fairness, Responsible AI & Demographic Quarantine**:
   - **Demographic Exclusion Audit**: Validates that protected attributes (`gender`, `religion`, `caste`, `ethnicity`, `family_income`, `sexual_orientation`, `disability_status`) are strictly quarantined and excluded from matching and ranking algorithms.
   - **Explainable 7-Factor Formula Audit**: Reports the transparent weights summing to exactly 100% (Required Skills: 40%, Preferred Skills: 15%, Project Evidence: 15%, Eligibility: 10%, Target Role: 10%, Work Mode: 5%, Compensation: 5%).
   - **Institutional Pedigree Neutrality**: Confirms tier-blind evaluation; universities are assessed solely for major and accreditation without awarding prestige multipliers.
   - **Responsible AI Limitations Notice**: Features an honest, clear disclaimer documenting data dependencies and ongoing human audit procedures (refusing naive "100% fair" claims).

8. **Administrative Action Audit Trail**:
   All administrative actions—such as creating, updating, verifying, publishing, or deleting an opportunity, as well as exporting sensitive analytics datasets—are permanently recorded in an immutable MongoDB collection (`admin_audit_logs`).

9. **Secure CSV Export with Formula Injection Protection**:
   Enables administrators to download aggregated CSV datasets (`overview`, `students`, `opportunities`, `skills`, `applications`, `fairness`). All cells are sanitized against spreadsheet formula injection attacks by prefixing dangerous characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with a single quote (`'`).

---

## 15. Verification & Automated Testing

CareerBridge AI maintains comprehensive end-to-end automated verification suites across all 9 stages:

```bash
# Stage 1: Auth & Student Profile Management (25 assertions)
npm run test:stage1

# Stage 2: Opportunity Management & Admin RBAC (20 assertions)
npm run test:stage2

# Stage 3: AI Resume Analyzer & Non-Destructive Sync (21 assertions)
npm run test:stage3

# Stage 4: Intelligent Matching Engine & Fairness Invariants (24 assertions)
npm run test:stage4

# Stage 5: AI-Powered Skill Gap Analyzer & Resource Linking (26 assertions)
npm run test:stage5

# Stage 6: Personalized AI Learning Roadmap & Adaptive Progress (29 assertions)
npm run test:stage6

# Stage 7: Explainable AI Recommendations & Evidence Breakdown (38 assertions)
npm run test:stage7

# Stage 8: Application Tracking System & Activity Auditing (50 assertions)
npm run test:stage8

# Stage 9: Admin Analytics & Fairness Dashboard (72 assertions)
npm run test:stage9

# Feature 1: AI Career Pathway & What-If Simulator (45 assertions)
npm run test:career-simulator

# Feature 2: Verified Digital Skills Passport (78 assertions)
npm run test:skills-passport

# Feature 4: Practical Skill Readiness Assessment (66 assertions)
npm run test:skill-assessment

# Feature 5: Local Opportunity & Skill Intelligence (75 assertions)
npm run test:local-opportunities

# Strict TypeScript compilation check (0 errors)
npm run type-check

# Next.js code quality & React 19 accessibility linting (0 errors)
npm run lint

# Production Next.js 16 Turbopack build verification (0 errors)
npm run build
```



---

## 16. Feature 1 – AI Career Pathway & What-If Simulator

### Overview & Objective
Feature 1 extends CareerBridge AI with an exploratory career intelligence system that bridges the gap between where students stand today and where they want to go. Students can browse industry-standard career pathways, inspect transparent 4-pillar readiness scores, run hypothetical What-If simulations to test skill additions without modifying their actual profile, compare multiple career paths side-by-side, and immediately generate Stage 6 learning roadmaps.

### Core Capabilities

1. **Curated Career Path Library**:
   Pre-seeded with 13 comprehensive, industry-standard career profiles:
   - Frontend Developer, Backend Developer, Full Stack Developer, Software Engineer, Mobile App Developer, QA Engineer
   - Data Analyst, Data Scientist, AI/ML Engineer
   - Cloud Engineer, DevOps Engineer, Cybersecurity Analyst
   - UI/UX Designer
   Each path defines core responsibilities, difficulty levels, required and preferred skills, recommended portfolio projects with acceptance criteria, and multi-stage career progression milestones (Entry $\to$ Mid $\to$ Senior $\to$ Lead).

2. **Deterministic 4-Pillar Readiness Scoring Engine**:
   Transparent, explainable scoring with zero black-box calculations:
   - **Required Skills (45%)**: Core technical competencies essential for the role.
   - **Preferred Skills (15%)**: Complementary tools, libraries, and workflows that provide competitive edge.
   - **Portfolio Projects (20%)**: Demonstrable practical project experience related to the career domain.
   - **Education & Foundational Alignment (20%)**: Degree, branch relevance, and foundational coursework.
   - **Total Score**: Bounded between 0% and 100%. Fully stamped with methodology version (`v1.0-career-path`).
   - Integrates Stage 4 semantic normalization (ensuring strict distinction between distinct technologies, e.g. `Java` $\neq$ `JavaScript`).

3. **What-If Skill Simulator**:
   - Allows students to select one or more hypothetical skills they are considering learning.
   - Dynamically recomputes simulated readiness score in-memory and displays the alignment score delta ($+\Delta\%$).
   - Flags newly satisfied career requirements alongside remaining gaps.
   - Evaluates the live impact on published opportunities in the system, calculating how many more internships or jobs the student would become competitive for.
   - **Profile Immutability Guarantee**: Simulations operate strictly in-memory. Hypothetical skills are never written to the student's actual database profile.
   - **Prominent Hypothetical Disclaimer**: Every simulation output is stamped `isSimulated: true` and includes clear guidance that results represent hypothetical projections.

4. **Multi-Career Path Comparison**:
   - Compare up to 3 career pathways side-by-side.
   - Automatically computes **Common Prerequisite Skills** shared across all selected paths (e.g. `Git`, `SQL`, core problem solving).
   - Isolates **Distinct Specializations** unique to each role.
   - Estimates ramp-up learning effort and queries real-time published opportunity demand for each pathway.

5. **AI Strategic Guidance with Resilient Deterministic Fallback**:
   - Leverages Google Gemini API (`@google/genai`) to generate empathetic career path summaries, strategic skill values, recommended learning order, and realistic portfolio project ideas.
   - Guarded with `AbortSignal.timeout(6000)` and comprehensive rule-based fallback generators that produce complete, structured analyses if network delays or service limits occur.
   - All responses include transparent `isAiGenerated: boolean` tracking.

6. **Simulation History & Student Data Isolation**:
   - Students can save simulation snapshots with custom notes for future reference.
   - Strict student data isolation enforced at the service and API layers (students cannot view, access, or delete simulations belonging to other users).

7. **Seamless Learning Roadmap Integration**:
   - Includes a one-click action handoff from simulation results directly to Stage 6 Personalized Learning Roadmaps (`/dashboard/roadmap`), carrying target skills into structured learning milestones.

### Dedicated UI Routes

- `/dashboard/career-explorer`: Interactive library of career paths with search, domain filtering, and personal readiness badges.
- `/dashboard/career-explorer/[careerPathId]`: In-depth career path detail page with 4-pillar readiness breakdown, required vs preferred skills, portfolio project recommendations, and milestone progressions.
- `/dashboard/career-simulator`: Interactive What-If sandbox with multi-skill selector, real-time delta score gauge, live opportunity impact cards, and simulation snapshot saving.
- `/dashboard/career-comparison`: Side-by-side comparison matrix for 2–3 paths showing shared foundations, distinct requirements, and comparative AI synthesis.

### REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/career-paths` | List career paths with search and category filters | Optional |
| `GET` | `/api/career-paths/[id]` | Get career path details and optional student readiness alignment | Optional |
| `POST` | `/api/career-simulator/analyze` | Execute What-If simulation with hypothetical skills | Yes (Student) |
| `POST` | `/api/career-simulator/compare` | Compare 2 to 3 career paths side-by-side | Yes (Student) |
| `GET` | `/api/career-simulator/history` | Retrieve saved simulation snapshots for logged-in student | Yes (Student) |
| `POST` | `/api/career-simulator/history` | Save a new simulation snapshot | Yes (Student) |
| `DELETE` | `/api/career-simulator/history/[id]` | Delete a saved simulation snapshot (ownership protected) | Yes (Student) |


---

## 17. Feature 2 – Verified Digital Skills Passport

### Overview & Objective
Feature 2 introduces a professional, shareable **Digital Skills Passport** for every student in CareerBridge AI. The passport acts as a tamper-evident digital credential showcasing verified technical competencies, practical software projects, certifications, curriculum assessments, and academic background. Students can selectively control section visibility, generate high-resolution QR codes, and share their credentials with recruiters via cryptographically secure public URLs.

### Core Capabilities

1. **5-Tier Skill Evidence Hierarchy**:
   Every skill is classified into an explicit evidence tier rather than being blindly marked as verified:
   - **`Externally Verified`**: Backed by a validated third-party credential from an authentic issuer.
   - **`Assessment Verified`**: Validated by a completed CareerBridge AI practical assessment or roadmap capstone.
   - **`Project Demonstrated`**: Supported by a software project in the student's portfolio utilizing this technology.
   - **`Resume Extracted`**: Detected in an approved, synchronized student resume.
   - **`Self-Reported`**: Self-attested by the student in profile without automated corroboration.
   - *Strict Invariant*: Projects, GitHub URLs, and resume claims are never fabricated as externally verified.

2. **Authoritative Certification Verification**:
   - Inspects credential URLs against verified third-party issuer registries (`Credly`, `Coursera`, `AWS CertMetrics`, `Google Cloud / Accredible`, `freeCodeCamp`, `HackerRank`, `Microsoft Learn`, `Udacity`).
   - Automatically checks expiration dates and issuer domain syntax.
   - Unintegrated or unverified certifications are explicitly marked as `Student-Provided` without fabricating validation.

3. **Project Portfolio Showcase**:
   - Displays student engineering deliverables with description, technologies, GitHub repository, live deployment, and specific student contribution notes.
   - Stamped with `Project Demonstrated` evidence status.

4. **Cryptographic Public Identification & URL Safety**:
   - Generates random public identifiers (`csp_[a-f0-9]{24}`) with high cryptographic entropy.
   - **Zero ID Exposure**: MongoDB `_id` and internal `userId` are strictly quarantined and never present in public URLs or payloads.

5. **Strict Privacy Protection & Allowlisting**:
   - **Quarantined PII**: Student email, personal phone number, home address, raw resume storage keys, and private application history are permanently excluded from public endpoints.
   - Public responses are strictly allowlisted. Contact handles (GitHub, LinkedIn, Portfolio) are opt-in (`visibleSections.contact`).

6. **Granular Section Visibility Controls**:
   - Students can independently toggle public visibility for:
     - Skills Matrix
     - Project Portfolio
     - Certifications
     - Academic Education
     - Practical Assessments
     - Portfolio / Social Handles

7. **Link Security Management (Revocation & Regeneration)**:
   - **Revoke Link**: Immediately cuts off public access. Visitors receive an official `410 Revoked` notice with zero student profile leakage.
   - **Regenerate Link**: Assigns a fresh cryptographically random public ID and immediately invalidates the previous public URL and QR code.

8. **High-Resolution QR Code Generator**:
   - Built with high error correction (`level: 'H'`).
   - Generates both PNG Data URLs (`data:image/png;base64,...`) and scalable vector graphics (`<svg>`) pointing directly to `/passport/[publicId]`.

9. **Employer Verification Interface (`/passport/[publicId]/verification`)**:
   - Provides recruiters and credential verifiers with:
     - Real-time authenticity status (`authentic`, `revoked`, `private`, `not_found`).
     - Cryptographic SHA-256 integrity hash sealing verified competencies.
     - Quantitative breakdown across the 5 evidence tiers.
     - Verification scope and limitations disclaimer (refusing naive claims of universal accreditation).
     - Official platform attestation seal.

### Dedicated UI Routes

- `/dashboard/skills-passport`: Interactive student management dashboard with bio editing, section toggles, QR code modal, and privacy controls.
- `/passport/[publicId]`: Polished, responsive public credential profile for employers and recruiters.
- `/passport/[publicId]/verification`: Employer-facing credential verification audit report.

### REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/passport` | Retrieve student's full passport (auto-initializes if first visit) | Yes (Student) |
| `PATCH` | `/api/passport` | Update headline, summary, visibility, and section toggles | Yes (Student) |
| `POST` | `/api/passport/sync` | Resynchronize passport with latest profile and approved resume | Yes (Student) |
| `POST` | `/api/passport/publish` | Set passport visibility to public | Yes (Student) |
| `POST` | `/api/passport/revoke` | Revoke public passport link | Yes (Student) |
| `POST` | `/api/passport/regenerate-link` | Invalidate current public link and generate fresh ID | Yes (Student) |
| `GET` | `/api/passport/qr` | Get PNG DataURL & SVG QR code for current passport | Yes (Student) |
| `GET` | `/api/public/passport/[publicId]` | Public sanitized skills passport view (allowlisted) | None (Public) |
| `GET` | `/api/public/passport/[publicId]/verification` | Public credential authenticity audit report | None (Public) |

---

## 18. Feature 4 – Practical Skill Readiness Assessment

### Overview & Objective
Feature 4 introduces a structured, secure **Practical Skill Readiness Assessment** platform into CareerBridge AI. It enables students to validate their technical knowledge through rigorous, time-limited tests across 11 core technical domains. The assessment engine provides concrete, measurable evidence of student proficiency, directly upgrading skills in the Digital Skills Passport (`assessment_verified`) and highlighting genuine skill discrepancies in the Stage 5 Skill Gap Analyzer without mutating the student's self-reported profile.

### Core Capabilities

1. **Curriculum Coverage Across 11 Technical Domains**:
   - **JavaScript**: Closures, event loop, asynchronous promises, prototypes, and scope.
   - **HTML**: Semantic structure, accessibility standards, form validations, and document parsing.
   - **CSS**: Flexbox, CSS Grid layouts, specificity cascade, and responsive media queries.
   - **React**: Component lifecycles, hooks (`useEffect`, `useState`), reconciliation, and state flow.
   - **Node.js**: Event-driven architecture, non-blocking I/O, streams, and module lifecycles.
   - **Express.js**: Middleware pipelines, routing error propagation, and HTTP status contracts.
   - **MongoDB**: Document indexing, aggregation pipelines, schema modeling, and atomicity.
   - **SQL**: Relational joins, schema normalization, aggregate groupings, and transaction isolation.
   - **Python**: List comprehensions, generators, mutable default arguments, and decorators.
   - **Java**: OOP polymorphism, thread synchronization, JVM memory pools, and garbage collection.
   - **Data Structures and Algorithms**: Time/space complexity analysis, hash tables, trees, and dynamic programming.

2. **3 Safe Assessment Question Categories**:
   - **Conceptual MCQs**: Tests foundational engineering concepts and operational theory.
   - **Output Prediction**: Requires students to analyze code snippets and predict exact runtime output.
   - **Code Debugging**: Identifies syntax bugs, logic flaws, and memory leaks in realistic code segments.
   - *Security Guarantee*: Arbitrary code is NEVER executed on the application server. All evaluations are deterministically structured with pre-validated options.

3. **Strict Security Invariant (Zero Client-Side Key Leaks)**:
   - When a student begins or resumes an assessment attempt, questions are filtered through `IAssessmentQuestionPublic`.
   - `correctAnswer` and `explanation` are strictly stripped from server responses and database attempt snapshots.
   - Solution reviews and explanations are only accessible via `GET /api/assessments/results/[attemptId]` after the attempt status is finalized (`submitted` or `timed_out`).

4. **Deterministic Server-Side Scoring & Proficiency Categorization**:
   - Computes total marks, obtained score, and percentage deterministically on the server.
   - Categorizes student proficiency into four tiers based on score and passing threshold:
     - **`Advanced`**: $\ge 85\%$
     - **`Proficient`**: $\ge \text{passingThreshold}$ (typically $60\% - 84\%$)
     - **`Developing`**: $40\% - (\text{passingThreshold} - 1\%)$
     - **`Beginner`**: $< 40\%$
   - Generates topic-wise and difficulty-wise performance breakdowns with strengths and focus recommendations.

5. **Student Assessment Runner Experience**:
   - Real-time countdown timer with auto-submission when time expires.
   - Dynamic question navigation palette with color-coded states (Answered, Current, Flagged for Review, Unanswered).
   - Instant answer auto-saving via `PATCH /api/assessments/attempts/[attemptId]`.
   - Full post-submission review detailing correct answers, selected answers, and rationale explanations.

6. **Digital Skills Passport Integration**:
   - Passing an assessment ($\ge \text{passingThreshold}$) writes a verified record to `AssessmentEvidence`.
   - Automatically synchronizes with Feature 2 Digital Skills Passport:
     - Adds a verified entry to `SkillsPassport.assessments` with badge and score.
     - Upgrades matching skills in `SkillsPassport.skills` to `evidenceType: "assessment_verified"` and `verificationStatus: "verified"`.

7. **Stage 5 Skill Gap Analyzer Integration**:
   - Correlates self-reported skills against verified assessment outcomes.
   - Transparently flags discrepancies (`verified_gap`, `verified_higher`, `verified_aligned`, `untested`).
   - Recommends targeted practice without overwriting or penalizing the student's self-reported profile skills.

8. **Stage 4 Matching Engine Non-Mandatory Compatibility**:
   - Practical assessments are completely voluntary.
   - Students without completed assessments match smoothly against opportunities using their profile and resume skills without penalties or ranking disqualification.

9. **Administrative Authoring & Question Bank Management**:
   - Full RBAC protection (`requireAdmin`).
   - Admin Question Bank (`/admin/assessments/questions`): filter by subject, author conceptual/output/debugging questions with validation.
   - Assessment Configuration Builder (`/admin/assessments/create`): configure title, subject, passing threshold, duration, retake cooldown, and question selection.

### Dedicated UI Routes

- `/dashboard/assessments`: Student assessment catalog with subject filters, test cards, duration, passing threshold, and active attempt badges.
- `/dashboard/assessments/[assessmentId]`: Assessment overview, syllabus, guidelines, and start/resume trigger.
- `/dashboard/assessments/[assessmentId]/attempt`: Interactive test runner with countdown timer, question palette, code snippets, and review flags.
- `/dashboard/assessments/results/[attemptId]`: Detailed post-submission scorecard with topic breakdowns, question-by-question review, and explanations.
- `/admin/assessments`: Administrator assessment configuration catalog.
- `/admin/assessments/create`: Administrator assessment builder form.
- `/admin/assessments/questions`: Curriculum question bank manager.

### REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/assessments` | List published assessments with optional subject and difficulty filters | Optional |
| `GET` | `/api/assessments/[id]` | Get assessment details and student active attempt status | Optional |
| `POST` | `/api/assessments/[id]/start` | Start a new attempt or resume an ongoing active attempt | Yes (Student) |
| `GET` | `/api/assessments/attempts/[attemptId]` | Retrieve active attempt snapshot (sanitized questions) | Yes (Student) |
| `PATCH` | `/api/assessments/attempts/[attemptId]` | Auto-save answer selections and review flags | Yes (Student) |
| `POST` | `/api/assessments/attempts/[attemptId]/submit` | Submit attempt for deterministic server-side scoring | Yes (Student) |
| `GET` | `/api/assessments/results/[attemptId]` | Post-submission score review and explanations | Yes (Student) |
| `GET` | `/api/assessments/history` | Student test history and verified assessment evidence | Yes (Student) |
| `GET` | `/api/assessments/skill-gap` | Correlate self-reported skills with verified scores | Yes (Student) |
| `GET` | `/api/admin/assessments` | Admin list of all assessments | Yes (Admin) |
| `POST` | `/api/admin/assessments` | Create and publish a new assessment configuration | Yes (Admin) |
| `PATCH` | `/api/admin/assessments/[id]` | Update an assessment configuration | Yes (Admin) |
| `GET` | `/api/admin/assessments/questions` | List curriculum question bank with subject filters | Yes (Admin) |
| `POST` | `/api/admin/assessments/questions` | Author and publish a new question | Yes (Admin) |
| `PATCH` | `/api/admin/assessments/questions/[id]` | Update an existing question in bank | Yes (Admin) |

---

## 19. Feature 5 – Local Opportunity & Skill Intelligence

### Overview & Objective
Feature 5 equips CareerBridge AI with geographic discovery and regional skill intelligence designed to democratize access to career opportunities for students outside major metropolitan technology hubs (tier-2, tier-3, and rural districts). It unifies regional internships, apprenticeships under the National Apprenticeship Promotion Scheme (NAPS), government skill missions (Skill India, PMKVY, State Missions), public ITIs, polytechnics, and regional remote employment into a single location-aware discovery platform.

### Core Capabilities

1. **Student Location Profile & Privacy Invariant**:
   - Allows students to specify optional, coarse geographic preferences: `state`, `district`, `city`, `preferredRadiusKm` (e.g. 50km), `willingToRelocate` (boolean), `preferredWorkMode` (`remote`, `hybrid`, `onsite`, `any`), and `preferRemote` (boolean).
   - **Privacy Invariant**: Precise street addresses or home GPS coordinates are **NEVER** required or stored. Only the minimum coarse geographic precision necessary for regional opportunity discovery is retained.

2. **Geospatial & Map-Based Discovery (`/dashboard/local-opportunities/map`)**:
   - Interactive map powered by Leaflet and OpenStreetMap tiles (100% free, requiring zero external API keys).
   - High-contrast custom vector pin markers with distinct colors:
     - Blue Pins: Employer opportunities and job postings.
     - Emerald Pins: Government ITIs, polytechnics, and vocational training centres.
     - Purple Pins: NAPS apprenticeships and Skill India initiatives.
   - **No-False-Coordinates Invariant**: Opportunities without verified street coordinates (e.g. Pan-India remote positions, district-wide quotas) are strictly excluded from physical map markers and presented in a dedicated unmapped regional drawer/list without fabricating false coordinates.

3. **Government Skill-Development Programs & Provenance (`/dashboard/local-opportunities/programs`)**:
   - Dedicated catalog for verified public initiatives: Skill India, NAPS (National Apprenticeship Promotion Scheme), PMKVY 4.0, National Career Service (NCS), State IT Missions (BELTRON, MAP_IT, Naan Mudhalvan, RajCOMP, AMTRON).
   - Every externally sourced listing preserves full provenance: `sourceOrganization`, `sourceUrl`, `lastVerifiedAt`, and `isGovernmentProgram: true`.
   - Distinguishes authentic government programs from private providers without making unverified endorsement claims.

4. **Regional Skill Demand Intelligence (`/dashboard/local-opportunities/skills`)**:
   - Real-time MongoDB aggregations calculating localized skill demands across active opportunities.
   - Uses the Stage 4 semantic normalizer (`normalizeSkill`) to ensure technology boundaries (e.g. `Java` $\neq$ `JavaScript`).
   - Visualizes top in-demand technologies, required vs preferred frequencies, work mode distribution (Remote vs Hybrid vs Onsite), and opportunity category breakdowns.
   - **Sample Size Transparency**: Clearly displays the exact number of verified opportunity records and date range used for the analysis, never claiming a region has "no opportunities" simply due to a small database sample.

5. **Personalized Regional Skill Gap Analysis**:
   - Compares localized employer demand against the student's demonstrated skills.
   - Categorizes skills into `Demonstrated`, `Target Gap (High Priority)`, and `Bonus Recommendation`.
   - Offers one-click action handoffs directly to the Stage 5 Skill Gap Analyzer and Stage 6 Personalized Learning Roadmap.

6. **Stage 4 Matching Engine Integration**:
   - Does NOT duplicate matching algorithms. Reuses Stage 4 (`matchSkills`, `checkEligibility`, `calculateCompatibilityScore`) to score opportunities when a student is logged in.
   - Prioritizes local matches and radius proximity alongside technical compatibility.

7. **Admin Regional Opportunity & Training Centre Management**:
   - `/admin/regional-opportunities`: Manage local opportunities, verify external URLs, update application deadlines, flag outdated listings, and review coordinates.
   - `/admin/training-centres`: Register and verify regional ITIs, PMKVY Kaushal Kendras, and polytechnics with exact coordinates and curriculum tracks.
   - `/admin/regional-analytics`: System monitoring dashboard reporting regional coverage, state opportunity distribution, and mapped vs unmapped statistics.

### Dedicated UI Routes

- `/dashboard/local-opportunities`: Main discovery catalog with state, district, work-mode, and radius search filters.
- `/dashboard/local-opportunities/map`: Interactive map and side panel for opportunities and training centres.
- `/dashboard/local-opportunities/skills`: Regional skill demand charts and student gap comparison.
- `/dashboard/local-opportunities/programs`: Dedicated catalog for NAPS and government skill initiatives.
- `/admin/regional-opportunities`: Administrator regional opportunity authoring and verification.
- `/admin/training-centres`: Administrator training centre registry and coordinate validator.
- `/admin/regional-analytics`: Administrator geographic coverage and unmapped indices.

### REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/local-opportunities` | Search local opportunities with radius, work-mode, and Stage 4 matching | Optional |
| `GET` | `/api/local-opportunities/map` | Get verified geo-coordinates for interactive map markers and unmapped counts | Optional |
| `GET` | `/api/local-opportunities/skills` | Regional skill demand aggregations and student gap analysis | Optional |
| `GET` | `/api/local-opportunities/programs` | Get verified government initiatives (NAPS, Skill India, State Missions) | Optional |
| `GET` | `/api/local-opportunities/regions` | List available states, districts, and opportunity volumes | Optional |
| `POST` | `/api/admin/regional-opportunities` | Create and publish a regional opportunity | Yes (Admin) |
| `PATCH` | `/api/admin/regional-opportunities/[id]` | Update regional opportunity, coordinates, or outdated status | Yes (Admin) |
| `GET` | `/api/admin/training-centres` | List all regional training centres | Yes (Admin) |
| `POST` | `/api/admin/training-centres` | Register a new regional training centre or ITI | Yes (Admin) |
| `PATCH` | `/api/admin/training-centres/[id]` | Update training centre details or verification | Yes (Admin) |
| `GET` | `/api/admin/regional-analytics` | Administrative regional analytics and geographic coverage summary | Yes (Admin) |



---

## 20. Feature 6 – Human Mentor & Career Counsellor Network

The Human Mentor & Career Counsellor Network connects students with experienced industry professionals, alumni, and career counsellors for personalized guidance, resume and project critiques, mock interviews, and structured career roadmapping.

### Core Architectural Invariants

1. **Role-Based Authorization & Zero Self-Promotion to Admin**:
   - Built directly on Better Auth with three verified platform roles:
     - **Student**: Discovers verified mentors, sends requests, schedules sessions, explicitly shares selected resources, and submits post-session reviews.
     - **Mentor**: Registers professional profile, defines expertise domains, configures weekly availability, accepts/declines requests, hosts sessions with validated external meeting links, and adds guidance notes.
     - **Administrator**: Audits mentor applications, reviews credentials, verifies/rejects/suspends profiles, and resolves conduct reports.
   - Prevents unauthorized role escalation: client cannot assign themselves the admin role.

2. **Strict Verification Workflow & Visibility Restrictions**:
   - Mentors undergo a formal 5-status verification lifecycle: `pending` $\rightarrow$ `under_review` $\rightarrow$ `verified` $\rightarrow$ `rejected` $\rightarrow$ `suspended`.
   - **Critical Public Invariant**: Unverified mentors (`pending`, `under_review`, `rejected`, `suspended`) **NEVER appear in public discovery** (`GET /api/mentors`). Only mentors verified by an administrator are visible to students.

3. **Explicit Consent & Privacy Control Invariant**:
   - Student profiles, resumes, and project repositories are **NEVER shared automatically**.
   - Students must explicitly grant access to specific resources (`resume`, `project`, `portfolio`, `github`) per mentor.
   - Students can revoke access immediately at any time. Once revoked, the mentor is strictly denied access.

4. **Timezone-Aware Session Management & Safe URL Validation**:
   - Sessions support customizable durations, agendas, and timezone-aware timestamps (e.g. `Asia/Kolkata`, `UTC`).
   - Supports external meeting links (Google Meet, Zoom, Microsoft Teams) with strict URL format and protocol validation. Unsafe protocols (e.g. `javascript:`, non-HTTP) are automatically rejected.

5. **Structured Guidance & Dynamic Feedback Ratings**:
   - Mentors provide private guidance notes and action items visible to the mentee or retained as private mentor-only observations.
   - Students submit post-session feedback (1–5 star rating, helpfulness assessment, and qualitative tags) upon completion of a session. The mentor's cumulative rating and review count recalculates dynamically.

6. **In-App Notification Dispatcher**:
   - Real-time in-app notifications generated for request submissions, acceptances, rejections, cancellations, scheduled sessions, shared resources, and feedback submissions.

### Dedicated UI Routes

- `/dashboard/mentors`: Main discovery catalog for students with domain, skill, experience, and availability filters.
- `/dashboard/mentors/[mentorId]`: Detailed mentor profile with credentials, availability slots, and request form.
- `/dashboard/mentorship-requests`: Student request tracking dashboard with real-time status.
- `/dashboard/mentorship-sessions`: Student calendar for scheduled calls, meeting links, notes, and reviews.
- `/dashboard/mentorship-resources`: Explicit resource sharing management and one-click access revocation.
- `/mentor/dashboard`: Mentor portal dashboard with active mentees, request metrics, and rating scores.
- `/mentor/profile`: Mentor onboarding and profile editor with live verification status badge and admin feedback.
- `/mentor/requests`: Mentor incoming request queue with Accept and Decline controls.
- `/mentor/sessions`: Mentor session coordination desk with meeting link and guidance note authoring.
- `/mentor/availability`: Weekly hour commitment and day/timeslot scheduler.
- `/admin/mentors`: Administrative mentor verification queue and conduct report moderation desk.

### REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/mentors` | Public mentor discovery (strictly verified mentors only) | Optional |
| `GET` | `/api/mentors/[mentorId]` | Detailed mentor profile | Optional |
| `GET` | `/api/mentor/profile` | Get logged-in user's mentor profile | Yes (Mentor) |
| `POST` | `/api/mentor/profile` | Create or update mentor profile (initiates pending verification) | Yes (Mentor) |
| `PATCH` | `/api/mentor/availability` | Update mentor weekly hours and availability slots | Yes (Mentor) |
| `GET` | `/api/mentorship/requests` | List mentorship requests (`as=student` or `as=mentor`) | Yes |
| `POST` | `/api/mentorship/requests` | Submit a new mentorship request to a verified mentor | Yes (Student) |
| `PATCH` | `/api/mentorship/requests/[requestId]` | Accept, reject, or cancel a mentorship request | Yes |
| `GET` | `/api/mentorship/sessions` | List mentorship sessions for current user | Yes |
| `POST` | `/api/mentorship/sessions` | Schedule a new mentorship session | Yes |
| `PATCH` | `/api/mentorship/sessions/[sessionId]` | Mark session completed, cancelled, or rescheduled | Yes |
| `GET` | `/api/mentorship/sessions/[sessionId]/notes` | Fetch guidance notes for a session | Yes |
| `POST` | `/api/mentorship/sessions/[sessionId]/notes` | Add structured guidance note to a session | Yes |
| `POST` | `/api/mentorship/feedback` | Submit post-session feedback and 1-5 star rating | Yes (Student) |
| `GET` | `/api/mentorship/resources/share` | List shared resources (active/revoked audit) | Yes |
| `POST` | `/api/mentorship/resources/share` | Explicitly share a resume or project with a mentor | Yes (Student) |
| `DELETE` | `/api/mentorship/resources/share/[shareId]` | Revoke a mentor's access to a shared resource | Yes (Student) |
| `POST` | `/api/mentorship/reports` | Submit a conduct or moderation report | Yes |
| `GET` | `/api/notifications` | Fetch current user's in-app notifications | Yes |
| `PATCH` | `/api/notifications` | Mark notifications as read | Yes |
| `GET` | `/api/admin/mentors` | Admin view of all mentors across verification states | Yes (Admin) |
| `PATCH` | `/api/admin/mentors/[mentorId]/verification` | Admin approve, reject, or suspend a mentor | Yes (Admin) |
| `GET` | `/api/admin/mentors/reports` | Admin view of conduct and moderation reports | Yes (Admin) |
| `PATCH` | `/api/admin/mentors/reports` | Resolve or dismiss conduct reports | Yes (Admin) |

### Testing Instructions

Execute the automated test suite verifying all 17 scenarios:
```bash
npm run test:mentorship-network
```


---

## Stage 10: Complete UI/UX Redesign & System Integration

### Overview
Stage 10 transforms CareerBridge AI into a cohesive, professional, responsive, and production-ready career platform integrating all 15 core modules and features:
1. Authentication & Student Profile Management
2. Opportunity Management
3. AI ATS Resume Analyzer
4. Intelligent Opportunity Matching Engine (Stage 4 deterministic scoring)
5. AI-Powered Skill Gap Analyzer
6. Personalized AI Learning Roadmap
7. Explainable AI Recommendations
8. Application Tracking System
9. Admin Analytics & Fairness Monitoring Dashboard
10. AI Career Pathway & What-If Simulator
11. Verified Digital Skills Passport & Public QR Code
12. Multilingual AI Career Companion (English / हिन्दी)
13. Practical Skill Readiness Assessments
14. Local Opportunity & Skill Intelligence
15. Human Mentor & Career Counsellor Network

### Global Design System & Component Library
- **Visual Identity**: Modern enterprise SaaS aesthetic using Tailwind CSS v4 design tokens:
  - **Primary**: Deep Indigo (`#4f46e5`, `indigo-600` / `indigo-700`)
  - **Neutral Surfaces**: Slate (`#f8fafc` to `#0f172a`, `slate-50` to `slate-900`)
  - **Accent**: Violet (`violet-600`)
  - **Success / Verified**: Emerald (`emerald-600`)
  - **Warning**: Amber (`amber-600`)
  - **Danger / Destructive**: Rose (`rose-600`)
- **Reusable Component Library (`components/ui/`)**:
  - `PageHeader`: Standard header with title, description, semantic breadcrumbs, and action slot.
  - `StatCard`: Standard metric card with icon container, main value, subtext/badge, and click handler.
  - `EmptyState`: Standard empty state with icon, title, description, and primary/secondary CTA buttons.
  - `StatusBadge`: Unified status pill handling recruitment, verification, assessment, and mentorship statuses.
  - `ProgressBar`: Accessible animated progress bar with colored variants and percentage labels.
  - `Skeleton`: Shimmer placeholder loader for dashboards, cards, and tables.
  - `Breadcrumb`: Semantic `<nav aria-label="Breadcrumb">` navigation.
  - `ConfirmationDialog`: Accessible modal for destructive or confirm actions.

### Multilingual AI Career Companion (Module 12)
- **Service**: `services/companion/career-companion.service.ts` connecting with Google Gemini API with conversational context from the student's profile, target role, and registered skills.
- **Resilience**: Full deterministic fallback mechanism responding intelligently in English and Hindi when offline or when Gemini rate limits (429) occur.
- **API Endpoint**: `POST /api/companion/chat` validating session authentication and returning structured responses with suggested follow-up chips and deep links.
- **Frontend**: `app/dashboard/companion/page.tsx` featuring:
  - English / हिन्दी language toggle pill.
  - Suggested question chips dynamically tailored to active language.
  - Speech-to-Text (STT) mic button utilizing browser Web Speech API with fallback notice.
  - Text-to-Speech (TTS) speaker playback using browser `speechSynthesis` matching language tags (`hi-IN` / `en-US`).
  - Copy response button with visual confirmation.
  - Clear conversation button.

### Navigation & Layout Architecture
- **Student Sidebar (`components/layout/StudentSidebar.tsx`)**:
  - **Overview**: Dashboard (`/dashboard`)
  - **Career Development**: Career Explorer (`/dashboard/career-explorer`), What-If Simulator (`/dashboard/career-simulator`), Smart Matches (`/dashboard/recommendations`), Opportunities (`/opportunities`), Local Intelligence (`/dashboard/local-opportunities`)
  - **Skills & Learning**: My Profile (`/profile`), AI Resume Analyzer (`/dashboard/resume`), Skill Gap Analysis (`/dashboard/skill-gap`), Learning Roadmap (`/dashboard/roadmap`), Skill Assessments (`/dashboard/assessments`), Digital Skills Passport (`/dashboard/skills-passport`)
  - **Career Support**: AI Career Companion (`/dashboard/companion`), Mentorship Network (`/dashboard/mentors`), Mentorship Requests (`/dashboard/mentorship-requests`), Mentorship Sessions (`/dashboard/mentorship-sessions`), My Applications (`/dashboard/applications`)
- **Admin Sidebar (`components/layout/AdminSidebar.tsx`)**:
  - **Platform Management**: Dashboard Overview (`/admin/dashboard`), Opportunities (`/admin/opportunities`), Regional Opportunities (`/admin/regional-opportunities`), Training Centres (`/admin/training-centres`)
  - **Analytics & Responsible AI**: Platform & Fairness (`/admin/analytics`), Regional Analytics (`/admin/regional-analytics`)
  - **Quality & Moderation**: Skill Assessments (`/admin/assessments`), Mentors & Verification (`/admin/mentors`), View Student Portal (`/dashboard`)
- **Mobile Responsiveness**: Slidable navigation drawers with accessible hamburger toggle buttons across both student and admin layouts.

### Central Student Dashboard (`app/dashboard/page.tsx`)
- Dynamic greeting with time of day and student name.
- 4 core KPI StatCards: Profile Readiness %, Active Applications, Smart Matches count, Verified Skills count.
- **Smart Next Best Action Engine**: Dynamic guidance banner based on student status (prompting profile completion, resume upload, practical skill assessments, roadmap generation, or opportunity exploration).
- Recent application pipeline mini-table with unified status badges.
- Top recommended opportunity cards with explainable match scores.
- Upcoming scheduled mentorship sessions with direct virtual meeting join links.
- Quick navigation grid linking to Career Companion, What-If Simulator, Skills Passport, and Local Opportunities.

### Verification & Testing
Execute the end-to-end integration test suite verifying all 8 workflows:
```bash
npm run test:system-integration
```
Run type-checking, linting, and build verification:
```bash
npm run type-check   # 0 errors
npm run lint         # 0 errors, 0 warnings
npm run build        # 96/96 routes compiled cleanly
```
