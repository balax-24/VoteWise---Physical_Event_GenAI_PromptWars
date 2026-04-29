import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <main
      id="main-content"
      role="main"
      className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-bg text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-7xl mb-6 block" role="img" aria-label="Ballot box">🗳️</span>
        <h1 className="font-display text-5xl font-bold text-primary mb-4">404</h1>
        <h2 className="font-display text-2xl font-semibold text-primary mb-3">
          Page Not Found
        </h2>
        <p className="text-muted text-sm mb-8 max-w-md mx-auto">
          Looks like this page doesn't exist — but your vote always does! Head back home and explore your civic guide.
        </p>
        <Link
          to="/"
          className="inline-block bg-accent hover:bg-amber-500 text-primary font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          aria-label="Go back to VoteWise home"
        >
          Back to Home
        </Link>
      </motion.div>
    </main>
  );
};

export default NotFound;
