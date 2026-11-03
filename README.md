<div align="center">

# 🌉 NexSkill AI
### *From Skill to Opportunity*

**AI-Powered Campus-to-Employment Opportunity Matcher with Explainable AI & Verified Credentials**  
*Developed for Problem Statement 22 (PS-22) — Campus Recruitment & Equal Opportunity Employment*

<br />

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-team--definite--winners.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://team-definite-winners.vercel.app/)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.13-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7-purple?style=flat)](https://www.better-auth.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.32_SDK-orange?style=flat&logo=google)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?style=flat&logo=leaflet)](https://leafletjs.com/)

<p align="center">
  <a href="https://team-definite-winners.vercel.app/"><b>🌐 Visit Live Demo</b></a> •
  <a href="#-quickstart--local-setup"><b>⚡ Quickstart</b></a> •
  <a href="#-demo-credentials"><b>🔑 Demo Accounts</b></a> •
  <a href="#-core-platform-pillars"><b>💡 Core Pillars</b></a> •
  <a href="#-matching-engine--mathematical-formulations"><b>⚖️ Matching Math</b></a> •
  <a href="#-system-architecture"><b>🏗️ Architecture</b></a>
</p>

</div>

---

## 📌 Table of Contents

- [🌐 Live Demo & Deployment](#-live-demo--deployment)
- [🎯 Executive Summary & Problem Statement (PS-22)](#-executive-summary--problem-statement-ps-22)
- [🏗️ System Architecture & Multi-Portal Design](#-system-architecture--multi-portal-design)
- [💡 Core Platform Pillars](#-core-platform-pillars)
  - [1. Intelligent Discovery & Explainable Matching](#1-intelligent-discovery--explainable-matching)
  - [2. Practical Assessments & Verified Skills Passport](#2-practical-assessments--verified-skills-passport)
  - [3. Personalized Guidance & Bilingual AI Companion](#3-personalized-guidance--bilingual-ai-companion)
  - [4. Mentorship Network, ATS & Responsible Governance](#4-mentorship-network-ats--responsible-governance)
- [⚖️ Matching Engine & Mathematical Formulations](#-matching-engine--mathematical-formulations)
  - [1. Multi-Factor Compatibility Score (7 Factors)](#1-multi-factor-compatibility-score)
  - [2. Haversine Geospatial Distance Formula](#2-haversine-geospatial-distance-formula)
  - [3. DAG Prerequisite Sequencing (Kahn's Algorithm)](#3-topological-skill-ordering-kahns-algorithm)
  - [4. Adaptive Learning Roadmap Completion Formula](#4-adaptive-learning-roadmap-completion-formula)
  - [5. Adverse Impact Ratio (EEOC Four-Fifths Rule)](#5-adverse-impact-ratio-four-fifths-rule)
- [🛠️ Technology Stack](#-technology-stack)
- [⚡ Quickstart & Local Setup](#-quickstart--local-setup)
- [🔑 Demo Credentials](#-demo-credentials)
- [🛡️ Security, Privacy & Responsible AI Standards](#-security-privacy--responsible-ai-standards)
- [📚 Technical Reference (API & Database)](#-technical-reference-api--database)

---

## 🌐 Live Demo & Deployment

NexSkill AI is live and publicly accessible:

| Resource | Link | Details |
|---|---|---|
| **Production Application** | **[https://team-definite-winners.vercel.app/](https://team-definite-winners.vercel.app/)** | Hosted on Vercel Edge with zero-downtime serverless compute |
| **Direct Login Portal** | **[https://team-definite-winners.vercel.app/login](https://team-definite-winners.vercel.app/login)** | Sign in using pre-seeded Student, Mentor, or Admin accounts |
| **Pre-Seeded Credentials** | [Jump to Demo Credentials](#-demo-credentials) | Instant test accounts with populated profiles and pipelines |

---

## 🎯 Executive Summary & Problem Statement (PS-22)

Conventional university placements and commercial hiring platforms are plagued by structural inequities that disadvantage millions of students:

| The Campus Recruitment Challenge | How NexSkill AI Solves It |
|---|---|
| **The Pedigree Prejudice:** Candidate screening frequently prioritizes Tier-1 college brand names over demonstrated competency. | **Zero Pedigree Bias:** College tiers are strictly excluded from matching algorithms ($w_{\text{pedigree}} = 0$). Candidates are evaluated solely on verified skills, projects, and academic eligibility. |
| **Black-Box Algorithmic Rejections:** Typical ATS systems reject students without transparent rationale or actionable feedback. | **Explainable AI by Design:** Every match percentage is deconstructed into 7 clear factor contributions with exact missing skills and What-If improvement levers. |
| **Unverified Resume Claims:** Resumes saturated with unverified buzzwords lead recruiters to rely on pedigree proxies. | **Verified Digital Skills Passport:** Integrates timed objective skill tests, GitHub repository proof, and tamper-evident QR codes for third-party verification. |
| **Geographic Disconnect:** Students outside metro hubs miss regional internships, local drives, and vocational training initiatives. | **Geospatial Opportunity Intelligence:** Interactive Leaflet maps with Haversine radial filtering ($10\text{–}100\text{ km}$) connecting students with local employers and NSDC/PMKVY centres. |
| **Guidance & Language Barriers:** Vernacular and first-generation students lack alumni connections and personalized mentorship. | **Bilingual AI Companion & Mentor Network:** Native English and Hindi (हिन्दी) conversational counseling plus direct 1-on-1 human mentor booking. |

---

## 🏗️ System Architecture & Multi-Portal Design

NexSkill AI is built on a modular multi-portal architecture serving students, mentors, and administrators through role-based access control (RBAC):

```text
+----------------------------------------------------------------------------------------------------+
|                                      NEXSKILL AI PLATFORM                                          |
+----------------------------------------------------------------------------------------------------+
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
       ┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
       │  STUDENT PORTAL  │             │   ADMIN PORTAL   │             │  MENTOR PORTAL   │
       │   (/dashboard)   │             │     (/admin)     │             │    (/mentor)     │
       └─────────┬────────┘             └─────────┬────────┘             └─────────┬────────┘
                 │                                │                                │
 ┌───────────────┴───────────────┐ ┌──────────────┴──────────────┐ ┌───────────────┴───────────────┐
 │ • Dashboard Overview & Stats  │ │ • Operational Metrics       │ │ • Mentor Dashboard            │
 │ • Smart Matches & Explanations│ │ • Opportunity Management    │ │ • Mentorship Requests Inbox   │
 │ • AI Resume Analyzer & Sync   │ │ • Regional Opportunities    │ │ • Session Scheduler & Links   │
 │ • Skill Gap & Curated Courses │ │ • Training Centre Registry  │ │ • Availability Configuration  │
 │ • DAG Learning Roadmaps       │ │ • Platform & Fairness Audit │ │ • Direct Resource Sharing     │
 │ • Timed Skill Assessments     │ │ • Assessment Authoring      │ │ • Confidential Guidance Notes │
 │ • Digital Skills Passport     │ │ • Mentor Credential Reviews │ │ • Mentee Reviews & Ratings    │
 │ • What-If Career Simulator    │ │ • Four-Fifths Parity Checks │ └───────────────────────────────┘
 │ • Multilingual AI Companion   │ │ • Sanitized CSV Analytics   │
 │ • Local Geospatial Map        │ └─────────────────────────────┘
 │ • Mentor Booking & Sessions   │
 │ • Application Pipeline (ATS)  │
 └───────────────────────────────┘
                 │
                 ▼
+----------------------------------------------------------------------------------------------------+
|                                        APPLICATION CORE                                            |
|   Next.js 16 App Router  •  Better Auth RBAC  •  Zod Input Guards  •  Audit Log Interceptors       |
+----------------------------------------------------------------------------------------------------+
                 │                                                │
                 ▼                                                ▼
+──────────────────────────────────────────────+   +─────────────────────────────────────────────────+
|               SERVICES LAYER                 |   |                DATA & PERSISTENCE               |
|  • Matching Engine (7-Factor Deterministic)  |   |  • MongoDB Atlas / Local MongoDB                |
|  • AI Explanation & What-If Service          |   |  • Mongoose Pooled Schemas (29 Models)          |
|  • Roadmap Sequencer (DAG Kahn's Algorithm)  |   |  • In-Memory Match Cache (5-min TTL)            |
|  • Geospatial Locator (Haversine Formula)    |   |  • Better Auth Session Store                    |
|  • AI Career Companion (Gemini / Fallback)   |   |  • Audit & Compliance Event Log Store           |
+──────────────────────────────────────────────+   +─────────────────────────────────────────────────+
```

---

## 💡 Core Platform Pillars

### 1. Intelligent Discovery & Explainable Matching

* **Deterministic 7-Factor Matching Engine:** Computes compatibility percentages without LLM bias using calibrated weights across Required Skills ($40\%$), Preferred Skills ($15\%$), Projects ($15\%$), Education ($10\%$), Career Alignment ($10\%$), Work Mode ($5\%$), and Compensation ($5\%$).
* **Mandatory Eligibility Hard Gate:** When candidate metrics fail hard constraints (e.g., CGPA below employer cutoff or restricted branch), the overall score is **strictly capped at $\le 45\%$** with explicit warning badges.
* **Semantic Token Normalization:** Maps dialectical variants and acronyms (e.g., *react.js* $\to$ *react*, *k8s* $\to$ *kubernetes*, *golang* $\to$ *go*) prior to computing skill intersections.
* **AI Resume Analyzer & Non-Destructive Sync:** In-memory PDF text extraction (`pdf-parse`) structured via Google Gemini (`@google/genai`) and strict Zod schemas. Extracted items are reviewed side-by-side—**existing profiles are never overwritten without explicit student confirmation**.
* **Labor Market Skill Gap Analyzer:** Aggregates skill demand across all postings to categorize missing competencies into `Critical`, `Important`, and `Beneficial`, linking each to curated learning resources (Coursera, freeCodeCamp, official docs).

### 2. Practical Assessments & Verified Skills Passport

* **Timed Technical Assessments:** Distraction-free, timed objective evaluations across JavaScript, React, Node.js, Python, and SQL with automated submission enforcement.
* **Automatic Credential Issuance:** Scoring $\ge 70\%$ automatically creates a verified `AssessmentEvidence` stamp and unlocks an assessment-verified badge on the student's passport.
* **Tamper-Evident Skills Passport:** Consolidates verified assessments, GitHub repositories, live demo URLs, and completed milestones into a cryptographically identifiable digital passport.
* **Public QR Verification:** Features a public URL (`/passport/[publicId]`), downloadable QR code for resume headers, and an employer verification endpoint (`/passport/[publicId]/verification`).
* **Granular Privacy Controls:** Passports remain strictly private by default; public visibility can be toggled on or revoked instantly with one click.

### 3. Personalized Guidance & Bilingual AI Companion

* **Interactive Career Explorer & What-If Simulator:** Visualizes industry career trajectories with competency matrices. Students can simulate adding prospective skills (e.g. *Docker*, *TypeScript*) to view immediate compatibility boosts before writing a line of code.
* **DAG Learning Roadmap Sequencer:** Resolves prerequisite chains using Kahn's topological sorting algorithm ($HTML/CSS \to JS \to React \to Next.js$) with dynamic weekly pacing based on student study schedules.
* **Adaptive Rescheduling:** Updating a roadmap recalculates only future milestones—**completed milestones and task checklists are strictly preserved**.
* **Multilingual AI Career Companion:** Voice-enabled (Web Speech API) conversational counseling grounded in the student's active profile, active in both **English** and **Hindi (हिन्दी)** with deep links into platform tools.
* **Geospatial Opportunity Intelligence:** Interactive Leaflet map with radial filtering ($10\text{–}100\text{ km}$) using the Haversine formula to surface local jobs and NSDC/PMKVY training centres.

### 4. Mentorship Network, ATS & Responsible Governance

* **Human Mentor Network:** Verified directory of senior alumni and industry engineers. Students request 1-on-1 counseling, attach resumes, schedule sessions, and access shared mentor resources.
* **Confidential Guidance Notes & Double-Blind Ratings:** Mentors maintain private guidance notes, and both parties submit post-session ratings (1–5 stars) to maintain community quality.
* **Full Application Tracking System (ATS):** Visual Kanban and list pipelines tracking opportunities across `Saved` $\to$ `Applied` $\to$ `Interviewing` $\to$ `Offered` with chronological activity audit logs.
* **Admin Fairness & Parity Dashboard:** Automatically calculates the EEOC **Four-Fifths Rule ($80\%$ Disparate Impact Ratio)** to monitor selection and recommendation distributions across academic branches and student categories.
* **Immutable Audit Trail:** All administrative operations, opportunity approvals, and role elevations are recorded in an append-only `AdminAuditLog` with CSV export capability.

---

## ⚖️ Matching Engine & Mathematical Formulations

### 1. Multi-Factor Compatibility Score

The NexSkill matching engine calculates opportunity compatibility deterministically using a calibrated **7-factor weighted multi-criteria decision model**. Rather than relying on non-deterministic black-box LLMs to score candidates, NexSkill evaluates candidates against verifiable competencies, project evidence, and verified credentials.

#### Mathematical Formulation

$$\text{Overall Compatibility Score} = \text{round}\left( \sum_{i=1}^{7} w_i \times S_i \right)$$

$$\text{Subject to Mandatory Gate: } \quad S_{\text{overall}} = \begin{cases} \min(45, S_{\text{overall}}) & \text{if Eligibility Status} = \text{Ineligible} \\ S_{\text{overall}} & \text{otherwise} \end{cases}$$

Where each factor weight $w_i \in (0, 1)$ satisfies $\sum_{i=1}^{7} w_i = 1.00$, and each component score $S_i \in [0, 100]$ is computed through specialized deterministic evaluation rubrics:

| Factor ($i$) | Component ($S_i$) | Weight ($w_i$) | Contribution | Scoring Rubric & Evaluation Logic |
|---|---|:---:|:---:|---|
| **1** | **Required Technical Skills** ($S_{\text{req}}$) | `0.40` | **40%** | Measures exact overlap against non-negotiable core requirements:<br>$$S_{\text{req}} = \frac{|\mathcal{S}_{\text{student}} \cap \mathcal{S}_{\text{required}}|}{|\mathcal{S}_{\text{required}}|} \times 100$$<br>Skills undergo canonicalization via `normalizeSkill()` (e.g., *react.js* $\to$ *react*, *k8s* $\to$ *kubernetes*). |
| **2** | **Preferred Technical Skills** ($S_{\text{pref}}$) | `0.15` | **15%** | Evaluates bonus technologies that elevate candidate readiness:<br>$$S_{\text{pref}} = \frac{|\mathcal{S}_{\text{student}} \cap \mathcal{S}_{\text{preferred}}|}{|\mathcal{S}_{\text{preferred}}|} \times 100$$ |
| **3** | **Projects & Practical Experience** ($S_{\text{proj}}$) | `0.15` | **15%** | Evaluates demonstrable proof in student projects and work history:<br>• **Baseline:** 40 points default.<br>• **$\ge 2$ Tech-Aligned Projects:** $+40$ pts (score $\to 80$).<br>• **1 Tech-Aligned Project:** $+25$ pts (score $\to 65$).<br>• **General Project:** $+15$ pts (score $\to 55$).<br>• **Work Experience / Internship Bonus:** $+20$ pts (capped at 100). |
| **4** | **Education & Eligibility** ($S_{\text{edu}}$) | `0.10` | **10%** | Evaluates branch, graduation batch, and academic thresholds:<br>• **Fully Eligible:** 100 points.<br>• **Potentially Eligible (Missing Data):** 70 points (*Non-punitive baseline*).<br>• **Ineligible (Criteria Unmet):** 20 points. |
| **5** | **Career Role Alignment** ($S_{\text{align}}$) | `0.10` | **10%** | Evaluates student aspirations against role scope:<br>• **Baseline:** 65 points.<br>• **Role Token Overlap:** $+25$ pts if preferred role matches opportunity title keywords.<br>• **Employment Type Match:** $+15$ pts if internship/job matches stated preference. |
| **6** | **Location & Work Mode** ($S_{\text{work}}$) | `0.05` | **5%** | Evaluates workplace format and geographic compatibility:<br>• **Remote Opportunities:** 100 points.<br>• **Exact Preference Match (Hybrid / On-site):** 95 points.<br>• **Compatible Hybrid:** 85 points.<br>• **City / Region Keyword Overlap:** $+15$ pts bonus (capped at 100). |
| **7** | **Compensation Alignment** ($S_{\text{comp}}$) | `0.05` | **5%** | Evaluates financial structure and learning track suitability:<br>• **Paid Opportunities:** 100 points.<br>• **Skill Development & Apprenticeship:** 90 points.<br>• **Unpaid / Unspecified:** 60 points. |

#### Architectural Guarantees & Safeguards

1. **Mandatory Eligibility Hard Gate:**  
   If a student fails mandatory criteria set by the employer (e.g., CGPA strictly below minimum threshold or restricted academic branch), the system enforces $\text{Overall Score} = \min(45, \text{Overall Score})$. This mathematically prevents unqualified candidates from receiving misleading high ratings while clearly displaying the exact unmet eligibility requirement.
2. **Non-Punitive Missing Data Policy:**  
   Unprovided optional profile attributes are assigned neutral baselines (e.g., 70 for academic eligibility, 65 for career alignment) rather than punitive 0 scores, encouraging continuous profile completion without demotivating students.
3. **Demographic & Pedigree Blindness:**  
   Institutional rankings (Tier-1, Tier-2, Tier-3) and candidate demographic attributes (gender, caste, religion, socio-economic bracket) are strictly excluded from the algorithm ($w_{\text{pedigree}} = 0$).
4. **High-Performance In-Memory Caching:**  
   Match scores and factor breakdowns are cached with a 5-minute TTL, indexed by `studentId:opportunityId`, and invalidated instantaneously upon profile update.

---

### 2. Haversine Geospatial Distance Formula

To calculate precise distance between a student's coordinates $(\phi_1, \lambda_1)$ and an opportunity or training centre $(\phi_2, \lambda_2)$:

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$d = 2R \cdot \arcsin\left(\sqrt{a}\right)$$

Where $R = 6,371\text{ km}$ (Earth's mean radius), $\Delta\phi = \phi_2 - \phi_1$, and $\Delta\lambda = \lambda_2 - \lambda_1$ in radians.

---

### 3. Topological Skill Ordering (Kahn's Algorithm)

To resolve prerequisite graphs without circular deadlocks:

1. Build directed acyclic graph $G = (V, E)$ where an edge $(u, v)$ signifies that skill $u$ is a prerequisite for skill $v$.
2. Compute in-degree $\text{deg}^-(v)$ for all vertices $v \in V$.
3. Enqueue all vertices with $\text{deg}^-(u) = 0$.
4. While queue is non-empty:
   * Dequeue vertex $u$, append $u$ to topological ordering $L$.
   * For each neighbor $v$ of $u$, decrement $\text{deg}^-(v)$. If $\text{deg}^-(v) = 0$, enqueue $v$.
5. If $|L| < |V|$, circular dependencies are detected and resolved gracefully using domain fallbacks.

---

### 4. Adaptive Learning Roadmap Completion Formula

$$\text{Roadmap Progress} = \text{round}\left(0.50 \cdot P_{\text{milestones}} + 0.50 \cdot P_{\text{tasks}}\right)$$

$$\begin{aligned}
P_{\text{milestones}} &= \frac{100 \times M_{\text{completed}} + 50 \times M_{\text{in-progress}}}{M_{\text{total}}} \\
P_{\text{tasks}} &= \left( \frac{\sum T_{\text{completed}}}{\sum T_{\text{total}}} \right) \times 100
\end{aligned}$$

---

### 5. Adverse Impact Ratio (Four-Fifths Rule)

$$\text{Adverse Impact Ratio} = \frac{\text{Selection Rate of Protected Group}}{\text{Selection Rate of Highest Group}}$$

$$\text{Compliance Check: } \text{If } \text{Ratio} \ge 0.80 \implies \text{Compliant; Else } \implies \text{Flagged for Administrative Audit}$$

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `16.4.4` | Server Components, Server Actions, Dynamic Layouts, Turbopack |
| **UI Library** | React | `19.0.0` | Modern concurrent rendering, transitions, hooks |
| **Language** | TypeScript | `5.7.0` | Strict type safety across client and server domains |
| **Styling** | Tailwind CSS | `v4.0.0` | Modern token-based CSS styling and design system |
| **Database** | MongoDB & Mongoose | `6.13` / `8.12` | High-concurrency document persistence and typed schemas |
| **Authentication** | Better Auth | `1.7.15` | Multi-role RBAC (`student`, `mentor`, `recruiter`, `admin`) |
| **AI / LLM Engine** | Google Gemini API (`@google/genai`) | `2.32.0` | Bilingual career companion, structured resume analysis, roadmaps |
| **PDF Extraction** | `pdf-parse` | `2.4.5` | In-memory text extraction from student resumes |
| **Mapping & GIS** | Leaflet & OpenStreetMap | `1.9.4` | Interactive tile maps, radius clustering, training centres |
| **QR Credentials** | `qrcode` | `1.5.4` | Cryptographic tamper-evident QR verification payloads |
| **Data Charts** | Recharts | `2.15.1` | Radar charts, conversion funnels, and match analytics |
| **Icons & Alerts** | Lucide React & Sonner | `0.475` / `2.0` | Accessible iconography and toast notifications |

---

## ⚡ Quickstart & Local Setup

### Prerequisites
* **Node.js:** `v20.x` or `v22.x` (or newer)
* **MongoDB:** A running MongoDB instance (Local: `mongodb://localhost:27017` or MongoDB Atlas URI)
* **Google Gemini API Key:** An active key from [Google AI Studio](https://aistudio.google.com/)

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/nexskill-ai/nexskill-ai.git
cd nexskill-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# (Edit .env.local with your MongoDB URI and Gemini API Key)

# 4. Seed database with sample opportunities and test accounts
npm run seed:opportunities
npm run seed:demo-users

# 5. Start development server
npm run dev
```

The application will be live at `http://localhost:3000`.

---

## 🔑 Demo Credentials

> [!TIP]
> You can test all these accounts immediately on the live production deployment:  
> **Direct Login:** **[https://team-definite-winners.vercel.app/login](https://team-definite-winners.vercel.app/login)**

| Role | Email Address | Password | Intended Test Experience |
|---|---|---|---|
| **Student** | `student@careerbridge.ai` | `Password123!` | Complete student portal, smart matches, roadmaps, passport |
| **Alternate Student** | `akash@gmail.com` | `Akash@123` | Secondary student profile for multi-applicant testing |
| **Administrator** | `admin@careerbridge.ai` | `Password123!` | Full administrative dashboard, fairness audits, opportunity CRUD |
| **Mentor** | *Auto-seeded in mentor catalog* | `Password123!` | Mentor dashboard, session management, availability scheduler |

To promote any registered user account to Administrator:
```bash
node scripts/promote-admin.mjs your-email@domain.com
```

---

## 🛡️ Security, Privacy & Responsible AI Standards

1. **Demographic Neutrality:** Matching engines operate completely blind to candidate gender, caste, religion, family income, disability status, or personal background attributes.
2. **Zero Pedigree Bias:** College tiers and institutional prestige are strictly omitted from matching vectors ($w_{\text{pedigree}} = 0$). Talent is evaluated on proven competencies and project portfolio proof.
3. **Four-Fifths Compliance Monitoring:** The administrative console continuously audits disparate impact ratios using the EEOC $80\%$ threshold to ensure fair opportunity distribution across student cohorts.
4. **Resilient AI Failure Modes:** Every Gemini API call is protected by schema-validated deterministic fallback generators. Network drops or API quota limits never block student workflows.
5. **Privacy by Default:** Resumes are processed in-memory without persistent disk writes; Digital Skills Passports remain private unless explicitly made public by the student.

---

## 📚 Technical Reference (API & Database)

<details>
<summary><b>🔍 Click to expand: Complete REST API Reference (40+ Route Handlers)</b></summary>

<br />

### Authentication & Profiles
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `ALL` | `/api/auth/[...all]` | Public | Better Auth authentication catch-all endpoint |
| `GET` | `/api/health` | Public | System, MongoDB, and Gemini AI health monitoring |
| `GET` | `/api/student/profile` | Student | Retrieves authenticated student profile |
| `PUT` | `/api/student/profile` | Student | Updates student profile with Zod schema validation |

### Opportunities & Matching
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/opportunities` | Public | Search, paginate, and filter published opportunities |
| `GET` | `/api/opportunities/[id]` | Public | Retrieves specific opportunity detail |
| `GET` | `/api/recommendations` | Student | Calculates 7-factor smart matches for student |
| `GET` | `/api/recommendations/[opportunityId]` | Student | Deconstructs match score into factor breakdown |
| `POST` | `/api/recommendations/[opportunityId]/feedback` | Student | Submits feedback on match explanation quality |

### Resume & Learning Roadmaps
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/resume/upload` | Student | In-memory PDF upload and structured AI extraction |
| `POST` | `/api/resume/approve` | Student | Non-destructively merges approved resume data into profile |
| `GET` | `/api/resume` | Student | Retrieves student resume metadata and parsed history |
| `POST` | `/api/roadmap/generate` | Student | Generates DAG-ordered adaptive milestone roadmap |
| `GET` | `/api/roadmap` | Student | Retrieves current active learning roadmap |
| `PATCH` | `/api/roadmap/[roadmapId]/milestones/[milestoneId]` | Student | Updates milestone status and notes |
| `POST` | `/api/roadmap/[roadmapId]/milestones/[milestoneId]/tasks` | Student | Toggles checklist subtask completion |
| `POST` | `/api/roadmap/[roadmapId]/adjust` | Student | Adjusts roadmap pace while preserving completed milestones |

### Skill Gap & Practical Assessments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/skill-gap/overview` | Student | Aggregated skill gap metrics and high-priority skills |
| `POST` | `/api/skill-gap/analyze` | Student | On-demand skill gap analysis for selected opportunities |
| `GET` | `/api/skill-gap/resources` | Student | Curated learning resources mapped to missing skills |
| `GET` | `/api/assessments` | Student | Catalog of available practical skill readiness tests |
| `POST` | `/api/assessments/[id]/attempt` | Student | Starts a timed assessment attempt |
| `POST` | `/api/assessments/attempts/[attemptId]/submit` | Student | Submits answers, calculates score, and issues evidence |
| `GET` | `/api/assessments/results/[attemptId]` | Student | Retrieves detailed scoring and answer explanations |

### Digital Skills Passport & Public Verification
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/passport` | Student | Retrieves authenticated student's Skills Passport |
| `POST` | `/api/passport/sync` | Student | Synchronizes verified assessment & project evidence |
| `POST` | `/api/passport/publish` | Student | Toggles public visibility and generates share link |
| `GET` | `/api/passport/qr` | Student | Generates QR code image buffer for resume insertion |
| `GET` | `/api/public/passport/[publicId]` | Public | Publicly accessible view of verified credentials |
| `GET` | `/api/public/passport/[publicId]/verification` | Public | Cryptographic employer verification endpoint |

### Career Simulation & AI Companion
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/career-paths` | Student | Catalog of standard industry career pathways |
| `POST` | `/api/career-simulator/simulate` | Student | Executes What-If simulation with prospective skills |
| `GET` | `/api/career-simulator/history` | Student | Retrieves previous What-If simulation records |
| `POST` | `/api/companion/chat` | Student | Bilingual AI career counseling (English / हिन्दी) |

### Local Opportunities & Mentorship Network
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/local-opportunities` | Student | Geospatial discovery using Haversine distance radius |
| `GET` | `/api/local-opportunities/centres` | Student | NSDC/PMKVY regional training centre directory |
| `GET` | `/api/mentors` | Student | Browse verified alumni and industry mentors |
| `POST` | `/api/mentorship/requests` | Student | Submits a 1-on-1 mentorship session request |
| `GET` | `/api/mentorship/sessions` | Student/Mentor | Retrieves scheduled virtual counseling sessions |
| `POST` | `/api/mentorship/feedback` | Student/Mentor | Submits post-session double-blind feedback rating |

### Application Tracking System (ATS) & Administrative Console
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/applications` | Student | Retrieves all saved and submitted applications |
| `POST` | `/api/applications` | Student | Records a new application submission or bookmark |
| `PATCH` | `/api/applications/[applicationId]` | Student | Updates application stage (e.g., Interviewing) |
| `GET` | `/api/applications/statistics` | Student | Summary metrics on response times and conversion |
| `GET` | `/api/admin/stats` | Admin | High-level system counts and active user statistics |
| `GET` | `/api/admin/analytics/overview` | Admin | Comprehensive student, opportunity, and matching metrics |
| `GET` | `/api/admin/analytics/fairness` | Admin | Demographic parity and Four-Fifths compliance audit |
| `GET` | `/api/admin/analytics/export` | Admin | Sanitized CSV export across platform analytics domains |
| `POST` | `/api/admin/opportunities` | Admin | Creates new verified opportunity listing |
| `PUT` | `/api/admin/opportunities/[id]` | Admin | Updates existing opportunity listing |
| `POST` | `/api/admin/opportunities/[id]/verify` | Admin | Approves or rejects submitted opportunity listing |
| `GET` | `/api/admin/audit-logs` | Admin | Queries compliance audit trail for administrative actions |

</details>

<br />

<details>
<summary><b>🗄️ Click to expand: Database Architecture & Mongoose Models (29 Collections)</b></summary>

<br />

| Model Name | Primary Collection | Core Responsibilities & Key Fields |
|---|---|---|
| `User` | `user` | Core user identity, email verification, hashed password, role (`student`, `mentor`, `recruiter`, `admin`) |
| `StudentProfile` | `student_profiles` | Personal details, academic history, skills array, projects array, career preferences, completion % |
| `Opportunity` | `opportunities` | Title, company, category, work mode, location, required/preferred skills, CGPA cutoff, verification status |
| `Resume` | `resumes` | Uploaded resume metadata, parsed JSON content, raw text preview, approval status |
| `LearningResource` | `learning_resources` | Curated courses, documentation, difficulty, estimated hours, provider, direct URL |
| `StudentSkillProgress` | `student_skill_progress` | Individual student skill lifecycle (`not_started`, `in_progress`, `completed`), target date |
| `Roadmap` | `roadmaps` | Weekly milestone plan, DAG topological ordering, task checklists, pace settings, overall progress % |
| `OpportunityExplanation` | `opportunity_explanations` | Cached 7-factor match deconstruction, missing skill weights, What-If suggestions |
| `ExplanationFeedback` | `explanation_feedbacks` | Student ratings (`helpful`, `not_helpful`), clarification comments, timestamp |
| `Application` | `applications` | Student application records, current status pipeline, interview timestamps, notes |
| `ApplicationActivity` | `application_activities` | Audit history of status transitions and candidate activity per application |
| `AdminAuditLog` | `admin_audit_logs` | Immutable audit log of administrative actions, user promotions, and policy adjustments |
| `AnalyticsEvent` | `analytics_events` | Granular telemetry events for match views, searches, and feature utilization |
| `CareerPath` | `career_paths` | Standard industry career trajectories, required foundational/advanced skills, salary benchmarks |
| `CareerSimulation` | `career_simulations` | Snapshot of simulated What-If skill additions and projected readiness improvements |
| `SkillsPassport` | `skills_passports` | Verified digital credential passport, public UUID, QR payload, visibility toggle |
| `PassportEvidence` | `passport_evidences` | Granular proof records (GitHub repos, live demos, assessment results) linked to passport |
| `Assessment` | `assessments` | Technical assessment definitions, domain categories, question count, duration, passing threshold |
| `AssessmentQuestion` | `assessment_questions` | Question bank, code snippets, multiple-choice options, correct answers, explanation |
| `AssessmentAttempt` | `assessment_attempts` | Student test sessions, selected answers, score percentage, pass/fail status, duration |
| `AssessmentEvidence` | `assessment_evidences` | Automated verifiable evidence created when an assessment attempt achieves $\ge 70\%$ |
| `RegionalTrainingCentre` | `regional_training_centres` | Local training centres, GPS coordinates (latitude/longitude), contact info, schemes |
| `MentorProfile` | `mentor_profiles` | Industry alumni details, current company, domain expertise, verified badge, availability slots |
| `MentorshipRequest` | `mentorship_requests` | Mentorship inquiries from students, stated goals, status (`pending`, `accepted`, `declined`) |
| `MentorshipSession` | `mentorship_sessions` | Confirmed 1-on-1 counseling sessions, date/time, meeting URL, completion status |
| `MentorshipFeedback` | `mentorship_feedbacks` | Double-blind post-session rating (1-5 stars) and qualitative feedback |
| `MentorshipResourceShare` | `mentorship_resource_shares` | Curated roadmaps and articles directly transmitted from mentor to student |
| `MentorshipNote` | `mentorship_notes` | Confidential counseling notes recorded by mentors during guidance sessions |
| `InAppNotification` | `in_app_notifications` | In-app alerts for session confirmations, status changes, and application reminders |

</details>

---

## 📄 License & Acknowledgments

This project is developed for **Problem Statement 22 (PS-22)**: *Campus Recruitment & Equal Opportunity Employment*.

* **Framework:** [Next.js by Vercel](https://nextjs.org/)
* **AI Models & SDK:** [Google DeepMind Gemini API (`@google/genai`)](https://ai.google.dev/)
* **Authentication:** [Better Auth](https://www.better-auth.com/)
* **Geospatial Mapping:** [Leaflet](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/)
* **Icons:** [Lucide Icons](https://lucide.dev/)

---

<div align="center">
  <b>Built with ❤️ to connect every student's skills with equal opportunity.</b>
</div>
