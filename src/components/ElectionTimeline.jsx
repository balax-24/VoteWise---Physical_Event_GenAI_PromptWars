import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { timelinePhases } from '../data/electionSteps';
import { trackEvent } from '../lib/analytics';

const TimelineItem = ({ phase, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const navigate = useNavigate();
  const isEven = index % 2 === 0;
  const shouldReduceMotion = useReducedMotion();

  const handleLearnMore = () => {
    trackEvent('timeline_phase_clicked', { phase: phase.phase });
    navigate('/chat', {
      state: { initialQuestion: `Tell me more about the "${phase.phase}" phase of the election process.` }
    });
  };

  return (
    <div ref={ref} className="relative mb-10 md:mb-8">
      {/* ── Mobile layout: single column ── */}
      <div className="flex items-start space-x-4 md:hidden">
        {/* Icon blob */}
        <div
          className="z-10 flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary border-4 border-bg shadow-md"
          style={{ borderColor: phase.color }}
          aria-hidden="true"
        >
          <span className="text-xl">{phase.icon}</span>
        </div>

        {/* Card */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -30 }}
          animate={isInView ? (shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }) : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: shouldReduceMotion ? 0 : 0.05 }}
          className="flex-1 bg-surface rounded-xl shadow-md border border-border px-5 py-4 hover:shadow-lg transition-shadow duration-300"
        >
          <h3 className="font-display font-bold text-lg mb-1" style={{ color: phase.color }}>
            {phase.phase}
          </h3>
          <p className="text-sm text-muted leading-relaxed">{phase.description}</p>
          <button
            onClick={handleLearnMore}
            className="mt-3 text-xs font-semibold text-accent hover:text-primary transition-colors duration-200 flex items-center space-x-1"
            aria-label={`Ask AI about the ${phase.phase} phase`}
          >
            <span>Ask AI about this</span>
            <span aria-hidden="true">→</span>
          </button>
        </motion.div>
      </div>

      {/* ── Desktop layout: alternating left/right ── */}
      <div className="hidden md:flex items-center">
        {/* Left side (even indexes get the card here) */}
        <div className="w-5/12">
          {isEven && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: -50 }}
              animate={isInView ? (shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }) : {}}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
              className="bg-surface rounded-xl shadow-md border border-border px-6 py-4 hover:shadow-xl transition-shadow duration-300 mr-6"
            >
              <h3 className="font-display font-bold text-lg mb-1" style={{ color: phase.color }}>
                {phase.phase}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{phase.description}</p>
              <button
                onClick={handleLearnMore}
                className="mt-3 text-xs font-semibold text-accent hover:text-primary transition-colors duration-200 flex items-center space-x-1"
                aria-label={`Ask AI about the ${phase.phase} phase`}
              >
                <span>Ask AI about this</span>
                <span aria-hidden="true">→</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Centre icon */}
        <div className="w-2/12 flex justify-center">
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0 }}
            animate={isInView ? (shouldReduceMotion ? { opacity: 1 } : { scale: 1 }) : {}}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, delay: shouldReduceMotion ? 0 : 0.05 }}
            className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-primary shadow-lg"
            style={{ border: `4px solid ${phase.color}` }}
            aria-hidden="true"
          >
            <span className="text-xl">{phase.icon}</span>
          </motion.div>
        </div>

        {/* Right side (odd indexes) */}
        <div className="w-5/12">
          {!isEven && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: 50 }}
              animate={isInView ? (shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }) : {}}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
              className="bg-surface rounded-xl shadow-md border border-border px-6 py-4 hover:shadow-xl transition-shadow duration-300 ml-6"
            >
              <h3 className="font-display font-bold text-lg mb-1" style={{ color: phase.color }}>
                {phase.phase}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{phase.description}</p>
              <button
                onClick={handleLearnMore}
                className="mt-3 text-xs font-semibold text-accent hover:text-primary transition-colors duration-200 flex items-center space-x-1"
                aria-label={`Ask AI about the ${phase.phase} phase`}
              >
                <span>Ask AI about this</span>
                <span aria-hidden="true">→</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const ElectionTimeline = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Vertical connector line — desktop only, centred */}
      <div className="relative">
        <div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden md:block"
          aria-hidden="true"
        />
        {/* Mobile connector line — left-aligned with icon column */}
        <div
          className="absolute left-6 top-0 bottom-0 w-0.5 bg-border md:hidden"
          aria-hidden="true"
        />

        {timelinePhases.map((phase, index) => (
          <TimelineItem key={phase.phase} phase={phase} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ElectionTimeline;
