import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import HowToVote from './pages/HowToVote';
import Timeline from './pages/Timeline';
import FindPollingBooth from './pages/FindPollingBooth';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

// Page fade transition wrapper
const PageWrapper = ({ children }) => (
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

// Inner component so we can use useLocation inside Router
const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/how-to-vote" element={<PageWrapper><HowToVote /></PageWrapper>} />
        <Route path="/timeline" element={<PageWrapper><Timeline /></PageWrapper>} />
        <Route path="/find-booth" element={<PageWrapper><FindPollingBooth /></PageWrapper>} />
        <Route path="/chat" element={<PageWrapper><Chat /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  // Dynamically inject GA4 only when a valid ID is configured
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!gaId || gaId === 'your_ga4_id') return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', { page_path: window.location.pathname });
    `;
    document.head.appendChild(script2);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-bg font-body antialiased">
        {/* Accessibility: skip link */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>

        <Navbar />

        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
