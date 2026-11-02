import crypto from "node:crypto";
import {
  IRoadmapMilestone,
  IRoadmapTask,
  IRoadmapAssignment,
  LearningPace,
} from "@/types/roadmap";
import { ISkillToSequence } from "./learning-sequencer";
import { getLearningResourcesForSkill } from "../skill-gap/learning-resource.service";
import { ILearningResource } from "@/types/skill-gap";

/**
 * Curated practical assignments for core skills.
 */
export const PRACTICAL_ASSIGNMENTS: Record<
  string,
  Omit<IRoadmapAssignment, "requiredSkills">
> = {
  React: {
    title: "Interactive Task & Workflow Manager",
    objective: "Master component hierarchy, state management with hooks, and conditional rendering.",
    description: "Build a responsive Kanban board or task tracker with customizable columns, localStorage persistence, and filter controls.",
    difficultyLevel: "beginner",
    expectedDeliverable: "GitHub repository with structured components, clean commit history, and a working demo.",
    completionCriteria: "Component state updates predictably, inputs are validated, and the UI adapts cleanly to mobile screens.",
  },
  TypeScript: {
    title: "Strict Type System Migration & Utility Library",
    objective: "Understand type safety, interfaces, generic functions, and compiler options.",
    description: "Refactor a JavaScript utility library to strict TypeScript. Add strongly typed API models, return types, and generic helper functions.",
    difficultyLevel: "intermediate",
    expectedDeliverable: "TypeScript package with tsconfig.json configured with strict mode and zero 'any' types.",
    completionCriteria: "Passes 'tsc --noEmit' with zero errors, includes union types, and exports reusable interfaces.",
  },
  "Node.js": {
    title: "Production-Ready RESTful API Service",
    objective: "Implement asynchronous event-driven backend services with middleware and routing.",
    description: "Design and implement a REST API with Express or native Node.js featuring request validation, centralized error handling, and environment config.",
    difficultyLevel: "intermediate",
    expectedDeliverable: "Backend repository with documented endpoints, environment configuration, and Postman/curl examples.",
    completionCriteria: "Endpoints handle HTTP status codes properly (200, 201, 400, 404, 500) and sanitize user inputs.",
  },
  Python: {
    title: "Automated Data Processing & CLI Pipeline",
    objective: "Demonstrate idiomatic Python, modular structure, data manipulation, and unit testing.",
    description: "Develop a command-line tool that ingests CSV or JSON data, performs aggregation and filtering, and outputs a formatted report.",
    difficultyLevel: "beginner",
    expectedDeliverable: "Python repository with virtual environment setup (requirements.txt/poetry), docstrings, and tests.",
    completionCriteria: "Script executes cleanly with CLI flags (--input, --output), handles invalid files gracefully, and passes tests.",
  },
  MongoDB: {
    title: "E-Commerce Database Schema & Aggregation Pipeline",
    objective: "Master NoSQL document modeling, indexing strategies, and multi-stage aggregation queries.",
    description: "Design collections for products, users, and orders. Create compound indexes and write an aggregation pipeline to compute revenue by category.",
    difficultyLevel: "intermediate",
    expectedDeliverable: "MongoDB schema scripts or Mongoose models along with documented aggregation queries.",
    completionCriteria: "Indexes are properly applied to query filters, queries use $lookup and $group effectively, and documents are well-structured.",
  },
  PostgreSQL: {
    title: "Relational Schema Design & Transaction Management",
    objective: "Learn database normalization, complex SQL joins, foreign key constraints, and ACID transactions.",
    description: "Create a database schema for an academic or booking platform. Write SQL migration scripts, multi-table JOIN queries, and a transaction for concurrent bookings.",
    difficultyLevel: "intermediate",
    expectedDeliverable: "SQL schema migration file, seed data script, and queries demonstrating transaction rollback on failure.",
    completionCriteria: "Primary/foreign keys ensure referential integrity, queries are optimized, and transactions commit or rollback reliably.",
  },
  Docker: {
    title: "Multi-Container Application Containerization",
    objective: "Containerize modern full-stack web applications and manage development services.",
    description: "Write an optimized, multi-stage Dockerfile for a web app and create a docker-compose.yml file linking the application with a database service.",
    difficultyLevel: "intermediate",
    expectedDeliverable: "Working Dockerfile and docker-compose.yml with volume mounting and environment variable configurations.",
    completionCriteria: "Application starts with 'docker compose up', persists database data across container restarts, and produces minimal image sizes.",
  },
  "Next.js": {
    title: "Modern Full-Stack Portal with App Router",
    objective: "Leverage React Server Components, streaming, server actions, and dynamic route handlers.",
    description: "Build a responsive web application using Next.js App Router featuring server-rendered pages, metadata optimization, and client interactivity.",
    difficultyLevel: "intermediate",
    expectedDeliverable: "Next.js codebase deployed to Vercel or running locally with production build passing cleanly.",
    completionCriteria: "Uses server components where appropriate, handles loading states with Suspense/loading.tsx, and passes 'npm run build'.",
  },
  "Tailwind CSS": {
    title: "Accessible Responsive Component System",
    objective: "Master utility-first CSS, mobile-first breakpoints, and theme customization.",
    description: "Design a reusable dashboard interface with responsive grid layouts, interactive modal dialogs, and accessible navigation menus.",
    difficultyLevel: "beginner",
    expectedDeliverable: "Responsive web interface tested across mobile, tablet, and desktop viewports.",
    completionCriteria: "Zero horizontal overflow on mobile, accessible contrast ratios, and clean semantic markup.",
  },
  Git: {
    title: "Collaborative Git Workflow & Branching Strategy",
    objective: "Master feature branching, interactive rebasing, merge conflict resolution, and pull requests.",
    description: "Create a GitHub repository, establish a git workflow with feature branches, simulate a merge conflict, and resolve it cleanly with rebase.",
    difficultyLevel: "beginner",
    expectedDeliverable: "GitHub repository showing structured commit messages, closed pull requests, and branch histories.",
    completionCriteria: "Commit messages follow conventional commits, conflicts are cleanly resolved without accidental code deletion.",
  },
};

