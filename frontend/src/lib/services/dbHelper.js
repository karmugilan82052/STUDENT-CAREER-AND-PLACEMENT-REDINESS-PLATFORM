import { browser } from '$app/environment';

export const isMockMode = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "mock-api-key-for-development-only";

if (isMockMode && browser) {
  console.log("CareerReady AI: Running in local mockup/offline mode. Data is stored in LocalStorage.");
  
  // Seed and ensure default users exist in LocalStorage
  let existingUsers = {};
  try { existingUsers = JSON.parse(localStorage.getItem('cs_users') || '{}'); } catch(e) {}
  existingUsers["admin@careerready.ai"] = { uid: "admin123", email: "admin@careerready.ai", role: "admin", name: "System Administrator" };
  existingUsers["student@careerready.ai"] = { uid: "student123", email: "student@careerready.ai", role: "student", name: "John Doe" };
  localStorage.setItem('cs_users', JSON.stringify(existingUsers));
  
  const defaultStudentBatch = {
    "student123": {
      uid: "student123",
      name: "John Doe",
      registerNumber: "2024MCA001",
      email: "student@careerready.ai",
      department: "Master of Computer Applications (MCA)",
      year: 2,
      cgpa: 8.5,
      backlogs: 0,
      phone: "+91 9876543210",
      address: "123 Main Street, Tech City",
      links: { linkedin: "https://linkedin.com/in/johndoe", github: "https://github.com/johndoe", portfolio: "https://johndoe.dev" },
      careerGoal: "Full Stack AI Engineer",
      preferredLanguage: "en",
      profilePhotoUrl: "",
      readinessScore: 78,
      atsScore: 78,
      mockScore: 82,
      updatedAt: new Date().toISOString()
    },
    "student124": {
      uid: "student124",
      name: "Priya Sharma",
      registerNumber: "2024MCA015",
      email: "priya.sharma@sonatech.ac.in",
      department: "Master of Computer Applications (MCA)",
      year: 2,
      cgpa: 9.1,
      backlogs: 0,
      phone: "+91 9845123456",
      address: "45 Anna Nagar, Salem",
      links: { linkedin: "https://linkedin.com/in/priyasharma", github: "https://github.com/priyasharma" },
      careerGoal: "Cloud & Distributed Systems Specialist",
      preferredLanguage: "en",
      profilePhotoUrl: "",
      readinessScore: 92,
      atsScore: 89,
      mockScore: 90,
      updatedAt: new Date().toISOString()
    },
    "student125": {
      uid: "student125",
      name: "Rahul Verma",
      registerNumber: "2024CSE042",
      email: "rahul.verma@sonatech.ac.in",
      department: "Computer Science (CSE)",
      year: 4,
      cgpa: 7.4,
      backlogs: 0,
      phone: "+91 9712345678",
      address: "12 Junction Road, Salem",
      links: { linkedin: "https://linkedin.com/in/rahulverma", github: "https://github.com/rahulverma" },
      careerGoal: "Backend Developer (Java/Spring)",
      preferredLanguage: "en",
      profilePhotoUrl: "",
      readinessScore: 72,
      atsScore: 75,
      mockScore: 70,
      updatedAt: new Date().toISOString()
    },
    "student126": {
      uid: "student126",
      name: "Ananya Sundaram",
      registerNumber: "2024IT028",
      email: "ananya.s@sonatech.ac.in",
      department: "Information Technology (IT)",
      year: 4,
      cgpa: 8.8,
      backlogs: 0,
      phone: "+91 9940123456",
      address: "78 Meyyanur Bypass, Salem",
      links: { linkedin: "https://linkedin.com/in/ananyas", github: "https://github.com/ananyas" },
      careerGoal: "AI & Data Engineer",
      preferredLanguage: "en",
      profilePhotoUrl: "",
      readinessScore: 86,
      atsScore: 88,
      mockScore: 85,
      updatedAt: new Date().toISOString()
    },
    "student127": {
      uid: "student127",
      name: "Karthik Raja",
      registerNumber: "2024MCA033",
      email: "karthik.raja@sonatech.ac.in",
      department: "Master of Computer Applications (MCA)",
      year: 2,
      cgpa: 6.2,
      backlogs: 1,
      phone: "+91 9623456789",
      address: "23 Fairlands, Salem",
      links: { linkedin: "https://linkedin.com/in/karthikraja", github: "https://github.com/karthikraja" },
      careerGoal: "Web Developer",
      preferredLanguage: "en",
      profilePhotoUrl: "",
      readinessScore: 55,
      atsScore: 62,
      mockScore: 58,
      updatedAt: new Date().toISOString()
    },
    "student128": {
      uid: "student128",
      name: "Sneha Patel",
      registerNumber: "2024ECE051",
      email: "sneha.patel@sonatech.ac.in",
      department: "Electronics & Comm. (ECE)",
      year: 4,
      cgpa: 7.8,
      backlogs: 0,
      phone: "+91 9501234567",
      address: "89 Alagapuram, Salem",
      links: { linkedin: "https://linkedin.com/in/snehapatel", github: "https://github.com/snehapatel" },
      careerGoal: "Embedded & IoT Software Engineer",
      preferredLanguage: "en",
      profilePhotoUrl: "",
      readinessScore: 79,
      atsScore: 81,
      mockScore: 76,
      updatedAt: new Date().toISOString()
    },
    "student129": {
      uid: "student129",
      name: "Vignesh K",
      registerNumber: "2024CSE089",
      email: "vignesh.k@sonatech.ac.in",
      department: "Computer Science (CSE)",
      year: 4,
      cgpa: 6.8,
      backlogs: 0,
      phone: "+91 9443123456",
      address: "14 Hastampatti, Salem",
      links: { linkedin: "https://linkedin.com/in/vigneshk", github: "https://github.com/vigneshk" },
      careerGoal: "Frontend Developer",
      preferredLanguage: "en",
      profilePhotoUrl: "",
      readinessScore: 65,
      atsScore: 68,
      mockScore: 64,
      updatedAt: new Date().toISOString()
    },
    "student130": {
      uid: "student130",
      name: "Divya Mohan",
      registerNumber: "2024MCA009",
      email: "divya.mohan@sonatech.ac.in",
      department: "Master of Computer Applications (MCA)",
      year: 2,
      cgpa: 8.2,
      backlogs: 0,
      phone: "+91 9382123456",
      address: "56 Saradha College Road, Salem",
      links: { linkedin: "https://linkedin.com/in/divyamohan", github: "https://github.com/divyamohan" },
      careerGoal: "Full Stack Python Specialist",
      preferredLanguage: "en",
      profilePhotoUrl: "",
      readinessScore: 84,
      atsScore: 85,
      mockScore: 80,
      updatedAt: new Date().toISOString()
    }
  };

  const existingStudents = localStorage.getItem('cs_students');
  if (!existingStudents) {
    localStorage.setItem('cs_students', JSON.stringify(defaultStudentBatch));
  } else {
    try {
      const parsed = JSON.parse(existingStudents);
      if (Object.keys(parsed).length <= 2) {
        // Upgrade with rich student cohort
        localStorage.setItem('cs_students', JSON.stringify({ ...defaultStudentBatch, ...parsed }));
      } else {
        // Ensure backlogs and scores are initialized
        let changed = false;
        Object.keys(parsed).forEach(uid => {
          if (parsed[uid].backlogs === undefined) {
            parsed[uid].backlogs = parsed[uid].cgpa < 6.5 ? 1 : 0;
            changed = true;
          }
          if (parsed[uid]?.profilePhotoUrl && parsed[uid].profilePhotoUrl.includes('images.unsplash.com')) {
            parsed[uid].profilePhotoUrl = "";
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem('cs_students', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      localStorage.setItem('cs_students', JSON.stringify(defaultStudentBatch));
    }
  }

  if (!localStorage.getItem('cs_skills')) {
    localStorage.setItem('cs_skills', JSON.stringify({
      "student123": {
        studentId: "student123",
        categories: {
          programming: [
            { name: "JavaScript", rating: 85 },
            { name: "HTML5 & CSS3", rating: 90 },
            { name: "Python", rating: 70 }
          ],
          database: [
            { name: "MongoDB", rating: 80 },
            { name: "PostgreSQL", rating: 65 }
          ],
          cloud: [
            { name: "AWS", rating: 50 }
          ],
          ai: [
            { name: "Prompt Engineering", rating: 75 }
          ],
          softSkills: [
            { name: "Communication", rating: 85 },
            { name: "Problem Solving", rating: 80 }
          ]
        }
      }
    }));
  }

  if (!localStorage.getItem('cs_resumes')) {
    localStorage.setItem('cs_resumes', JSON.stringify([
      {
        id: "res123",
        studentId: "student123",
        fileName: "john_doe_resume.pdf",
        fileUrl: "#",
        uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        isPrimary: true
      }
    ]));
  }

  if (!localStorage.getItem('cs_resume_analysis')) {
    localStorage.setItem('cs_resume_analysis', JSON.stringify({
      "res123": {
        id: "res123",
        studentId: "student123",
        atsScore: 78,
        parsedData: {
          name: "John Doe",
          email: "student@careerready.ai",
          skills: ["JavaScript", "React", "Node.js", "MongoDB", "CSS", "HTML"],
          education: "Master of Computer Applications",
          experience: "Frontend Intern at TechCorp (6 months)"
        },
        grammarCheck: [
          { error: "Utilized", suggestion: "Used", context: "...utilized Svelte to..." }
        ],
        keywordMatching: {
          matched: ["JavaScript", "HTML", "CSS", "MongoDB"],
          missing: ["SvelteKit", "Tailwind CSS", "Firebase"]
        },
        formattingSuggestions: [
          "Ensure section headers are consistent in size and capitalization",
          "Remove excessive bullet margins to save spacing"
        ],
        strengths: [
          "Strong core JavaScript foundation",
          "Clear presentation of academic projects"
        ],
        weaknesses: [
          "Lacks cloud deployment credentials",
          "Few contributions to open source shown"
        ],
        recruiterFeedback: "A solid entry-level candidate. Good technical foundation, but needs to showcase more modern framework-specific applications and cloud hosting skills.",
        suggestions: [
          "Add a project hosted on Vercel or Firebase Storage",
          "Highlight Firebase configuration experience under skills"
        ],
        analyzedAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    }));
  }

  const defaultCompanies = [
    {
      id: "comp1",
      name: "Google",
      logoUrl: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop",
      package: 34,
      location: "Bengaluru, India",
      eligibility: {
        minCgpa: 8.0,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
        requiredSkills: ["Data Structures", "Algorithms", "Python/C++", "System Design"]
      },
      bond: "None",
      driveDate: "2026-09-15",
      jobDescription: "Software Engineer (SDE-1). Design, test, deploy, and scale globally distributed cloud services and web applications.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp13",
      name: "Capgemini",
      logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
      package: 7.5,
      location: "Mumbai, India",
      eligibility: {
        minCgpa: 6.0,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)", "Electronics & Comm. (ECE)"],
        requiredSkills: ["Java", "SQL", "Spring Boot", "Cloud Fundamentals"]
      },
      bond: "None",
      driveDate: "2026-08-28",
      jobDescription: "Senior Analyst / Software Engineer. Collaborate with global enterprise client teams on digital transformation and cloud migration.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp2",
      name: "TCS",
      logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      package: 7,
      location: "Chennai, India",
      eligibility: {
        minCgpa: 6.5,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
        requiredSkills: ["JavaScript", "Java", "SQL", "SDLC"]
      },
      bond: "2 Years",
      driveDate: "2026-08-20",
      jobDescription: "Systems Engineer. Collaborate with teams to support enterprise digital applications.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp3",
      name: "Infosys",
      logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=100&h=100&fit=crop",
      package: 6.5,
      location: "Mysore, India",
      eligibility: {
        minCgpa: 6.0,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
        requiredSkills: ["HTML/CSS", "Python", "SQL"]
      },
      bond: "1 Year",
      driveDate: "2026-08-25",
      jobDescription: "Specialist Programmer. Responsible for high-performance software building.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp4",
      name: "Microsoft",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
      package: 28,
      location: "Hyderabad, India",
      eligibility: {
        minCgpa: 8.0,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
        requiredSkills: ["C++", "Data Structures", "Cloud Computing", "Azure", "Algorithms"]
      },
      bond: "None",
      driveDate: "2026-10-05",
      jobDescription: "Software Development Engineer (SDE-1). Design and scale distributed cloud services and enterprise platforms.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp5",
      name: "Amazon",
      logoUrl: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&h=100&fit=crop",
      package: 32,
      location: "Bengaluru, India",
      eligibility: {
        minCgpa: 7.5,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)", "Electronics & Comm. (ECE)"],
        requiredSkills: ["Java", "System Design", "AWS", "Object-Oriented Programming"]
      },
      bond: "None",
      driveDate: "2026-09-28",
      jobDescription: "SDE-1. Build high-throughput microservices, customer shopping systems, and cloud infrastructure components.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp6",
      name: "Accenture",
      logoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
      package: 8.5,
      location: "Pune, India",
      eligibility: {
        minCgpa: 6.0,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)", "Electronics & Comm. (ECE)"],
        requiredSkills: ["Java", "SQL", "Cloud Fundamentals", "Agile Methodology"]
      },
      bond: "None",
      driveDate: "2026-08-30",
      jobDescription: "Application Development Associate. Assist client engineering teams in software delivery, testing, and cloud migration.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp7",
      name: "Wipro",
      logoUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop",
      package: 6.8,
      location: "Bengaluru, India",
      eligibility: {
        minCgpa: 6.0,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)", "Electronics & Comm. (ECE)"],
        requiredSkills: ["Python", "JavaScript", "DBMS", "Operating Systems"]
      },
      bond: "1 Year",
      driveDate: "2026-09-02",
      jobDescription: "Project Engineer. Develop and maintain scalable software modules for global client operations.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp8",
      name: "Deloitte",
      logoUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop",
      package: 11.5,
      location: "Bengaluru, India",
      eligibility: {
        minCgpa: 7.0,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
        requiredSkills: ["React", "Node.js", "SQL", "Cybersecurity Basics"]
      },
      bond: "None",
      driveDate: "2026-09-10",
      jobDescription: "Technology Analyst. Drive digital transformation, audit compliance automation, and enterprise web solutions.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp9",
      name: "IBM",
      logoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop",
      package: 14.0,
      location: "Kochi, India",
      eligibility: {
        minCgpa: 7.0,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
        requiredSkills: ["Python", "AI/ML", "Docker", "Kubernetes", "Linux"]
      },
      bond: "None",
      driveDate: "2026-09-20",
      jobDescription: "Associate Software Engineer. Build containerized cloud platforms, cognitive AI services, and hybrid cloud solutions.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp10",
      name: "Oracle",
      logoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&h=100&fit=crop",
      package: 18.0,
      location: "Bengaluru, India",
      eligibility: {
        minCgpa: 7.5,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
        requiredSkills: ["Java", "Oracle DB", "SQL", "Distributed Systems"]
      },
      bond: "None",
      driveDate: "2026-10-12",
      jobDescription: "Member of Technical Staff (MTS). Engineer cloud database kernel tools, security protocols, and SaaS platforms.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp11",
      name: "Cognizant",
      logoUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&h=100&fit=crop",
      package: 7.2,
      location: "Coimbatore, India",
      eligibility: {
        minCgpa: 6.5,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)", "Electronics & Comm. (ECE)"],
        requiredSkills: ["JavaScript", "React", "Spring Boot", "SQL"]
      },
      bond: "1 Year",
      driveDate: "2026-09-01",
      jobDescription: "Programmer Analyst. Work with cross-functional development teams on cloud-native web applications.",
      createdAt: new Date().toISOString()
    },
    {
      id: "comp12",
      name: "Adobe",
      logoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
      package: 35.0,
      location: "Noida, India",
      eligibility: {
        minCgpa: 8.5,
        departments: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
        requiredSkills: ["C++", "Algorithms", "Computer Graphics", "Machine Learning"]
      },
      bond: "None",
      driveDate: "2026-10-18",
      jobDescription: "Product Development Engineer. Build next-generation creative tools, digital document services, and generative AI features.",
      createdAt: new Date().toISOString()
    }
  ];

  const existingCompanies = localStorage.getItem('cs_companies');
  if (!existingCompanies) {
    localStorage.setItem('cs_companies', JSON.stringify(defaultCompanies));
  } else {
    try {
      const parsed = JSON.parse(existingCompanies);
      // If user has only the original 3 mock companies, upgrade local storage to full list
      if (Array.isArray(parsed) && parsed.length <= 3) {
        localStorage.setItem('cs_companies', JSON.stringify(defaultCompanies));
      }
    } catch (e) {
      localStorage.setItem('cs_companies', JSON.stringify(defaultCompanies));
    }
  }

  if (!localStorage.getItem('cs_applications')) {
    localStorage.setItem('cs_applications', JSON.stringify([
      {
        id: "app1",
        studentId: "student123",
        companyId: "comp2",
        status: "Applied",
        appliedDate: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('cs_notifications')) {
    localStorage.setItem('cs_notifications', JSON.stringify([
      {
        id: "notif1",
        recipientId: "student123",
        title: "TCS Placement Drive",
        message: "You are eligible for the upcoming TCS placement drive on Aug 20! Apply now from the Companies tab.",
        type: "Placement",
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "notif2",
        recipientId: "student123",
        title: "Resume Analysis Completed",
        message: "Your uploaded resume has been analyzed by AI. Current ATS score is 78/100.",
        type: "AI_Analysis",
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ]));
  }
}
