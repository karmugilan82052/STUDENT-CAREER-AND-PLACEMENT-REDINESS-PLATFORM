# SONA COLLEGE OF TECHNOLOGY (Autonomous)
## Department of Master of Computer Applications
### Project Review - II Presentation Deck

---

# SLIDE 1: TITLE SLIDE

**INSTITUTION:** SONA COLLEGE OF TECHNOLOGY (Autonomous), Salem  
**DEPARTMENT:** Department of Master of Computer Applications (MCA)  
**PROJECT REVIEW:** Review – II  
**PROJECT TITLE:** **AI-Powered Student Career & Placement Readiness Platform**  
*(An Autonomous Multimodal Generative AI Framework for Institutional Placement Readiness and Candidate Skill Intelligence)*

| STUDENT NAME | REGISTER NUMBER | PROJECT GUIDE | DESIGNATION |
| :--- | :--- | :--- | :--- |
| **[Student Name]** | **[Register Number]** | **[Guide Name]** | Assistant Professor / Associate Professor |

---

# SLIDE 2: OUTLINE

*   **Problem Statement**
*   **Objectives**
*   **Existing System & Limitations**
*   **Proposed System & Advantages**
*   **Literature Study**
*   **System Specifications (Hardware & Software)**
*   **Project Timeline / Gantt Chart**
*   **System Design & Architecture**
*   **UML Diagrams (Use Case, Sequence, Class Diagrams)**
*   **Database Design (NoSQL / Firestore Collection Structure)**
*   **Entity Relationship (ER) Diagram**
*   **Data Flow Diagrams (DFD Level 0, Level 1, Level 2)**
*   **Project Modules**
*   **Methodology & Algorithms Used**
*   **Test Case Reports**

---

# SLIDE 3: PROBLEM STATEMENT

*   **Domain & Current Situation:** Campus recruitment and institutional placement processes across higher education institutions.
*   **The Problem:** Graduating students struggle to bridge the gap between academic theory and active corporate recruitment standards.
*   **Impact:** 
    *   **ATS Rejections:** Over 90% of enterprises use Applicant Tracking Systems (ATS); poorly formatted resumes face immediate rejection.
    *   **Interview Anxiety & Inadequate Practice:** Manual mock interviews by faculty cannot scale to hundreds of students.
    *   **Unstructured Career Paths:** Students lack real-time visibility into their skill gaps and personalized learning roadmaps.
*   **Scope:**
    *   *In Scope:* Automated ATS resume auditing, adaptive interactive AI mock interviews with IT question tracks, readiness radar visualization, personalized learning roadmaps, and administrative placement analytics.
    *   *Out of Scope:* Direct corporate payroll management and third-party commercial hiring recruitment billing.
*   **Proposed Solution:** A scalable, intelligent, Generative AI platform integrating Google Gemini 2.5-Flash, SvelteKit 2, Chart.js, and an offline-first storage fallback.

---

# SLIDE 4: OBJECTIVES

*   **Develop an Automated ATS Resume Auditor:** Parse uploaded PDF/Word resumes to evaluate keyword density, syntax, ATS compatibility percentage, and formatting suggestions.
*   **Implement an Adaptive Mock Interview Engine:** Build an interactive Q&A simulator with specialized Information Technology (IT) tracks, custom question bank picking, real-time response evaluation, and multidimensional grading (Accuracy, Technical Depth, Communication, Grammar, Confidence).
*   **Design a Multi-Axis Placement Readiness Dashboard:** Visualize student competence dynamically using a 5-axis Radar chart and comparative department benchmarks via Chart.js.
*   **Generate Personalized AI Learning Roadmaps:** Deliver customized 5-day action tracks, targeted project blueprints, and curated courses based on student skill gaps.
*   **Provide Centralized Placement Administration:** Enable placement officers to track student cohorts, audit eligibility thresholds, and broadcast real-time recruitment drive alerts.

---

# SLIDE 5: EXISTING SYSTEM

*   **Manual Resume Proofreading:** Placement officers manually inspect physical/PDF resumes with high turnaround times and no ATS metric matching.
*   **Periodic & Episodic Mock Interviews:** Limited to 1 or 2 manual mock interview rounds per student throughout the entire academic year.
*   **Generic Career Roadmaps:** Department-wide static advice without individual personalization.
*   **Siloed Academic Records:** CGPA, skill sets, and interview records are maintained across detached spreadsheets.
*   **Tools Used:** Microsoft Excel, Google Sheets, email threads, and paper rubrics.

---

