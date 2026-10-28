/**
 * INSTITUTIONAL PLACEMENT KNOWLEDGE BASE (RAG Repository)
 * Used by ragService to retrieve grounded company archives, technical rubrics,
 * MCA/B.Tech placement syllabi, and job descriptions for LLM augmentation.
 */

export const RAG_KNOWLEDGE_DOCS = [
  // ==========================================
  // 1. COMPANY PLACEMENT ARCHIVES & PATTERNS
  // ==========================================
  {
    id: "rag_comp_tcs_01",
    title: "TCS NQT & Digital Technical Interview Pattern & Core Questions",
    category: "Company Archive",
    company: "TCS",
    domain: "all",
    tags: ["TCS", "NQT", "Digital", "Prime", "Ninja", "Java", "SQL", "OOP", "DSA"],
    source: "Institutional Placement Archive - Sona Placement Cell (TCS Recruitment Drive)",
    content: `TCS Digital and Prime technical interview rounds focus heavily on:
1. Object-Oriented Programming (OOP) in Java/C++: Four pillars, diamond problem, method overloading vs overriding, abstract classes vs interfaces.
2. Database Systems: Write complex SQL queries involving INNER/LEFT/FULL OUTER JOINs, GROUP BY, HAVING, subqueries, and second-highest salary queries.
3. Data Structures: In-place string reversal, cycle detection in linked lists (Floyd's algorithm), binary search variations, and array manipulation.
4. Core CS: Process vs Thread, Deadlock conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait), and TCP vs UDP.
5. Project Deep Dive: Candidate must explain architectural choices, database schema normalization (3NF), and REST API design.`
  },
  {
    id: "rag_comp_zoho_01",
    title: "Zoho Advanced Programming & Technical HR Evaluation Rubric",
    category: "Company Archive",
    company: "Zoho",
    domain: "dsa",
    tags: ["Zoho", "C", "Java", "DSA", "Design", "String Manipulation", "Matrix"],
    source: "Institutional Placement Archive - Zoho Campus Assessment & Technical Round 2/3",
    content: `Zoho technical rounds prioritize raw logic, zero-built-in-library implementation, and object-oriented system design:
1. Advanced Programming (Round 2): Problems include Look-and-Say sequence, Matrix Spiral Traversal, custom JSON/Expression Evaluator, String Compression (Run-length encoding), and Sudoku Solver via Backtracking.
2. Design Round (Round 3): Low-Level System Design (LLD) such as Railway/Flight Ticket Booking System, Snake and Ladder, Call Taxi Booking, or Splitwise expense manager using pure OOP principles.
3. Key Evaluation Metric: Memory optimization, avoidance of language shortcuts, pointer/array mastery, and clean modular code organization.`
  },
  {
    id: "rag_comp_capgemini_01",
    title: "Capgemini Senior Analyst & Software Engineer Technical Rubric",
    category: "Company Archive",
    company: "Capgemini",
    domain: "web",
    tags: ["Capgemini", "Full Stack", "Cloud", "Java", "Spring Boot", "React", "Svelte", "Microservices"],
    source: "Institutional Placement Archive - Capgemini Excellence Drive",
    content: `Capgemini technical assessments and interviews evaluate:
1. Modern Web & Frameworks: State management, component lifecycle, reactive DOM rendering, REST vs GraphQL, and secure JWT authentication.
2. Cloud & Microservices: Docker containerization basics, API Gateway pattern, CI/CD pipeline triggers, and stateless session design.
3. Database & ORM: Indexing strategies (B-Tree, Hash Index), ACID properties, connection pooling, and optimistic vs pessimistic locking.
4. Problem Solving: Clean coding standards, modular exception handling, and standard unit test coverage.`
  },
  {
    id: "rag_comp_infosys_01",
    title: "Infosys DSE (Digital Specialist Engineer) & Power Programmer Interview Archive",
    category: "Company Archive",
    company: "Infosys",
    domain: "dsa",
    tags: ["Infosys", "DSE", "Power Programmer", "Dynamic Programming", "Graphs", "Trees"],
    source: "Institutional Placement Archive - Infosys SP/DSE Selection Panel",
    content: `Infosys DSE and Specialist Programmer tracks evaluate candidates on rigorous algorithmic problem solving:
1. Dynamic Programming: 0/1 Knapsack problem, Longest Common Subsequence (LCS), Matrix Chain Multiplication, and Coin Change permutations.
2. Graph Algorithms: Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra's shortest path, and Topological Sorting in DAGs.
3. Tree Structures: Binary Search Tree (BST) validation, Lowest Common Ancestor (LCA), and Tree traversals (Inorder, Preorder, Postorder, Level Order).
4. System Understanding: Distributed caching (Redis), horizontal vs vertical scaling, and microservice resilience.`
  },
  {
    id: "rag_comp_accenture_01",
    title: "Accenture Advanced Associate Software Engineer (AASE) Interview Criteria",
    category: "Company Archive",
    company: "Accenture",
    domain: "cloud",
    tags: ["Accenture", "AASE", "Cloud", "DevOps", "Agile", "Security"],
    source: "Institutional Placement Archive - Accenture Campus Recruitment Panel",
    content: `Accenture AASE technical evaluation focuses on:
1. Cloud Fundamentals: AWS/Azure services (S3, EC2, Lambda, Blob Storage), Serverless computing benefits, and IAM role security.
2. DevOps & Agile: Git workflow (branching, PRs, merge conflict resolution), Agile Scrum ceremonies (sprints, standups, retrospectives), and Docker image building.
3. Software Engineering: SOLID design principles, MVC/MVVM patterns, and cross-browser responsive frontend styling.`
  },
  {
    id: "rag_comp_amazon_01",
    title: "Amazon SDE (Software Development Engineer) Leadership Principles & Bar Raiser Rubric",
    category: "Company Archive",
    company: "Amazon",
    domain: "dsa",
    tags: ["Amazon", "SDE", "Leadership Principles", "System Design", "Complexity"],
    source: "Corporate SDE Interview Guidelines - Tier 1 Benchmark",
    content: `Amazon SDE technical interviews evaluate technical competence integrated with Amazon Leadership Principles:
1. Coding & DSA: Write production-ready code with optimal Time ($O(N)$ / $O(N \\log N)$) and Space complexity. Deep familiarity with HashMaps, Heaps/Priority Queues, Two Pointers, and Binary Trees.
2. STAR Methodology for Behavioral: Situation, Task, Action, Result framing for Customer Obsession, Ownership, Bias for Action, and Deliver Results.
3. Low-Level Design: Object-Oriented Design patterns (Factory, Singleton, Strategy, Observer) with clean interfaces and unit tests.`
  },

  // ==========================================
  // 2. TECHNICAL DOMAIN RUBRICS & BENCHMARKS
  // ==========================================
  {
    id: "rag_dom_web_01",
    title: "Full Stack & Web Architecture Technical Evaluation Benchmark",
    category: "Technical Rubric",
    company: "General",
    domain: "web",
    tags: ["Web", "Full Stack", "Frontend", "Backend", "SSR", "CSR", "Hydration", "APIs"],
    source: "Curated Technical Interview Rubrics - Modern Web Track",
    content: `Full Stack & Web Development Evaluation Rubric:
- Client-Side Rendering (CSR) vs Server-Side Rendering (SSR) vs Static Site Generation (SSG): Candidate should clearly articulate that CSR loads minimal HTML and renders in browser (rich SPAs), SSR compiles HTML on the server per request (best for SEO & dynamic content), and SSG builds static files at deploy time.
- Reactivity & State Management: Explain compile-time signals/runes (like Svelte $state) vs Virtual DOM diffing (React reconciliation) and why fine-grained reactivity eliminates tree-diffing overhead.
- REST vs GraphQL: REST uses standard HTTP verbs (GET, POST, PUT, DELETE) and fixed endpoints; GraphQL allows single-endpoint schema querying to prevent over-fetching and under-fetching.
- Security & Performance: HTTPS, Cross-Origin Resource Sharing (CORS), Cross-Site Scripting (XSS) prevention, SQL Injection sanitization, and asset caching strategies.`
  },
  {
    id: "rag_dom_cloud_01",
    title: "Cloud Computing, DevOps & Microservices Benchmark",
    category: "Technical Rubric",
    company: "General",
    domain: "cloud",
    tags: ["Cloud", "DevOps", "Docker", "Kubernetes", "CI/CD", "Microservices", "AWS"],
    source: "Curated Technical Interview Rubrics - Infrastructure & Cloud Track",
    content: `Cloud & DevOps Evaluation Rubric:
- Virtual Machines vs Containers: Containers share the host OS kernel and isolate user space, resulting in instant startup, minimal resource footprints, and high portability compared to hypervisor-based VMs.
- CI/CD Pipelines: Automated build -> automated unit/lint testing -> container artifact registry push -> staging/production deployment with rollback capability.
- Microservices vs Monoliths: Monoliths offer simpler initial debugging and transactions, while microservices enable independent scalability, fault isolation, and autonomous team deployment at the expense of distributed complexity and network latency.
- Infrastructure as Code (IaC) & Monitoring: Declarative state management (Terraform), centralized logging (ELK / Prometheus / Grafana), and auto-scaling health checks.`
  },
  {
    id: "rag_dom_db_01",
    title: "Database Engineering, SQL Optimization & NoSQL Architecture",
    category: "Technical Rubric",
    company: "General",
    domain: "db",
    tags: ["Database", "SQL", "NoSQL", "ACID", "BASE", "Indexing", "Normalization"],
    source: "Curated Technical Interview Rubrics - Data Systems Track",
    content: `Database Systems Evaluation Rubric:
- ACID Properties: Atomicity (all or nothing), Consistency (preserves schema constraints), Isolation (concurrent transactions do not interfere), Durability (committed changes persist in disk).
- SQL vs NoSQL Selection: SQL (PostgreSQL, MySQL) excels in structured relations, transactional integrity, and complex relational joins. NoSQL (MongoDB, DynamoDB, Firestore) excels in horizontal partitioning, unstructured JSON schemas, and high-velocity reads/writes.
- Indexing & Query Tuning: B-Tree indexes speed up equality and range lookups from O(N) to O(log N). Over-indexing incurs heavy write penalties during INSERT/UPDATE operations. EXPLAIN ANALYZE for query execution plan inspection.
- Normalization (1NF to BCNF): Eliminates data redundancy, update anomalies, insertion anomalies, and deletion anomalies through foreign key relationships.`
  },
  {
    id: "rag_dom_dsa_01",
    title: "Data Structures, Algorithms & OOP Software Design Standards",
    category: "Technical Rubric",
    company: "General",
    domain: "dsa",
    tags: ["DSA", "OOP", "SOLID", "Algorithms", "Time Complexity", "Space Complexity"],
    source: "Curated Technical Interview Rubrics - Core CS Track",
    content: `Data Structures & OOP Software Design Evaluation Rubric:
- Asymptotic Complexity: Big-O analysis of common operations. Hash table lookups (O(1) average, O(N) worst), QuickSort/MergeSort (O(N log N)), Binary Search (O(log N)).
- SOLID Principles: Single Responsibility, Open/Closed (open for extension, closed for modification), Liskov Substitution, Interface Segregation, Dependency Inversion.
- Core Data Structures: Dynamic Arrays, Linked Lists, Stacks, Queues, Hash Tables, Trees (BST, AVL, Tries), and Priority Queues / Binary Heaps.
- Dynamic Programming Essentials: Optimal Substructure and Overlapping Subproblems (Memoization top-down vs Tabulation bottom-up).`
  },
  {
    id: "rag_dom_ai_01",
    title: "Artificial Intelligence, Machine Learning & Generative AI Systems",
    category: "Technical Rubric",
    company: "General",
    domain: "ai",
    tags: ["AI", "ML", "Generative AI", "RAG", "Embeddings", "LLM", "Transformers"],
    source: "Curated Technical Interview Rubrics - Applied AI Track",
    content: `AI, ML & GenAI Systems Evaluation Rubric:
- Retrieval-Augmented Generation (RAG): Grounding Large Language Models (LLMs) with external vector knowledge bases. Involves document chunking, generating dense vector embeddings, computing cosine similarity to find top-k relevant context chunks, and injecting context into the prompt to prevent hallucination.
- Transformers & Attention Mechanism: Self-attention calculates relationships between all tokens in an input sequence simultaneously, overcoming RNN recurrent bottleneck.
- Supervised vs Unsupervised vs Reinforcement Learning: Labeled ground truth data vs pattern discovery/clustering vs reward-penalty policy optimization.
- Evaluation Metrics: Precision, Recall, F1-Score, ROC-AUC for classification; MSE/RMSE for regression; BLEU/ROUGE for text generation.`
  },

  // ==========================================
  // 3. INSTITUTIONAL PLACEMENT POLICIES & SYLLABUS
  // ==========================================
  {
    id: "rag_inst_curriculum_01",
    title: "Sona College MCA / Engineering Placement Eligibility & Career Readiness Standards",
    category: "Institutional Policy",
    company: "Institutional",
    domain: "all",
    tags: ["Sona", "Placement Cell", "Eligibility", "CGPA", "Aptitude", "Mock Rounds"],
    source: "Sona College of Technology - Placement & Training Guidelines",
    content: `Institutional Placement Readiness Framework:
1. Academic Eligibility Tiers:
   - Tier 1 / Marquee Tier (> 8.5 CGPA, 0 standing backlogs): Eligible for high-package product & consulting firms (> 8 - 25 LPA).
   - Tier 2 / Core IT Tier (> 7.0 CGPA, max 1 backlog history): Eligible for premier service and mid-scale product companies (4.5 - 8 LPA).
   - Tier 3 / Mass Recruitment Tier (> 6.0 CGPA): Eligible for mass IT service drives (3.5 - 4.5 LPA).
2. Four Pillars of Campus Selection:
   - Round 1: Quantitative Aptitude, Logical Reasoning, and Verbal Ability.
   - Round 2: Online Coding & Domain Assessment (Clean compilation, edge case handling).
   - Round 3: Technical Interview (Core CS, DBMS, OOP, Project Architecture).
   - Round 4: HR & Behavioral Interview (Communication, Cultural fit, Long-term goals).
3. Continuous Assessment Mandate: Minimum 3 AI/Manual mock interviews and an ATS-audited resume score > 75% are required prior to campus drive registration.`
  },
  {
    id: "rag_inst_hr_rubric_01",
    title: "Standard Institutional HR & Behavioral Evaluation Rubric (STAR Method)",
    category: "Behavioral Rubric",
    company: "General",
    domain: "all",
    tags: ["HR", "Behavioral", "STAR", "Communication", "Teamwork", "Strengths"],
    source: "Institutional Placement Training - HR Master Guide",
    content: `HR & Behavioral Interview Evaluation Matrix:
1. STAR Methodology: Answers must present Situation (context), Task (goal/challenge), Action (personal initiative taken), and Result (quantifiable outcome).
2. Common Behavioral Questions & Grounded Structure:
   - "Tell me about yourself": 60-90 second elevator pitch summarizing academic background, technical passions, flagship project, and alignment with the company role.
   - "Why should we hire you?": Connect specific technical skills and problem-solving drive to the company's tech stack and mission.
   - "Handling conflict in a project team": Focus on active listening, objective data-driven decision making, and preserving team morale.
3. Scoring Criteria: Clarity of thought, professional vocabulary, confidence, honesty, and emotional intelligence.`
  }
];
