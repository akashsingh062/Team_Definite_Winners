/**
 * Skill Normalizer for CareerBridge AI.
 * Normalizes skill strings, resolves aliases, handles casing and punctuation,
 * and maintains strict distinction between non-equivalent skills (e.g. Java !== JavaScript).
 */

const SKILL_ALIASES: Record<string, string> = {
  // JavaScript & TypeScript
  js: "JavaScript",
  javascript: "JavaScript",
  ecmascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",

  // Python
  py: "Python",
  python: "Python",
  python3: "Python",

  // Java & Kotlin
  java: "Java",
  kotlin: "Kotlin",

  // C / C++ / C#
  c: "C",
  cpp: "C++",
  "c++": "C++",
  "c plus plus": "C++",
  csharp: "C#",
  "c#": "C#",
  "c sharp": "C#",

  // Go / Rust / PHP / Ruby
  golang: "Go",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",

  // Frontend Libraries & Frameworks
  react: "React",
  reactjs: "React",
  "react.js": "React",
  next: "Next.js",
  nextjs: "Next.js",
  "next.js": "Next.js",
  vue: "Vue.js",
  vuejs: "Vue.js",
  "vue.js": "Vue.js",
  angular: "Angular",
  angularjs: "Angular",
  svelte: "Svelte",
  html: "HTML5",
  html5: "HTML5",
  css: "CSS3",
  css3: "CSS3",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  bootstrap: "Bootstrap",
  redux: "Redux",
  "redux toolkit": "Redux",

  // Backend Frameworks
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  express: "Express.js",
  expressjs: "Express.js",
  "express.js": "Express.js",
  nest: "NestJS",
  nestjs: "NestJS",
  django: "Django",
  drf: "Django REST Framework",
  "django rest framework": "Django REST Framework",
  flask: "Flask",
  fastapi: "FastAPI",
  spring: "Spring Boot",
  springboot: "Spring Boot",
  "spring boot": "Spring Boot",
  graphql: "GraphQL",
  gql: "GraphQL",
  rest: "REST APIs",
  "rest api": "REST APIs",
  "restful api": "REST APIs",
  "rest apis": "REST APIs",

  // Databases & ORMs
  mongo: "MongoDB",
  mongodb: "MongoDB",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  psql: "PostgreSQL",
  mysql: "MySQL",
  redis: "Redis",
  sql: "SQL",
  sqlite: "SQLite",
  prisma: "Prisma",
  mongoose: "Mongoose",
  typeorm: "TypeORM",

  // Cloud & DevOps
  aws: "AWS",
  "amazon web services": "AWS",
  gcp: "GCP",
  "google cloud": "GCP",
  "google cloud platform": "GCP",
  azure: "Azure",
  "microsoft azure": "Azure",
  docker: "Docker",
  dockerfile: "Docker",
  k8s: "Kubernetes",
  kubernetes: "Kubernetes",
  vercel: "Vercel",
  firebase: "Firebase",
  ci: "CI/CD",
  "ci/cd": "CI/CD",
  cicd: "CI/CD",
  git: "Git",
  github: "Git",
  gitlab: "GitLab",
  linux: "Linux",

  // AI & Data Science
  ml: "Machine Learning",
  "machine learning": "Machine Learning",
  ai: "Artificial Intelligence",
  "artificial intelligence": "Artificial Intelligence",
  dl: "Deep Learning",
  "deep learning": "Deep Learning",
  nlp: "NLP",
  "natural language processing": "NLP",
  cv: "Computer Vision",
  "computer vision": "Computer Vision",
  pandas: "Pandas",
  numpy: "NumPy",
  scikit: "Scikit-Learn",
  "scikit-learn": "Scikit-Learn",
  tensorflow: "TensorFlow",
  pytorch: "PyTorch",

  // Testing & Quality
  jest: "Jest",
  cypress: "Cypress",
  playwright: "Playwright",
  selenium: "Selenium",
  qa: "QA Automation",
  "automated testing": "QA Automation",
};

/**
 * Cleans a skill string by lowercasing, trimming extra spaces, and stripping outer punctuation.
 */
function cleanSkillKey(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[,;.\s]+|[,;.\s]+$/g, "");
}

/**
 * Normalizes a skill string using canonical casing and alias mapping.
 */
export function normalizeSkill(rawSkill: string): string {
  if (!rawSkill) return "";
  const cleaned = cleanSkillKey(rawSkill);
  if (!cleaned) return "";

  // Check alias dictionary
  if (SKILL_ALIASES[cleaned]) {
    return SKILL_ALIASES[cleaned];
  }

  // Capitalize words as fallback for unknown terms
  return rawSkill
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 3 && word.toUpperCase() === word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Normalizes an array of skills, removes duplicates, and trims empty items.
 */
export function normalizeSkillList(skills: string[]): string[] {
  if (!Array.isArray(skills)) return [];

  const seen = new Set<string>();
  const normalizedList: string[] = [];

  for (const raw of skills) {
    const normalized = normalizeSkill(raw);
    if (!normalized) continue;

    const lowerKey = normalized.toLowerCase();
    if (!seen.has(lowerKey)) {
      seen.add(lowerKey);
      normalizedList.push(normalized);
    }
  }

  return normalizedList;
}

/**
 * Checks whether two skill strings refer to the same competency.
 */
export function areSkillsEquivalent(skillA: string, skillB: string): boolean {
  if (!skillA || !skillB) return false;
  return normalizeSkill(skillA).toLowerCase() === normalizeSkill(skillB).toLowerCase();
}

export { normalizeSkill as normalizeSkillName };

