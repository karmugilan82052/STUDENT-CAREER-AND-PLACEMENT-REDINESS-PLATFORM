export const IT_DOMAINS = [
  { id: 'all', name: 'All IT Tracks', icon: 'Layers' },
  { id: 'web', name: 'Full Stack & Web Dev', icon: 'Globe' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: 'Cloud' },
  { id: 'db', name: 'Database & SQL/NoSQL', icon: 'Database' },
  { id: 'security', name: 'Cybersecurity & Networks', icon: 'Shield' },
  { id: 'dsa', name: 'DSA & OOP Software Design', icon: 'Code' },
  { id: 'ai', name: 'AI, ML & Data Science', icon: 'Cpu' },
  { id: 'sys', name: 'Operating Systems & Infrastructure', icon: 'Server' },
  { id: 'agile', name: 'Agile, Git & IT Management', icon: 'GitBranch' }
];

export const IT_QUESTIONS = [
  // 1. Full Stack & Web Dev
  {
    id: 'it_web_01',
    domain: 'Full Stack & Web Dev',
    domainId: 'web',
    topic: 'Web Architecture',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'Explain the difference between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG). When should you choose each?',
    sampleAnswer: 'CSR renders HTML in the browser using JavaScript (ideal for rich SPAs/dashboards). SSR renders HTML on the server per request (great for dynamic SEO-sensitive pages). SSG compiles HTML at build time (best for high performance blogs/docs).',
    keyConcepts: ['Hydration', 'First Contentful Paint (FCP)', 'SEO Crawling', 'Server Load vs Client Processing']
  },
  {
    id: 'it_web_02',
    domain: 'Full Stack & Web Dev',
    domainId: 'web',
    topic: 'Reactivity & Svelte/React',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'How does fine-grained reactivity in modern frameworks (like Svelte runes) differ from Virtual DOM diffing in React?',
    sampleAnswer: 'Virtual DOM computes differences between JS representations of the DOM tree on state changes, scheduling re-renders. Fine-grained reactivity uses compile-time signals/runes ($state) to directly update the exact DOM node without diffing the full tree.',
    keyConcepts: ['Reconciliation', 'Signals/Runes', 'DOM Invalidation', 'Bundle Size Overhead']
  },
  {
    id: 'it_web_03',
    domain: 'Full Stack & Web Dev',
    domainId: 'web',
    topic: 'API Design',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'What are the principles of RESTful API design, and what are the main architectural trade-offs between REST and GraphQL?',
    sampleAnswer: 'REST uses standard HTTP methods (GET, POST, PUT, DELETE) and resource URIs with stateless communication. GraphQL enables clients to request exact fields, preventing over-fetching and under-fetching at the cost of caching complexity.',
    keyConcepts: ['Statelessness', 'Idempotency', 'Over-fetching / Under-fetching', 'HTTP Status Codes', 'Schema Definition']
  },
  {
    id: 'it_web_04',
    domain: 'Full Stack & Web Dev',
    domainId: 'web',
    topic: 'Asynchronous JavaScript',
    difficulty: 'Beginner',
    category: 'Information Technology (IT)',
    text: 'Explain the JavaScript Event Loop, Microtask Queue vs Macrotask Queue, and how Promises are resolved asynchronously.',
    sampleAnswer: 'The Event Loop coordinates the call stack, Web APIs, Microtask queue (Promises, mutation observers), and Macrotask/Task queue (setTimeout, setInterval, I/O). Microtasks have higher priority and run immediately after the current call stack clears.',
    keyConcepts: ['Call Stack', 'Microtasks vs Macrotasks', 'Non-blocking I/O', 'Promise Resolution']
  },
  {
    id: 'it_web_05',
    domain: 'Full Stack & Web Dev',
    domainId: 'web',
    topic: 'Web Performance & Caching',
    difficulty: 'Advanced',
    category: 'Information Technology (IT)',
    text: 'How do you optimize a modern web application for Core Web Vitals (LCP, INP, CLS)?',
    sampleAnswer: 'Optimize LCP via critical resource preloading, CDN caching, and modern image formats (WebP/AVIF). Optimize INP by yielding main thread time and debouncing expensive handlers. Avoid CLS by reserving aspect ratios and explicit dimension attributes on images/embeds.',
    keyConcepts: ['Largest Contentful Paint', 'Interaction to Next Paint', 'Cumulative Layout Shift', 'Critical Rendering Path']
  },

  // 2. Cloud & DevOps
  {
    id: 'it_cloud_01',
    domain: 'Cloud & DevOps',
    domainId: 'cloud',
    topic: 'Containerization',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'What is the difference between a Virtual Machine (VM) and a Docker Container? How do containers achieve isolation?',
    sampleAnswer: 'VMs virtualize the hardware and include a full guest OS on top of a hypervisor. Docker containers share the host OS kernel and isolate processes using Linux namespaces (PID, NET, MNT) and control groups (cgroups).',
    keyConcepts: ['Hypervisor vs Host Kernel', 'Namespaces & cgroups', 'Resource Efficiency', 'Layered Image Filesystem']
  },
  {
    id: 'it_cloud_02',
    domain: 'Cloud & DevOps',
    domainId: 'cloud',
    topic: 'Kubernetes Orchestration',
    difficulty: 'Advanced',
    category: 'Information Technology (IT)',
    text: 'Explain the core architectural components of a Kubernetes cluster and how a Pod deployment handles rolling updates and self-healing.',
    sampleAnswer: 'Control plane includes API Server, etcd, Scheduler, and Controller Manager. Worker nodes run Kubelet, Kube-proxy, and Container Runtime. Deployments use ReplicaSets for rolling updates with zero downtime and restart failed pods automatically.',
    keyConcepts: ['Control Plane vs Worker Nodes', 'etcd state store', 'Rolling Updates & Rollbacks', 'Health Probes (Liveness/Readiness)']
  },
  {
    id: 'it_cloud_03',
    domain: 'Cloud & DevOps',
    domainId: 'cloud',
    topic: 'CI/CD Pipelines',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'Describe an end-to-end CI/CD pipeline from code commit to cloud deployment, including security checks and automated testing stages.',
    sampleAnswer: 'Triggered on pull request: 1) Linting & Static Code Analysis (SAST), 2) Unit & Integration Tests, 3) Container Build & Vulnerability scan, 4) Staging deployment with E2E tests, 5) Blue-Green or Canary production release.',
    keyConcepts: ['Continuous Integration', 'Automated Gates', 'Blue-Green / Canary Deployments', 'Artifact Registries']
  },
  {
    id: 'it_cloud_04',
    domain: 'Cloud & DevOps',
    domainId: 'cloud',
    topic: 'Serverless & Cloud Architecture',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'What is Serverless Architecture (e.g. AWS Lambda / Cloud Functions)? Discuss cold starts, state management, and best use cases.',
    sampleAnswer: 'Serverless abstracts server provisioning, charging only for active compute execution. Cold starts occur during initial container initialization. Applications should remain stateless and leverage managed databases or Redis for session caching.',
    keyConcepts: ['Event-driven triggers', 'Cold start mitigation', 'Stateless execution', 'Auto-scaling & Cost Model']
  },

  // 3. Database & SQL/NoSQL
  {
    id: 'it_db_01',
    domain: 'Database & SQL/NoSQL',
    domainId: 'db',
    topic: 'SQL vs NoSQL',
    difficulty: 'Beginner',
    category: 'Information Technology (IT)',
    text: 'Compare SQL (Relational) and NoSQL (Document/Key-Value) databases in terms of ACID compliance, schema flexibility, and scalability.',
    sampleAnswer: 'SQL databases (PostgreSQL, MySQL) enforce rigid tabular schemas, ACID transactions, and scale vertically. NoSQL databases (MongoDB, Firestore) offer dynamic schemas, eventual consistency (BASE), and scale horizontally across distributed partitions.',
    keyConcepts: ['ACID vs BASE', 'Vertical vs Horizontal Scaling', 'Schema Validation', 'Joins vs Embedding']
  },
  {
    id: 'it_db_02',
    domain: 'Database & SQL/NoSQL',
    domainId: 'db',
    topic: 'Indexing & Performance',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'How do B-Tree and Hash indexes work in a relational database? What are composite indexes, and what causes index degradation?',
    sampleAnswer: 'B-Tree indexes maintain sorted balanced trees supporting range and equality queries in O(log N). Hash indexes offer O(1) for equality only. Composite indexes follow the leftmost prefix rule. Excessive indexes slow down INSERT/UPDATE/DELETE operations.',
    keyConcepts: ['B+ Tree structure', 'Leftmost Prefix Rule', 'Execution Plan (EXPLAIN ANALYZE)', 'Write Amplification']
  },
  {
    id: 'it_db_03',
    domain: 'Database & SQL/NoSQL',
    domainId: 'db',
    topic: 'Database Transactions & Isolation',
    difficulty: 'Advanced',
    category: 'Information Technology (IT)',
    text: 'Explain the 4 Transaction Isolation Levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) and the concurrency anomalies they prevent.',
    sampleAnswer: 'They prevent: Dirty Reads (reading uncommitted data), Non-Repeatable Reads (row changes during transaction), and Phantom Reads (new rows matching range). Serializable provides strict total order using two-phase locking or MVCC.',
    keyConcepts: ['Dirty Read', 'Non-Repeatable Read', 'Phantom Read', 'Multi-Version Concurrency Control (MVCC)']
  },
  {
    id: 'it_db_04',
    domain: 'Database & SQL/NoSQL',
    domainId: 'db',
    topic: 'Database Normalization',
    difficulty: 'Beginner',
    category: 'Information Technology (IT)',
    text: 'What are 1NF, 2NF, 3NF, and BCNF normalization forms? Why might a high-traffic production system intentionally denormalize data?',
    sampleAnswer: '1NF eliminates repeating groups; 2NF removes partial key dependencies; 3NF removes transitive dependencies. Denormalization reduces expensive multi-table JOIN operations in read-heavy applications (e.g. dashboards, analytics).',
    keyConcepts: ['Atomic values', 'Partial Dependency', 'Transitive Dependency', 'Read Optimization']
  },

  // 4. Cybersecurity & Networks
  {
    id: 'it_sec_01',
    domain: 'Cybersecurity & Networks',
    domainId: 'security',
    topic: 'Authentication & Security Tokens',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'How does JSON Web Token (JWT) based authentication work? What are best practices for storing and refreshing tokens securely?',
    sampleAnswer: 'JWT contains Header, Payload, and Signature. The client sends it via Authorization Bearer header. Access tokens should have short expiry (e.g. 15m) and be stored in memory or httpOnly SameSite cookies; Refresh tokens handle seamless rotation.',
    keyConcepts: ['Header.Payload.Signature', 'httpOnly Cookies', 'CSRF Protection', 'Token Rotation & Revocation']
  },
  {
    id: 'it_sec_02',
    domain: 'Cybersecurity & Networks',
    domainId: 'security',
    topic: 'Web Security (OWASP Top 10)',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'Explain SQL Injection (SQLi) and Cross-Site Scripting (XSS). How do you safeguard a modern web application against them?',
    sampleAnswer: 'SQLi manipulates queries via unescaped input (mitigate with parameterized prepared statements / ORMs). XSS executes malicious client scripts (mitigate with Context-aware escaping, Content Security Policy (CSP), and sanitized user inputs).',
    keyConcepts: ['Parameterized Queries', 'Stored vs Reflected XSS', 'Content Security Policy (CSP)', 'Input Validation']
  },
  {
    id: 'it_sec_03',
    domain: 'Cybersecurity & Networks',
    domainId: 'security',
    topic: 'Networking & OSI Model',
    difficulty: 'Beginner',
    category: 'Information Technology (IT)',
    text: 'Explain the 7 layers of the OSI model and how a web browser establishes an encrypted HTTPS connection using TCP and TLS Handshake.',
    sampleAnswer: 'Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. HTTPS begins with a TCP 3-way handshake (SYN, SYN-ACK, ACK), followed by TLS key exchange (cipher suites negotiation, certificate verification, symmetric session key creation).',
    keyConcepts: ['TCP 3-Way Handshake', 'TLS/SSL Certificate', 'Symmetric vs Asymmetric Encryption', 'Port 443']
  },
  {
    id: 'it_sec_04',
    domain: 'Cybersecurity & Networks',
    domainId: 'security',
    topic: 'Zero Trust & Cloud Security',
    difficulty: 'Advanced',
    category: 'Information Technology (IT)',
    text: 'What is the Zero Trust Architecture model in enterprise IT infrastructure? How do Role-Based Access Control (RBAC) and Least Privilege apply?',
    sampleAnswer: 'Zero Trust assumes breach and verifies explicitly every request ("never trust, always verify"). Principles include least-privilege access, micro-segmentation, multi-factor authentication (MFA), and real-time telemetry monitoring.',
    keyConcepts: ['Never Trust Always Verify', 'Micro-segmentation', 'Principle of Least Privilege', 'MFA & Identity Federation']
  },

  // 5. DSA & OOP Software Design
  {
    id: 'it_dsa_01',
    domain: 'DSA & OOP Software Design',
    domainId: 'dsa',
    topic: 'SOLID Principles',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'Explain the SOLID design principles in Object-Oriented Software Engineering with practical real-world programming examples.',
    sampleAnswer: 'Single Responsibility (one reason to change), Open/Closed (open for extension, closed for modification), Liskov Substitution (subclasses replace base types seamlessly), Interface Segregation (small specific interfaces), Dependency Inversion (depend on abstractions).',
    keyConcepts: ['SRP', 'OCP', 'LSP', 'ISP', 'DIP', 'Decoupled Architecture']
  },
  {
    id: 'it_dsa_02',
    domain: 'DSA & OOP Software Design',
    domainId: 'dsa',
    topic: 'Design Patterns',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'What is the difference between Creational, Structural, and Behavioral design patterns? Explain the Singleton and Observer patterns.',
    sampleAnswer: 'Creational deals with object creation (Singleton, Factory); Structural with class/object composition (Adapter, Decorator); Behavioral with communication between objects (Observer, Strategy). Observer enables a publisher to notify subscribers on state change.',
    keyConcepts: ['Singleton Pattern', 'Observer / Pub-Sub', 'Factory Method', 'Loose Coupling']
  },
  {
    id: 'it_dsa_03',
    domain: 'DSA & OOP Software Design',
    domainId: 'dsa',
    topic: 'Data Structures & Complexity',
    difficulty: 'Beginner',
    category: 'Information Technology (IT)',
    text: 'Explain how a Hash Table handles collisions. Compare Separate Chaining and Open Addressing (Linear Probing). What is the worst-case time complexity?',
    sampleAnswer: 'Collisions occur when different keys hash to the same bucket. Separate Chaining attaches a linked list or red-black tree to each bucket. Open Addressing finds the next empty slot. Average lookup is O(1), worst-case is O(N) without resizing.',
    keyConcepts: ['Hash Function', 'Collision Resolution', 'Load Factor & Rehashing', 'Big-O Analysis']
  },

  // 6. AI, ML & Data Science
  {
    id: 'it_ai_01',
    domain: 'AI, ML & Data Science',
    domainId: 'ai',
    topic: 'Machine Learning Fundamentals',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'What is the difference between Supervised, Unsupervised, and Reinforcement Learning? How do you detect and prevent model Overfitting?',
    sampleAnswer: 'Supervised uses labeled data (Classification/Regression); Unsupervised finds patterns in unlabeled data (Clustering/PCA); Reinforcement learns via reward/penalty signals. Overfitting is prevented using cross-validation, regularization (L1/L2), dropout, and data augmentation.',
    keyConcepts: ['Bias-Variance Tradeoff', 'Regularization (L1/L2)', 'Cross-Validation', 'Training vs Validation Loss']
  },
  {
    id: 'it_ai_02',
    domain: 'AI, ML & Data Science',
    domainId: 'ai',
    topic: 'LLMs & GenAI Engineering',
    difficulty: 'Advanced',
    category: 'Information Technology (IT)',
    text: 'Explain Retrieval-Augmented Generation (RAG) architecture. How do Vector Embeddings and Cosine Similarity enhance LLM responses with proprietary company data?',
    sampleAnswer: 'RAG converts enterprise documents into vector embeddings using an embedding model and stores them in a Vector Database. User queries search for top-K semantically similar chunks via cosine similarity, which are injected into the LLM system prompt.',
    keyConcepts: ['Vector Embeddings', 'Cosine Similarity', 'Chunking & Token Limits', 'Hallucination Mitigation']
  },

  // 7. Operating Systems & Infrastructure
  {
    id: 'it_sys_01',
    domain: 'Operating Systems & Infrastructure',
    domainId: 'sys',
    topic: 'Concurrency & OS Architecture',
    difficulty: 'Intermediate',
    category: 'Information Technology (IT)',
    text: 'What is the difference between a Process and a Thread? Explain Deadlock and the four necessary Coffman conditions required for a deadlock to occur.',
    sampleAnswer: 'A Process has its own dedicated address space/memory; Threads share memory within the same process. Coffman conditions: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, 4) Circular Wait. Prevent by ordering resource acquisition.',
    keyConcepts: ['Context Switching', 'Shared Memory vs IPC', 'Coffman Conditions', 'Mutex & Semaphores']
  },
  {
    id: 'it_sys_02',
    domain: 'Operating Systems & Infrastructure',
    domainId: 'sys',
    topic: 'DNS, CDN & Global Traffic',
    difficulty: 'Beginner',
    category: 'Information Technology (IT)',
    text: 'Step-by-step, what happens when a user types a URL (e.g. https://example.com) in their browser until the page finishes loading?',
    sampleAnswer: '1) Browser cache & OS DNS lookup (Recursive resolver -> Root -> TLD -> Authoritative DNS), 2) IP resolution to CDN edge or server, 3) TCP handshake + TLS negotiation, 4) HTTP GET request, 5) Server response & DOM tree parsing, 6) CSSOM construction and rendering.',
    keyConcepts: ['DNS Hierarchy', 'CDN Edge Caching', 'DOM & CSSOM', 'Render Tree Construction']
  },

  // 8. Agile, Git & IT Management
  {
    id: 'it_agile_01',
    domain: 'Agile, Git & IT Management',
    domainId: 'agile',
    topic: 'Git Workflow & Branching',
    difficulty: 'Beginner',
    category: 'Information Technology (IT)',
    text: 'What is the difference between git merge and git rebase? When should you use trunk-based development versus GitFlow in enterprise IT projects?',
    sampleAnswer: 'git merge preserves history with a 3-way merge commit; git rebase rewrites commit history on top of the target branch for a linear log. Trunk-based development promotes frequent small PRs to main (ideal for CI/CD), while GitFlow uses feature/release branches.',
    keyConcepts: ['Fast-Forward Merge', 'Interactive Rebase', 'Trunk-Based vs GitFlow', 'Conflict Resolution']
  }
];

export function getQuestionsByDomain(domainId) {
  if (!domainId || domainId === 'all') return IT_QUESTIONS;
  return IT_QUESTIONS.filter(q => q.domainId === domainId);
}

export function searchQuestions(query, domainId = 'all', difficulty = 'all') {
  let list = IT_QUESTIONS;
  if (domainId && domainId !== 'all') {
    list = list.filter(q => q.domainId === domainId);
  }
  if (difficulty && difficulty !== 'all') {
    list = list.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(item => 
      item.text.toLowerCase().includes(q) ||
      item.topic.toLowerCase().includes(q) ||
      item.domain.toLowerCase().includes(q) ||
      (item.keyConcepts && item.keyConcepts.some(c => c.toLowerCase().includes(q)))
    );
  }
  return list;
}
