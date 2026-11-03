# NexSkill AI (CareerBridge AI)

> **AI-Powered Campus-to-Employment Opportunity Matcher**  
> *From Skill to Opportunity* — Democratizing student careers through explainable AI recommendations, skills-based verification, regional opportunity intelligence, and demographic neutrality.  
> **Problem Statement:** PS-22 (Campus Recruitment & Equal Opportunity Employment)  
> 🌐 **Live Demo Application:** [https://team-definite-winners.vercel.app/](https://team-definite-winners.vercel.app/)

[![Live Demo](https://img.shields.io/badge/Live_Demo-team--definite--winners.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://team-definite-winners.vercel.app/)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.13-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7-purple?style=flat)](https://www.better-auth.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.32_SDK-orange?style=flat&logo=google)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?style=flat&logo=leaflet)](https://leafletjs.com/)

---

## Table of Contents

- [🌐 Live Demo & Deployment](#-live-demo--deployment)
1. [Executive Summary & Problem Statement (PS-22)](#1-executive-summary--problem-statement-ps-22)
2. [Key Innovations & Ethical AI Principles](#2-key-innovations--ethical-ai-principles)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture & Multi-Portal Design](#4-system-architecture--multi-portal-design)
5. [In-Depth Feature & Implementation Breakdown](#5-in-depth-feature--implementation-breakdown)
   - [Stage 1: Authentication & Comprehensive Student Profiles](#stage-1-authentication--comprehensive-student-profiles)
   - [Stage 2: Opportunity Management & Administrative RBAC](#stage-2-opportunity-management--administrative-rbac)
   - [Stage 3: AI Resume Analyzer & Non-Destructive Profile Sync](#stage-3-ai-resume-analyzer--non-destructive-profile-sync)
   - [Stage 4: Intelligent Multi-Factor Matching Engine & Eligibility Gates](#stage-4-intelligent-multi-factor-matching-engine--eligibility-gates)
   - [Stage 5: AI Skill Gap Analyzer & Curated Resource Linking](#stage-5-ai-skill-gap-analyzer--curated-resource-linking)
   - [Stage 6: Personalized AI Learning Roadmaps & Topological Ordering](#stage-6-personalized-ai-learning-roadmaps--topological-ordering)
   - [Stage 7: Explainable AI Recommendations & What-If Levers](#stage-7-explainable-ai-recommendations--what-if-levers)
   - [Stage 8: Application Tracking System (ATS) & Pipeline Auditing](#stage-8-application-tracking-system-ats--pipeline-auditing)
   - [Stage 9: Admin Analytics & Responsible AI Fairness Monitoring](#stage-9-admin-analytics--responsible-ai-fairness-monitoring)
   - [Feature 1: Career Pathway Explorer & What-If Simulator](#feature-1-career-pathway-explorer--what-if-simulator)
   - [Feature 2: Verified Digital Skills Passport & Public Verification](#feature-2-verified-digital-skills-passport--public-verification)
   - [Feature 3: Multilingual AI Career Companion (English & हिन्दी)](#feature-3-multilingual-ai-career-companion-english--हिन्दी)
   - [Feature 4: Practical Skill Readiness Assessment Engine](#feature-4-practical-skill-readiness-assessment-engine)
   - [Feature 5: Local Opportunity & Regional Skill Intelligence](#feature-5-local-opportunity--regional-skill-intelligence)
   - [Feature 6: Human Mentor & Career Counsellor Network](#feature-6-human-mentor--career-counsellor-network)
6. [Mathematical Formulations & Core Algorithms](#6-mathematical-formulations--core-algorithms)
7. [Comprehensive REST API Reference](#7-comprehensive-rest-api-reference)
8. [Database Architecture & Mongoose Models](#8-database-architecture--mongoose-models)
9. [Project Directory Structure](#9-project-directory-structure)
10. [Getting Started & Installation](#10-getting-started--installation)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Seeding & Demo Credentials](#12-seeding--demo-credentials)
13. [Security, Privacy & Responsible AI Standards](#13-security-privacy--responsible-ai-standards)
14. [License & Acknowledgments](#14-license--acknowledgments)

---

## 🌐 Live Demo & Deployment

NexSkill AI is live and publicly accessible:

| Resource | Link | Notes |
|---|---|---|
| **Production Application** | **[https://team-definite-winners.vercel.app/](https://team-definite-winners.vercel.app/)** | Hosted on Vercel Edge & Serverless Infrastructure |
| **Student & Admin Login** | **[https://team-definite-winners.vercel.app/login](https://team-definite-winners.vercel.app/login)** | Use demo credentials below or register a new student account |
| **Pre-Seeded Credentials** | [Jump to Demo Accounts](#12-seeding--demo-credentials) | Student, Admin, and Mentor accounts ready for testing |

---

## 1. Executive Summary & Problem Statement (PS-22)

Conventional university placement cells and online job boards are plagued by structural inequities that disadvantage millions of students:

1. **The Pedigree Prejudice:** Candidate screening frequently prioritizes tier-1 university brand names over demonstrated competency, discarding talented candidates from tier-2, tier-3, and rural institutions.
2. **The "Black-Box" Algorithmic Problem:** Typical applicant tracking systems reject candidates without transparent rationale, providing zero actionable feedback on how students can bridge skill deficits.
3. **The Unverified Skills Gap:** Self-reported resumes are saturated with unverified buzzwords, forcing recruiters to rely on pedigree proxies rather than proven code and portfolio proof.
4. **Geographic & Economic Disconnect:** Students located outside metropolitan hubs miss localized internships, state vocational training centres (e.g., NSDC, PMKVY), and regional skill development initiatives.
5. **Language & Guidance Accessibility Barriers:** Vernacular-speaking and first-generation college students frequently lack access to seasoned alumni networks, industry mentors, and personalized bilingual career counseling.

**NexSkill AI (CareerBridge AI)** addresses Problem Statement 22 by providing a holistic campus-to-career intelligence platform. By combining **pedigree-neutral matching algorithms**, **verifiable skill passports**, **multilingual AI counseling**, **localized geospatial opportunity maps**, and **transparent explainability**, NexSkill AI bridges the gap between campus learning and gainful employment.

---

## 2. Key Innovations & Ethical AI Principles

* **Explainable Recommendations by Design:** Every match percentage is deconstructed into transparent factor contributions (Skills, Projects, Education, Alignment, Work Mode, Compensation) with exact missing skill breakdowns and actionable improvement levers.
* **Deterministic Decision Boundaries:** Recommendation scoring formulas are strictly mathematical and deterministic. AI large language models are employed solely to articulate student-friendly explanations, personalized roadmaps, and career advisory—**never to compute, adjust, or bias matching scores**.
* **Zero Pedigree Bias Invariant:** College tiers, institutional prestige, and brand rankings are strictly excluded from candidate scoring algorithms.
* **Demographic Neutrality:** Matching engines operate completely blind to candidate gender, caste, religion, family income, disability status, or personal background attributes.
* **Non-Destructive Resilience (100% Fallback Guarantee):** All AI modules (Gemini API) are fortified with deterministic, schema-compliant fallback generators. Network latency, quota exhaustion, or API unavailability never disrupt student workflows.
* **Non-Punitive Evaluation Policy:** Incomplete optional profile information is handled with neutral baselines rather than punitive zero scores.

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | `16.4.4` | Server Components, Server Actions, Dynamic Layouts, Turbopack |
| **UI Library** | React | `19.0.0` | Modern concurrent rendering, transitions, hooks |
| **Language** | TypeScript | `5.7.0` | Strict type safety, shared domain interfaces across client and server |
| **Styling & Design** | Tailwind CSS | `v4.0.0` | High-performance CSS token-based design system, responsive UI |
| **Database** | MongoDB & Mongoose | `6.13` / `8.12` | Scalable document persistence, connection pooling, typed schemas |
| **Authentication & RBAC** | Better Auth | `1.7.15` | Multi-role authentication (`student`, `mentor`, `recruiter`, `admin`) |
| **AI / LLM Engine** | Google Gemini API (`@google/genai`) | `2.32.0` | Career advisory, structured resume analysis, adaptive roadmap sequencing |
| **PDF Processing** | `pdf-parse` | `2.4.5` | In-memory text extraction from uploaded student resumes |
| **Geospatial & Mapping** | Leaflet & `@types/leaflet` | `1.9.4` | Interactive tile maps, radius clustering, training centre locators |
| **Credential QR Codes** | `qrcode` | `1.5.4` | Cryptographic tamper-evident verification codes for Skills Passport |
| **Data Visualizations** | Recharts | `2.15.1` | Skill coverage radar/bar charts, applicant funnel charts, score metrics |
| **Form Management** | React Hook Form & Zod | `7.54` / `3.24` | Strict client/server validation, typed input sanitization |
| **Icons & Notifications** | Lucide React & Sonner | `0.475` / `2.0` | Accessible iconography, custom toast notifications |
| **Test Runner & Runtime** | `tsx` | `4.23.15` | Fast native TypeScript execution for automated verification suites |

---

## 4. System Architecture & Multi-Portal Design

```
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
 │ • Dashboard Overview          │ │ • Metrics & Stats           │ │ • Mentor Dashboard            │
 │ • Smart Matches & Explanations│ │ • Opportunity Management    │ │ • Mentorship Requests         │
 │ • AI Resume Analyzer          │ │ • Regional Opportunities    │ │ • Session Scheduler & Links   │
 │ • Skill Gap & Curated Courses │ │ • Training Centre Registry  │ │ • Availability Configuration  │
 │ • Personalized AI Roadmaps    │ │ • Platform & Fairness Audit │ │ • Direct Resource Sharing     │
 │ • Skill Readiness Assessments │ │ • Skill Assessment Authoring│ │ • Confidential Session Notes  │
 │ • Digital Skills Passport     │ │ • Mentor Credential Reviews │ │ • Mentee Review & Ratings     │
 │ • What-If Career Simulator    │ │ • Demographic Parity Checks │ └───────────────────────────────┘
 │ • Multilingual AI Companion   │ │ • Comprehensive CSV Export  │
 │ • Local Intelligence & Map    │ └─────────────────────────────┘
 │ • Mentor Booking & Sessions   │
 │ • Application Pipeline (ATS)  │
 └───────────────────────────────┘
                 │
                 ▼
+────────────────────────────────────────────────────────────────────────────────────────────────----+
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

## 5. In-Depth Feature & Implementation Breakdown

### Stage 1: Authentication & Comprehensive Student Profiles
* **Secure Authentication:** Built on **Better Auth** with MongoDB adapter, supporting password hashing (`@better-auth/utils/password`), session cookies, and multi-role access control (`student`, `mentor`, `recruiter`, `admin`).
* **Multi-Section Student Profile:**
  * **Personal Information:** Full name, email, phone, location, portfolio/GitHub URLs.
  * **Academic Background:** College name, degree, branch, current academic year, graduation year, and CGPA.
  * **Skills Inventory:** Categorized technical and soft skills with proficiency ratings (`Beginner`, `Intermediate`, `Advanced`).
  * **Project Portfolio:** Project titles, descriptions, live demo links, repository URLs, and applied technologies.
  * **Work Experience & Certifications:** Internships, past roles, issuing organizations, and credential IDs.
  * **Career Preferences:** Target job role, employment type (Full-time, Internship), work mode (Remote, Hybrid, Onsite), preferred location, and expected stipend.
* **Profile Completion Engine:** Dynamic scoring algorithm assessing section completeness to guide students to 100% profile readiness.

### Stage 2: Opportunity Management & Administrative RBAC
* **Comprehensive Listings:** Supports **Internships**, **Full-Time Jobs**, and **Skill-Development Programs**.
* **Publication & Verification Workflows:** Opportunities follow strict status lifecycles (`draft`, `published`, `archived`) and administrative verification statuses (`pending`, `verified`, `rejected`).
* **Opportunity Attributes:** Minimum CGPA requirements, required vs preferred skills, compensation disclosures (stipend/salary), location type, and explicit application deadlines.
* **Role Protection:** Non-admin users are strictly restricted to read-only views of published and verified listings.

### Stage 3: AI Resume Analyzer & Non-Destructive Profile Sync
* **In-Memory PDF Parsing:** Extracts textual content directly from PDF uploads using `pdf-parse` without persisting raw files to disk.
* **Structured AI Extraction:** Powered by Google Gemini API with strict Zod schema validation (`geminiResumeParsedSchema`) to isolate:
  * Extracted contact info, detected skills (with inferred proficiency), projects, work experience, and educational credentials.
* **Non-Destructive Sync Workflow:** Students review extracted items side-by-side with their existing profile in an interactive modal. Existing profile entries are **never overwritten without explicit confirmation**.
* **Deterministic Fallback Engine:** If the Gemini API is unavailable, a regex-based keyword parser extracts technical competencies, ensuring zero downtime.

### Stage 4: Intelligent Multi-Factor Matching Engine & Eligibility Gates
* **Deterministic 7-Factor Mathematical Model:** Evaluates student compatibility across seven independently weighted criteria: Required Skills ($40\%$), Preferred Skills ($15\%$), Projects & Practical Experience ($15\%$), Education & Eligibility ($10\%$), Career Role Alignment ($10\%$), Location & Work Mode ($5\%$), and Compensation Alignment ($5\%$).
* **Semantic Token Normalization:** Resolves skill variations, abbreviations, and dialectical naming differences (e.g., *react.js* $\to$ *react*, *k8s* $\to$ *kubernetes*, *golang* $\to$ *go*) prior to computing skill intersections.
* **Mandatory Eligibility Hard Gate:** Enforces strict academic and institutional requirements (minimum CGPA, graduation batch, permitted branches). If a student fails any mandatory gate, the overall match score is **strictly capped at $\le 45\%$**, preventing misleading high match percentages.
* **Non-Punitive Missing Data Policy:** Evaluates unprovided optional profile fields with a fair, neutral baseline rather than penalizing students with a zero score.
* **Zero-Pedigree & Demographic Blindness:** Operates entirely blind to college tier, institutional pedigree, gender, caste, religion, and socio-economic indicators.
* **High-Throughput In-Memory Caching:** Features a 5-minute TTL caching layer indexed by `studentId:opportunityId`, auto-invalidating instantly whenever a student updates their profile.

### Stage 5: AI Skill Gap Analyzer & Curated Resource Linking
* **Opportunity-Specific & Aggregated Gaps:** Compares student profiles against single opportunities or across the entire catalog to isolate missing required and preferred competencies.
* **Labor Market Demand Scoring:** Evaluates skill frequency across all active job postings to classify skills into `Critical`, `Important`, and `Beneficial`.
* **Curated Learning Catalog:** Automatically maps missing competencies to curated, verified learning resources (Coursera, freeCodeCamp, official documentation, interactive tutorials) with difficulty rankings and time commitments.
* **Skill Progress Tracker:** Allows students to mark skills as `Not Started`, `In Progress`, or `Completed`.

### Stage 6: Personalized AI Learning Roadmaps & Topological Ordering
* **Directed Acyclic Graph (DAG) Prerequisite Sequencing:** Resolves prerequisites using industry-standard dependency trees (e.g., $HTML/CSS \to JavaScript \to React/TypeScript \to Next.js$).
* **Cycle-Breaking & Kahn's Algorithm:** Employs depth-first cycle detection and priority-weighted Kahn's topological sort to eliminate dependency deadlocks.
* **Dynamic Time Allocation:** Adapts weekly milestone pacing to student schedules ($\text{Study Hours/Day} \times \text{Study Days/Week}$).
* **Non-Destructive Adaptive Rescheduling:** Modifying a roadmap recalculates only future uncompleted milestones—**completed milestones and task checklists are strictly preserved**.

### Stage 7: Explainable AI Recommendations & What-If Levers
* **Transparent Match Factor Deconstruction:** Breaks down composite match scores into visual components with clear rationale.
* **What-If Impact Levers:** Demonstrates the exact percentage boost a student would achieve by acquiring specific missing skills (e.g., *"+12% match boost if you learn Docker"*).
* **Demographic Neutrality Guarantee:** Discloses fairness principles directly to students and provides a double-blind feedback mechanism (`Helpful` / `Misleading`) to audit explanation clarity.

### Stage 8: Application Tracking System (ATS) & Pipeline Auditing
* **Kanban & List Pipeline Views:** Full lifecycle management across application states:
  $$\text{Saved} \longrightarrow \text{Applied} \longrightarrow \text{Under Review} \longrightarrow \text{Interviewing} \longrightarrow \text{Offered} \ / \ \text{Rejected} \ / \ \text{Withdrawn}$$
* **Application Activity Audit Log:** Automatically timestamps every status update and records personalized interview notes, submission dates, and recruiter contact details.
* **Analytics & Responsiveness Metrics:** Tracks active applications, interview rates, offer conversion ratios, and average recruiter turnaround times.

### Stage 9: Admin Analytics & Responsible AI Fairness Monitoring
* **Demographic Parity & Adverse Impact Monitoring:** Implements the EEOC **Four-Fifths Rule ($80\%$ Disparate Impact Ratio)** to continuously audit recommendation distributions across academic branches, graduation cohorts, and student categories.
* **Audit Trail Compliance:** Every administrative privilege escalation, opportunity modification, and verification event is immutably logged to `AdminAuditLog`.
* **Exportable Reporting:** Generates timestamped, sanitized CSV exports for overview metrics, student rosters, opportunity engagement, and fairness audits.

### Feature 1: Career Pathway Explorer & What-If Simulator
* **Interactive Career Progression Trees:** Explore defined industry career pathways (e.g., *Full-Stack Engineer*, *AI/ML Engineer*, *DevOps Specialist*, *Data Analyst*) with salary bands and competency matrices.
* **What-If Skill Simulation:** Select prospective skills to simulate immediate career readiness score shifts and visualize unlocking higher-tier job roles before writing a single line of code.

### Feature 2: Verified Digital Skills Passport & Public Verification
* **Tamper-Evident Digital Credential:** Centralizes assessed skills, verified projects, and completed milestones into a cryptographically identifiable digital passport.
* **Public Sharing & Privacy Controls:** Features a public URL (`/passport/[publicId]`), QR code generation for resume inclusion, and an instant privacy visibility toggle.
* **Third-Party Employer Verification:** Recruiter-facing verification portal (`/passport/[publicId]/verification`) displaying verified assessment stamps and project evidence.

### Feature 3: Multilingual AI Career Companion (English & हिन्दी)
* **Conversational AI Counseling:** Conversational assistant grounded in student profile context, application statuses, and active skill gaps.
* **Full Bilingual Support:** Native prompts and responses in **English** and **Hindi (Devanagari script: हिन्दी)**.
* **Voice Speech Synthesis & Recognition:** Integrated Web Speech API for voice queries and audio playback.
* **Actionable Deep Linking:** Automatically generates deep links pointing students to corresponding platform tools (e.g., *Launch What-If Simulator*, *Start JavaScript Assessment*).

### Feature 4: Practical Skill Readiness Assessment Engine
* **Distraction-Free Timed Tests:** Objective, timed technical assessments across core domains: JavaScript, React, Node.js, Python, and SQL.
* **Anti-Cheat & Auto-Submission:** Enforces timer deadlines and calculates scores automatically.
* **Automated Evidence Linking:** Scoring $\ge 70\%$ automatically creates verified `AssessmentEvidence` and issues a verified badge on the student's Digital Skills Passport.

### Feature 5: Local Opportunity & Regional Skill Intelligence
* **Interactive Leaflet Map View:** Visualizes regional opportunities, off-campus hiring drives, and nearby skill centres.
* **Haversine Proximity Search:** Geospatial radial filtering ($10\text{ km}$, $25\text{ km}$, $50\text{ km}$, $100\text{ km}$) connecting students in tier-2/tier-3 regions with nearby opportunities.
* **Government & Vocational Integration:** Direct directory of National Skill Development Corporation (NSDC) and PMKVY vocational training centres.

### Feature 6: Human Mentor & Career Counsellor Network
* **Alumni & Industry Mentor Directory:** Verified directory of senior engineers, recruiters, and career counselors with industry domains and expertise tags.
* **1-on-1 Session Scheduling:** Student mentorship requests with stated goals, resume attachment, session calendar scheduling, and virtual meeting links.
* **Collaborative Tools:** Mentor session notes, direct learning resource sharing, and double-blind post-session rating reviews.

---

## 6. Mathematical Formulations & Core Algorithms

### 1. Multi-Factor Compatibility Score

The NexSkill matching engine calculates opportunity compatibility deterministically using a calibrated **7-factor weighted multi-criteria decision model**. Rather than relying on non-deterministic black-box LLMs to score candidates, NexSkill evaluates candidates against verifiable competencies, project evidence, and verified credentials.

#### Mathematical Formulation

$$\text{Overall Compatibility Score} = \text{round}\left( \sum_{i=1}^{7} w_i \times S_i \right)$$

$$\text{Subject to Mandatory Gate: } \quad S_{\text{overall}} = \begin{cases} \min(45, S_{\text{overall}}) & \text{if } \text{Status}(\text{Eligibility}) = \text{"not\_eligible"} \\ S_{\text{overall}} & \text{otherwise} \end{cases}$$

Where each factor weight $w_i \in (0, 1)$ satisfies $\sum_{i=1}^{7} w_i = 1.00$, and each component score $S_i \in [0, 100]$ is computed through specialized deterministic evaluation rubrics.

#### Component Weights and Scoring Breakdown

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
   If a student fails mandatory criteria set by the employer (e.g., CGPA strictly below minimum threshold or restricted academic branch), the system enforces:
   $$\text{Overall Score} = \min(45, \text{Overall Score})$$
   This invariant mathematically prevents unqualified candidates from receiving misleading high ratings while clearly displaying the exact unmet eligibility requirement.

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

To resolve prerequisite graphs without infinite loops:

1. Build directed graph $G = (V, E)$ where an edge $(u, v)$ signifies that skill $u$ is a prerequisite for skill $v$.
2. Compute in-degree $\text{deg}^-(v)$ for all vertices $v \in V$.
3. Enqueue all vertices with $\text{deg}^-(u) = 0$.
4. While queue is non-empty:
   * Dequeue vertex $u$, append $u$ to topological ordering $L$.
   * For each neighbor $v$ of $u$, decrement $\text{deg}^-(v)$. If $\text{deg}^-(v) = 0$, enqueue $v$.
5. If $|L| < |V|$, circular dependencies are detected and resolved gracefully using domain fallbacks.

---

### 4. Adaptive Learning Roadmap Completion Formula

$$\text{Roadmap Progress (\%)} = \text{round}\left(0.50 \cdot P_{\text{milestones}} + 0.50 \cdot P_{\text{tasks}}\right)$$

$$\begin{aligned}
P_{\text{milestones}} &= \frac{100 \times M_{\text{completed}} + 50 \times M_{\text{in\_progress}}}{M_{\text{total}}} \\
P_{\text{tasks}} &= \left( \frac{\sum T_{\text{completed}}}{\sum T_{\text{total}}} \right) \times 100
\end{aligned}$$

---

### 5. Adverse Impact Ratio (Four-Fifths Rule)

$$\text{Adverse Impact Ratio} = \frac{\text{Selection Rate of Protected Group}}{\text{Selection Rate of Highest Group}}$$

$$\text{Compliance Check: } \text{If } \text{Ratio} \ge 0.80 \implies \text{Compliant; Else } \implies \text{Flagged for Administrative Audit}$$

---

## 7. Comprehensive REST API Reference

### Authentication & Profiles
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `ALL` | `/api/auth/[...all]` | Public | Better Auth authentication catch-all endpoint |
| `GET` | `/api/health` | Public | System, MongoDB, and Gemini AI health monitoring |
| `GET` | `/api/student/profile` | Student | Retrieves authenticated student profile |
| `PUT` | `/api/student/profile` | Student | Updates student profile with Zod schema validation |

### Opportunities & Intelligence
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

### Application Tracking System (ATS)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/applications` | Student | Retrieves all saved and submitted applications |
| `POST` | `/api/applications` | Student | Records a new application submission or bookmark |
| `PATCH` | `/api/applications/[applicationId]` | Student | Updates application stage (e.g., Interviewing) |
| `GET` | `/api/applications/statistics` | Student | Summary metrics on response times and conversion |

### Administrative Console & Auditing
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | High-level system counts and active user statistics |
| `GET` | `/api/admin/analytics/overview` | Admin | Comprehensive student, opportunity, and matching metrics |
| `GET` | `/api/admin/analytics/fairness` | Admin | Demographic parity and Four-Fifths compliance audit |
| `GET` | `/api/admin/analytics/export` | Admin | Sanitized CSV export across platform analytics domains |
| `POST` | `/api/admin/opportunities` | Admin | Creates new verified opportunity listing |
| `PUT` | `/api/admin/opportunities/[id]` | Admin | Updates existing opportunity listing |
| `POST` | `/api/admin/opportunities/[id]/verify` | Admin | Approves or rejects submitted opportunity listing |
| `GET` | `/api/admin/audit-logs` | Admin | Queries compliance audit trail for administrative actions |

---

## 8. Database Architecture & Mongoose Models

The application persists data across **29 typed Mongoose models**:

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

---

## 9. Project Directory Structure

```text
nexskill-ai/
├── app/                                 # Next.js 16 App Router
│   ├── admin/                           # Administrative Console Pages
│   │   ├── analytics/                   # Platform & Fairness Monitoring Dashboard
│   │   ├── assessments/                 # Assessment Question & Exam Management
│   │   ├── dashboard/                   # Admin Operations Dashboard
│   │   ├── mentors/                     # Mentor Credential Verification
│   │   ├── opportunities/               # Opportunity CRUD, Publishing & Verification
│   │   ├── regional-analytics/          # Geospatial & Regional Demand Analytics
│   │   ├── regional-opportunities/      # Regional Internship Listings
│   │   └── training-centres/            # NSDC/PMKVY Centre Registry
│   ├── api/                             # REST API Endpoints (40+ Route Handlers)
│   ├── dashboard/                       # Student Portal Pages
│   │   ├── applications/                # Application Tracking System (ATS)
│   │   ├── assessments/                 # Timed Practical Skill Assessments
│   │   ├── career-comparison/           # Career Pathway Side-by-Side Comparison
│   │   ├── career-explorer/             # Standard Career Path Exploration
│   │   ├── career-simulator/            # What-If Skill Simulator
│   │   ├── companion/                   # Bilingual AI Career Companion (EN/HI)
│   │   ├── local-opportunities/         # Geospatial Radius Map & Regional Listings
│   │   ├── mentors/                     # Mentor & Alumni Discovery
│   │   ├── mentorship-requests/         # Outgoing Mentorship Request Pipeline
│   │   ├── mentorship-resources/        # Resources Shared by Mentors
│   │   ├── mentorship-sessions/         # Scheduled Mentorship Calendar
│   │   ├── recommendations/             # 7-Factor Explainable Smart Matches
│   │   ├── resume/                      # AI Resume Analyzer & Sync
│   │   ├── roadmap/                     # Personalized AI Learning Roadmap (DAG)
│   │   ├── skill-gap/                   # Labor Market Skill Gap Analyzer
│   │   └── skills-passport/             # Digital Skills Passport & Evidence
│   ├── login/                           # Better Auth Login Form
│   ├── mentor/                          # Dedicated Mentor Advisory Portal
│   ├── opportunities/                   # Public Directory of Job & Internship Listings
│   ├── passport/                        # Public Digital Skills Passport & QR Verification
│   ├── profile/                         # Multi-Section Student Profile Management
│   ├── register/                        # New Student Account Creation
│   ├── globals.css                      # Tailwind CSS v4 Theme & Design Tokens
│   ├── layout.tsx                       # Global Root Layout & Providers
│   └── page.tsx                         # Landing Page & 15-Module Overview
├── components/                          # Shared UI & Layout Primitives
│   ├── layout/                          # Navbar, Footer, AdminSidebar, StudentSidebar
│   ├── providers/                       # Sonner Toast & Context Providers
│   └── ui/                              # Button, Card, Badge, Avatar, Input Primitives
├── config/                              # Configuration & Environment Validation
│   ├── env.ts                           # Zod-Validated Environment Variable Schema
│   └── site.ts                          # Site Navigation Links & Brand Metadata
├── features/                            # Modular Domain-Driven Feature Packages
├── hooks/                               # Custom React Hooks (useAuth, useMediaQuery)
├── lib/                                 # Shared Infrastructure Libraries
│   ├── auth.ts                          # Better Auth Configuration & MongoDB Adapter
│   ├── auth-client.ts                   # Client-Side Authentication Provider
│   ├── db/                              # MongoDB Connection Pooling & Mongoose Connection
│   ├── gemini.ts                        # Google Gemini GenAI SDK Client Initialization
│   └── utils.ts                         # Tailwind Class Merging & Formatting Utilities
├── models/                              # Mongoose Schemas & TypeScript Model Definitions (29 models)
├── public/                              # Static Assets, Icons, and Logos
├── scripts/                             # Database Seeders & Automated Verification Suites
├── services/                            # Server-Side Business Logic & Deterministic Engines
├── types/                               # TypeScript Type Definitions & Domain Interfaces
├── package.json                         # Project Manifest & Automated Test Scripts
└── tsconfig.json                        # Strict TypeScript Compiler Configuration
```

---

## 10. Getting Started & Installation

### Prerequisites
* **Node.js:** `v20.x` or `v22.x` (or newer)
* **Package Manager:** `npm` (included with Node.js)
* **MongoDB:** A running MongoDB instance (Local: `mongodb://localhost:27017` or MongoDB Atlas URI)
* **Google Gemini API Key:** An active key from [Google AI Studio](https://aistudio.google.com/)

### Step-by-Step Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/nexskill-ai/nexskill-ai.git
   cd nexskill-ai
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local` with your MongoDB URI and Gemini API key (see [Environment Variables Reference](#11-environment-variables-reference)).*

4. **Seed Database with Sample Opportunities & Demo Users:**
   ```bash
   # Seed 35 sample opportunities (Internships, Jobs, Skill Programs)
   npm run seed:opportunities

   # Seed pre-configured Demo Student, Mentor, and Admin accounts
   npm run seed:demo-users
   ```

5. **Start the Next.js Development Server:**
   ```bash
   npm run dev
   ```

6. **Access the Application:**
   * **Local Environment:** Open your browser and navigate to `http://localhost:3000`.
   * **Live Production Deployment:** Access immediately at **[https://team-definite-winners.vercel.app/](https://team-definite-winners.vercel.app/)**.

---

## 11. Environment Variables Reference

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/careerbridge-ai` | MongoDB connection string (Atlas or Local) |
| `BETTER_AUTH_SECRET` | **Yes** | *32+ character random string* | Secret key for signing session tokens and cookies |
| `BETTER_AUTH_URL` | **Yes** | `http://localhost:3000` | Canonical application base URL for auth callbacks |
| `GEMINI_API_KEY` | **Yes** | *None* | Google AI Studio Gemini API key (`@google/genai`) |
| `GEMINI_MODEL` | No | `gemini-3.8-flash` | Target Gemini model identifier for AI services |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public URL used for passport links and QR payloads |

---

## 12. Seeding & Demo Credentials

> [!TIP]
> You can test all features on the live production deployment using these pre-configured accounts:  
> **Direct Login:** [https://team-definite-winners.vercel.app/login](https://team-definite-winners.vercel.app/login)

The database seeder (`npm run seed:demo-users`) provisions ready-to-test accounts across all roles:

| Role | Email Address | Password | Intended Test Functionality |
|---|---|---|---|
| **Student** | `student@careerbridge.ai` | `Password123!` | Complete student portal, smart matches, roadmaps, passport |
| **Alternate Student** | `akash@gmail.com` | `Akash@123` | Secondary student profile for multi-user application testing |
| **Administrator** | `admin@careerbridge.ai` | `Password123!` | Full administrative dashboard, fairness audits, opportunity CRUD |
| **Mentor** | *Auto-seeded in mentor catalog* | `Password123!` | Mentor dashboard, session management, availability scheduler |

To promote any registered user account to Administrator:
```bash
node scripts/promote-admin.mjs your-email@domain.com
```

---

## 13. Security, Privacy & Responsible AI Standards

1. **Demographic Neutrality & Fairness Protection:**
   * Candidate demographic factors (gender, caste, religion, income, disability) are never ingested by matching and ranking algorithms.
   * Educational pedigree (institutional rank/tier) is strictly excluded from scoring formulas to guarantee equal opportunity for tier-2/tier-3 talent.
   * The Admin Fairness Dashboard continuously monitors adverse impact ratios using the EEOC Four-Fifths compliance standard.
2. **Student Privacy & Public Sharing Governance:**
   * Student resumes are processed in-memory via temporary streams; unapproved files are never saved permanently.
   * Digital Skills Passports remain private by default; public viewing links are enabled only via explicit student opt-in and can be revoked at any time.
3. **Tamper-Evident Credential Architecture:**
   * Public passport verification endpoints (`/passport/[publicId]/verification`) validate assessment scores against cryptographically logged attempts, preventing credential forgery.
4. **Resilient AI Failure Modes:**
   * Every LLM call to Google Gemini is wrapped in a deterministic fallback layer. Network drops, invalid outputs, or API quota exhaustion automatically trigger schema-compliant fallback responses, ensuring 100% platform availability.

---

## 14. License & Acknowledgments

This project is developed for **Problem Statement 22 (PS-22)**: *AI-Powered Campus-to-Employment Opportunity Matcher*.

* **Framework:** [Next.js by Vercel](https://nextjs.org/)
* **AI Models & SDK:** [Google DeepMind Gemini API (`@google/genai`)](https://ai.google.dev/)
* **Authentication:** [Better Auth](https://www.better-auth.com/)
* **Geospatial Mapping:** [Leaflet](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/)
* **Icons:** [Lucide Icons](https://lucide.dev/)

---
*Built with ❤️ to bridge talent with opportunity.*

