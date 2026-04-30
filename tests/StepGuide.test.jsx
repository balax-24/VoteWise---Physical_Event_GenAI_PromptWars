/**
 * @file StepGuide component tests.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StepGuide from '../src/components/StepGuide';
import { votingSteps } from '../src/data/electionSteps';

const pdfMocks = vi.hoisted(() => {
  const doc = {
    internal: { pageSize: { getWidth: vi.fn(() => 210) } },
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    splitTextToSize: vi.fn((text) => [text]),
    addPage: vi.fn(),
    save: vi.fn(),
  };

  return {
    doc,
    jsPDF: vi.fn(function jsPDF() {
      return doc;
    }),
  };
});

vi.mock('jspdf', () => ({
  jsPDF: pdfMocks.jsPDF,
}));

describe('StepGuide', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 8 step cards', () => {
    render(<StepGuide />);
    votingSteps.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    });
  });

  it('renders the PDF download button', () => {
    render(<StepGuide />);
    const button = screen.getByRole('button', { name: /Download voting checklist as PDF/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('displays step numbers for all cards', () => {
    render(<StepGuide />);
    votingSteps.forEach((step) => {
      expect(screen.getByLabelText(`Step ${step.id}`)).toBeInTheDocument();
    });
  });

  it('renders external links on steps that have them', () => {
    render(<StepGuide />);
    const stepsWithLinks = votingSteps.filter((s) => s.link);
    stepsWithLinks.forEach((step) => {
      expect(screen.getByLabelText(`Visit portal for step: ${step.title}`)).toHaveAttribute('href', step.link);
    });
  });

  it('generates and saves the PDF checklist', async () => {
    render(<StepGuide />);

    fireEvent.click(screen.getByRole('button', { name: /Download voting checklist as PDF/i }));

    await waitFor(() => expect(pdfMocks.doc.save).toHaveBeenCalledWith('votewise-checklist.pdf'));
    expect(pdfMocks.jsPDF).toHaveBeenCalledTimes(1);
    expect(pdfMocks.doc.text).toHaveBeenCalledWith('VoteWise — Your Voting Checklist', 20, 20);
  });
});
