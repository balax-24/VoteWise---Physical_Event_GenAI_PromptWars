import { beforeEach, describe, expect, it } from 'vitest';
import { getRemainingRequests, getRequestCount, MAX_REQUESTS_PER_SESSION, resetSessionCounts, sanitizeInput } from '../src/gemini/geminiClient';

describe('geminiClient', () => {
  beforeEach(() => {
    resetSessionCounts();
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
  });
});
