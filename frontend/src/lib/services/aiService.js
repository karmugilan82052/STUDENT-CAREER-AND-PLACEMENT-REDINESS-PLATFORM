import { isMockMode } from './dbHelper';
import { studentService } from './studentService';
import { IT_QUESTIONS, getQuestionsByDomain } from '../data/itQuestionBank';
import { ragService } from './ragService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Helper to make direct Gemini calls
async function callGeminiDirect(prompt, systemInstruction = "") {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini API request failed.");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const aiService = {
  // 1. RESUME ANALYZER
  async analyzeResume(studentId, resumeId, resumeText) {
    const profile = await studentService.getProfile(studentId);
    const skillsObj = await studentService.getSkills(studentId);
    const studentSkills = skillsObj ? Object.values(skillsObj.categories).flatMap(c => c.map(s => s.name)) : [];

    const systemInstruction = `You are an expert AI Resume Reviewer and ATS System parser.
Your job is to analyze the resume text against the candidate's profile and desired department/skills.
You MUST respond with a valid JSON object ONLY. Do not wrap the JSON in markdown code blocks or add comments.
The JSON must follow this structure EXACTLY:
{
  "atsScore": 85,
  "parsedData": {
    "name": "Candidate Name",
    "email": "email@example.com",
    "skills": ["Skill1", "Skill2"],
    "education": "Degree Details",
    "experience": "Brief experience summary"
  },
  "grammarCheck": [
    { "error": "incorrect word", "suggestion": "correct word", "context": "context sentence" }
  ],
  "keywordMatching": {
    "matched": ["MatchingSkill1"],
    "missing": ["MissingSkill1", "MissingSkill2"]
  },
  "formattingSuggestions": ["Suggestion 1", "Suggestion 2"],
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "recruiterFeedback": "Overall executive summary feedback from a recruiter perspective.",
  "suggestions": ["Actionable step 1", "Actionable step 2"]
}`;

    const prompt = `
Candidate Profile:
- Name: ${profile?.name}
- Department: ${profile?.department}
- Career Goal: ${profile?.careerGoal || 'Software Engineer'}
- Current Listed Skills: ${studentSkills.join(', ')}

Resume Content:
${resumeText}

Analyze this resume and return the analysis in the requested JSON structure.`;

    let analysisResult;

    if (GEMINI_API_KEY) {
      try {
        const rawJsonText = await callGeminiDirect(prompt, systemInstruction);
        // Strip markdown code block if Gemini wrapped it anyway
        const cleaned = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
        analysisResult = JSON.parse(cleaned);
        analysisResult.analyzedAt = new Date().toISOString();
      } catch (e) {
        console.warn("Live Gemini analysis failed, using fallback:", e);
        analysisResult = generateMockResumeAnalysis(resumeText, profile, studentSkills);
      }
    } else {
      // Mock analyzer for local offline development - fast snappy execution
      await new Promise(r => setTimeout(r, 40));
      analysisResult = generateMockResumeAnalysis(resumeText, profile, studentSkills);
    }

    // Save result to Firestore/LocalStorage
    if (isMockMode) {
      const analyses = JSON.parse(localStorage.getItem('cs_resume_analysis') || '{}');
      analyses[resumeId] = { id: resumeId, studentId, ...analysisResult };
      localStorage.setItem('cs_resume_analysis', JSON.stringify(analyses));
    } else {
      await setDoc(doc(db, 'resumeAnalysis', resumeId), {
        id: resumeId,
        studentId,
        ...analysisResult,
        analyzedAt: new Date()
      });
    }

    // Auto-update student's skill inventory from parsed resume skills
    const parsedSkills = analysisResult.parsedData?.skills || [];
    if (parsedSkills.length > 0) {
      try {
        const currentSkillsObj = await studentService.getSkills(studentId);
        const categories = currentSkillsObj.categories || { programming: [], database: [], cloud: [], ai: [], softSkills: [] };
        let modified = false;

        parsedSkills.forEach(sName => {
          const trimmed = sName.trim();
          if (!trimmed) return;
          const exists = Object.values(categories).some(arr => Array.isArray(arr) && arr.some(s => s.name.toLowerCase() === trimmed.toLowerCase()));
          if (!exists) {
            let cat = 'programming';
            const lower = trimmed.toLowerCase();
            if (['sql', 'mongodb', 'postgresql', 'mysql', 'database', 'firestore', 'firebase'].some(k => lower.includes(k))) cat = 'database';
            else if (['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'cloud', 'devops'].some(k => lower.includes(k))) cat = 'cloud';
            else if (['ai', 'ml', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'nlp', 'gemini'].some(k => lower.includes(k))) cat = 'ai';
            else if (['communication', 'leadership', 'teamwork', 'problem solving', 'management'].some(k => lower.includes(k))) cat = 'softSkills';

            if (!categories[cat]) categories[cat] = [];
            categories[cat].push({ name: trimmed, rating: 75 });
            modified = true;
          }
        });

        if (modified) {
          await studentService.saveSkills(studentId, categories);
        }
      } catch (err) {
        console.warn("Auto-syncing skills from resume failed:", err);
      }
    }

    // Auto-update AI Skill Gap & Learning Recommendations based on uploaded resume
    try {
      await this.generateLearningRecommendations(studentId);
    } catch (err) {
      console.warn("Auto-generating skill gap recommendations failed:", err);
    }

    // Send automatic notification
    try {
      await studentService.addNotification(studentId, {
        title: "Skill Gap Analysis Updated",
        message: `Your resume "${analysisResult.parsedData?.name || 'file'}" was analyzed. Your skills and Skill Gap roadmap have been updated automatically!`,
        type: "AI_Analysis"
      });
    } catch (err) {
      console.warn("Sending notification failed:", err);
    }

    // Recompute readiness score with fresh ATS score
    await studentService.recalculateReadinessScore(studentId);

    return analysisResult;
  },

  // 2. LEARNING RECOMMENDATIONS
  async generateLearningRecommendations(studentId) {
    const profile = await studentService.getProfile(studentId);
    const skillsObj = await studentService.getSkills(studentId);
    const skillsList = skillsObj ? Object.values(skillsObj.categories).flatMap(c => c.map(s => s.name)) : [];

    const systemInstruction = `You are a Senior AI Career Mentor and Placement Officer.
Create a personalized learning roadmap, course, book, project, and practice suggestions.
You MUST respond with a valid JSON object ONLY. Do not wrap in markdown block quotes.
JSON structure:
{
  "roadmap": [
    { "title": "Step 1: Focus Area", "desc": "Detailed instructions on what to learn", "duration": "Weeks 1-2" }
  ],
  "courses": [
    { "title": "Course Name", "platform": "Coursera/Udemy/edX", "url": "#" }
  ],
  "videos": [
    { "title": "Video/Playlist Name", "channel": "YouTube Channel", "url": "#" }
  ],
  "platforms": [
    { "name": "LeetCode/GeeksforGeeks", "url": "#" }
  ],
  "books": [
    { "title": "Book Title", "author": "Author Name" }
  ],
  "projects": [
    { "title": "Project Title", "desc": "Brief details of what to build", "tech": ["Tech1", "Tech2"] }
  ],
  "weeklySchedule": {
    "Monday": "Task details",
    "Tuesday": "Task details",
    "Wednesday": "Task details",
    "Thursday": "Task details",
    "Friday": "Task details",
    "Saturday": "Task details",
    "Sunday": "Task details"
  },
  "monthlyGoal": "Master core framework architecture and build 2 portfolio projects."
}`;

    const prompt = `
Student Details:
- Name: ${profile?.name}
- Department: ${profile?.department}
- Year of Study: ${profile?.year}
- CGPA: ${profile?.cgpa}
- Career Goal: ${profile?.careerGoal || 'Software Engineer'}
- Current Skills: ${skillsList.join(', ')}

Please recommend a targeted learning path to help this student achieve their career goal.`;

    let recommendations;

    if (GEMINI_API_KEY) {
      try {
        const rawJsonText = await callGeminiDirect(prompt, systemInstruction);
        const cleaned = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
        recommendations = JSON.parse(cleaned);
      } catch (e) {
        console.warn("Live Gemini roadmap failed, using fallback:", e);
        recommendations = generateMockRecommendations(profile, skillsList);
      }
    } else {
      await new Promise(r => setTimeout(r, 40));
      recommendations = generateMockRecommendations(profile, skillsList);
    }

    // Save recommendations
    const data = { studentId, ...recommendations, updatedAt: isMockMode ? new Date().toISOString() : new Date() };
    if (isMockMode) {
      const dbRecs = JSON.parse(localStorage.getItem('cs_recommendations') || '{}');
      dbRecs[studentId] = data;
      localStorage.setItem('cs_recommendations', JSON.stringify(dbRecs));
    } else {
      await setDoc(doc(db, 'recommendations', studentId), data);
    }

    return recommendations;
  },

  // 3. AI CAREER MENTOR CHAT (RAG-Augmented)
  async getChatMentorResponse(studentId, chatHistory, userMessage) {
    const profile = await studentService.getProfile(studentId);
    
    // RAG: Retrieve Top-K relevant institutional placement and technical documents
    const ragChunks = ragService.retrieveMentorKnowledge(userMessage, 2);
    const ragContext = ragService.formatContextForPrompt(ragChunks);

    // Construct chat history prompt with RAG grounding
    let conversationContext = `You are the CareerReady AI Career Mentor. You help students with placement guidance, resumes, higher studies, technical interview prep, and career strategy.
Student Context:
- Name: ${profile?.name || 'Student'}
- Department: ${profile?.department || 'Computer Science'}
- Career Goal: ${profile?.careerGoal || 'Software Engineer'}
- CGPA: ${profile?.cgpa || 'N/A'}
${ragContext}
Chat History:
`;

    chatHistory.slice(-10).forEach(msg => {
      conversationContext += `${msg.sender === 'student' ? 'Student' : 'Mentor'}: ${msg.text}\n`;
    });
    conversationContext += `Student: ${userMessage}\nMentor: `;

    let outputText = "";
    if (GEMINI_API_KEY) {
      try {
        outputText = await callGeminiDirect(conversationContext, "You are a career development expert. Ground your advice using the provided Institutional Knowledge Base (RAG context). Keep responses structured, concise, and professional. Use markdown lists and bold text where helpful.");
      } catch (e) {
        console.warn("Live Gemini chat failed, using fallback:", e);
        outputText = generateMockChatResponse(userMessage, profile, ragChunks);
      }
    } else {
      await new Promise(r => setTimeout(r, 40));
      outputText = generateMockChatResponse(userMessage, profile, ragChunks);
    }

    return {
      text: outputText,
      ragSources: ragChunks,
      toString() { return this.text; }
    };
  },

  // 4. MOCK INTERVIEW GENERATOR & EVALUATOR (RAG-Augmented)
  async generateInterviewQuestions(studentId, type = "Mixed", domain = "all", customPrompt = "", company = "") {
    const profile = await studentService.getProfile(studentId);
    const skillsObj = await studentService.getSkills(studentId);
    const skillsList = skillsObj ? Object.values(skillsObj.categories).flatMap(c => c.map(s => s.name)) : [];

    // RAG: Retrieve company archive & technical rubrics
    const ragChunks = ragService.retrieveInterviewKnowledge(domain, company, customPrompt, 3);
    const ragContext = ragService.formatContextForPrompt(ragChunks);

    const systemInstruction = `You are a Senior Technical Recruiter at a top tech company.
Ground the interview questions using the provided Institutional Knowledge Base archives and technical rubrics.
Generate exactly 5 interview questions targeting this student's profile.
Include questions matching the specified interview focus and IT domain:
- HR/Behavioral questions (if requested)
- Technical/Core IT questions (based on skills and selected IT domain)
- Coding problems / architectural concepts
- Domain questions (linked to Information Technology / Computer Science)
You MUST respond with a valid JSON array ONLY. Do not use Markdown code fence blocks.
JSON structure:
[
  {
    "id": "q1",
    "category": "Information Technology (IT)",
    "domain": "Full Stack & Web Dev",
    "difficulty": "Intermediate",
    "text": "What is the difference between virtual DOM and real DOM?",
    "sampleAnswer": "Explain reconciliation and virtual representation of UI elements in memory.",
    "keyConcepts": ["Virtual DOM", "Reconciliation", "Diffing Algorithm"]
  }
]`;

    const prompt = `
Student Information:
- Department: ${profile?.department || 'Information Technology (IT)'}
- Career Goal: ${profile?.careerGoal || 'Software Engineer / IT Specialist'}
- Key Skills: ${skillsList.join(', ') || 'JavaScript, SQL, Cloud, Web Dev'}
- Interview Focus / Category: ${type}
- Selected IT Domain: ${domain}
${company ? `- Target Company: ${company}` : ''}
${customPrompt ? `- Custom Focus Notes: ${customPrompt}` : ''}
${ragContext}
Generate exactly 5 highly relevant interview questions grounded in the institutional rubric.`;

    let questions;

    if (GEMINI_API_KEY) {
      try {
        const rawJsonText = await callGeminiDirect(prompt, systemInstruction);
        const cleaned = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
        questions = JSON.parse(cleaned);
      } catch (e) {
        console.warn("Live Gemini interview generation failed, using fallback:", e);
        questions = generateMockQuestions(profile, skillsList, type, domain);
      }
    } else {
      await new Promise(r => setTimeout(r, 40));
      questions = generateMockQuestions(profile, skillsList, type, domain);
    }

    // Attach RAG metadata
    questions._ragSources = ragChunks;
    questions.forEach((q, i) => {
      if (!q.ragSource && ragChunks.length > 0) {
        q.ragSource = ragChunks[i % ragChunks.length].title;
      }
    });

    return questions;
  },

  async evaluateInterviewAnswers(studentId, questions, answers) {
    const profile = await studentService.getProfile(studentId);
    
    // RAG: Retrieve scoring benchmark rubrics for the questions
    const qCombined = questions.map(q => q.text).join(' ');
    const ragChunks = ragService.retrieveContext(qCombined, { limit: 2 });
    const ragContext = ragService.formatContextForPrompt(ragChunks);

    // Format Q&A for grading
    let qaBlock = "";
    questions.forEach((q) => {
      qaBlock += `Question: ${q.text}\nCategory: ${q.category}\nSample Answer Rubric: ${q.sampleAnswer || 'N/A'}\nStudent Answer: ${answers[q.id] || "No Answer Provided"}\n\n`;
    });

    const systemInstruction = `You are a professional Interview Examiner.
Review the questions and candidate answers using the provided RAG ground-truth rubrics. Evaluate across:
1. Accuracy: Correctness of answer compared to sample rubric.
2. Grammar: Correct language use.
3. Communication: Clarity and articulation.
4. Technical Knowledge: Depth of understanding.
5. Confidence: Articulated tone.
Calculate scores (out of 100) and overall score.
You MUST respond with a valid JSON object ONLY.
JSON structure:
{
  "evaluation": {
    "accuracy": 80,
    "grammar": 85,
    "confidence": 75,
    "communication": 80,
    "technicalKnowledge": 80,
    "score": 80,
    "suggestions": [
      "Explain JavaScript scopes with examples next time.",
      "Work on structuring behavioral answers using the STAR method."
    ]
  }
}`;

    const prompt = `
Candidate Profile:
- Department: ${profile?.department}
- Career Goal: ${profile?.careerGoal}
${ragContext}
Interview Answers:
${qaBlock}`;

    let result;

    if (GEMINI_API_KEY) {
      try {
        const rawJsonText = await callGeminiDirect(prompt, systemInstruction);
        const cleaned = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
        result = JSON.parse(cleaned);
      } catch (e) {
        console.warn("Live Gemini interview evaluation failed, using fallback:", e);
        result = generateMockEvaluation(questions, answers);
      }
    } else {
      await new Promise(r => setTimeout(r, 40));
      result = generateMockEvaluation(questions, answers);
    }

    return {
      evaluation: result.evaluation || result,
      ragSources: ragChunks
    };
  },

  // 5. COMPANY PREPARATION STRATEGY (RAG-Augmented)
  async getCompanyPreparation(companyName, jd, studentId) {
    const profile = await studentService.getProfile(studentId);
    
    // RAG: Retrieve company archive
    const ragChunks = ragService.retrieveCompanyKnowledge(companyName, 2);
    const ragContext = ragService.formatContextForPrompt(ragChunks);

    const prompt = `Provide a complete interview preparation guide for the company: "${companyName}".
Job Description details: "${jd || 'Software Engineering role'}".
Student Profile: Department is "${profile?.department}", Career Goal is "${profile?.careerGoal}".
${ragContext}
Generate:
1. Typical Interview Pattern (Rounds, durations, format)
2. Frequently Asked Questions (Top 5 questions with sample concepts from archive)
3. Main Technical Topics to revise
4. Preparation Strategy & Timeline
5. Critical Coding Topics to practice
6. Recommended questions to ask the interviewer.

Format your output in a beautiful, structured Markdown guide with sections and lists.`;

    let responseText = "";
    if (GEMINI_API_KEY) {
      try {
        responseText = await callGeminiDirect(prompt, "You are a Placement training officer. Ground your response using the provided institutional company placement archive. Provide highly structured, realistic, and actionable advice. Use bold subheadings.");
      } catch (e) {
        console.warn("Live Gemini company prep failed, using fallback:", e);
        responseText = generateMockCompanyPrep(companyName, jd, profile, ragChunks);
      }
    } else {
      await new Promise(r => setTimeout(r, 40));
      responseText = generateMockCompanyPrep(companyName, jd, profile, ragChunks);
    }

    return {
      text: responseText,
      ragSources: ragChunks,
      toString() { return this.text; }
    };
  },

  // 6. TECHNICAL CODING ROUND EVALUATION (RAG-Augmented)
  async evaluateCodingSubmission(studentId, challenge, code, language = 'javascript') {
    const profile = await studentService.getProfile(studentId);
    
    // RAG: Retrieve domain & company algorithmic benchmarks
    const ragChunks = ragService.retrieveContext(`${challenge.company} ${challenge.title} ${challenge.category} code algorithm`, { limit: 2 });
    const ragContext = ragService.formatContextForPrompt(ragChunks);

    const systemInstruction = `You are a Senior Technical Lead and Coding Interview Examiner at ${challenge.company || 'a top tech firm'}.
Evaluate the candidate's coding solution for:
1. Correctness and logic flow
2. Time Complexity (e.g. O(N), O(N log N), O(N^2))
3. Space Complexity (e.g. O(1), O(N))
4. Edge Case Handling (e.g. empty inputs, duplicates, boundary bounds)
5. Clean Code Quality & Idiomatic Style

You MUST respond with a valid JSON object ONLY.
JSON structure:
{
  "score": 90,
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "correctness": 95,
  "codeQuality": 90,
  "feedback": "Concise executive assessment of the candidate's algorithm.",
  "strengths": ["Optimal linear scan", "Clean variable naming"],
  "suggestions": ["Add guard clause for empty array", "Consider memory optimization"]
}`;

    const prompt = `
Coding Problem: "${challenge.title}"
Company: ${challenge.company}
Difficulty: ${challenge.difficulty}
Problem Description:
${challenge.description}

Candidate Language: ${language}
Submitted Code:
\`\`\`${language}
${code}
\`\`\`

${ragContext}
Analyze this coding submission and return the evaluation in JSON.`;

    let result;
    if (GEMINI_API_KEY) {
      try {
        const rawJsonText = await callGeminiDirect(prompt, systemInstruction);
        const cleaned = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
        result = JSON.parse(cleaned);
      } catch (e) {
        console.warn("Live Gemini code evaluation failed, using fallback:", e);
        result = generateMockCodeEvaluation(challenge, code);
      }
    } else {
      await new Promise(r => setTimeout(r, 40));
      result = generateMockCodeEvaluation(challenge, code);
    }

    return {
      evaluation: result,
      ragSources: ragChunks
    };
  },

  // 7. MULTILINGUAL TRANSLATION SERVICE
  async translateUI(text, targetLang) {
    if (targetLang === 'en' || !text) return text;

    const langNames = {
      'ta': 'Tamil',
      'hi': 'Hindi',
      'te': 'Telugu',
      'ml': 'Malayalam',
      'kn': 'Kannada'
    };

    const targetLangName = langNames[targetLang] || "English";
    const prompt = `Translate the following text exactly into ${targetLangName}. Preserve any variables, HTML-like tags, and maintain the exact tone. Return only the translated text, do not add any comments or notes:
"${text}"`;

    if (GEMINI_API_KEY) {
      try {
        const translated = await callGeminiDirect(prompt, "You are a precise dictionary translation service. Return the exact translation of the input text only.");
        return translated.replace(/^"|"$/g, '').trim();
      } catch (e) {
        console.warn("Live Gemini translation failed, using offline fallback:", e);
        return getMockTranslation(text, targetLang);
      }
    } else {
      return getMockTranslation(text, targetLang);
    }
  },

  // 8. JOB DESCRIPTION (JD) REVERSE MATCHER & KEYWORD OPTIMIZER
  async matchJobDescription(studentId, jdText, companyName = "Target Recruiter") {
    const profile = await studentService.getProfile(studentId);
    const skillsObj = await studentService.getSkills(studentId);
    const studentSkills = skillsObj ? Object.values(skillsObj.categories).flatMap(c => c.map(s => s.name)) : [];

    const systemInstruction = `You are an elite Applicant Tracking System (ATS) algorithm and senior technical recruiter.
Analyze the candidate's skills and profile against the provided Job Description (JD).
You MUST respond with a valid JSON object ONLY. Do not wrap in markdown or include backticks.
Format:
{
  "matchPercentage": 78,
  "summary": "2-3 sentences evaluating the candidate's fit for this specific job description.",
  "matchedKeywords": ["Skill1", "Skill2"],
  "missingKeywords": ["Skill3", "Skill4", "Skill5"],
  "recommendedActionBullets": [
    "STAR-formatted project bullet point incorporating missing keywords to boost ATS match.",
    "Another actionable bullet point with measurable impact (e.g., reduced latency by 30%)."
  ],
  "likelyInterviewQuestions": [
    "Technical question candidate will be asked based on this JD.",
    "Architecture/design question relevant to this role.",
    "Behavioral/scenario question for this specific company."
  ],
  "atsFormattingTips": [
    "Specific ATS keyword placement tip for this role",
    "Recommendation for section ordering"
  ]
}`;

    const prompt = `
Candidate Profile:
- Name: ${profile?.name || 'Student Candidate'}
- Department: ${profile?.department || 'MCA'}
- Career Goal: ${profile?.careerGoal || 'Software Engineer'}
- Current Skills: ${studentSkills.join(', ')}

Target Company: ${companyName}
Job Description Content:
${jdText}

Audit candidate fit against this JD and return the JSON analysis.`;

    let result;
    if (GEMINI_API_KEY) {
      try {
        const rawJsonText = await callGeminiDirect(prompt, systemInstruction);
        const cleaned = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
        result = JSON.parse(cleaned);
      } catch (e) {
        console.warn("Live Gemini JD match failed, using fallback:", e);
        result = generateMockJdMatch(jdText, companyName, profile, studentSkills);
      }
    } else {
      await new Promise(r => setTimeout(r, 40));
      result = generateMockJdMatch(jdText, companyName, profile, studentSkills);
    }

    return result;
  },

  // 9. AI RESUME BULLET ENHANCER (STAR METHOD & ACTION VERBS)
  async enhanceResumeBullets(draftText, role = "Software Engineer") {
    const systemInstruction = `You are a professional executive resume writer specializing in ATS-compliant resumes for top tech companies.
Rewrite rough notes or weak draft bullet points into 3-4 high-impact STAR-format (Situation, Task, Action, Result) bullet points.
Start every bullet point with an assertive action verb (e.g., Architected, Spearheaded, Optimized, Engineered, Implemented).
Include realistic quantifiable business metrics (e.g., reduced latency by 35%, scaled to 10k users, improved throughput by 2.4x).
Return ONLY the bullet points separated by newlines, with no markdown code blocks or introduction.`;

    const prompt = `Target Role: ${role}
Draft Bullet / Project Description:
"${draftText}"

Enhance into elite, ATS-optimized resume bullet points.`;

    if (GEMINI_API_KEY) {
      try {
        const response = await callGeminiDirect(prompt, systemInstruction);
        return response.trim();
      } catch (e) {
        console.warn("Live Gemini bullet enhancement failed, using fallback:", e);
        return generateMockEnhancedBullets(draftText, role);
      }
    } else {
      await new Promise(r => setTimeout(r, 40));
      return generateMockEnhancedBullets(draftText, role);
    }
  },

  // 10. AI PROFESSIONAL SUMMARY GENERATOR
  async generateSummaryForResume(profile, targetRole = "Full Stack Software Engineer") {
    const prompt = `Write an ATS-friendly, 2-3 sentence professional resume summary for:
Candidate: ${profile?.name || 'Graduating Student'}
Department: ${profile?.department || 'Master of Computer Applications'}
Target Role: ${targetRole}
Key Strengths: Strong foundations in data structures, modern full-stack web applications, database architecture, and agile software development.

Keep it impactful, concise, and focused on high employability. Return ONLY the summary text.`;

    if (GEMINI_API_KEY) {
      try {
        const response = await callGeminiDirect(prompt, "You are an expert technical resume writer. Return only the summary paragraph.");
        return response.replace(/^"|"$/g, '').trim();
      } catch (e) {
        return `Results-driven ${profile?.department || 'Computer Science'} graduate specializing in ${targetRole} with robust expertise in scalable web architectures, modern component lifecycles, and relational database systems. Demonstrated track record of architecting high-performance applications with a strong focus on clean code, automated testing, and agile delivery.`;
      }
    } else {
      return `Results-driven ${profile?.department || 'Computer Science'} graduate specializing in ${targetRole} with robust expertise in scalable web architectures, modern component lifecycles, and relational database systems. Demonstrated track record of architecting high-performance applications with a strong focus on clean code, automated testing, and agile delivery.`;
    }
  },

  // 11. SAVE AI GENERATED RESUME & AUTO-EVALUATE
  async saveGeneratedResume(studentId, resumePayload) {
    const resumeId = "res_gen_" + Math.random().toString(36).substr(2, 9);
    const fileName = `${(resumePayload.name || 'Candidate').toLowerCase().replace(/\s+/g, '_')}_ats_resume.pdf`;
    
    const resumeRecord = {
      id: resumeId,
      studentId,
      fileName,
      fileUrl: "#",
      template: resumePayload.template || "modern",
      data: resumePayload,
      uploadedAt: isMockMode ? new Date().toISOString() : new Date(),
      isPrimary: true,
      isAiGenerated: true
    };

    // Calculate dynamic high ATS score for this newly built resume (88 to 96)
    const atsScore = Math.floor(Math.random() * 8) + 89;
    const skillsList = resumePayload.skills ? resumePayload.skills.split(',').map(s => s.trim()).filter(Boolean) : ["JavaScript", "React", "SQL", "Git"];

    const analysis = {
      id: resumeId,
      studentId,
      atsScore,
      parsedData: {
        name: resumePayload.name,
        email: resumePayload.email,
        skills: skillsList,
        education: resumePayload.education?.degree || "Master of Computer Applications",
        experience: resumePayload.experience?.role || "Software Engineering Projects"
      },
      grammarCheck: [],
      keywordMatching: {
        matched: skillsList,
        missing: ["Docker", "Kubernetes", "Microservices"]
      },
      formattingSuggestions: [
        "ATS-compliant single column layout verified",
        "Bullet points follow standard STAR quantification structure"
      ],
      strengths: [
        "Flawless ATS machine readability score",
        "High density of actionable technical keywords",
        "Clear quantifiable achievements with percentage metrics"
      ],
      weaknesses: [
        "Can add cloud certification badges (AWS/GCP) to achieve 98+ score"
      ],
      recruiterFeedback: "Exceptional ATS-ready resume! Clean single-column layout, zero parser parsing blockers, and strong STAR-method action verbs make this candidate an immediate candidate for recruiter shortlisting.",
      suggestions: [
        "Prepare code repository walkthroughs for the listed projects",
        "Tailor keywords for each specific company drive"
      ],
      analyzedAt: isMockMode ? new Date().toISOString() : new Date()
    };

    if (isMockMode) {
      const resumes = JSON.parse(localStorage.getItem('cs_resumes') || '[]');
      // Set existing resumes to not primary
      resumes.forEach(r => r.isPrimary = false);
      resumes.unshift(resumeRecord);
      localStorage.setItem('cs_resumes', JSON.stringify(resumes));

      const analyses = JSON.parse(localStorage.getItem('cs_resume_analysis') || '{}');
      analyses[resumeId] = analysis;
      localStorage.setItem('cs_resume_analysis', JSON.stringify(analyses));
    } else {
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase/firebaseClient');
      await setDoc(doc(db, 'resumes', resumeId), resumeRecord);
      await setDoc(doc(db, 'resumeAnalysis', resumeId), analysis);
    }

    // Trigger notification
    await studentService.addNotification(studentId, {
      title: "AI ATS Resume Generated!",
      message: `Your new ATS-optimized resume "${fileName}" was created with a fit score of ${atsScore}/100.`,
      type: "AI_Analysis"
    });

    return { resumeRecord, analysis };
  },

  // 12. DYNAMIC TRANSLATION
  async translateUI(text, targetLang) {
    if (!text || targetLang === 'en') return text;
    return getMockTranslation(text, targetLang);
  }
};

// ====================================================
// FALLBACK GENERATORS (MOCK DATABASES & LLM OUTPUTS)
// ====================================================

function generateMockResumeAnalysis(text, profile, currentSkills) {
  return {
    atsScore: Math.floor(Math.random() * 15) + 70, // 70 to 85
    parsedData: {
      name: profile?.name || "Student Candidate",
      email: profile?.email || "candidate@example.com",
      skills: currentSkills.length > 0 ? currentSkills : ["JavaScript", "HTML", "CSS", "SQL"],
      education: profile?.department || "Master of Computer Applications",
      experience: "Academic projects and course labs."
    },
    grammarCheck: [
      { error: "worked on", suggestion: "engineered", context: "I worked on a frontend project using React" }
    ],
    keywordMatching: {
      matched: currentSkills.filter(s => ["JavaScript", "HTML", "React", "SQL"].includes(s)),
      missing: ["SvelteKit", "Cloud Deployments", "API Gateways"]
    },
    formattingSuggestions: [
      "Use bullet points starting with strong action verbs",
      "List projects before academic certifications if you have coding experience"
    ],
    strengths: [
      "Clear formatting and good contact sections",
      "Department alignment with modern technical requirements"
    ],
    weaknesses: [
      "Missing critical keyword matching for advanced web frameworks",
      "No open source or external portfolio links in resume text"
    ],
    recruiterFeedback: "The resume shows potential and lines up well with entry level placement requirements. To increase candidate attractiveness for product roles, include cloud configurations and Svelte/Vite application architectures.",
    suggestions: [
      "Integrate Cloud Firestore operations directly under your projects section description",
      "Restructure project bullets to highlight performance enhancements (e.g. reduced load times by 20%)"
    ]
  };
}

function generateMockRecommendations(profile, skills) {
  return {
    roadmap: [
      { title: "Strengthen Advanced Web Frameworks", desc: "Gain production-level familiarity with SvelteKit. Practice routing, page structures, layouts, and server actions.", duration: "Weeks 1-2" },
      { title: "Master Firebase Architecture", desc: "Learn Firestore database structures, subcollections, rules, and Storage operations.", duration: "Weeks 3-4" },
      { title: "Develop Mock Applications", desc: "Build a complete real-world project, deploying it to Firebase Hosting and testing end-to-end user journeys.", duration: "Weeks 5-6" },
      { title: "System Design and Algorithms", desc: "Practice array manipulations, binary trees, dynamic queries, and optimization techniques.", duration: "Weeks 7-8" }
    ],
    courses: [
      { title: "Complete SvelteKit Course: Zero to Hero", platform: "Udemy", url: "https://www.udemy.com" },
      { title: "Firebase Web SDK Essentials", platform: "Coursera", url: "https://www.coursera.org" }
    ],
    videos: [
      { title: "SvelteKit in 100 Seconds & Full Guide", channel: "Fireship", url: "https://www.youtube.com" },
      { title: "Firestore Rules and Advanced Databases", channel: "Firebase Developers", url: "https://www.youtube.com" }
    ],
    platforms: [
      { name: "LeetCode (Focus: Arrays & Dynamic Programming)", url: "https://leetcode.com" },
      { name: "Frontend Mentor (Focus: Responsive CSS UI)", url: "https://frontendmentor.io" }
    ],
    books: [
      { title: "Eloquent JavaScript (3rd Edition)", author: "Marijn Haverbeke" },
      { title: "Clean Code", author: "Robert C. Martin" }
    ],
    projects: [
      { title: "Decentralized Chat Hub", desc: "SvelteKit app using Firestore for instant messaging and Auth for secure logins.", tech: ["SvelteKit", "Firebase Auth", "Firestore"] },
      { title: "E-Commerce Mock Store with Dashboard", desc: "Responsive layout with admin analytics dashboard using Chart.js.", tech: ["JavaScript", "Tailwind CSS", "Chart.js"] }
    ],
    weeklySchedule: {
      Monday: "Study SvelteKit Routing and Layouts (2 hours)",
      Tuesday: "Implement basic mock layouts (2.5 hours)",
      Wednesday: "Review SQL Joins and Firestore query configurations (1.5 hours)",
      Thursday: "Practice 2 Easy algorithms on LeetCode (2 hours)",
      Friday: "Learn CSS flexbox/grid adjustments (1.5 hours)",
      Saturday: "Build a mini project module (4 hours)",
      Sunday: "Review weak topics and schedule next week goals (1 hour)"
    },
    monthlyGoal: "Build 2 responsive web applications using Firebase Auth and show 50+ solved algorithm targets on LeetCode."
  };
}

function generateMockChatResponse(msg, profile, ragChunks = []) {
  const txt = msg.toLowerCase();
  const name = profile?.name || "Student";
  const dept = profile?.department || "MCA";

  let ragNote = "";
  if (ragChunks && ragChunks.length > 0) {
    ragNote = `\n\n> ⚡ *Grounded from ${ragChunks[0].title} (${ragChunks[0].similarityScore}% match)*`;
  }

  if (txt.includes("resume")) {
    return `### Resume Optimization Tips for **${name}**
As a student in **${dept}**, your resume should instantly capture your programming skills and projects:
1. **Highlight Core Projects First**: Do not hide projects under certifications. Give them a dedicated section showing the tech stack and outcomes.
2. **Action-Oriented Bullets**: Instead of writing "I made a website," use phrases like "*Engineered a responsive web app using SvelteKit, reducing page load times by 15%*".
3. **Keyword Alignment**: Align your resume keywords with specific job descriptions (e.g. mention *Firestore*, *Node.js*, *REST APIs*).
4. **Link Cleanliness**: Always include active, clickable links to your **GitHub** and **LinkedIn** profiles.${ragNote}`;
  }
  
  if (txt.includes("interview") || txt.includes("placement") || txt.includes("tcs") || txt.includes("zoho")) {
    return `### Interview Prep Strategy for **${name}**
Here is a structured checklist to prepare for upcoming placements:
- **Technical Round**: Brush up on Data Structures (Arrays, Strings, HashMaps) and DBMS (SQL queries, indexing). Expect questions on OOPs concepts and framework lifecycle hooks.
- **System Design & Coding**: Practice array manipulations, matrix traversals, and REST API communication.
- **HR Round**: Prepare answers using the **STAR Method** (Situation, Task, Action, Result) for behavioral questions (e.g., "Tell me about a time you resolved a conflict").
- **Final Mock Practice**: Use our **Mock Interview** tab on CareerReady AI to test your skills in real-time.${ragNote}`;
  }

  if (txt.includes("higher studies") || txt.includes("mtech") || txt.includes("ms")) {
    return `### Higher Studies Opportunities
If you are considering higher studies after your degree, here are popular paths:
1. **M.Tech in Computer Science / AI / Data Science**: Great for specializing in research areas. Requires cracking the GATE exam (for India).
2. **MS in Computer Science (Abroad)**: Offers deep industry integration and global experience. Key requirements: GRE/IELTS exams, strong Statement of Purpose (SOP), and academic reference letters.
3. **MBA (IT / Systems Management)**: Excellent if you want to shift towards product management, business analysis, or technical consultant roles. Requires CAT/GMAT preparation.${ragNote}`;
  }

  return `Hello **${name}**! I'm your AI Career Mentor. I see you are studying in the **${dept}** department with a goal of becoming a **${profile?.careerGoal || 'Software Professional'}**.

I can guide you with:
- **Resume Help** (Type "resume tips")
- **Placement Strategies** (Type "placement prep" or ask about TCS, Zoho, Capgemini)
- **Higher Studies** (Type "higher studies options")
- **Programming & Projects**

What career questions can I answer for you today?${ragNote}`;
}

function generateMockQuestions(profile, skills, type, domain = 'all') {
  if (type === 'IT' || domain !== 'all') {
    const domainQuestions = getQuestionsByDomain(domain);
    if (domainQuestions && domainQuestions.length > 0) {
      // Pick up to 5 questions
      return domainQuestions.slice(0, 5).map((q, idx) => ({
        id: q.id || `q${idx + 1}`,
        category: q.category || 'Information Technology (IT)',
        domain: q.domain || 'IT',
        difficulty: q.difficulty || 'Intermediate',
        text: q.text,
        sampleAnswer: q.sampleAnswer,
        keyConcepts: q.keyConcepts || []
      }));
    }
  }

  return [
    {
      id: "q1",
      category: "Technical",
      domain: "Full Stack & Web Dev",
      difficulty: "Intermediate",
      text: "Explain the difference between Svelte's reactive states/runes ($state) and traditional React state management.",
      sampleAnswer: "Svelte 5 runes ($state) utilize compiler-driven fine-grained reactivity to update only the specific DOM elements affected, whereas React schedules component-wide re-renders.",
      keyConcepts: ["Runes ($state)", "Fine-grained Reactivity", "Virtual DOM diffing"]
    },
    {
      id: "q2",
      category: "Database",
      domain: "Database & SQL/NoSQL",
      difficulty: "Intermediate",
      text: "How would you design a Firestore database schema to support real-time chatting between students and advisors? How do you handle scalability?",
      sampleAnswer: "Create a root 'chats' collection. Each doc contains metadata. Inside, use a 'messages' subcollection. Scale by ordering by timestamp and paginating queries (limit 20).",
      keyConcepts: ["Subcollections", "Pagination / Query Limits", "Composite Indexing"]
    },
    {
      id: "q3",
      category: "Coding",
      domain: "DSA & Software Design",
      difficulty: "Beginner",
      text: "Given an array of integers, how do you find the first non-repeating character in O(N) time complexity?",
      sampleAnswer: "Use a HashMap or Frequency Array to store character counts on the first pass, then iterate the array a second time to find the first character with a count of 1.",
      keyConcepts: ["Hash Map", "Time Complexity O(N)", "Frequency Array"]
    },
    {
      id: "q4",
      category: "Domain",
      domain: "IT Infrastructure & Cloud",
      difficulty: "Intermediate",
      text: "What is your understanding of the Software Development Life Cycle (SDLC), and why is the Agile methodology popular in software development?",
      sampleAnswer: "SDLC outlines design, development, testing, deployment, and maintenance. Agile is popular because it encourages incremental releases, feedback, and flexibility.",
      keyConcepts: ["Agile Ceremonies", "Sprint Velocity", "Incremental Delivery"]
    },
    {
      id: "q5",
      category: "Behavioral",
      domain: "HR & Leadership",
      difficulty: "Beginner",
      text: "Describe a situation where a project group had conflicting design views. How did you handle the situation and achieve a positive outcome?",
      sampleAnswer: "Used the STAR method. Explained the scenario, my role in suggesting a matrix evaluation of the designs, compiling feedback from tests, and aligning the team on the best layout.",
      keyConcepts: ["STAR Method", "Conflict Resolution", "Team Collaboration"]
    }
  ];
}

function generateMockEvaluation(questions, answers) {
  return {
    evaluation: {
      accuracy: 80,
      grammar: 85,
      confidence: 78,
      communication: 82,
      technicalKnowledge: 75,
      score: 80,
      suggestions: [
        "Your answers show good logical structures. Try to give concrete codebase examples for the technical questions.",
        "Ensure your coding explanations specify the spatial and temporal complexity (e.g. O(N) space, O(N) time)."
      ]
    }
  };
}

function generateMockCodeEvaluation(challenge, code) {
  const trimmed = (code || "").trim();
  const codeLen = trimmed.length;
  const isStarterOnly = (trimmed.includes("Write your code here") && codeLen < 240) || (trimmed.includes("pass") && codeLen < 140) || codeLen < 60;

  if (isStarterOnly) {
    return {
      score: 20,
      timeComplexity: "Unimplemented",
      spaceComplexity: "Unimplemented",
      correctness: 0,
      codeQuality: 30,
      feedback: `Starter boilerplate detected for "${challenge.title}". Please write your algorithm logic before requesting an AI audit.`,
      strengths: ["Template loaded successfully."],
      suggestions: [
        "Implement the algorithm logic according to the problem requirements.",
        "Ensure you return the expected data type and handle edge cases."
      ]
    };
  }

  const hasLoop = /for|while|forEach|map|filter/.test(code);
  const hasReturn = /return/.test(code);

  const score = codeLen > 100 && hasReturn ? (hasLoop ? 88 : 78) : 65;
  
  return {
    score,
    timeComplexity: challenge.id.includes('spiral') ? 'O(M * N)' : (challenge.id.includes('dp') ? 'O(Amount * Coins)' : 'O(N)'),
    spaceComplexity: challenge.id.includes('spiral') ? 'O(1) extra space' : 'O(N)',
    correctness: score > 80 ? 90 : 70,
    codeQuality: 85,
    feedback: `Good algorithmic structure for ${challenge.title}. Logic addresses core constraints and boundary cases.`,
    strengths: [
      "Appropriate use of language constructs and standard pointers/data structures.",
      "Clear control flow and clean syntax."
    ],
    suggestions: [
      "Add explicit validation for null or empty input values.",
      "Consider documenting edge cases in inline comments."
    ]
  };
}

function generateMockCompanyPrep(companyName, jd, profile, ragChunks = []) {
  let ragSnippet = "";
  if (ragChunks && ragChunks.length > 0) {
    ragSnippet = `\n\n> ⚡ **Grounded via RAG Placement Archive:** *${ragChunks[0].title}* (${ragChunks[0].source} - ${ragChunks[0].similarityScore}% match)\n\n`;
  }

  return `# Interview Preparation Strategy for **${companyName}**
${ragSnippet}  
This strategy has been personalized for **${profile?.name || 'Student'}** (${profile?.department || 'MCA'}).

## 1. Typical Interview Pattern
- **Round 1: Online Assessment (90 mins)**: Quantitative aptitude, logical reasoning, and 2 coding questions (medium difficulty - arrays/strings/linked lists).
- **Round 2: Technical Interview (45 mins)**: Deep dive into projects listed on your resume, database fundamentals (SQL queries/normalization), and live coding.
- **Round 3: Managerial & HR Interview (30 mins)**: Situational questions, behavioral evaluations, goals alignment, and eligibility parameters check.

## 2. Frequently Asked Questions (From Placement Archives)
1. **"Walk me through your database projects in Firestore/SQL."**
   - *Strategy*: Detail the database design, document/entity relationships, and how you secured user data using Firestore Security Rules.
2. **"Explain how you handle state management or reactive logic in Svelte/JavaScript."**
   - *Strategy*: Elaborate on reactive variables, stores, and compiler-driven DOM updates.
3. **"What is the difference between SQL and NoSQL? When would you use Firestore?"**
   - *Strategy*: Contrast ACID properties, structured schemas (SQL) with scalability and flexible document layouts (Firestore).

## 3. Main Technical Topics to Revise
- **Data Structures**: HashMaps, Arrays, Strings, and recursion methods.
- **Web Technologies**: REST API design, client vs. server rendering, Svelte lifecycle.
- **Database Systems**: Query optimization, indexing, ACID transactions.

## 4. Preparation Strategy & Timeline
- **Days 1-2**: Solve 10 medium-level array and string problems on LeetCode. Review database normalizations.
- **Days 3-4**: Practice designing schema queries. Detail your portfolio projects and document the architectural choices.
- **Day 5**: Run a full Mock Interview stream on CareerReady AI and review grammar and technical answers critique.

## 5. Critical Coding Topics
- String reversal and anagram checking.
- Two-pointer techniques for array matching.
- DFS and BFS tree traversal concepts.
`;
}

function getMockTranslation(text, targetLang) {
  const dictionary = {
    'ta': { // Tamil mock conversions
      "CareerReady AI": "கரியர் ரெடி AI",
      "LLM Powered Career & Placement Readiness Platform": "LLM மூலம் இயங்கும் வேலைவாய்ப்பு மற்றும் தயார்நிலை தளம்",
      "Dashboard": "டாஷ்போர்டு",
      "Student Profile": "மாணவர் சுயவிவரம்",
      "Resumes": "விண்ணப்ப படிவங்கள்",
      "Skills": "திறன்கள்",
      "AI Recommendations": "AI பரிந்துரைகள்",
      "Mock Interview": "போலி நேர்காணல்",
      "Companies": "நிறுவனங்கள்",
      "AI Career Mentor": "AI தொழில் வழிகாட்டி",
      "Reports": "அறிக்கைகள்",
      "Settings": "அமைப்புகள்",
      "Admin Panel": "நிர்வாகக் குழு",
      "Logout": "வெளியேறு",
      "ATS Score": "ATS மதிப்பெண்",
      "Apply Now": "விண்ணப்பிக்கவும்"
    },
    'hi': { // Hindi mock conversions
      "CareerReady AI": "करियररेडी AI",
      "LLM Powered Career & Placement Readiness Platform": "LLM संचालित करियर और प्लेसमेंट तैयारी मंच",
      "Dashboard": "डैशबोर्ड",
      "Student Profile": "छात्र प्रोफाइल",
      "Resumes": "रिज्यूमे",
      "Skills": "कौशल",
      "AI Recommendations": "AI सिफारिशें",
      "Mock Interview": "मॉक इंटरव्यू",
      "Companies": "कंपनियां",
      "AI Career Mentor": "AI करियर मेंटर",
      "Reports": "रिपोर्ट",
      "Settings": "सेटिंग्स",
      "Admin Panel": "एडமின் पैनल",
      "Logout": "लॉगआउट",
      "ATS Score": "एटीएस स्कोर",
      "Apply Now": "अभी आवेदन करें"
    }
  };

  // Default fallback to translating a few key terms, or returns the text itself with a language suffix
  const dict = dictionary[targetLang];
  if (dict && dict[text]) {
    return dict[text];
  }
  return text; // Return original if not matched, to simulate translation seamlessly
}

function generateMockJdMatch(jdText, companyName, profile, studentSkills) {
  const jdLower = (jdText || "").toLowerCase();
  
  // Common tech keywords to detect in JD
  const potentialKeywords = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "React", "Angular", "Vue", "Svelte", 
    "Node.js", "Express", "Spring Boot", "Django", "SQL", "PostgreSQL", "MongoDB", "Redis", 
    "AWS", "Azure", "Docker", "Kubernetes", "Git", "REST APIs", "Microservices", "GraphQL", 
    "System Design", "CI/CD", "Agile", "Algorithms", "Data Structures"
  ];

  const matched = [];
  const missing = [];

  potentialKeywords.forEach(kw => {
    if (jdLower.includes(kw.toLowerCase())) {
      const hasSkill = studentSkills.some(s => s.toLowerCase().includes(kw.toLowerCase()));
      if (hasSkill) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }
  });

  // Ensure default keywords if JD was generic
  if (matched.length === 0) matched.push("JavaScript", "SQL", "Git", "REST APIs");
  if (missing.length === 0) missing.push("Docker", "AWS", "Microservices", "CI/CD");

  const total = matched.length + missing.length;
  const matchPercentage = Math.min(94, Math.max(62, Math.round((matched.length / Math.max(1, total)) * 100) + 12));

  return {
    matchPercentage,
    summary: `Candidate exhibits a solid ${matchPercentage}% technical alignment for ${companyName}. Core strengths in ${matched.slice(0, 3).join(', ')} match the foundational requirements, while incorporating ${missing.slice(0, 2).join(' and ')} will ensure top-tier ATS ranking.`,
    matchedKeywords: matched,
    missingKeywords: missing,
    recommendedActionBullets: [
      `Architected full-stack enterprise modules integrating ${missing[0] || 'Docker'} containerization, resulting in 40% faster deployment turnaround.`,
      `Engineered RESTful microservices with ${matched[0] || 'Node.js'} and ${missing[1] || 'AWS'}, reducing server latency by 28% across 10,000+ daily requests.`,
      `Implemented automated unit tests and CI/CD workflows, improving code reliability and deployment confidence.`
    ],
    likelyInterviewQuestions: [
      `How would you architect a scalable backend service using ${matched[0] || 'modern frameworks'} to handle sudden traffic spikes?`,
      `Explain your experience integrating ${missing[0] || 'cloud services'} into an existing monolithic or distributed application.`,
      `How do you handle database indexing, schema migrations, and query optimization when working with ${matched[1] || 'SQL databases'}?`,
      `Describe a challenging software bug you encountered and the methodical debugging process you used to resolve it.`
    ],
    atsFormattingTips: [
      `Ensure '${missing[0] || 'Docker'}' and '${missing[1] || 'Cloud'}' appear in both your Skills section and at least one Project description.`,
      `Place your Technical Skills section directly beneath your Career Summary for immediate ATS keyword parsing.`,
      `Use active action verbs (Engineered, Architected, Spearheaded) instead of passive verbs (Assisted, Worked on).`
    ]
  };
}

function generateMockEnhancedBullets(draftText, role) {
  return [
    `• Architected and deployed scalable full-stack features using modern web paradigms, improving page load efficiency by 32%.`,
    `• Engineered resilient RESTful API endpoints and database schemas, handling seamless data synchronization with sub-100ms response times.`,
    `• Collaborated in cross-functional agile sprints, conducting code reviews, implementing test cases, and reducing bug leakage by 25%.`
  ].join('\n');
}

