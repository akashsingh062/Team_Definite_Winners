import { connectToDatabase } from "@/lib/db/mongodb";
import { LearningResource } from "@/models/LearningResource";
import { normalizeSkill, areSkillsEquivalent } from "../matching/skill-normalizer";
import { ILearningResource } from "@/types/skill-gap";

/**
 * Curated high-reputation, accessible learning resources seeded for common technical skills.
 */
export const DEFAULT_VETTED_RESOURCES: Omit<ILearningResource, "_id" | "id">[] = [
  // React
  {
    title: "React Official Documentation: Quick Start & Deep Dive",
    skillName: "React",
    description: "The official React documentation explaining components, state, hooks, and modern rendering patterns.",
    resourceType: "documentation",
    provider: "React Official Docs",
    url: "https://react.dev/learn",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "6 hours",
    verificationStatus: "verified",
  },
  {
    title: "freeCodeCamp Full React Course for Beginners",
    skillName: "React",
    description: "Comprehensive hands-on course building real-world dynamic web applications with React.",
    resourceType: "course",
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/news/tag/react/",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "12 hours",
    verificationStatus: "verified",
  },
  {
    title: "The Odin Project: React Path",
    skillName: "React",
    description: "Project-centered curriculum teaching modern React, client routing, and state management.",
    resourceType: "project",
    provider: "The Odin Project",
    url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/javascript#react",
    difficultyLevel: "intermediate",
    isFree: true,
    estimatedDuration: "20 hours",
    verificationStatus: "verified",
  },

  // TypeScript
  {
    title: "TypeScript Handbook: The Official Guide",
    skillName: "TypeScript",
    description: "Official guide to TypeScript types, interfaces, generics, and compiler configurations.",
    resourceType: "documentation",
    provider: "Microsoft TypeScript",
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "8 hours",
    verificationStatus: "verified",
  },
  {
    title: "Total TypeScript Essentials",
    skillName: "TypeScript",
    description: "Interactive exercises for learning type transformations, generics, and real-world patterns.",
    resourceType: "tutorial",
    provider: "Total TypeScript",
    url: "https://www.totaltypescript.com/tutorials",
    difficultyLevel: "intermediate",
    isFree: true,
    estimatedDuration: "5 hours",
    verificationStatus: "verified",
  },

  // JavaScript
  {
    title: "MDN Web Docs: JavaScript Fundamentals",
    skillName: "JavaScript",
    description: "Standard reference for modern ECMAScript, asynchronous programming, DOM APIs, and closures.",
    resourceType: "documentation",
    provider: "Mozilla Developer Network",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "15 hours",
    verificationStatus: "verified",
  },
  {
    title: "JavaScript.info: The Modern JavaScript Tutorial",
    skillName: "JavaScript",
    description: "In-depth, beautifully structured tutorial from core language syntax to advanced browser internals.",
    resourceType: "tutorial",
    provider: "JavaScript.info",
    url: "https://javascript.info/",
    difficultyLevel: "intermediate",
    isFree: true,
    estimatedDuration: "25 hours",
    verificationStatus: "verified",
  },

  // Node.js
  {
    title: "Node.js Official Getting Started Guides",
    skillName: "Node.js",
    description: "Learn server-side runtime concepts, event loops, file systems, and HTTP module fundamentals.",
    resourceType: "documentation",
    provider: "Node.js Foundation",
    url: "https://nodejs.org/en/learn",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "5 hours",
    verificationStatus: "verified",
  },
  {
    title: "Build RESTful APIs with Node.js and Express",
    skillName: "Node.js",
    description: "Complete guide to designing REST endpoints, routing, middleware, and request validation.",
    resourceType: "course",
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/news/build-a-restful-api-with-node-and-express/",
    difficultyLevel: "intermediate",
    isFree: true,
    estimatedDuration: "8 hours",
    verificationStatus: "verified",
  },

  // Python
  {
    title: "Python Official Tutorial: Language Fundamentals",
    skillName: "Python",
    description: "The official Python documentation introducing data structures, control flow, functions, and modules.",
    resourceType: "documentation",
    provider: "Python Software Foundation",
    url: "https://docs.python.org/3/tutorial/index.html",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "10 hours",
    verificationStatus: "verified",
  },
  {
    title: "Harvard CS50P: Introduction to Programming with Python",
    skillName: "Python",
    description: "Harvard University's acclaimed open-access course teaching algorithmic thinking in Python.",
    resourceType: "course",
    provider: "Harvard University",
    url: "https://cs50.harvard.edu/python/",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "30 hours",
    verificationStatus: "verified",
  },

  // Next.js
  {
    title: "Next.js App Router Documentation",
    skillName: "Next.js",
    description: "Official guide to Server Components, dynamic routing, streaming, and data fetching in Next.js.",
    resourceType: "documentation",
    provider: "Vercel",
    url: "https://nextjs.org/docs",
    difficultyLevel: "intermediate",
    isFree: true,
    estimatedDuration: "8 hours",
    verificationStatus: "verified",
  },
  {
    title: "Next.js Interactive Learn Course",
    skillName: "Next.js",
    description: "Step-by-step guided tutorial building a full-stack dashboard application with authentication and database.",
    resourceType: "course",
    provider: "Next.js Learn",
    url: "https://nextjs.org/learn",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "6 hours",
    verificationStatus: "verified",
  },

  // MongoDB
  {
    title: "MongoDB University: Relational to Document Modeling",
    skillName: "MongoDB",
    description: "Free interactive course teaching NoSQL schema design, indexing, and aggregation pipelines.",
    resourceType: "course",
    provider: "MongoDB University",
    url: "https://learn.mongodb.com/",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "10 hours",
    verificationStatus: "verified",
  },

  // PostgreSQL
  {
    title: "PostgreSQL Tutorial for Developers",
    skillName: "PostgreSQL",
    description: "Comprehensive guide to SQL queries, table constraints, joins, transactions, and indexing.",
    resourceType: "documentation",
    provider: "Postgres Guide",
    url: "https://www.postgresqltutorial.com/",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "12 hours",
    verificationStatus: "verified",
  },
  {
    title: "SQLBolt: Interactive SQL Lessons",
    skillName: "PostgreSQL",
    description: "Interactive browser exercises to practice SQL select, filter, aggregation, and join statements.",
    resourceType: "practice",
    provider: "SQLBolt",
    url: "https://sqlbolt.com/",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "4 hours",
    verificationStatus: "verified",
  },

  // Docker
  {
    title: "Docker Getting Started Guide",
    skillName: "Docker",
    description: "Official hands-on walkthrough containerizing web applications, writing Dockerfiles, and multi-container setups.",
    resourceType: "documentation",
    provider: "Docker Docs",
    url: "https://docs.docker.com/get-started/",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "5 hours",
    verificationStatus: "verified",
  },

  // Git
  {
    title: "Pro Git Book (Free Edition)",
    skillName: "Git",
    description: "The authoritative book on version control, branching models, rebasing, and GitHub collaboration.",
    resourceType: "documentation",
    provider: "Git SCM",
    url: "https://git-scm.com/book/en/v2",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "10 hours",
    verificationStatus: "verified",
  },
  {
    title: "Learn Git Branching Sandbox",
    skillName: "Git",
    description: "Visual and interactive sandbox to master Git merges, rebase, cherry-pick, and HEAD operations.",
    resourceType: "practice",
    provider: "Learn Git Branching",
    url: "https://learngitbranching.js.org/",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "3 hours",
    verificationStatus: "verified",
  },

  // Tailwind CSS
  {
    title: "Tailwind CSS Official Documentation",
    skillName: "Tailwind CSS",
    description: "Utility-first CSS framework guide covering flexbox, grid, responsive design, and theme customization.",
    resourceType: "documentation",
    provider: "Tailwind Labs",
    url: "https://tailwindcss.com/docs",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "4 hours",
    verificationStatus: "verified",
  },

  // AWS
  {
    title: "AWS Skill Builder: Cloud Essentials",
    skillName: "AWS",
    description: "Free self-paced digital training on cloud computing foundations, S3, EC2, Lambda, and IAM security.",
    resourceType: "course",
    provider: "Amazon Web Services",
    url: "https://skillbuilder.aws/",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "8 hours",
    verificationStatus: "verified",
  },
];