/**
 * Standard learning objectives for common technologies.
 */
export const DEFAULT_OBJECTIVES: Record<string, string[]> = {
  React: [
    "Understand React component architecture and JSX syntax",
    "Master state management with useState and side effects with useEffect",
    "Pass data efficiently using props and custom hooks",
    "Build accessible, responsive UI components with clean lifecycle handling",
  ],
  TypeScript: [
    "Configure TypeScript compiler and understand basic primitive types",
    "Define custom interfaces, type aliases, and union types",
    "Implement generic functions and reusable type constraints",
    "Integrate TypeScript with React components and API contracts",
  ],
  "Node.js": [
    "Understand the Node.js asynchronous event loop and runtime APIs",
    "Build modular RESTful API endpoints using Express",
    "Handle request validation, authentication, and HTTP status codes",
    "Connect Node.js applications to databases and manage environment secrets",
  ],
  Python: [
    "Write idiomatic Python using standard data structures (lists, dicts, sets)",
    "Implement object-oriented design and modular package structures",
    "Handle file I/O, error handling, and external package management",
    "Write automated unit tests to verify algorithmic logic",
  ],
  MongoDB: [
    "Understand document-oriented NoSQL architecture vs relational databases",
    "Perform CRUD operations using MongoDB shell and Mongoose ODM",
    "Create single and compound indexes to optimize query performance",
    "Construct multi-stage aggregation pipelines for data analytics",
  ],
  PostgreSQL: [
    "Design 3NF relational schemas with primary and foreign key constraints",
    "Write complex SELECT queries using INNER, LEFT, and FULL JOINs",
    "Manage database transactions ensuring ACID compliance and rollback",
    "Optimize queries using EXPLAIN ANALYZE and strategic indexing",
  ],
  Docker: [
    "Understand container isolation, images, and container registries",
    "Write efficient multi-stage Dockerfiles for web applications",
    "Configure docker-compose for multi-service environments",
    "Manage container networking, port binding, and volume persistence",
  ],
  "Next.js": [
    "Understand App Router architecture and React Server Components (RSC)",
    "Implement dynamic route segments and nested layouts",
    "Fetch data efficiently using server actions and route handlers",
    "Optimize Core Web Vitals, images, fonts, and streaming with Suspense",
  ],
  "Tailwind CSS": [
    "Master utility classes for layout, flexbox, CSS grid, and typography",
    "Implement mobile-first responsive design breakpoints",
    "Customize theme colors, spacing, and dark mode variations",
    "Build accessible and reusable UI components without stylesheet bloat",
  ],
};

/**
 * Generates structured learning tasks for a milestone.
 */
