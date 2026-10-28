const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenAI } = require('@google/generative-ai');

admin.initializeApp();

const db = admin.firestore();

// Helper to init Gemini API
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'Gemini API key is not configured in environment variables.');
  }
  return new GoogleGenAI({ apiKey });
}

// 1. RESUME PARSING & ATS ANALYSIS
exports.analyzeResume = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { studentId, resumeId, resumeText } = data;
  if (!studentId || !resumeId || !resumeText) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing parameters.');
  }

  try {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    const prompt = `Resume Content:\n${resumeText}\n\nAnalyze this resume text and output the results.`;
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction
    });

    const responseText = result.response.text();
    const analysisResult = JSON.parse(responseText.trim());

    // Save to Firestore
    await db.collection('resumeAnalysis').doc(resumeId).set({
      id: resumeId,
      studentId,
      ...analysisResult,
      analyzedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Post notification
    await db.collection('notifications').add({
      recipientId: studentId,
      title: "ATS Resume Analysis Completed",
      message: `Your resume has been parsed. ATS score: ${analysisResult.atsScore}/100.`,
      type: "AI_Analysis",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, analysis: analysisResult };

  } catch (error) {
    console.error("analyzeResume error:", error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to analyze resume.');
  }
});

// 2. MOCK INTERVIEW GENERATOR & GRADER
exports.conductMockInterview = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { type, action, questions, answers, studentId } = data;

  try {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    if (action === 'generate') {
      const systemInstruction = `You are a Senior Technical Recruiter. Generate exactly 5 interview questions.
      You MUST respond with a valid JSON array ONLY.
      JSON structure:
      [
        { "id": "q1", "category": "Technical", "text": "Question?", "sampleAnswer": "Suggested answer" }
      ]`;

      const prompt = `Generate 5 interview questions for a student interview focusing on type: ${type}.`;
      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
        systemInstruction
      });

      return { questions: JSON.parse(result.response.text().trim()) };
    } 
    
    if (action === 'evaluate') {
      let qaBlock = "";
      questions.forEach((q) => {
        qaBlock += `Question: ${q.text}\nStudent Answer: ${answers[q.id] || "No Answer"}\n\n`;
      });

      const systemInstruction = `You are a professional Interview Examiner. Evaluate the answers.
      You MUST respond with a valid JSON object ONLY.
      JSON structure:
      {
        "evaluation": {
          "accuracy": 80, "grammar": 85, "confidence": 75, "communication": 80, "technicalKnowledge": 80, "score": 80,
          "suggestions": ["suggestion 1", "suggestion 2"]
        }
      }`;

      const result = await model.generateContent({
        contents: [{ parts: [{ text: qaBlock }] }],
        generationConfig: { responseMimeType: "application/json" },
        systemInstruction
      });

      return JSON.parse(result.response.text().trim());
    }

    throw new functions.https.HttpsError('invalid-argument', 'Invalid action parameter.');

  } catch (error) {
    console.error("conductMockInterview error:", error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed in mock interview function.');
  }
});

// 3. LEARNING RECOMMENDATIONS
exports.generateRecommendations = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { studentId, profile, skills } = data;

  try {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemInstruction = `You are a Senior AI Career Mentor. Create learning roadmaps, courses, and project ideas.
    You MUST respond with a valid JSON object ONLY.
    JSON structure:
    {
      "roadmap": [{ "title": "Focus Area", "desc": "details", "duration": "Weeks 1-2" }],
      "courses": [{ "title": "Course Name", "platform": "Coursera", "url": "#" }],
      "videos": [{ "title": "Video Name", "channel": "YouTube", "url": "#" }],
      "platforms": [{ "name": "LeetCode", "url": "#" }],
      "books": [{ "title": "Book Title", "author": "Author" }],
      "projects": [{ "title": "Project", "desc": "description", "tech": ["Tech1"] }],
      "weeklySchedule": { "Monday": "Task", "Tuesday": "Task", "Wednesday": "Task", "Thursday": "Task", "Friday": "Task", "Saturday": "Task", "Sunday": "Task" },
      "monthlyGoal": "Monthly target goals"
    }`;

    const prompt = `Student Career Goal: ${profile.careerGoal || 'Software Professional'}. Department: ${profile.department}. Skills: ${skills.join(', ')}.`;
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction
    });

    const recommendations = JSON.parse(result.response.text().trim());
    
    // Save
    await db.collection('recommendations').doc(studentId).set({
      studentId,
      ...recommendations,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return recommendations;

  } catch (error) {
    console.error("generateRecommendations error:", error);
    throw new functions.https.HttpsError('internal', 'Failed to generate recommendations.');
  }
});

// 4. TRANSLATION FUNCTION
exports.translateText = functions.https.onCall(async (data, context) => {
  const { text, targetLang } = data;
  if (!text || !targetLang) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing parameters.');
  }

  try {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Translate this text directly to language tag ${targetLang}. Return ONLY translated content: "${text}"`;
    const result = await model.generateContent(prompt);
    
    return { translatedText: result.response.text().trim() };
  } catch (error) {
    console.error("translateText error:", error);
    throw new functions.https.HttpsError('internal', 'Translation service failed.');
  }
});
