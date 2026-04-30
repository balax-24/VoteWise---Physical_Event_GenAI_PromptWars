/**
 * @file Performance monitoring — Web Vitals reporting to GA4.
 *
 * Uses the `PerformanceObserver` API to capture Core Web Vitals
 * (LCP, FID, CLS) and reports them as GA4 events when analytics
 * is available. Safe no-op when `PerformanceObserver` is absent
 * (e.g. in SSR or older browsers).
 *
 * @module lib/performance
 */

import { trackEvent } from './analytics';

/**
 * Reports a web vital metric to GA4.
 *
 * @param {string} name  - Metric name (e.g. 'LCP', 'FID', 'CLS')
 * @param {number} value - Metric value in milliseconds (or unitless for CLS)
 */
const reportMetric = (name, value) => {
  trackEvent('web_vital', {
    metric_name: name,
    metric_value: Math.round(name === 'CLS' ? value * 1000 : value),
  });
};

/**
 * Initializes performance monitoring for Core Web Vitals.
 * Should be called once at application startup (e.g. in App.jsx useEffect).
 */
export const initPerformanceMonitoring = () => {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) reportMetric('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      if (firstEntry) reportMetric('FID', firstEntry.processingStart - firstEntry.startTime);
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      reportMetric('CLS', clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (err) {
    // Silently fail — performance monitoring is non-critical
    console.warn('[VoteWise] Performance monitoring unavailable:', err.message);
  }
};
