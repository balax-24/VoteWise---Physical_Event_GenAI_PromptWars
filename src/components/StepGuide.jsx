import React, { useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { votingSteps } from '../data/electionSteps';

const StepCard = ({ step, index, onVisible }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // useEffect replaced by ref callback via isInView — report once visible
  React.useEffect(() => {
    if (isInView) onVisible(index);
  }, [isInView, index, onVisible]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-surface rounded-xl p-6 shadow-md border border-border flex items-start space-x-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Step number badge */}
      <div
        className="flex-shrink-0 bg-accent text-primary font-mono font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
        aria-label={`Step ${step.id}`}
      >
        {step.id}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl" role="img" aria-label={step.title}>{step.icon}</span>
          <h3 className="font-display font-semibold text-lg text-primary leading-tight">{step.title}</h3>
        </div>
        <p className="text-sm text-muted leading-relaxed">{step.description}</p>
        {step.link && (
          <a
            href={step.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-semibold text-accent hover:underline"
            aria-label={`Visit portal for step: ${step.title}`}
          >
            Visit Portal →
          </a>
        )}
      </div>
    </motion.div>
  );
};

const StepGuide = () => {
  const viewedSteps = useRef(new Set());
  const completedTracked = useRef(false);

  // Stable callback — won't trigger infinite useEffect loops
  const handleStepVisible = useCallback((index) => {
    viewedSteps.current.add(index);
    if (
      viewedSteps.current.size === votingSteps.length &&
      !completedTracked.current
    ) {
      completedTracked.current = true;
      if (window.gtag) {
        window.gtag('event', 'step_guide_completed');
      }
    }
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(26, 58, 92);
    doc.text('VoteWise — Your Voting Checklist', margin, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Powered by VoteWise | votewise.app', margin, 28);

    // Divider line
    doc.setDrawColor(229, 224, 216);
    doc.line(margin, 32, pageWidth - margin, 32);

    let y = 42;

    votingSteps.forEach((step) => {
      // Check if we need a new page
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(26, 58, 92);
      doc.text(`${step.id}. ${step.icon} ${step.title}`, margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(28, 28, 30);

      // Word-wrap long descriptions
      const lines = doc.splitTextToSize(step.description, maxLineWidth - 5);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5 + 8;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('For official voter info visit: https://electoralsearch.eci.gov.in', margin, 285);

    doc.save('votewise-checklist.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-display font-bold text-primary">Your 8-Step Voting Guide</h2>
        <button
          onClick={downloadPDF}
          className="bg-accent hover:bg-amber-500 text-primary font-semibold px-4 py-2 rounded-lg text-sm shadow-md transition-all duration-200 flex items-center space-x-2 hover:-translate-y-0.5 transform"
          aria-label="Download voting checklist as PDF"
        >
          <span aria-hidden="true">📥</span>
          <span>Download PDF</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {votingSteps.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            index={index}
            onVisible={handleStepVisible}
          />
        ))}
      </div>
    </div>
  );
};

export default StepGuide;