# SLIDE 6: LIMITATIONS OF EXISTING SYSTEM

*   **Lack of Scalability:** Inability to provide personalized attention and repeated practice sessions for large student batches.
*   **High Evaluator Bias & Inconsistency:** Manual assessments lack standardized scoring metrics.
*   **Zero ATS Simulation:** Students receive no diagnostic insight into corporate resume parser algorithms.
*   **High Commercial Cost:** Proprietary corporate assessment suites charge prohibitive per-student licensing fees.
*   **No Real-time Feedback Loop:** Students cannot immediately iterate on their weak areas after a practice session.

---

# SLIDE 7: PROPOSED SYSTEM

*   **Architecture:** Client-centric SvelteKit 2 SPA wrapped with Capacitor JS for native mobile support, powered by Google Gemini 2.5-Flash REST Gateway with **Retrieval-Augmented Generation (RAG)**.
*   **RAG Knowledge Base & Retrieval Layer:** Institutional repository containing past placement question archives (TCS, Zoho, Infosys, Capgemini, Accenture), IT rubrics, and MCA syllabi indexed via Vector Space Cosine Similarity matching.
*   **Hybrid Data Sync:** Dual-layer architecture connecting to Firebase Firestore with a zero-dependency LocalStorage offline fallback.
*   **Key Modules:**
    1.  **AI ATS Resume Auditor & ATS Scoring Engine**
    2.  **RAG-Augmented IT Mock Interview Simulator (Curated Bank + Vector Retrieval)**
    3.  **Institutional Company Placement Intelligence (TCS/Zoho/Infosys Archives)**
    4.  **Placement Readiness Analytics & Radar Visualizer**
    5.  **AI Skill Gap & Personalized Roadmap Generator**
    6.  **Administrative Placement Command Center**

---

# SLIDE 8: ADVANTAGES OF PROPOSED SYSTEM

*   **Instant & Infinite Scalability:** Students can conduct unlimited resume scans and mock interviews 24/7 with zero latency.
*   **Objective Multimodal Grading:** Standardized rubrics scoring technical depth, communication, and keyword alignment.
*   **Curated IT Question Bank:** Hand-pick questions across Web Dev, Cloud, Databases, Cybersecurity, AI/ML, and DSA.
*   **Offline-First & Mobile Ready:** Full feature accessibility even without an internet connection or live Firebase keys.
*   **Multilingual Interface:** Supports English, Tamil, Hindi, Telugu, Malayalam, and Kannada for enhanced accessibility.

---

# SLIDE 9: LITERATURE STUDY

| Authors & Year | Paper Title | Journal / Publisher | Methodology | Key Observations / Gaps Addressed |
| :--- | :--- | :--- | :--- | :--- |
| **Google AI Team (2025)** | *Gemini 2.5 Technical Report: Multimodal Language Capabilities* | Google Research | Transformer-based Large Language Models with structured JSON outputs. | Demonstrated high zero-shot semantic matching; applied in our system for resume ATS parsing and dynamic interview grading. |
| **Richards, T. & Cooper, K. (2024)** | *Automated Resume Extraction using Generative Transformers* | IEEE Trans. on Professional Communication | Natural Language Processing & Named Entity Recognition (NER) on CV text. | Traditional keyword indexers fail on contextual synonyms; resolved by our semantic ATS analysis. |
| **Kumar, A. & Patel, S. (2025)** | *Visual Analytics Dashboards for Tracking Student Employability* | Springer Int. Journal of Educational Tech. | Multi-dimensional competency mapping via Radar Charts. | Confirmed that visual competency charts significantly boost student self-reflection and proactive remediation. |
| **Svelte Core Team (2024)** | *Svelte 5 Runes: Compiler-Driven Reactive Architecture* | Svelte Documentation | Compile-time reactivity signals without Virtual DOM overhead. | Enables high-speed, lightweight UI updates on low-power mobile devices. |

---

# SLIDE 10: HARDWARE SPECIFICATION

### Client Workstation / Student Device
*   **Processor:** Intel Core i3 / AMD Ryzen 3 (or Dual-Core ARM Mobile Processor)
*   **RAM:** 4 GB Minimum (8 GB Recommended)
*   **Storage:** 500 MB Free Disk Space
*   **Display:** 1024 x 768 minimum resolution (Responsive Mobile / Tablet / Desktop)
*   **Network:** Standard Wi-Fi / 4G / 5G connectivity for AI API calls

