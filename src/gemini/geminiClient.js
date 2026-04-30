/**
 * @file Gemini AI client — streaming chat with rate limiting and input sanitization.
 *
 * Uses the Google Generative AI SDK to send messages to Gemini 1.5 Flash
 * and stream responses chunk-by-chunk. Includes per-session rate limiting
 * (tracked in a module-level Map) and input sanitization to strip HTML,
 * event handlers, and script injections.
 *
 * @module gemini/geminiClient
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/** @type {number} Maximum Gemini requests allowed per anonymous session. */
export const MAX_REQUESTS_PER_SESSION = 10;

/** @type {Map<string, number>} Per-session request counters. */
const sessionCounts = new Map();

/** System prompt that constrains the model to civic/election topics only. */
const SYSTEM_PROMPT = `You are VoteWise, an AI-powered civic education assistant focused exclusively on the Indian election process. Your role is to help citizens understand how elections work and how to participate.

SCOPE — You may discuss:
- Voter registration and eligibility (age, NRI voting, service voters)
- How to find and verify polling booths
- Voting day procedures (EVMs, VVPAT, mock polls, queue management)
- The Model Code of Conduct and its implications
- Election timeline phases (announcement → result declaration)
- Vote counting processes (EVM counting, postal ballots, VVPAT verification)
- NOTA (None of the Above) option and its significance
- Absentee and postal voting (service voters, senior citizens, PwD)
- Voter assistance for persons with disabilities
- The role of election observers and the Election Commission of India
- General civic rights and responsibilities

BOUNDARIES — You must NOT:
- Endorse, compare, or express opinions about any political party or candidate
- Discuss current political events, controversies, or campaign promises
- Answer questions unrelated to elections and civic participation
- Generate false or misleading information about electoral procedures

FORMAT:
- Use clear, simple language accessible to first-time voters
- Include relevant official sources (e.g., eci.gov.in) when helpful
- Use Markdown formatting (bold, lists, headers) for readability
- Keep responses concise but comprehensive`;

/**
 * Sanitizes user input by stripping HTML tags, event handler attributes,
 * javascript: protocol URIs, and collapsing whitespace.
 *
 * @param   {string} text - Raw user input
 * @returns {string} Cleaned text safe for API consumption
 */
export const sanitizeInput = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*on\w+\s*=\s*(["']).*?\1/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Returns the number of requests made by a session.
 * @param   {string} userId
 * @returns {number}
 */
export const getRequestCount = (userId) => sessionCounts.get(userId) || 0;

/**
 * Returns how many requests remain for a session.
 * @param   {string} userId
 * @returns {number}
 */
export const getRemainingRequests = (userId) =>
  MAX_REQUESTS_PER_SESSION - getRequestCount(userId);

/**
 * Resets all session counters. Used in tests.
 */
export const resetSessionCounts = () => sessionCounts.clear();

/**
 * Sends a message to Gemini 1.5 Flash and streams the response chunk-by-chunk.
 *
 * @param {string}   userId   - Anonymous session identifier
 * @param {string}   message  - User's raw message (will be sanitized)
 * @param {Function} onChunk  - Callback invoked with each streamed text chunk
 * @throws {Error} When the session rate limit is exceeded or the API key is missing
 */
export const getGeminiResponseStream = async (userId, message, onChunk) => {
  const currentCount = getRequestCount(userId);

  if (currentCount >= MAX_REQUESTS_PER_SESSION) {
    throw new Error(
      `Session limit reached (${MAX_REQUESTS_PER_SESSION} questions). Please start a new session.`
    );
  }

  const sanitizedMessage = sanitizeInput(message);

  if (!sanitizedMessage) {
    throw new Error('Message is empty after sanitization.');
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    throw new Error('Gemini API key is not configured.');
  }

  sessionCounts.set(userId, currentCount + 1);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContentStream(sanitizedMessage);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (chunkText) onChunk(chunkText);
  }
};
