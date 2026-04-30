/**
 * @file Analytics helper tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackEvent, trackPageView } from '../src/lib/analytics';

describe('analytics', () => {
  let mockGtag;

  beforeEach(() => {
    mockGtag = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.gtag;
  });

  describe('trackEvent', () => {
    it('returns false when gtag is not available', () => {
      expect(trackEvent('test_event')).toBe(false);
    });

    it('calls gtag when available', () => {
      window.gtag = mockGtag;
      const result = trackEvent('chat_question_asked', { question: 'test' });

      expect(result).toBe(true);
      expect(mockGtag).toHaveBeenCalledWith('event', 'chat_question_asked', { question: 'test' });
    });

    it('passes empty params by default', () => {
      window.gtag = mockGtag;
      trackEvent('some_event');

      expect(mockGtag).toHaveBeenCalledWith('event', 'some_event', {});
    });
  });

  describe('trackPageView', () => {
    it('returns false when gtag is not available', () => {
      expect(trackPageView('/test')).toBe(false);
    });

    it('returns false when GA ID is missing', () => {
      window.gtag = mockGtag;
      // No VITE_GA_MEASUREMENT_ID set in test env
      expect(trackPageView('/test')).toBe(false);
    });
  });
});
