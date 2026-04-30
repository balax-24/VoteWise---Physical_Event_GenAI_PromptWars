/**
 * @file Home page — Landing page with hero, guided journeys, feature cards,
 * voter eligibility checker, and FAQ section.
 *
 * @module pages/Home
 */

import { Link, useNavigate } from 'react-router-dom';
import { memo } from 'react';
import FAQSection from '../components/FAQSection';
import EligibilityChecker from '../components/EligibilityChecker';
import { GUIDED_JOURNEYS } from '../config/appConfig';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

const Home = memo(function Home() {
  const navigate = useNavigate();

  // Ctrl+K / ⌘K → jump to chat (available globally on this page)
  useKeyboardShortcut('k', () => navigate('/chat'));

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
          {/* Keyboard shortcut hint */}
          <p className="mt-4 text-xs text-surface/40">
            Press <kbd className="px-1.5 py-0.5 bg-surface/10 rounded text-surface/60 font-mono text-[10px]">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-surface/10 rounded text-surface/60 font-mono text-[10px]">K</kbd> to open the AI assistant anytime
          </p>
        </div>
      </section>

      {/* Guided Journeys */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Guided Assistant</p>
          <h2 className="font-display text-3xl font-bold text-primary">Choose a voting goal, then let VoteWise guide the next step</h2>
          <p className="mx-auto max-w-2xl text-sm text-muted">
            These flows make the assistant more practical for first-time voters, polling-day prep, and election result understanding.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {GUIDED_JOURNEYS.map((journey) => (
            <Link
              key={journey.id}
              to="/chat"
              state={{ initialQuestion: journey.prompt }}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-primary">{journey.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{journey.description}</p>
              <span className="mt-4 inline-flex text-xs font-semibold text-accent">{journey.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Eligibility Checker — Unique interactive feature */}
      <section className="py-14 px-4 bg-primary/5 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Quick Check</p>
            <h2 className="font-display text-3xl font-bold text-primary mt-2">Am I Eligible to Vote?</h2>
            <p className="mx-auto max-w-lg text-sm text-muted mt-2">
              Instantly check your voter eligibility based on your date of birth. No data is sent — everything is calculated on your device.
            </p>
          </div>
          <EligibilityChecker />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 bg-bg max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
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

          {/* Card 4 */}
          <div className="bg-surface p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl mb-4" role="img" aria-label="Learning lab">🧭</div>
            <h2 className="font-display font-bold text-xl text-primary mb-2">Learning Lab</h2>
            <p className="text-sm text-muted mb-4">Practice the booth flow, take quizzes, build a plan, and export reminders.</p>
            <Link to="/learning-lab" className="text-sm font-semibold text-accent hover:underline">
              Open Lab →
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
});

export default Home;
