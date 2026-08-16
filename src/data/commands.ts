export interface ClaudeCommand {
  command: string;
  name: string;
  description: string;
  category: 'Thinking & Reasoning' | 'Writing & Content' | 'Engineering & Code' | 'Architecture & Strategy' | 'Roles & Personas' | 'Career & Social';
  icon: string;
  prompt: string;
  placeholder?: string;
  example?: string;
}

export const CLAUDE_COMMANDS: ClaudeCommand[] = [
  // Thinking & Reasoning
  {
    command: "/explainlikeim5",
    name: "Explain Like I'm 5",
    description: "Explain like you're 5 years old with intuitive analogies and no jargon",
    category: "Thinking & Reasoning",
    icon: "Brain",
    prompt: "Explain the following concept in a delightfully simple, friendly, and intuitive way as if explaining to a curious 5-year-old child. Use everyday analogies and avoid all jargon: ",
    placeholder: "Quantum computing, recursion, inflation...",
    example: "What is an API?"
  },
  {
    command: "/brief",
    name: "Brief Answer",
    description: "Give the shortest possible, high-signal answer",
    category: "Thinking & Reasoning",
    icon: "FileText",
    prompt: "Provide the absolute shortest, most concise, and highest-signal answer possible without fluff or filler words: ",
    placeholder: "Question or topic needing a direct answer...",
    example: "What is the difference between TCP and UDP?"
  },
  {
    command: "/compare",
    name: "Side-by-Side Compare",
    description: "Compare options side-by-side with a detailed markdown comparison matrix",
    category: "Thinking & Reasoning",
    icon: "Scale",
    prompt: "Compare the following options side-by-side in a clear, structured markdown table highlighting pros, cons, performance, trade-offs, and final recommendation: ",
    placeholder: "React vs Vue, PostgreSQL vs MongoDB...",
    example: "Redis vs Memcached"
  },
  {
    command: "/critique",
    name: "Constructive Critique",
    description: "Find weaknesses, failure points, and suggest actionable improvements",
    category: "Thinking & Reasoning",
    icon: "MessageSquare",
    prompt: "Act as a rigorous and constructive critic. Thoroughly evaluate the following, identify blind spots, weaknesses, edge-case risks, and provide actionable improvements: ",
    placeholder: "Code, business proposal, essay, design...",
    example: "Review this landing page value proposition"
  },
  {
    command: "/teacher",
    name: "Master Teacher",
    description: "Teach step-by-step like an elite mentor with checkpoints",
    category: "Thinking & Reasoning",
    icon: "GraduationCap",
    prompt: "Act as a patient, world-class master teacher. Break down and teach the following topic step-by-step with real-world examples, intuitive analogies, and comprehension checkpoints: ",
    placeholder: "Dynamic programming, asynchronous event loops...",
    example: "How does HTTPS TLS handshake work?"
  },
  {
    command: "/scout",
    name: "Risk & Edge-Case Scout",
    description: "Find risks, blind spots, unintended consequences, and edge cases",
    category: "Thinking & Reasoning",
    icon: "Eye",
    prompt: "Conduct a comprehensive risk scout. Identify all potential failure modes, edge cases, blind spots, security loopholes, and unintended second-order consequences for: ",
    placeholder: "New feature rollout, database migration plan...",
    example: "Migrating from monolith to microservices"
  },
  {
    command: "/devil",
    name: "Devil's Advocate",
    description: "Argue the opposite side and steelman counter-arguments",
    category: "Thinking & Reasoning",
    icon: "Zap",
    prompt: "Play devil's advocate. Vigorously steelman the opposing point of view and present the strongest possible counter-arguments against: ",
    placeholder: "A thesis, decision, or point of view...",
    example: "Why AI will replace all software engineers in 2 years"
  },
  {
    command: "/godmode",
    name: "God Mode Exhaustive",
    description: "Provide the most comprehensive, exhaustive, and masterful breakdown",
    category: "Thinking & Reasoning",
    icon: "Sparkles",
    prompt: "Activate maximum depth and detail. Provide an exhaustive, deeply researched, and authoritative master-level breakdown with zero skipped nuances on: ",
    placeholder: "Complex technical architecture, historical event, mathematical proof...",
    example: "Modern distributed consensus algorithms (Raft vs Paxos)"
  },
  {
    command: "/debate",
    name: "Balanced Debate",
    description: "Present both sides of an argument with equal rigor and objectivity",
    category: "Thinking & Reasoning",
    icon: "Users",
    prompt: "Structure a balanced, high-level debate presenting the strongest arguments for both perspectives, key empirical evidence, and a synthesis on: ",
    placeholder: "Monorepo vs Polyrepo, Remote vs In-office...",
    example: "Static Typing vs Dynamic Typing for early-stage startups"
  },
  {
    command: "/roadmap",
    name: "Learning Roadmap",
    description: "Create a structured, milestone-based learning roadmap",
    category: "Thinking & Reasoning",
    icon: "List",
    prompt: "Create a comprehensive, phase-by-phase learning roadmap with timelines, curated resources, practical projects, and mastery milestones for: ",
    placeholder: "Fullstack AI Engineer, Rust Systems Programming...",
    example: "Mastering Distributed Systems in 6 months"
  },
  {
    command: "/plan",
    name: "Action Plan Builder",
    description: "Build a structured, prioritized execution plan with dependencies",
    category: "Thinking & Reasoning",
    icon: "CheckSquare",
    prompt: "Build an actionable, high-precision execution plan with prioritized phases, milestones, critical dependencies, risk mitigations, and immediate next steps for: ",
    placeholder: "Product launch, technical migration, sprint goal...",
    example: "Launching a SaaS MVP in 30 days"
  },
  {
    command: "/summary",
    name: "Executive Summary",
    description: "Summarize content into crisp executive takeaways and key points",
    category: "Thinking & Reasoning",
    icon: "FileText",
    prompt: "Distill the following into a crisp executive summary with core thesis, key takeaways in bullet points, and high-impact implications: ",
    placeholder: "Long article, transcript, technical document...",
    example: "Summarize this quarterly engineering report"
  },
  {
    command: "/research",
    name: "Deep-Dive Research",
    description: "Deep-dive into a topic covering history, state of the art, and future",
    category: "Thinking & Reasoning",
    icon: "Search",
    prompt: "Perform a deep-dive research paper-grade synthesis covering foundational concepts, historical evolution, state of the art, current benchmarks, and future outlook on: ",
    placeholder: "Vector databases, Mixture of Experts (MoE), Zero-Knowledge Proofs...",
    example: "State of Mixture-of-Experts architecture in modern LLMs"
  },
  {
    command: "/simplify",
    name: "Deconstruct & Simplify",
    description: "Make complex technical content intuitive and digestible",
    category: "Thinking & Reasoning",
    icon: "Sparkles",
    prompt: "Deconstruct and simplify the following complex technical topic into clean, intuitive mental models and clear explanations: ",
    placeholder: "Kubernetes control plane, React Reconciliation...",
    example: "How GPU matrix multiplication works"
  },

  // Writing & Content
  {
    command: "/pitch",
    name: "Client/Investor Pitch",
    description: "Create a compelling, high-converting business or client pitch",
    category: "Writing & Content",
    icon: "Megaphone",
    prompt: "Craft a punchy, high-converting elevator pitch and client proposal with a gripping hook, core value proposition, quantifiable ROI, and clear call to action for: ",
    placeholder: "Product, service, freelance proposal...",
    example: "AI-powered automated code review tool for enterprise teams"
  },
  {
    command: "/ghost",
    name: "Ghostwrite Human Tone",
    description: "Rewrite to sound completely natural, authentic, and human (anti-AI tone)",
    category: "Writing & Content",
    icon: "PenTool",
    prompt: "Rewrite the following text so it sounds 100% natural, human, authentic, and engaging. Remove robotic cadence, filler phrases, and generic AI idioms: ",
    placeholder: "AI-sounding draft, blog post, email...",
    example: "Our cutting-edge revolutionary platform leverages synergy..."
  },
  {
    command: "/10x",
    name: "10x Writing Upgrade",
    description: "Dramatically elevate writing quality, punchiness, and persuasion",
    category: "Writing & Content",
    icon: "TrendingUp",
    prompt: "Dramatically elevate and upgrade this writing (clarity, emotional impact, rhythmic flow, persuasive punch, and elite vocabulary): ",
    placeholder: "Draft paragraph, email, landing page copy...",
    example: "We make software that helps you manage tasks faster."
  },
  {
    command: "/rewrite",
    name: "Content Rewrite",
    description: "Rewrite content with optimized structure, flow, and clarity",
    category: "Writing & Content",
    icon: "PenTool",
    prompt: "Rewrite the following content with optimal sentence flow, strong active voice, logical paragraph structure, and impeccable clarity: ",
    placeholder: "Rough draft or notes...",
    example: "Meeting summary notes for engineering leads"
  },
  {
    command: "/linkedin",
    name: "LinkedIn Viral Post",
    description: "Create high-engagement LinkedIn content with strong hooks",
    category: "Writing & Content",
    icon: "Share2",
    prompt: "Write a high-engagement LinkedIn post with a viral curiosity hook, clean line-breaks, insightful story/lesson, bulleted takeaways, and an engaging closing question for: ",
    placeholder: "Tech achievement, career lesson, software launch...",
    example: "What I learned shipping a production app with Gemini 2.5 Flash"
  },
  {
    command: "/reel",
    name: "Reel / TikTok Script",
    description: "Generate 30-60s short-form video script with visual & audio cues",
    category: "Writing & Content",
    icon: "Video",
    prompt: "Write a high-retention 30-60 second Instagram Reel / TikTok / YouTube Shorts script including visual scene directions, sound effects, on-screen text overlays, and voiceover hook for: ",
    placeholder: "Tech tutorial, productivity tip, product demo...",
    example: "3 hidden VS Code extensions that feel illegal to know"
  },
  {
    command: "/carousel",
    name: "Instagram Carousel",
    description: "Generate 10-slide visual carousel content with swipe triggers",
    category: "Writing & Content",
    icon: "Layout",
    prompt: "Create a 10-slide Instagram/LinkedIn carousel outline with compelling slide headlines, punchy body text (under 30 words per slide), visual notes, and strong swipe prompts for: ",
    placeholder: "10 clean code principles, System design cheatsheet...",
    example: "10 System Design concepts every developer must master"
  },

  // Engineering & Code
  {
    command: "/optimize",
    name: "Performance Optimizer",
    description: "Improve runtime efficiency, memory footprint, and algorithm complexity",
    category: "Engineering & Code",
    icon: "Zap",
    prompt: "Analyze the following code/logic and optimize it for maximum execution speed, reduced time/space complexity (Big-O), memory efficiency, and idiomatic best practices: ",
    placeholder: "Algorithm, React component, database query...",
    example: "Optimize nested array search and filtering"
  },
  {
    command: "/debug",
    name: "Deep Debugger",
    description: "Find bugs, memory leaks, race conditions, and provide root-cause fixes",
    category: "Engineering & Code",
    icon: "Wrench",
    prompt: "Perform deep debugging and root-cause analysis on the following code snippet. Identify all bugs, logic flaws, race conditions, edge-case crashes, and provide the clean, corrected code with explanations: ",
    placeholder: "Broken code, stack trace, unexpected behavior...",
    example: "Fix useEffect infinite re-render loop"
  },
  {
    command: "/review",
    name: "Code & Content Review",
    description: "Conduct rigorous peer code review with security and quality scores",
    category: "Engineering & Code",
    icon: "ShieldCheck",
    prompt: "Conduct a senior-level peer code review. Evaluate architecture, security, readability, edge cases, error handling, and provide categorized line-by-line feedback with suggestions: ",
    placeholder: "Pull request diff, code module, API handler...",
    example: "Review this authentication middleware"
  },
  {
    command: "/sql",
    name: "SQL Solution Generator",
    description: "Generate optimized SQL queries, indexes, CTEs, and schema tuning",
    category: "Engineering & Code",
    icon: "Database",
    prompt: "Generate production-grade, highly optimized SQL queries (using CTEs, indexes, window functions, and proper constraints) with explanations for: ",
    placeholder: "Complex data extraction, aggregation, schema design...",
    example: "Find top 5 spending customers per region in the last 90 days"
  },
  {
    command: "/frontend",
    name: "Frontend Specialist",
    description: "Focus on modern frontend UI/UX, React, Tailwind, and accessibility",
    category: "Engineering & Code",
    icon: "Layout",
    prompt: "Focus exclusively on modern frontend engineering. Provide responsive, accessible (WCAG AA), beautifully styled React + Tailwind CSS code with smooth micro-interactions for: ",
    placeholder: "Interactive component, dashboard card, modal layout...",
    example: "Build an animated command palette modal with keyboard navigation"
  },
  {
    command: "/backend",
    name: "Backend Specialist",
    description: "Focus on robust backend architectures, APIs, databases, and microservices",
    category: "Engineering & Code",
    icon: "Server",
    prompt: "Focus on backend engineering excellence. Design scalable, secure, high-throughput backend services, endpoints, data validation, and error recovery in Node.js/TypeScript/Go for: ",
    placeholder: "Rate-limited API, background worker queue, payment webhook...",
    example: "Implement idempotent Stripe webhook handler"
  },
  {
    command: "/fullstack",
    name: "Fullstack End-to-End",
    description: "Provide complete end-to-end solution (UI + API + DB + Types)",
    category: "Engineering & Code",
    icon: "Code",
    prompt: "Deliver a complete, production-ready end-to-end fullstack solution. Include frontend component, backend API endpoint, TypeScript interfaces, database schema, and validation logic for: ",
    placeholder: "Feature specification, auth flow, real-time sync...",
    example: "Fullstack real-time comment system with upvoting"
  },
  {
    command: "/api",
    name: "API Contract & Schema",
    description: "Design clean RESTful/GraphQL APIs with OpenAPI schemas and status codes",
    category: "Engineering & Code",
    icon: "Globe",
    prompt: "Design a clean, RESTful/GraphQL API contract with complete endpoint specifications, HTTP status codes, request/response JSON schemas, error structures, and headers for: ",
    placeholder: "User management, billing system, analytics events...",
    example: "E-commerce checkout and order processing API"
  },
  {
    command: "/security",
    name: "Security Audit",
    description: "Identify vulnerabilities (OWASP, injection, auth flaws) and mitigations",
    category: "Engineering & Code",
    icon: "Lock",
    prompt: "Perform an end-to-end security vulnerability audit. Identify OWASP Top 10 risks, injection flaws, authentication weaknesses, data leakage vectors, and provide hardened remediation code for: ",
    placeholder: "Endpoint, authentication flow, database queries...",
    example: "Audit this JWT authentication and refresh token flow"
  },
  {
    command: "/performance",
    name: "Performance & Scalability",
    description: "Audit performance bottlenecks and optimize latency and throughput",
    category: "Engineering & Code",
    icon: "Activity",
    prompt: "Conduct a thorough performance and scalability audit. Identify CPU/memory bottlenecks, database query N+1 issues, network latency, and caching strategies for: ",
    placeholder: "Slow endpoint, high traffic service, large dataset...",
    example: "Scaling real-time chat with 100k concurrent WebSocket connections"
  },

  // Architecture & Strategy
  {
    command: "/architect",
    name: "System Architect",
    description: "Design high-scale, fault-tolerant system architectures and diagrams",
    category: "Architecture & Strategy",
    icon: "Cloud",
    prompt: "Design a robust, fault-tolerant, high-scale cloud architecture. Detail components, data pipelines, load balancing, caching layers, storage choices, and failure domain boundaries for: ",
    placeholder: "Video streaming platform, global notification service...",
    example: "Architecting a global URL shortener handling 1B links/month"
  },
  {
    command: "/systemdesign",
    name: "System Design Document",
    description: "Create complete System Design docs with trade-offs & scaling calculations",
    category: "Architecture & Strategy",
    icon: "Server",
    prompt: "Produce an exhaustive System Design document covering functional/non-functional requirements, back-of-the-envelope capacity estimations, high-level architecture, deep-dive components, and CAP theorem trade-offs for: ",
    placeholder: "Uber backend, Twitter feed generation, Google Drive sync...",
    example: "Design a real-time collaborative document editor (like Google Docs)"
  },
  {
    command: "/analyst",
    name: "Data & Systems Analyst",
    description: "Analyze complex data, operational metrics, or ambiguous situations",
    category: "Architecture & Strategy",
    icon: "BarChart",
    prompt: "Conduct a rigorous quantitative and qualitative analytical breakdown. Segment the core variables, identify statistical correlations, root causes, and derive data-backed conclusions for: ",
    placeholder: "User drop-off metric, server outage logs, market data...",
    example: "Analyzing 35% user churn on onboarding step 3"
  },

  // Roles & Personas
  {
    command: "/startup",
    name: "Startup Founder Mindset",
    description: "Think like a YC founder: PMF, growth loops, and distribution",
    category: "Roles & Personas",
    icon: "Target",
    prompt: "Adopt the mindset of an experienced Y Combinator startup founder. Evaluate product-market fit, unit economics, unfair competitive advantages, go-to-market distribution, and lethal risks for: ",
    placeholder: "Startup idea, new business feature, pivot strategy...",
    example: "B2B AI agent for automated invoice reconciliation"
  },
  {
    command: "/pm",
    name: "Product Manager (PRD)",
    description: "Think like a Senior PM: User stories, acceptance criteria, and OKRs",
    category: "Roles & Personas",
    icon: "CheckSquare",
    prompt: "Adopt the persona of a Principal Product Manager. Generate a structured Product Requirements Document (PRD) with user problem statement, user personas, user stories, acceptance criteria, edge cases, and North Star metrics for: ",
    placeholder: "Feature idea, mobile app onboarding, dark mode...",
    example: "AI-assisted smart reply feature for email client"
  },
  {
    command: "/cto",
    name: "Chief Technology Officer",
    description: "Think like a CTO: Tech debt, team velocity, architecture decisions",
    category: "Roles & Personas",
    icon: "Cpu",
    prompt: "Adopt the executive perspective of a CTO. Evaluate technical stack trade-offs, engineering maintainability, long-term technical debt, hiring complexity, and infrastructure cost for: ",
    placeholder: "Rewriting in Rust, adopting Kubernetes, choosing cloud provider...",
    example: "Should we migrate from Postgres to Cassandra for time-series data?"
  },
  {
    command: "/senior",
    name: "Senior Engineer Review",
    description: "Review as a Senior Staff Engineer focusing on clean code & maintainability",
    category: "Roles & Personas",
    icon: "Code",
    prompt: "Evaluate this from the lens of a Senior Staff Engineer. Focus on clean code principles, SOLID patterns, type safety, modular design, testability, and operational simplicity for: ",
    placeholder: "Code design, library choice, refactoring proposal...",
    example: "Evaluating Redux Toolkit vs Zustand for state management"
  },
  {
    command: "/mentor",
    name: "Senior Mentor",
    description: "Guide like a seasoned mentor with career advice and strategic insights",
    category: "Roles & Personas",
    icon: "Users",
    prompt: "Act as a compassionate, seasoned engineering director and mentor. Provide high-level guidance, career perspectives, actionable advice, and mindset framing for: ",
    placeholder: "Career crossroads, team conflict, impostor syndrome...",
    example: "Transitioning from Senior Engineer to Engineering Manager"
  },
  {
    command: "/coach",
    name: "Performance Coach",
    description: "Help diagnose personal bottlenecks and design peak performance systems",
    category: "Roles & Personas",
    icon: "Activity",
    prompt: "Act as an elite executive performance coach. Diagnose productivity bottlenecks, cognitive friction, time management traps, and design a high-leverage execution routine for: ",
    placeholder: "Deep work routine, handling context switching, focus...",
    example: "Structuring an effective 4-hour daily deep-work coding routine"
  },
  {
    command: "/interviewer",
    name: "Mock Interviewer",
    description: "Simulate a tough technical or behavioral job interview with grading",
    category: "Roles & Personas",
    icon: "MessageCircle",
    prompt: "Act as a strict yet fair Principal Engineer interviewer at a top tech company. Ask me probing technical questions one at a time, critique my answers, and grade my performance for: ",
    placeholder: "React Senior role, System Design interview, Backend Go role...",
    example: "Senior Frontend React & Performance interview"
  },

  // Career & Social
  {
    command: "/interview",
    name: "Interview Question Generator",
    description: "Generate 10 insightful, realistic interview questions and answer rubrics",
    category: "Career & Social",
    icon: "HelpCircle",
    prompt: "Generate 10 realistic, insightful interview questions spanning junior to principal levels, complete with ideal answer points and red-flag answers for: ",
    placeholder: "Role or skill: TypeScript, Cloud Security, Product Lead...",
    example: "Lead Cloud Security Engineer role"
  },
  {
    command: "/resume",
    name: "Resume Bullet Polish",
    description: "Rewrite resume bullets using the Google XYZ impact formula",
    category: "Career & Social",
    icon: "FileText",
    prompt: "Critique and rewrite the following resume bullets using the Google XYZ formula ('Accomplished [X] as measured by [Y], by doing [Z]') with power action verbs and quantifiable business impact: ",
    placeholder: "Raw resume bullet points, job history description...",
    example: "Helped team speed up website and fixed bugs"
  }
];

export const COMMAND_CATEGORIES = [
  "All",
  "Thinking & Reasoning",
  "Writing & Content",
  "Engineering & Code",
  "Architecture & Strategy",
  "Roles & Personas",
  "Career & Social"
] as const;
