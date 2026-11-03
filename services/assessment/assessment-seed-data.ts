import {
  IAssessment,
  IAssessmentQuestion,
} from "@/types/assessment";

export const INITIAL_ASSESSMENTS_SEED: Array<
  Omit<IAssessment, "_id" | "id" | "createdAt" | "updatedAt">
> = [
  {
    title: "JavaScript Core & Asynchronous Runtime",
    subject: "JavaScript",
    description: "Evaluates closures, prototype inheritance, event loop, promises, and modern ES6+ paradigms.",
    durationMinutes: 25,
    totalMarks: 30,
    passingThreshold: 60,
    difficulty: "Mixed",
    topics: ["Closures", "Event Loop", "Promises & Async/Await", "Prototypes", "Scope"],
    questionCount: 6,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "React Architecture, Hooks & State Management",
    subject: "React",
    description: "Assesses component lifecycle, useEffect dependencies, custom hooks, rendering optimization, and context API.",
    durationMinutes: 25,
    totalMarks: 30,
    passingThreshold: 60,
    difficulty: "Mixed",
    topics: ["Hooks", "Lifecycle", "Virtual DOM", "State Management", "Performance"],
    questionCount: 6,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "HTML5 Semantic Structure & Web Accessibility",
    subject: "HTML",
    description: "Tests semantic markup, forms, accessibility (ARIA), SEO best practices, and document structure.",
    durationMinutes: 20,
    totalMarks: 25,
    passingThreshold: 60,
    difficulty: "Beginner",
    topics: ["Semantics", "Accessibility", "Forms", "Document Metadata"],
    questionCount: 5,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "Modern CSS, Flexbox, Grid & Responsive Design",
    subject: "CSS",
    description: "Validates CSS specificity, box model, Flexbox alignments, CSS Grid layouts, and responsive media queries.",
    durationMinutes: 20,
    totalMarks: 25,
    passingThreshold: 60,
    difficulty: "Mixed",
    topics: ["Box Model", "Flexbox", "Grid", "Specificity", "Responsive Design"],
    questionCount: 5,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "Node.js Architecture, Streams & Event-Driven I/O",
    subject: "Node.js",
    description: "Examines libuv event loop, buffer/streams, process management, file system I/O, and EventEmitter patterns.",
    durationMinutes: 25,
    totalMarks: 30,
    passingThreshold: 60,
    difficulty: "Intermediate",
    topics: ["Event Loop", "Streams & Buffers", "Modules", "Error Handling"],
    questionCount: 6,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "Express.js REST APIs & Middleware Architecture",
    subject: "Express.js",
    description: "Assesses routing, middleware chaining, error-handling middleware, request validation, and CORS security.",
    durationMinutes: 20,
    totalMarks: 25,
    passingThreshold: 60,
    difficulty: "Intermediate",
    topics: ["Routing", "Middleware", "Error Handling", "Security"],
    questionCount: 5,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "MongoDB Schema Design & Aggregation Pipelines",
    subject: "MongoDB",
    description: "Tests document modeling, indexing strategies, pipeline operators ($match, $group, $lookup), and ACID transactions.",
    durationMinutes: 25,
    totalMarks: 30,
    passingThreshold: 60,
    difficulty: "Mixed",
    topics: ["Aggregation", "Indexing", "Document Modeling", "CRUD"],
    questionCount: 6,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "Relational SQL, Joins & Query Optimization",
    subject: "SQL",
    description: "Validates complex JOINs, GROUP BY aggregations, window functions, indexing, and normalization forms.",
    durationMinutes: 25,
    totalMarks: 30,
    passingThreshold: 60,
    difficulty: "Mixed",
    topics: ["Joins", "Aggregation", "Subqueries", "Indexing & Normalization"],
    questionCount: 6,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "Python Data Structures, OOP & Functional Paradigms",
    subject: "Python",
    description: "Assesses lists/dictionaries, list comprehensions, decorators, generators, OOP inheritance, and magic methods.",
    durationMinutes: 25,
    totalMarks: 30,
    passingThreshold: 60,
    difficulty: "Mixed",
    topics: ["Data Structures", "Generators & Iterators", "Decorators", "OOP"],
    questionCount: 6,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "Java OOP, Collections Framework & Multithreading",
    subject: "Java",
    description: "Tests class hierarchy, interfaces, Collections API (List, Set, Map), memory management, and concurrent synchronization.",
    durationMinutes: 25,
    totalMarks: 30,
    passingThreshold: 60,
    difficulty: "Mixed",
    topics: ["OOP Principles", "Collections Framework", "Generics", "Concurrency"],
    questionCount: 6,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
  {
    title: "Data Structures & Algorithmic Problem Solving",
    subject: "Data Structures and Algorithms",
    description: "Validates Big-O complexity, binary search trees, graph traversals (BFS/DFS), dynamic programming, and sorting.",
    durationMinutes: 30,
    totalMarks: 35,
    passingThreshold: 60,
    difficulty: "Intermediate",
    topics: ["Big-O Complexity", "Trees & Graphs", "Dynamic Programming", "Sorting & Searching"],
    questionCount: 7,
    questionReferences: [],
    status: "published",
    retakeCooldownHours: 12,
    createdBy: "system",
  },
];

export const INITIAL_QUESTIONS_SEED: Array<
  Omit<IAssessmentQuestion, "_id" | "id" | "createdAt" | "updatedAt">
> = [
  // -------------------------------------------------------------
  // JavaScript Questions
  // -------------------------------------------------------------
  {
    title: "Variable Hoisting & Scope",
    questionText: "What will be printed to the console when this snippet is executed?",
    codeSnippet: `console.log(a);
var a = 10;
console.log(b);
let b = 20;`,
    subject: "JavaScript",
    topic: "Scope",
    difficulty: "Beginner",
    questionType: "output_prediction",
    options: [
      { id: "opt_a", text: "undefined, then ReferenceError for b" },
      { id: "opt_b", text: "undefined, then undefined" },
      { id: "opt_c", text: "10, then 20" },
      { id: "opt_d", text: "ReferenceError for a immediately" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "var declarations are hoisted with an initial value of undefined. In contrast, let and const declarations are hoisted into a Temporal Dead Zone (TDZ) and accessing them before initialization throws a ReferenceError.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Asynchronous Microtask vs Macrotask Execution",
    questionText: "In what chronological order will the console log messages appear?",
    codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
    subject: "JavaScript",
    topic: "Event Loop",
    difficulty: "Intermediate",
    questionType: "output_prediction",
    options: [
      { id: "opt_a", text: "1, 4, 3, 2" },
      { id: "opt_b", text: "1, 2, 3, 4" },
      { id: "opt_c", text: "1, 4, 2, 3" },
      { id: "opt_d", text: "1, 3, 4, 2" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "Synchronous code runs first ('1', '4'). Next, the microtask queue (Promise.then callbacks) executes ('3'). Finally, macrotasks such as setTimeout callbacks execute in the next tick ('2').",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Closure Retaining Inner State",
    questionText: "What is the primary technical mechanism that allows createCounter() to preserve count after the outer function finishes executing?",
    codeSnippet: `function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}`,
    subject: "JavaScript",
    topic: "Closures",
    difficulty: "Intermediate",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Closure retains a lexical environment reference to the enclosing scope variable" },
      { id: "opt_b", text: "count is automatically promoted to global window scope" },
      { id: "opt_c", text: "The JavaScript garbage collector cannot clear functions" },
      { id: "opt_d", text: "count is stored in the browser's LocalStorage" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "A closure is the combination of a function bundled together with references to its surrounding lexical state, allowing the inner function to access an outer function's scope even after the outer function has returned.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Debugging Unhandled Async Error",
    questionText: "Identify the critical bug in this asynchronous API handler function.",
    codeSnippet: `async function fetchUserData(userId) {
  try {
    const res = fetch('/api/user/' + userId);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}`,
    subject: "JavaScript",
    topic: "Promises & Async/Await",
    difficulty: "Intermediate",
    questionType: "code_debugging",
    options: [
      { id: "opt_a", text: "Missing await before fetch: res is a Promise, so res.json() is not a function" },
      { id: "opt_b", text: "fetch must not be wrapped inside a try/catch block" },
      { id: "opt_c", text: "async functions cannot return a value directly" },
      { id: "opt_d", text: "userId must be passed as an Array buffer" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "Without 'await fetch(...)', res is an unresolved Promise rather than a Response object. Calling res.json() will throw a TypeError: res.json is not a function.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Prototypal Inheritance vs Class Syntax",
    questionText: "Which statement is TRUE regarding ES6 classes in JavaScript?",
    subject: "JavaScript",
    topic: "Prototypes",
    difficulty: "Advanced",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "ES6 classes are syntactic sugar over JavaScript's existing prototype-based inheritance" },
      { id: "opt_b", text: "ES6 classes introduce traditional class-based compiled OOP like C++" },
      { id: "opt_c", text: "ES6 classes do not use prototype chains for method delegation" },
      { id: "opt_d", text: "Methods declared in classes are copied onto each instance object" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "JavaScript classes provide a cleaner syntax to define constructor functions and prototype methods, but under the hood the language remains fundamentally prototype-based.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Array Method Immutability",
    questionText: "Which of the following array methods mutates the original array in-place?",
    subject: "JavaScript",
    topic: "Scope",
    difficulty: "Beginner",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Array.prototype.splice()" },
      { id: "opt_b", text: "Array.prototype.slice()" },
      { id: "opt_c", text: "Array.prototype.map()" },
      { id: "opt_d", text: "Array.prototype.filter()" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "splice() modifies the original array by removing or replacing elements in-place. slice(), map(), and filter() return new array instances without mutating the source array.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },

  // -------------------------------------------------------------
  // React Questions
  // -------------------------------------------------------------
  {
    title: "useEffect Dependency Array Closure Stale State",
    questionText: "What problem will this component exhibit after mounting?",
    codeSnippet: `function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>{count}</div>;
}`,
    subject: "React",
    topic: "Hooks",
    difficulty: "Intermediate",
    questionType: "output_prediction",
    options: [
      { id: "opt_a", text: "count will update to 1 and then remain stuck at 1 due to a stale closure" },
      { id: "opt_b", text: "The interval will cause an infinite render loop" },
      { id: "opt_c", text: "The component will crash with an unhandled exception" },
      { id: "opt_d", text: "count will increment indefinitely without issue" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "Because the dependency array is empty [], the interval callback captures the initial count value (0). Every second it runs setCount(0 + 1), leaving count perpetually at 1. Using setCount(prev => prev + 1) fixes the stale closure.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "React Key Prop Requirement",
    questionText: "Why is using array index as the key prop generally discouraged for dynamic lists?",
    subject: "React",
    topic: "Virtual DOM",
    difficulty: "Beginner",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Reordering, inserting, or deleting items can cause incorrect component state and render bugs" },
      { id: "opt_b", text: "React strictly throws a fatal compiler error if index is used as a key" },
      { id: "opt_c", text: "Indexes consume 10x more browser memory than string UUIDs" },
      { id: "opt_d", text: "Virtual DOM reconciliation is completely disabled when index keys are present" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "React relies on keys to identify which items have changed, been added, or removed. If index is used as the key, reordering or filtering items causes React to reuse old component instances and state improperly.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Debugging Infinite Re-render Loop",
    questionText: "Why does this component enter an infinite re-render loop upon mounting?",
    codeSnippet: `function UserCard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(data => setUser(data));
  }, [user]);

  return <div>{user?.name}</div>;
}`,
    subject: "React",
    topic: "Hooks",
    difficulty: "Intermediate",
    questionType: "code_debugging",
    options: [
      { id: "opt_a", text: "user is in the dependency array: setUser changes user, triggering useEffect again repeatedly" },
      { id: "opt_b", text: "fetch cannot be called inside a component" },
      { id: "opt_c", text: "useState cannot accept null as an initial value" },
      { id: "opt_d", text: "Optional chaining is invalid syntax in JSX" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "Because 'user' is listed in the dependency array, when setUser(data) is called, React detects that 'user' changed and re-runs the effect, creating an infinite loop. The dependency array should be empty [] if the fetch should only run once on mount.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "useMemo vs useCallback Optimization",
    questionText: "What is the primary difference between useMemo and useCallback?",
    subject: "React",
    topic: "Performance",
    difficulty: "Intermediate",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "useMemo caches the result of a calculation; useCallback caches the function definition itself" },
      { id: "opt_b", text: "useMemo is only for strings; useCallback is only for numbers" },
      { id: "opt_c", text: "useCallback executes asynchronously in web workers; useMemo is synchronous" },
      { id: "opt_d", text: "There is no difference; they are exact aliases" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "useMemo invokes its function and caches the returned computed value between renders. useCallback returns a memoized version of the callback function itself so its reference remains stable.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Component Re-render Causes",
    questionText: "Which of the following will cause a React functional component to re-render?",
    subject: "React",
    topic: "Lifecycle",
    difficulty: "Beginner",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "A state update via useState, new props received, or context value changes" },
      { id: "opt_b", text: "Updating a useRef value" },
      { id: "opt_c", text: "Declaring a local variable inside the component body" },
      { id: "opt_d", text: "A user scrolling on the web page" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "React functional components re-render when their own state updates, their parent passes updated props, or a subscribed Context value changes. Mutating a ref (useRef) intentionally does not trigger a re-render.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Custom Hook Composition Rules",
    questionText: "Which convention MUST a custom hook follow according to React official specifications?",
    subject: "React",
    topic: "Hooks",
    difficulty: "Beginner",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Its name must begin with 'use' so linting rules can verify Rules of Hooks compliance" },
      { id: "opt_b", text: "It must return an array of exactly two elements" },
      { id: "opt_c", text: "It must be wrapped in React.memo()" },
      { id: "opt_d", text: "It can only be used once across the entire application" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "Custom hooks must be named starting with 'use' (e.g. useAuth, useDebounce). This convention allows ESLint plugins to automatically inspect the code for violations of the Rules of Hooks.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },

  // -------------------------------------------------------------
  // HTML & CSS Questions
  // -------------------------------------------------------------
  {
    title: "HTML5 Semantic Main Content Element",
    questionText: "Which HTML5 semantic element should encapsulate the dominant, unique content of a webpage (excluding headers, footers, and sidebars)?",
    subject: "HTML",
    topic: "Semantics",
    difficulty: "Beginner",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "<main>" },
      { id: "opt_b", text: "<section>" },
      { id: "opt_c", text: "<article>" },
      { id: "opt_d", text: "<content>" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "The <main> tag represents the dominant content of the <body> of a document. A page should have only one visible <main> element, excluding repeated content like navigation and footers.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Accessible Form Input Associations",
    questionText: "What is the most accessible and robust way to associate a <label> with an <input> element?",
    subject: "HTML",
    topic: "Accessibility",
    difficulty: "Beginner",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Set the label's 'for' attribute to match the input's 'id' attribute" },
      { id: "opt_b", text: "Place the input next to the label with a line break" },
      { id: "opt_c", text: "Give the label and input the exact same CSS class name" },
      { id: "opt_d", text: "Use placeholder text inside the input instead of a label" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "Using <label for='username'> and <input id='username'> programmatically links the two elements in the browser's accessibility tree, allowing screen readers to announce the label when the input receives focus.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "CSS Box Model Dimensions Calculation",
    questionText: "With 'box-sizing: content-box', what is the total rendered width of this element on screen?",
    codeSnippet: `.card {
  width: 200px;
  padding: 20px;
  border: 5px solid black;
  margin: 15px;
}`,
    subject: "CSS",
    topic: "Box Model",
    difficulty: "Intermediate",
    questionType: "output_prediction",
    options: [
      { id: "opt_a", text: "250px" },
      { id: "opt_b", text: "200px" },
      { id: "opt_c", text: "280px" },
      { id: "opt_d", text: "240px" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "Under content-box: Total width = width (200px) + left/right padding (20px * 2 = 40px) + left/right border (5px * 2 = 10px) = 250px. (Margin affects outer spacing, not element box width).",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "CSS Specificity Calculation",
    questionText: "Which CSS rule has the highest specificity and will determine the paragraph's color?",
    codeSnippet: `/* Rule A */ p.intro { color: blue; }
/* Rule B */ #content p { color: green; }
/* Rule C */ div p { color: red; }
/* Rule D */ p { color: black; }`,
    subject: "CSS",
    topic: "Specificity",
    difficulty: "Intermediate",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Rule B (#content p) - contains an ID selector (0,1,0,1)" },
      { id: "opt_b", text: "Rule A (p.intro) - class selectors beat ID selectors" },
      { id: "opt_c", text: "Rule C (div p) - two element selectors have priority" },
      { id: "opt_d", text: "Rule D (p) - the most specific single element" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "Specificity hierarchy: Inline (1,0,0,0) > ID (0,1,0,0) > Class/Attribute/Pseudo-class (0,0,1,0) > Element (0,0,0,1). Rule B has 1 ID + 1 element = (0,1,0,1), overriding all class and element selectors.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },

  // -------------------------------------------------------------
  // Node.js & Express Questions
  // -------------------------------------------------------------
  {
    title: "Node.js Event Loop Phases",
    questionText: "Which phase of the libuv event loop executes process.nextTick() callbacks?",
    subject: "Node.js",
    topic: "Event Loop",
    difficulty: "Advanced",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Immediately after the current synchronous operation finishes, before entering the next phase" },
      { id: "opt_b", text: "During the Poll phase only" },
      { id: "opt_c", text: "During the Timers phase with setTimeout" },
      { id: "opt_d", text: "During the Close callbacks phase" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "process.nextTick() is not technically part of the libuv event loop. The nextTickQueue is processed immediately after the current JavaScript operation completes, regardless of the current phase of the event loop.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Express Middleware Next() Error Handling",
    questionText: "In Express.js, what does passing an argument to next(err) signal to the framework?",
    codeSnippet: `app.get('/user', (req, res, next) => {
  if (!req.query.id) {
    return next(new Error('User ID is required'));
  }
});`,
    subject: "Express.js",
    topic: "Error Handling",
    difficulty: "Intermediate",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Bypasses all standard middleware and routes straight to error-handling middleware with 4 arguments (err, req, res, next)" },
      { id: "opt_b", text: "Immediately closes the HTTP connection without a response" },
      { id: "opt_c", text: "Restarts the Node.js server process" },
      { id: "opt_d", text: "Sends an automatic 200 OK with the error message as JSON" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "When next(err) is invoked with an error argument, Express skips all remaining non-error-handling route handlers in the stack and routes directly to middleware defined with four parameters: (err, req, res, next).",
    marks: 5,
    status: "published",
    createdBy: "system",
  },

  // -------------------------------------------------------------
  // MongoDB & SQL Questions
  // -------------------------------------------------------------
  {
    title: "MongoDB Compound Index Prefixing",
    questionText: "Given a compound index on { department: 1, salary: -1 }, which query CANNOT use this index efficiently?",
    subject: "MongoDB",
    topic: "Indexing",
    difficulty: "Intermediate",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "find({ salary: { $gt: 50000 } }) without a department filter" },
      { id: "opt_b", text: "find({ department: 'Engineering' })" },
      { id: "opt_c", text: "find({ department: 'Engineering', salary: { $gt: 80000 } })" },
      { id: "opt_d", text: "find({ department: 'Sales' }).sort({ salary: -1 })" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "Compound indexes in MongoDB follow the index prefix rule. Queries that do not filter on the leading index field ('department') cannot utilize the index for lookup and require a full collection scan.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "SQL INNER JOIN vs LEFT JOIN Behavior",
    questionText: "What will a LEFT JOIN between Table A and Table B return for rows in Table A that have no matching record in Table B?",
    subject: "SQL",
    topic: "Joins",
    difficulty: "Beginner",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "The row from Table A with NULL values for all Table B columns" },
      { id: "opt_b", text: "The row is omitted completely from the output" },
      { id: "opt_c", text: "The query throws a relational integrity error" },
      { id: "opt_d", text: "Empty string values for all Table A columns" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "A LEFT JOIN returns all records from the left table (Table A), and the matched records from the right table (Table B). If there is no match, the result is NULL for all columns from Table B.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },

  // -------------------------------------------------------------
  // Python & Java Questions
  // -------------------------------------------------------------
  {
    title: "Python Mutable Default Argument Pitfall",
    questionText: "What will be printed when this Python code runs?",
    codeSnippet: `def append_item(x, item_list=[]):
    item_list.append(x)
    return item_list

print(append_item(1))
print(append_item(2))`,
    subject: "Python",
    topic: "Data Structures",
    difficulty: "Intermediate",
    questionType: "output_prediction",
    options: [
      { id: "opt_a", text: "[1] then [1, 2]" },
      { id: "opt_b", text: "[1] then [2]" },
      { id: "opt_c", text: "[1] then []" },
      { id: "opt_d", text: "SyntaxError: mutable defaults are prohibited" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "In Python, default arguments are evaluated only once when the function is defined, not each time it is called. The same list object is reused across calls, resulting in [1] and then [1, 2].",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Java String Pool & Object Equality",
    questionText: "What will be printed to stdout when this Java snippet executes?",
    codeSnippet: `String s1 = "CareerBridge";
String s2 = "CareerBridge";
String s3 = new String("CareerBridge");

System.out.println((s1 == s2) + " " + (s1 == s3));`,
    subject: "Java",
    topic: "OOP Principles",
    difficulty: "Intermediate",
    questionType: "output_prediction",
    options: [
      { id: "opt_a", text: "true false" },
      { id: "opt_b", text: "true true" },
      { id: "opt_c", text: "false false" },
      { id: "opt_d", text: "false true" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "s1 and s2 both reference the same interned string literal in the Java String Pool, so s1 == s2 is true. 'new String()' allocates a distinct object on the heap, so s1 == s3 is false (though s1.equals(s3) is true).",
    marks: 5,
    status: "published",
    createdBy: "system",
  },

  // -------------------------------------------------------------
  // Data Structures & Algorithms
  // -------------------------------------------------------------
  {
    title: "Hash Table Average vs Worst-Case Time Complexity",
    questionText: "What are the average-case and worst-case time complexities for lookup in a standard Hash Table?",
    subject: "Data Structures and Algorithms",
    topic: "Big-O Complexity",
    difficulty: "Beginner",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Average: O(1), Worst-Case: O(n) when hash collisions degrade into a linked list" },
      { id: "opt_b", text: "Average: O(log n), Worst-Case: O(n log n)" },
      { id: "opt_c", text: "Average: O(1), Worst-Case: O(1)" },
      { id: "opt_d", text: "Average: O(n), Worst-Case: O(n^2)" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "With a good hash function and proper load factor, lookup is O(1) on average. In the worst case where every key collides into the same bucket, lookup degrades to O(n).",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
  {
    title: "Binary Search Tree In-Order Traversal",
    questionText: "Performing an In-Order traversal (Left, Root, Right) on a valid Binary Search Tree (BST) visits the nodes in which order?",
    subject: "Data Structures and Algorithms",
    topic: "Trees & Graphs",
    difficulty: "Intermediate",
    questionType: "multiple_choice",
    options: [
      { id: "opt_a", text: "Ascending sorted order" },
      { id: "opt_b", text: "Descending sorted order" },
      { id: "opt_c", text: "Level by level (Breadth-First)" },
      { id: "opt_d", text: "Unpredictable order based on insertion sequence" },
    ],
    correctAnswer: "opt_a",
    explanation:
      "In a BST, all values in the left subtree are smaller than the root, and all values in the right subtree are larger. Therefore, visiting Left, Root, Right produces values in strictly ascending sorted order.",
    marks: 5,
    status: "published",
    createdBy: "system",
  },
];

