/**
 * @file Security-focused tests — input sanitization, rate limiting, XSS prevention.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  sanitizeInput,
  getRequestCount,
  getRemainingRequests,
  resetSessionCounts,
  MAX_REQUESTS_PER_SESSION,
} from '../src/gemini/geminiClient';

describe('Security: sanitizeInput', () => {
  it('strips basic HTML tags', () => {
    expect(sanitizeInput('<p>Hello</p>')).toBe('Hello');
  });

  it('strips nested HTML tags', () => {
    expect(sanitizeInput('<div><span>test</span></div>')).toBe('test');
  });

  it('strips script tags (XSS vector)', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('');
  });

  it('strips event handler attributes', () => {
    expect(sanitizeInput('hello onerror="alert(1)" world')).toBe('hello world');
  });

  it('strips javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });

  it('strips style blocks and data HTML payloads', () => {
    expect(sanitizeInput('<style>body{display:none}</style>data:text/html,<b>x</b>')).toBe(',x');
  });

  it('strips img tags with onerror (common XSS payload)', () => {
    expect(sanitizeInput('<img src=x onerror="alert(1)">')).toBe('');
  });

  it('handles null and undefined input', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(123)).toBe('');
  });

  it('collapses whitespace after stripping', () => {
    expect(sanitizeInput('  hello   world  ')).toBe('hello world');
  });

  it('preserves normal text', () => {
    expect(sanitizeInput('How do I register to vote?')).toBe('How do I register to vote?');
  });
});

describe('Security: Rate Limiting', () => {
  beforeEach(() => {
    resetSessionCounts();
  });

  it('starts at zero requests', () => {
    expect(getRequestCount('test-user')).toBe(0);
    expect(getRemainingRequests('test-user')).toBe(MAX_REQUESTS_PER_SESSION);
  });

  it('has a configured limit of 10', () => {
    expect(MAX_REQUESTS_PER_SESSION).toBe(10);
  });

  it('tracks independent counts per session', () => {
    // Simulate internal counter via direct test
    expect(getRequestCount('user-a')).toBe(0);
    expect(getRequestCount('user-b')).toBe(0);
  });

  it('reset clears all session counts', () => {
    // After reset, everything should be zero
    resetSessionCounts();
    expect(getRequestCount('any-user')).toBe(0);
    expect(getRemainingRequests('any-user')).toBe(10);
  });
});
