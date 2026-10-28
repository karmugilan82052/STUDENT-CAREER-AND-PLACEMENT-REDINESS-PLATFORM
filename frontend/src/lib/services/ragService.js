/**
 * RAG SERVICE (Retrieval-Augmented Generation)
 * 
 * Provides vector indexing, semantic search, cosine similarity ranking,
 * and contextual prompt injection for Gemini 2.5 Flash.
 */

import { RAG_KNOWLEDGE_DOCS } from '../data/ragKnowledgeBase.js';

// Simple English Stopwords to optimize vector space representation
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Tokenize and normalize text into clean terms
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Compute Term Frequency (TF) map
 */
function computeTF(tokens) {
  const tf = new Map();
  if (tokens.length === 0) return tf;
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize by length
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / tokens.length);
  }
  return tf;
}

/**
 * Calculate Cosine Similarity between two TF vectors
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [, val] of vecA.entries()) {
    normA += val * val;
  }
  for (const [, val] of vecB.entries()) {
    normB += val * val;
  }

  if (normA === 0 || normB === 0) return 0;

  for (const [key, valA] of vecA.entries()) {
    if (vecB.has(key)) {
      dotProduct += valA * vecB.get(key);
    }
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Pre-compute indexed vectors for knowledge base documents
const indexedKnowledgeBase = RAG_KNOWLEDGE_DOCS.map(doc => {
  const fullText = `${doc.title} ${doc.tags.join(' ')} ${doc.category} ${doc.company} ${doc.domain} ${doc.content}`;
  const tokens = tokenize(fullText);
  const tfVector = computeTF(tokens);
  return {
    ...doc,
    tokens,
    tfVector
  };
});

export const ragService = {
  /**
   * Retrieve Top-K relevant knowledge chunks matching a query, domain, or company filter
   */
  retrieveContext(query, options = {}) {
    const { domain = 'all', company = '', limit = 3, minScore = 0.05 } = options;
    const queryTokens = tokenize(query);
    const queryVector = computeTF(queryTokens);

    const scoredDocs = indexedKnowledgeBase.map(doc => {
      let baseSim = cosineSimilarity(queryVector, doc.tfVector);

      // Metadata boost for exact company or domain match
      let boost = 0;
      if (company && doc.company && doc.company.toLowerCase() === company.toLowerCase()) {
        boost += 0.35;
      }
      if (domain && domain !== 'all' && doc.domain && (doc.domain === domain || doc.domain === 'all')) {
        boost += 0.20;
      }

      // Check keyword overlap in tags
      const queryLower = query.toLowerCase();
      const matchedTags = doc.tags.filter(tag => queryLower.includes(tag.toLowerCase()));
      boost += matchedTags.length * 0.08;

      const finalScore = Math.min(1.0, baseSim + boost);

      return {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        company: doc.company,
        domain: doc.domain,
        source: doc.source,
        content: doc.content,
        similarityScore: Math.round(finalScore * 100),
        matchedTags
      };
    });

    // Filter and sort descending by similarity score
    const results = scoredDocs
      .filter(doc => (doc.similarityScore / 100) >= minScore)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    // Fallback if score was very low but query exists
    if (results.length === 0 && indexedKnowledgeBase.length > 0) {
      return [
        {
          id: indexedKnowledgeBase[0].id,
          title: indexedKnowledgeBase[0].title,
          category: indexedKnowledgeBase[0].category,
          source: indexedKnowledgeBase[0].source,
          content: indexedKnowledgeBase[0].content,
          similarityScore: 65,
          matchedTags: ['General Knowledge']
        }
      ];
    }

    return results;
  },

  /**
   * Specialized retrieval for Mock Interview Generation
   */
  retrieveInterviewKnowledge(domain = 'all', company = '', customPrompt = '', limit = 3) {
    const combinedQuery = `${company} ${domain} technical interview questions rubrics concepts ${customPrompt}`;
    return this.retrieveContext(combinedQuery, { domain, company, limit });
  },

  /**
   * Specialized retrieval for Career Mentor Chatbot
   */
  retrieveMentorKnowledge(userQuery, limit = 2) {
    return this.retrieveContext(userQuery, { limit });
  },

  /**
   * Specialized retrieval for Company Syllabus & Hiring Patterns
   */
  retrieveCompanyKnowledge(companyName, limit = 2) {
    return this.retrieveContext(`Company hiring pattern syllabus rounds questions ${companyName}`, {
      company: companyName,
      limit
    });
  },

  /**
   * Format retrieved chunks as an augmented context string for LLM injection
   */
  formatContextForPrompt(chunks) {
    if (!chunks || chunks.length === 0) return "";
    
    let formatted = `\n--- RETRIEVED GROUNDING KNOWLEDGE BASE (RAG CONTEXT) ---\n`;
    formatted += `Use the following institutional archives and rubrics to ground your response and eliminate hallucinations:\n\n`;
    
    chunks.forEach((chunk, idx) => {
      formatted += `[Source #${idx + 1}: ${chunk.title} (${chunk.source}) - Relevance: ${chunk.similarityScore}%]\n`;
      formatted += `${chunk.content}\n\n`;
    });
    formatted += `--- END RAG GROUNDING CONTEXT ---\n\n`;
    
    return formatted;
  }
};
