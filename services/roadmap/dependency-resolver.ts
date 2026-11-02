import { normalizeSkill, areSkillsEquivalent } from "../matching/skill-normalizer";

/**
 * Standard industry prerequisite graph.
 * Key: Canonical skill name.
 * Value: Array of canonical prerequisite skill names that should be learned beforehand.
 */
export const DEFAULT_SKILL_DEPENDENCIES: Record<string, string[]> = {
  // Frontend
  React: ["JavaScript"],
  TypeScript: ["JavaScript"],
  "Next.js": ["React", "JavaScript"],
  Vue: ["JavaScript"],
  Angular: ["TypeScript", "JavaScript"],
  Redux: ["React", "JavaScript"],
  "Tailwind CSS": ["CSS", "HTML"],
  HTML5: [],
  CSS3: [],

  // Backend
  "Node.js": ["JavaScript"],
  Express: ["Node.js", "JavaScript"],
  NestJS: ["TypeScript", "Node.js"],
  Django: ["Python"],
  FastAPI: ["Python"],
  Flask: ["Python"],
  "Spring Boot": ["Java"],

  // Databases & ORMs
  MongoDB: [],
  PostgreSQL: [],
  MySQL: [],
  Redis: [],
  Prisma: ["TypeScript"],
  Mongoose: ["MongoDB", "Node.js"],

  // DevOps & Cloud
  Docker: ["Linux"],
  Kubernetes: ["Docker"],
  AWS: [],
  GCP: [],
  Azure: [],
  "CI/CD": ["Git"],

  // Tooling & Foundations
  Git: [],
  Linux: [],
  REST: [],
  GraphQL: ["REST"],
};

/**
 * Detects whether a directed graph contains a cycle starting from a given node.
 */
function hasCycleDFS(
  node: string,
  graph: Map<string, string[]>,
  visited: Set<string>,
  recursionStack: Set<string>
): boolean {
  visited.add(node);
  recursionStack.add(node);

  const neighbors = graph.get(node) || [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      if (hasCycleDFS(neighbor, graph, visited, recursionStack)) {
        return true;
      }
    } else if (recursionStack.has(neighbor)) {
      return true; // Cycle detected
    }
  }

  recursionStack.delete(node);
  return false;
}

/**
 * Checks if a dependency graph contains any cycles.
 */
export function detectCircularDependencies(
  dependencies: Record<string, string[]>
): { hasCycle: boolean; cycleNodes: string[] } {
  const graph = new Map<string, string[]>();

  for (const [skill, prereqs] of Object.entries(dependencies)) {
    const canonicalSkill = normalizeSkill(skill);
    const canonicalPrereqs = prereqs.map((p) => normalizeSkill(p));
    graph.set(canonicalSkill, canonicalPrereqs);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycleNodes: string[] = [];

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      if (hasCycleDFS(node, graph, visited, recursionStack)) {
        cycleNodes.push(node);
      }
    }
  }

  return {
    hasCycle: cycleNodes.length > 0,
    cycleNodes,
  };
}

/**
 * Resolves dependencies and returns a logically sequenced array of skills using topological sorting.
 * If multiple skills have their prerequisites met, higher priority/weight skills are scheduled first.
 * If cycles are detected, they are gracefully broken to prevent infinite loops.
 */
export function resolveSkillDependencies(
  skillsToLearn: string[],
  customDependencies: Record<string, string[]> = DEFAULT_SKILL_DEPENDENCIES,
  skillWeights: Map<string, number> = new Map()
): string[] {
  if (skillsToLearn.length <= 1) {
    return skillsToLearn;
  }

  // Normalize all input skills
  const normalizedInputs = Array.from(
    new Set(skillsToLearn.map((s) => normalizeSkill(s)).filter(Boolean))
  );

  // Build dependency subgraph restricted to input skills
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>(); // prereq -> dependents

  for (const skill of normalizedInputs) {
    inDegree.set(skill, 0);
    adjList.set(skill, []);
  }

  for (const skill of normalizedInputs) {
    // Find prerequisites for this skill
    let prereqs: string[] = [];
    for (const [depKey, depPrereqs] of Object.entries(customDependencies)) {
      if (areSkillsEquivalent(depKey, skill)) {
        prereqs = depPrereqs;
        break;
      }
    }

    for (const p of prereqs) {
      // Find matching skill in our input set
      const matchingInput = normalizedInputs.find((inputSkill) =>
        areSkillsEquivalent(inputSkill, p)
      );

      if (matchingInput && matchingInput !== skill) {
        // matchingInput must be learned BEFORE skill
        adjList.get(matchingInput)!.push(skill);
        inDegree.set(skill, (inDegree.get(skill) || 0) + 1);
      }
    }
  }

  // Helper to sort ready queue by priority weight (higher weight first)
  const getWeight = (s: string) => skillWeights.get(s.toLowerCase()) || 0;

  // Kahn's algorithm with priority ordering
  let queue: string[] = [];
  for (const [skill, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(skill);
    }
  }

  queue.sort((a, b) => getWeight(b) - getWeight(a));

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    const neighbors = adjList.get(current) || [];
    for (const neighbor of neighbors) {
      const updatedDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, updatedDegree);
      if (updatedDegree === 0) {
        queue.push(neighbor);
      }
    }

    // Keep queue prioritized as new skills become unlocked
    queue.sort((a, b) => getWeight(b) - getWeight(a));
  }

  // If cycle detected (some nodes were not processed because degree > 0), append remaining
  if (sorted.length < normalizedInputs.length) {
    for (const skill of normalizedInputs) {
      if (!sorted.includes(skill)) {
        sorted.push(skill);
      }
    }
  }

  return sorted;
}
