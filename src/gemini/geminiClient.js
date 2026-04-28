// import { GoogleGenAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Rate limiting state: Map of userId -> request count
const sessionCounts = new Map();
const MAX_REQUESTS_PER_SESSION = 10;

const SYSTEM_PROMPT = `You are VoteWise, a friendly and knowledgeable civic assistant that helps citizens understand the election process. You explain:
- Voter registration steps and eligibility
- How to find and visit a polling booth
- What happens on election day (step by step)
- How votes are counted and results declared
- Post-election processes like recounts and certifications
- Rights of voters
- Differences between local, state, and national elections

Keep answers clear, factual, jargon-free, and encouraging. If asked about specific candidates or political opinions, politely decline and redirect to the process. Always end with a helpful follow-up suggestion.`;

// Sanitize input: Strip HTML tags
export const sanitizeInput = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/<[^>]*>/g, '');
};

export const getGeminiResponseStream = async (userId, userMessage, onChunk) => {
  if (!API_KEY || API_KEY === 'your_gemini_key_here') {
    throw new Error('Gemini API key is missing or not configured.');
  }

  // Check rate limit
  const currentCount = sessionCounts.get(userId) || 0;
  if (currentCount >= MAX_REQUESTS_PER_SESSION) {
    throw new Error('Rate limit exceeded. Maximum 10 questions per session.');
  }

  const sanitizedMessage = sanitizeInput(userMessage);

  try {
    // Initialize the SDK
    // Note: In newer versions of the SDK, the import might be GoogleGenAI or GoogleGenerativeAI.
    // Let's use the standard GoogleGenerativeAI if GoogleGenAI fails, but usually it's GoogleGenerativeAI.
    // Wait, let's check the package documentation or use a safe fallback.
    // Actually, the package `@google/generative-ai` exports `GoogleGenerativeAI`.
    // Let's use `GoogleGenerativeAI`.
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const ai = new GoogleGenerativeAI(API_KEY);
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });

    const result = await model.generateContentStream(sanitizedMessage);
    
    // Increment count after successful initiation
    sessionCounts.set(userId, currentCount + 1);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onChunk(chunkText);
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

export const getRequestCount = (userId) => {
  return sessionCounts.get(userId) || 0;
};
export const getRemainingRequests = (userId) => {
  const count = sessionCounts.get(userId) || 0;
  return Math.max(0, MAX_REQUESTS_PER_SESSION - count);
};
export { MAX_REQUESTS_PER_SESSION };
