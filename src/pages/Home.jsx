import React from 'react';
import { Link } from 'react-router-dom';
import FAQSection from '../components/FAQSection';

const Home = () => {
  return (
    <main id="main-content" role="main" className="flex-1">
      {/* Hero Section */}
      <section className="bg-primary text-surface py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f4a623_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-surface mb-4 leading-tight">
            Every vote starts with <span className="text-accent">understanding</span>.
          </h1>
          <p className="text-lg md:text-xl text-surface/80 mb-8 max-w-2xl mx-auto">
            Your interactive guide to the election process. Navigate timelines, find booths, and get instant answers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/chat"
              className="bg-accent hover:bg-accent-dark text-primary font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              aria-label="Ask AI Assistant"
            >
              Ask our AI Guide
            </Link>
            <Link
              to="/how-to-vote"
              className="bg-surface/10 hover:bg-surface/20 text-surface border border-surface/30 px-8 py-3 rounded-lg transition-all duration-200"
              aria-label="Learn how to vote"
            >
              How to Vote
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 bg-bg max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-surface p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl mb-4" role="img" aria-label="Timeline">🗓️</div>
            <h2 className="font-display font-bold text-xl text-primary mb-2">Election Timeline</h2>
            <p className="text-sm text-muted mb-4">Track the lifecycle from announcement to result declaration.</p>
            <Link to="/timeline" className="text-sm font-semibold text-accent hover:underline">
              View Timeline →
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-surface p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl mb-4" role="img" aria-label="Map">📍</div>
            <h2 className="font-display font-bold text-xl text-primary mb-2">Polling Finder</h2>
            <p className="text-sm text-muted mb-4">Locate your nearest voting station quickly.</p>
            <Link to="/find-booth" className="text-sm font-semibold text-accent hover:underline">
              Find Booth →
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-surface p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl mb-4" role="img" aria-label="Book">📖</div>
            <h2 className="font-display font-bold text-xl text-primary mb-2">Voter Rights</h2>
            <p className="text-sm text-muted mb-4">Understand your rights and protections as a citizen.</p>
            <Link to="/chat" className="text-sm font-semibold text-accent hover:underline">
              Ask About Rights →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface py-12 border-t border-border">
        <FAQSection />
      </section>
    </main>
  );
};

export default Home;