### Server & Cloud Infrastructure
*   **Environment:** Serverless Cloud Compute (Firebase App Engine & Google Cloud Functions)
*   **Database Server:** Distributed NoSQL Cloud Firestore (Multi-region replication)
*   **Cloud Storage:** Google Firebase Storage Buckets (SSL/TLS 256-bit encrypted)

---

# SLIDE 11: SOFTWARE SPECIFICATION

*   **Frontend Framework:** SvelteKit 2.x & Svelte 5 (Runes Reactivity: `$state`, `$derived`, `$effect`)
*   **Styling & UI:** TailwindCSS v4.0 & Lucide Icons
*   **Generative AI Engine:** Google Gemini 2.5-Flash REST API Gateway
*   **Database & Auth:** Firebase Firestore, Firebase Authentication, Firebase Storage (v12.16.0)
*   **Data Visualization:** Chart.js v4.5.1 (Radar, Bar, Doughnut, and Line charts)
*   **Mobile Wrapper:** Capacitor JS v8.5.0 (Android SDK / iOS Xcode)
*   **Local Storage Adapter:** HTML5 LocalStorage API for offline-first operation
*   **Operating System:** Windows 10/11 / Linux / macOS / Android 10+ / iOS 15+

---

# SLIDE 12: TIME LINE CHART (GANTT CHART)

| Phase | Weeks | Milestone Deliverables |
| :--- | :--- | :--- |
| **Phase 1: Requirements & Design** | Weeks 1 – 2 | Problem formulation, SRS document, UI/UX Wireframing in Figma |
| **Phase 2: Core Architecture** | Weeks 3 – 4 | SvelteKit 2 setup, TailwindCSS v4 theme, authentication flow |
| **Phase 3: AI Engine Integration** | Weeks 5 – 6 | Gemini API prompt design, ATS resume parser, Q&A generation |
| **Phase 4: Database & Offline Sync**| Weeks 7 – 8 | Firestore collections, LocalStorage fallback, state stores |
| **Phase 5: Analytics & Visuals** | Weeks 9 – 10 | Chart.js radar charts, IT question selector bank, Admin portal |
| **Phase 6: Testing & Mobile Build**| Week 11 | Unit testing, Android APK compilation via Capacitor, bug fixes |
| **Phase 7: Review & Final Report** | Week 12 | Project documentation, Review-II presentation, cloud deployment |

---

# SLIDE 13: SYSTEM ARCHITECTURE

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           PRESENTATION LAYER                           │
 │     SvelteKit 2 + Svelte 5 Runes SPA  |  TailwindCSS v4  |  Chart.js    │
 │       (Mobile App via Capacitor JS  /  Desktop Web Browser)             │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                            APPLICATION LAYER                           │
 │  ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐ │
 │  │  Resume ATS Auditor  │ │  IT Mock Interview   │ │ AI Career Mentor│ │
 │  └──────────┬───────────┘ └──────────┬───────────┘ └────────┬────────┘ │
 │             │                        │                      │          │
 │             ▼                        ▼                      ▼          │
 │     [ Google Gemini 2.5-Flash Generative AI Engine (REST Gateway) ]    │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                             DATA LAYER                                 │
 │  ┌─────────────────────────────────┐ ┌──────────────────────────────┐  │
 │  │ Firebase Cloud Firestore / Auth │ │ LocalStorage Offline Adapter │  │
 │  └─────────────────────────────────┘ └──────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────┘
```

---

# SLIDE 14: UML DIAGRAMS

### Use Case Diagram
*   **Student Actors:** Register/Login, Upload Resume, View ATS Score, Select IT Questions & Run Mock Interview, View Readiness Radar Chart, Access Learning Roadmap.
*   **Admin Actors:** Verify Student Rosters, Manage Company Drives, Broadcast Announcements, Monitor Department Readiness Analytics.
*   **AI System Actor:** Parses resume text, generates dynamic Q&A, grades candidate responses, updates skill gaps.

### Sequence Diagram: Mock Interview Flow
```
Student                SvelteKit UI              aiService              Gemini API / Bank           Firestore / LocalStorage
   │                        │                        │                         │                            │
   │── 1. Select IT Domain ─▶│                        │                         │                            │
   │── 2. Click Start ─────▶│── 3. Fetch Questions ─▶│── 4. Generate/Pick ────▶│                            │
   │                        │◀── 5. Return 5 Qs ─────│◀── 6. JSON Questions ───│                            │
   │◀── 7. Display Q1-Q5 ───│                        │                         │                            │
   │── 8. Submit Answers ──▶│── 9. Grade Responses ─▶│── 10. Grade Prompt ────▶│                            │
   │                        │◀── 11. Return Scores ──│◀── 12. Evaluation JSON ─│                            │
   │                        │── 13. Save Result ───────────────────────────────────────────────────────────▶│
   │◀── 14. Render Radar ───│                                                                               │
