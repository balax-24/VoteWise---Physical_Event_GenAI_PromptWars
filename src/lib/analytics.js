const hasGtag = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

export const trackEvent = (name, params = {}) => {
  if (!hasGtag()) return false;
  window.gtag('event', name, params);
  return true;
};

export const trackPageView = (pagePath) => {
  if (!hasGtag()) return false;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId || gaId === 'your_ga4_id') return false;

  window.gtag('config', gaId, { page_path: pagePath });
  return true;
};
