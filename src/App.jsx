/**
 * @file App — Root application component.
 *
 * Sets up React Router, AnimatePresence page transitions, GA4 analytics,
 * an accessibility skip-link, and the global error boundary.
 *
 * @module App
 */

import { lazy, Suspense, useEffect, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { trackPageView } from './lib/analytics';
import { initPerformanceMonitoring } from './lib/performance';

const Home = lazy(() => import('./pages/Home'));
const HowToVote = lazy(() => import('./pages/HowToVote'));
const Timeline = lazy(() => import('./pages/Timeline'));
const FindPollingBooth = lazy(() => import('./pages/FindPollingBooth'));
const LearningLab = lazy(() => import('./pages/LearningLab'));
const Chat = lazy(() => import('./pages/Chat'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * Page transition wrapper — fades and slides children in/out on route change.
 * Memoized to prevent unnecessary re-renders of static layout chrome.
 */
const PageWrapper = memo(function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
});

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

/** Full-screen loader shown while lazy-loaded pages are being fetched. */
const PageLoader = memo(function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16" aria-live="polite">
      <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-3 shadow-sm">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden="true"
        />
        <span className="text-sm text-muted">Loading page…</span>
      </div>
    </div>
  );
});

/** Fires a GA4 page view on every route change. */
const RouteAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
};

/** Inner component that uses useLocation inside Router context. */
const AppRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/how-to-vote" element={<PageWrapper><HowToVote /></PageWrapper>} />
          <Route path="/timeline" element={<PageWrapper><Timeline /></PageWrapper>} />
          <Route path="/find-booth" element={<PageWrapper><FindPollingBooth /></PageWrapper>} />
          <Route path="/learning-lab" element={<PageWrapper><LearningLab /></PageWrapper>} />
          <Route path="/chat" element={<PageWrapper><Chat /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

function App() {
  // Dynamically inject GA4 only when a valid ID is configured
  useEffect(() => {
    initPerformanceMonitoring();

    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!gaId || gaId === 'your_ga4_id') return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script1);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { page_path: window.location.pathname });
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-bg font-body antialiased">
        {/* Accessibility: skip link */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>

        <Navbar />
        <RouteAnalytics />

        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