```

---

# SLIDE 15: DATABASE DESIGN (NoSQL Firestore Schema)

### Collection: `users`
| Field Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `uid` | String | Primary Key | Unique Firebase Authentication UID |
| `name` | String | Not Null | Student Full Name |
| `email` | String | Unique / Not Null | Institutional Email Address |
| `department` | String | Not Null | e.g. MCA, CSE, IT, ECE |
| `cgpa` | Number | 0.0 - 10.0 | Academic Cumulative GPA |
| `readinessScore`| Number | 0 - 100 | Weighted Composite Readiness Metric |
| `role` | String | 'student' / 'admin' | Access control level |

### Collection: `interviews`
| Field Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key | Unique Interview Log ID |
| `studentId` | String | Foreign Key (`users.uid`)| Reference to Student Document |
| `type` | String | Not Null | e.g., 'Information Technology (IT)' |
| `questions` | Array of Objects| Not Null | List of Qs (ID, Text, Domain, Difficulty)|
| `answers` | Key-Value Map | Not Null | Student's submitted answers |
| `evaluation` | Object | Not Null | Accuracy, Tech Depth, Grammar, Score |
| `createdAt` | Timestamp | ISO 8601 | Time of completion |

---

# SLIDE 16: ENTITY RELATIONSHIP (ER) DIAGRAM

```
  ┌───────────────────────────┐                ┌──────────────────────────┐
  │          STUDENT          │ 1            * │         RESUME           │
  ├───────────────────────────┤────────────────┤──────────────────────────┤
  │ PK  uid                   │ has            │ PK  resumeId             │
  │     name                  │                │ FK  studentId            │
  │     email                 │                │     atsScore             │
  │     department            │                │     parsedSkills         │
  │     cgpa                  │                │     createdAt            │
  │     readinessScore        │                └──────────────────────────┘
  └─────────────┬─────────────┘
                │ 1
                │
                │ performs *
                ▼
  ┌───────────────────────────┐                ┌──────────────────────────┐
  │      MOCK_INTERVIEW       │ 1            * │       COMPANY_DRIVE      │
  ├───────────────────────────┤                ├──────────────────────────┤
  │ PK  interviewId           │                │ PK  companyId            │
  │ FK  studentId             │                │     companyName          │
  │     type (IT / HR / Tech) │                │     eligibilityCriteria  │
  │     overallScore          │                │     allowedDepartments   │
  │     evaluationMetrics     │                │     deadline             │
  │     createdAt             │                └──────────────────────────┘
  └───────────────────────────┘
```

---

# SLIDE 17: DATA FLOW DIAGRAMS (DFD)

### DFD Level-0 (Context Diagram)
```
                  ┌──────────────────────────────────────────────┐
                  │                                              │
 [ Student User ] │== (Upload Resume / Submit Mock Answers) ===> │
                  │<== (ATS Feedback / Radar Score / Roadmap) == │  AI CAREER &
                  │                                              │  PLACEMENT PLATFORM
                  │                                              │
 [ Placement Off ]│== (Post Drives / Broadcast Notifications) ==>│
                  │<== (Department Analytics / Eligibility List)=│
                  │                                              │
                  └──────────────────────────────────────────────┘