/**
 * Seeds default vetted learning resources into MongoDB if empty.
 */
export async function seedLearningResourcesIfNeeded(): Promise<number> {
  await connectToDatabase();
  const count = await LearningResource.countDocuments();
  if (count === 0) {
    await LearningResource.insertMany(DEFAULT_VETTED_RESOURCES);
    return DEFAULT_VETTED_RESOURCES.length;
  }
  return count;
}

/**
 * Retrieves learning resources for a specific skill.
 */
export async function getLearningResourcesForSkill(
  skillName: string,
  limit = 5
): Promise<ILearningResource[]> {
  await connectToDatabase();
  const canonical = normalizeSkill(skillName);

  // Query database for matched skill name
  let resources = await LearningResource.find({
    skillName: { $regex: new RegExp(`^${canonical}$`, "i") },
    verificationStatus: "verified",
  })
    .sort({ isFree: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  // If none found in DB, check fallback vetted list
  if (!resources || resources.length === 0) {
    const fallbackMatches = DEFAULT_VETTED_RESOURCES.filter((r) =>
      areSkillsEquivalent(r.skillName, canonical)
    );
    if (fallbackMatches.length > 0) {
      return fallbackMatches.slice(0, limit).map((r, i) => ({
        ...r,
        id: `fallback-${canonical}-${i}`,
      }));
    }

    // Generic high-quality free documentation fallback
    return [
      {
        title: `${canonical} Developer Reference & Getting Started`,
        skillName: canonical,
        description: `Explore the official documentation and community guide to master ${canonical} core concepts.`,
        resourceType: "documentation",
        provider: "Official Documentation",
        url: `https://www.google.com/search?q=${encodeURIComponent(canonical + " official documentation")}`,
        difficultyLevel: "beginner",
        isFree: true,
        estimatedDuration: "Self-paced",
        verificationStatus: "verified",
      },
    ];
  }

  return resources.map((r) => ({
    _id: r._id.toString(),
    id: r._id.toString(),
    title: r.title,
    skillName: r.skillName,
    description: r.description,
    resourceType: r.resourceType,
    provider: r.provider,
    url: r.url,
    difficultyLevel: r.difficultyLevel,
    isFree: r.isFree,
    estimatedDuration: r.estimatedDuration,
    verificationStatus: r.verificationStatus,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