export function generateMilestoneTasks(
  skillName: string,
  milestoneId: string
): IRoadmapTask[] {
  return [
    {
      id: `${milestoneId}-t1`,
      title: `Study core documentation and fundamental concepts of ${skillName}`,
      description: `Read official documentation and explore syntax, core architectural patterns, and setup.`,
      isCompleted: false,
    },
    {
      id: `${milestoneId}-t2`,
      title: `Complete interactive tutorials and hands-on coding exercises`,
      description: `Work through guided coding exercises to solidify understanding of key patterns.`,
      isCompleted: false,
    },
    {
      id: `${milestoneId}-t3`,
      title: `Build practical coding assignment for ${skillName}`,
      description: `Apply your knowledge by implementing the milestone project assignment.`,
      isCompleted: false,
    },
    {
      id: `${milestoneId}-t4`,
      title: `Review code, write documentation, and push repository to GitHub`,
      description: `Ensure clean formatting, verify deliverable criteria, and document your learning in your portfolio.`,
      isCompleted: false,
    },
  ];
}

/**
 * Deterministically generates weekly milestones for an ordered list of skills.
 */
export async function generateMilestonesForSkills(
  sequencedSkills: ISkillToSequence[],
  studyHoursPerDay: number = 2,
  studyDaysPerWeek: number = 5,
  learningPace: LearningPace = "moderate"
): Promise<{ milestones: IRoadmapMilestone[]; totalHours: number }> {
  const weeklyHours = studyHoursPerDay * studyDaysPerWeek;

  // Pace multiplier adjusts how many hours are allocated per skill
  const paceMultiplier =
    learningPace === "relaxed" ? 0.8 : learningPace === "intensive" ? 1.3 : 1.0;

  const milestones: IRoadmapMilestone[] = [];
  let currentWeek = 1;
  let totalHours = 0;

  for (let i = 0; i < sequencedSkills.length; i++) {
    const item = sequencedSkills[i];
    const skillName = item.skillName;
    const milestoneId = `milestone-${i + 1}-${crypto.randomBytes(3).toString("hex")}`;

    // Base estimated hours per skill based on priority and pace
    const baseHours =
      item.priority === "critical" ? 14 : item.priority === "high" ? 10 : 8;
    const estimatedHours = Math.round(baseHours * paceMultiplier);
    totalHours += estimatedHours;

    // Fetch learning resources from DB / curated list
    const resources = await getLearningResourcesForSkill(skillName, 3);
    const resourceIds = resources.map((r) => r.id || r._id || "").filter(Boolean);

    // Objectives
    const objectives =
      DEFAULT_OBJECTIVES[skillName] || [
        `Understand core principles and terminology of ${skillName}`,
        `Write clean, modular code utilizing ${skillName} best practices`,
        `Debug common issues and integrate ${skillName} into application workflows`,
        `Demonstrate practical knowledge through a showcase project`,
      ];

    // Assignment
    let assignment: IRoadmapAssignment | undefined = undefined;
    if (PRACTICAL_ASSIGNMENTS[skillName]) {
      assignment = {
        ...PRACTICAL_ASSIGNMENTS[skillName],
        requiredSkills: [skillName],
      };
    } else {
      assignment = {
        title: `${skillName} Showcase Project`,
        objective: `Demonstrate practical competence in ${skillName}.`,
        description: `Build a small but functional project that demonstrates core ${skillName} capabilities and error handling.`,
        requiredSkills: [skillName],
        difficultyLevel: "beginner",
        expectedDeliverable: `GitHub repository with code and README explaining how ${skillName} is used.`,
        completionCriteria: `Code executes without errors and demonstrates clean separation of concerns.`,
      };
    }

    const tasks = generateMilestoneTasks(skillName, milestoneId);

    milestones.push({
      id: milestoneId,
      title: `Week ${currentWeek}: Master ${skillName}`,
      description: `Acquire core competencies in ${skillName} required by your target career opportunities.`,
      skillName,
      weekNumber: currentWeek,
      objectives,
      tasks,
      resourceIds,
      resources,
      assignment,
      estimatedDuration: `${estimatedHours} hours (Week ${currentWeek})`,
      estimatedHours,
      priority: item.priority,
      status: i === 0 ? "in_progress" : "not_started",
      startedAt: i === 0 ? new Date() : null,
      completedAt: null,
      notes: "",
    });

    currentWeek++;
  }

  return { milestones, totalHours };
}