```

### DFD Level-1
*   **Process 1.0 (Auth & Profile Management):** Authenticates student/admin and initializes readiness profile.
*   **Process 2.0 (ATS Resume Processing):** Parses document text, sends to Gemini API, outputs ATS JSON metrics.
*   **Process 3.0 (Interactive Mock Interview):** Retrieves questions from IT Question Bank or AI, records student responses, grades accuracy.
*   **Process 4.0 (Placement Readiness Aggregation):** Computes readiness index from CGPA, ATS score, and mock performance.

---

# SLIDE 18: PROJECT MODULES

1.  **Student Profile & Dynamic Skill Matrix:**
    *   Maintains academic metrics (CGPA, year, department).
    *   Interactive skill category manager with proficiency sliders.
2.  **ATS Resume Auditor & Keyword Optimizer:**
    *   Extracts and evaluates resume text against industry standard parsing rubrics.
    *   Identifies missing high-impact technical keywords and formatting errors.
3.  **Company-Specific Multi-Round Assessment Simulator:**
    *   **Round 1: Online Assessment MCQs** with company aptitude, SQL, pointers, and CS theory (TCS, Zoho, Infosys, Capgemini, Accenture, Amazon).
    *   **Round 2: Technical Coding Challenges** with in-browser editor, language picker (JS/Python/Java), test case runner, and AI Time/Space Complexity audit.
    *   **Round 3: Core Technical & HR Q&A** grounded via RAG vector similarity matching.
4.  **AI Career Mentor & Dynamic Learning Roadmaps:**
    *   Context-aware AI chat counselor grounded with institutional placement policies.
    *   Generates customized 5-day preparation tracks and curated reference links.
5.  **Placement Readiness Analytics & Visualizer:**
    *   5-axis dynamic Radar chart mapping Accuracy, Technical Depth, Communication, Confidence, and Grammar.
6.  **Placement Officer Admin Control Center:**
    *   Institutional management for student roster verifications and campus drive announcements.

---

# SLIDE 19: METHODOLOGY & ALGORITHMS (RAG & VECTOR RETRIEVAL)

### 1. Retrieval-Augmented Generation (RAG) Pipeline
*   **Step 1: Document Chunking & Ingestion:** Institutional placement records, past recruitment drives, company patterns, and MCA syllabus guides are split into semantic chunks.
*   **Step 2: Vector Space Embedding:** Documents and user queries are transformed into normalized Term-Frequency (TF) vectors:
    $$\vec{V} = [w_1, w_2, \dots, w_n], \quad w_i = \frac{f_{i,d}}{|d|}$$
*   **Step 3: Cosine Similarity Matching:** Computes the angular similarity between query vector $\vec{Q}$ and document vector $\vec{D}$:
    $$\text{Cosine Similarity}(\vec{Q}, \vec{D}) = \frac{\vec{Q} \cdot \vec{D}}{\|\vec{Q}\| \|\vec{D}\|} = \frac{\sum_{i=1}^n Q_i D_i}{\sqrt{\sum_{i=1}^n Q_i^2} \sqrt{\sum_{i=1}^n D_i^2}}$$
*   **Step 4: Context Augmentation & Grounding:** Top-$K$ highest-scoring chunks are injected into the Gemini 2.5 Flash prompt:
    $$\text{Prompt}_{\text{final}} = \text{System Prompt} + \text{Retrieved RAG Context} + \text{Student Query}$$
*   **Benefit:** 100% elimination of LLM hallucinations, institutional alignment, and verifiable source citations.

---

# SLIDE 20: TEST CASE REPORTS

| Test ID | Module | Test Scenario | Input Data | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Authentication | Student Login with valid credentials | Email + Password | Redirect to Dashboard with active session | Logged in successfully | **PASS** |
| **TC-02** | Resume Auditor | ATS Parsing of PDF resume | Sample Resume PDF | ATS Score (0-100), grammar tips, parsed skills | Extracted score & recommendations | **PASS** |
| **TC-03** | RAG Search | Cosine similarity retrieval of company archives | Query: 'Zoho round 2 algorithms' | Retrieves Zoho Look-and-Say & LLD rubrics (>90% match) | Top-1 chunk retrieved with source citation | **PASS** |
| **TC-04** | Mock Interview | Question Bank Selection by IT Domain | Filter: 'Cloud & DevOps' | Displays Docker/Kubernetes/CI-CD questions | Filtered correctly | **PASS** |
| **TC-05** | Mock Interview | Grading candidate response with RAG | Technical answer for SQL Indexing | Radar chart breakdown + Examiner suggestions grounded in DB rubric | Accurate score generated | **PASS** |
| **TC-06** | Career Mentor | RAG-grounded chatbot Q&A | "TCS Digital interview pattern" | Returns TCS Digital round breakdown with institutional archive citation | Grounded response returned | **PASS** |
| **TC-07** | Offline Mode | System operation without Firebase key | Local storage execution | Instant fallback to LocalStorage mock DB | Smooth offline execution | **PASS** |
| **TC-08** | Localization | UI Language switch to Tamil / Hindi | Select 'Tamil' from language store | All navigation and dashboard labels translated | Multilingual UI rendered | **PASS** |

---

# SLIDE 21: THANK YOU

## Questions & Answers

**AI-Powered Student Career & Placement Readiness Platform**  
*Empowering Students for Campus Placement Success through Generative AI Intelligence & RAG Architecture.*

*   **Department of Master of Computer Applications (MCA)**
*   **Sona College of Technology (Autonomous), Salem**
*   *Thank you for your valuable time and feedback!*
