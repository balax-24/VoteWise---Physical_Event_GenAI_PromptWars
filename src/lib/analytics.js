/**
 * @file Analytics — GA4 event tracking helpers.
 *
 * Safe wrappers around `window.gtag`. All functions return `false` when
 * GA4 is not available, making analytics entirely optional.
 *
 * @module lib/analytics
 */

/** @returns {boolean} Whether the gtag global is available */
const hasGtag = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

/**
 * Sends a custom GA4 event.
 *
 * @param   {string} name   - Event name (e.g. `chat_question_asked`)
 * @param   {Object} params - Additional event parameters
 * @returns {boolean} `true` if the event was sent
 */
export const trackEvent = (name, params = {}) => {
  if (!hasGtag()) return false;
  window.gtag('event', name, params);
  return true;
};

/**
 * Sends a page view event to GA4.
 *
 * @param   {string} pagePath - Route path (e.g. `/chat`)
 * @returns {boolean} `true` if the page view was sent
 */
export const trackPageView = (pagePath) => {
  if (!hasGtag()) return false;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId || gaId === 'your_ga4_id') return false;

  window.gtag('config', gaId, { page_path: pagePath });
  return true;
};
