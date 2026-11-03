import { getGeminiClient, DEFAULT_GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";
import { ISkillExplanation, IOpportunitySkillRef } from "@/types/skill-gap";

/**
 * Deterministic explanation fallback when Gemini API is unavailable or offline.
 */
export function getDeterministicSkillExplanation(
  skillName: string,
  category: string,
  relevantOpportunities: IOpportunitySkillRef[],
  targetRole?: string
): ISkillExplanation {
  const oppTitles = relevantOpportunities.map((o) => o.title).filter(Boolean);
  const oppListText =
    oppTitles.length > 0 ? oppTitles.slice(0, 3).join(", ") : "target roles";

  const whatMap: Record<string, string> = {
    React: "A declarative, component-based JavaScript UI library used to build responsive single-page web applications.",
    TypeScript: "A strongly typed superset of JavaScript that adds static typing, interfaces, and enhanced developer tooling.",
    "Node.js": "A cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser, commonly used for backend servers.",
    Python: "A versatile, high-level programming language known for readable syntax, widely used in backend engineering, data science, and AI.",
    MongoDB: "A document-oriented NoSQL database that stores data in flexible, JSON-like documents with dynamic schemas.",
    PostgreSQL: "An enterprise-grade open-source relational database supporting advanced SQL queries, ACID compliance, and relational integrity.",
    Docker: "An open platform for developing, shipping, and running applications in lightweight, isolated containers.",
    Git: "A distributed version control system designed to track changes in source code and enable multi-developer collaboration.",
    "Next.js": "A full-stack React framework featuring hybrid static & server rendering, file-based routing, and built-in optimization.",
    "Tailwind CSS": "A utility-first CSS framework providing low-level styling classes directly within HTML and JSX.",
  };

  const projectMap: Record<string, string> = {
    React: "Build an interactive task tracker or kanban board managing state across components with localStorage persistence.",
    TypeScript: "Refactor an existing JavaScript project to TypeScript with strict type checking, custom interfaces, and typed API responses.",
    "Node.js": "Develop a REST API with Express featuring user authentication, request validation, and CRUD endpoints connected to a database.",
    Python: "Create a CLI tool or web scraper with automated testing and structured output parsing.",
    MongoDB: "Design an e-commerce inventory schema with indexing and aggregation pipelines for order metrics.",
    PostgreSQL: "Build a multi-table relational schema with foreign key constraints, complex joins, and transaction management.",
    Docker: "Write a multi-stage Dockerfile for a Node.js or Python web app and run it with docker-compose.",
    Git: "Demonstrate git feature branching, pull request workflows, conflict resolution, and structured commit history.",
    "Next.js": "Build a responsive blog or documentation site using Next.js App Router, Server Components, and dynamic routing.",
    "Tailwind CSS": "Design a responsive landing page with dark mode toggle and accessible layout components.",
  };

  const conceptsMap: Record<string, string[]> = {
    React: ["JSX syntax", "Props & State", "useEffect & custom hooks", "Component lifecycle", "Context API"],
    TypeScript: ["Primitive types", "Interfaces vs Types", "Generics", "Union types", "Type narrowing"],
    "Node.js": ["Event loop", "Async/Await & Promises", "HTTP & Express routing", "Middleware", "Environment config"],
    Python: ["Data structures (lists, dicts)", "Object-oriented design", "Virtual environments", "Error handling", "Standard library"],
    MongoDB: ["Collections & Documents", "CRUD operations", "Indexing strategies", "Aggregation framework", "Mongoose schema modeling"],
    PostgreSQL: ["Relational schemas & normalization", "Primary & Foreign keys", "JOIN queries", "Indexes", "Transactions & ACID"],
    Docker: ["Containers vs Virtual Machines", "Dockerfiles & layers", "Docker images", "Port binding", "Docker Compose"],
    Git: ["Commit workflow", "Branching & Merging", "Merge conflict resolution", "Rebase", "Remote remotes & PRs"],
    "Next.js": ["App Router", "Server vs Client Components", "Route handlers", "Layouts & Templates", "Server Actions"],
    "Tailwind CSS": ["Utility classes", "Responsive breakpoints", "Flexbox & Grid utilities", "Theme configuration", "Custom plugins"],
  };

  const whatIsIt =
    whatMap[skillName] ||
    `${skillName} is a core competency in ${category} widely required in industry software engineering.`;

  const whyItMatters =
    relevantOpportunities.length > 0
      ? `This skill is required by ${relevantOpportunities.length} of your selected opportunities (${oppListText}) and represents an important prerequisite for ${targetRole || "your target career path"}.`
      : `Mastering ${skillName} significantly expands your eligibility for technical roles and industry projects.`;

  const keyConcepts =
    conceptsMap[skillName] || [
      `Core syntax and architecture of ${skillName}`,
      "Best practices and coding conventions",
      "Debugging and error handling techniques",
      "Integration with other modern technologies",
    ];

  const suggestedProject =
    projectMap[skillName] ||
    `Build a practical showcase project that integrates ${skillName} into a working application and push it to your GitHub portfolio.`;

  return {
    skillName,
    whatIsIt,
    whyItMatters,
    keyConcepts,
    suggestedProject,
    relevantOpportunities: oppTitles,
  };
}

/**
 * Generates AI-assisted explanation for a missing skill gap, falling back to deterministic synthesis.
 */
export async function generateSkillGapExplanation(
  skillName: string,
  category: string,
  relevantOpportunities: IOpportunitySkillRef[],
  targetRole?: string
): Promise<ISkillExplanation> {
  const fallback = getDeterministicSkillExplanation(
    skillName,
    category,
    relevantOpportunities,
    targetRole
  );

  if (!isGeminiConfigured()) {
    return fallback;
  }

  try {
    const ai = getGeminiClient();
    const oppTitles = relevantOpportunities.map((o) => `${o.title} at ${o.companyName}`).join("; ");

    const prompt = `
You are NexSkill AI's explainable learning advisor. Explain why a student should learn the missing technical skill "${skillName}" (${category}).

Context:
- Target career role: ${targetRole || "Software Engineering"}
- Selected student opportunities requiring this skill: ${oppTitles || "Industry software roles"}

Output strictly a JSON object with this exact shape:
{
  "whatIsIt": "Clear 1-2 sentence description of what the skill is",
  "whyItMatters": "1-2 sentence explanation of why this skill is relevant to the selected opportunities",
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
  "suggestedProject": "A concrete, realistic beginner project idea the student can build and showcase on GitHub"
}

Security & Quality rules:
- Strictly fact-based technical definitions.
- Do NOT invent companies or qualifications.
- Do NOT output markdown code fences outside JSON.
`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text;
    if (!responseText) return fallback;

    let sanitizedJson = responseText.trim();
    if (sanitizedJson.startsWith("```json")) {
      sanitizedJson = sanitizedJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (sanitizedJson.startsWith("```")) {
      sanitizedJson = sanitizedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(sanitizedJson);

    return {
      skillName,
      whatIsIt: parsed.whatIsIt || fallback.whatIsIt,
      whyItMatters: parsed.whyItMatters || fallback.whyItMatters,
      keyConcepts: Array.isArray(parsed.keyConcepts) && parsed.keyConcepts.length > 0
        ? parsed.keyConcepts
        : fallback.keyConcepts,
      suggestedProject: parsed.suggestedProject || fallback.suggestedProject,
      relevantOpportunities: fallback.relevantOpportunities,
    };
  } catch (err) {
    console.warn(`Gemini explanation generation for "${skillName}" encountered an issue, using deterministic fallback:`, err);
    return fallback;
  }
}

