/**
 * @file Performance monitoring tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const trackEvent = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/analytics', () => ({
  trackEvent,
}));

describe('initPerformanceMonitoring', () => {
  const OriginalPerformanceObserver = globalThis.PerformanceObserver;
  const observers = [];

  class MockPerformanceObserver {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }

    observe = vi.fn();
  }

  beforeEach(() => {
    observers.length = 0;
    trackEvent.mockClear();
    globalThis.PerformanceObserver = MockPerformanceObserver;
  });

  afterEach(() => {
    globalThis.PerformanceObserver = OriginalPerformanceObserver;
    vi.restoreAllMocks();
  });

  it('registers observers for core web vitals and reports metrics', async () => {
    const { initPerformanceMonitoring } = await import('../src/lib/performance');

    initPerformanceMonitoring();

    expect(observers).toHaveLength(3);
    expect(observers[0].observe).toHaveBeenCalledWith({
      type: 'largest-contentful-paint',
      buffered: true,
    });
    expect(observers[1].observe).toHaveBeenCalledWith({
      type: 'first-input',
      buffered: true,
    });
    expect(observers[2].observe).toHaveBeenCalledWith({
      type: 'layout-shift',
      buffered: true,
    });

    observers[0].callback({ getEntries: () => [{ startTime: 1234.4 }] });
    observers[1].callback({ getEntries: () => [{ startTime: 10, processingStart: 42 }] });
    observers[2].callback({
      getEntries: () => [
        { value: 0.04, hadRecentInput: false },
        { value: 0.5, hadRecentInput: true },
      ],
    });

    expect(trackEvent).toHaveBeenCalledWith('web_vital', {
      metric_name: 'LCP',
      metric_value: 1234,
    });
    expect(trackEvent).toHaveBeenCalledWith('web_vital', {
      metric_name: 'FID',
      metric_value: 32,
    });
    expect(trackEvent).toHaveBeenCalledWith('web_vital', {
      metric_name: 'CLS',
      metric_value: 40,
    });
  });

  it('no-ops when PerformanceObserver is unavailable', async () => {
    globalThis.PerformanceObserver = undefined;
    const { initPerformanceMonitoring } = await import('../src/lib/performance');

    initPerformanceMonitoring();

    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('warns instead of crashing when observer registration fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.PerformanceObserver = class {
      observe() {
        throw new Error('unsupported metric');
      }
    };
    const { initPerformanceMonitoring } = await import('../src/lib/performance');

    initPerformanceMonitoring();

    expect(warn).toHaveBeenCalledWith(
      '[VoteWise] Performance monitoring unavailable:',
      'unsupported metric'
    );
  });
});
