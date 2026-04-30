import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getGeminiResponseStream,
  getRemainingRequests,
  getRequestCount,
  MAX_REQUESTS_PER_SESSION,
  resetSessionCounts,
  sanitizeInput,
} from '../src/gemini/geminiClient';

const geminiMocks = vi.hoisted(() => ({
  GoogleGenerativeAI: vi.fn(),
  getGenerativeModel: vi.fn(),
  generateContentStream: vi.fn(),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: geminiMocks.GoogleGenerativeAI,
}));

const asyncStream = (chunks) => ({
  async *[Symbol.asyncIterator]() {
    for (const chunk of chunks) {
      yield { text: () => chunk };
    }
  },
});

describe('geminiClient', () => {
  beforeEach(() => {
    resetSessionCounts();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'real-gemini-key');
    geminiMocks.GoogleGenerativeAI.mockImplementation(function GoogleGenerativeAI() {
      return {
      getGenerativeModel: geminiMocks.getGenerativeModel,
      };
    });
    geminiMocks.getGenerativeModel.mockReturnValue({
      generateContentStream: geminiMocks.generateContentStream,
    });
    geminiMocks.generateContentStream.mockResolvedValue({
      stream: asyncStream(['First ', 'second']),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('sanitizeInput', () => {
    it('should strip HTML tags', () => {
      const input = '<p>Hello <b>World</b></p>';
      expect(sanitizeInput(input)).toBe('Hello World');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

    it('should collapse repeated whitespace after stripping tags', () => {
      const input = '  <div>Hello</div>\n\n    world  ';
      expect(sanitizeInput(input)).toBe('Hello world');
    });
  });

  describe('Rate Limiting', () => {
    it('should expose the configured per-session limit', () => {
      expect(MAX_REQUESTS_PER_SESSION).toBe(10);
    });

    it('should start each session with the full remaining allowance', () => {
      expect(getRequestCount('session-1')).toBe(0);
      expect(getRemainingRequests('session-1')).toBe(MAX_REQUESTS_PER_SESSION);
    });

    it('should increment request counts after a successful stream', async () => {
      await getGeminiResponseStream('session-1', 'How do I vote?', vi.fn());

      expect(getRequestCount('session-1')).toBe(1);
      expect(getRemainingRequests('session-1')).toBe(MAX_REQUESTS_PER_SESSION - 1);
    });
  });

  describe('getGeminiResponseStream', () => {
    it('streams Gemini chunks to the callback', async () => {
      const onChunk = vi.fn();

      await getGeminiResponseStream('session-1', '<b>How do I vote?</b>', onChunk);

      expect(geminiMocks.GoogleGenerativeAI).toHaveBeenCalledWith('real-gemini-key');
      expect(geminiMocks.getGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gemini-1.5-flash',
        systemInstruction: expect.stringContaining('VoteWise'),
      }));
      expect(geminiMocks.generateContentStream).toHaveBeenCalledWith('How do I vote?');
      expect(onChunk).toHaveBeenNthCalledWith(1, 'First ');
      expect(onChunk).toHaveBeenNthCalledWith(2, 'second');
    });

    it('rejects when the Gemini API key is missing', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'your_gemini_api_key_here');

      await expect(getGeminiResponseStream('session-1', 'Hello', vi.fn()))
        .rejects.toThrow('Gemini API key is not configured.');
      expect(geminiMocks.GoogleGenerativeAI).not.toHaveBeenCalled();
    });

    it('rejects empty messages after sanitization', async () => {
      await expect(getGeminiResponseStream('session-1', '<img src=x>', vi.fn()))
        .rejects.toThrow('Message is empty after sanitization.');
      expect(geminiMocks.generateContentStream).not.toHaveBeenCalled();
    });

    it('enforces the per-session request limit before calling Gemini', async () => {
      for (let i = 0; i < MAX_REQUESTS_PER_SESSION; i += 1) {
        await getGeminiResponseStream('limited-session', `Question ${i}`, vi.fn());
      }

      await expect(getGeminiResponseStream('limited-session', 'One more?', vi.fn()))
        .rejects.toThrow('Session limit reached');
      expect(geminiMocks.generateContentStream).toHaveBeenCalledTimes(MAX_REQUESTS_PER_SESSION);
    });
  });
});
