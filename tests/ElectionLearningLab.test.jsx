/**
 * @file ElectionLearningLab component tests.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ElectionLearningLab from '../src/components/ElectionLearningLab';
import { READINESS_STORAGE_KEY, quizQuestions } from '../src/data/electionLearning';

const pdfMocks = vi.hoisted(() => {
  const doc = {
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    splitTextToSize: vi.fn((text) => [text]),
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

const renderLab = () => render(
  <MemoryRouter>
    <ElectionLearningLab />
  </MemoryRouter>
);

describe('ElectionLearningLab', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:votewise'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });

  it('renders the ten feature areas', () => {
    renderLab();

    expect(screen.getByText('Readiness tracker')).toBeInTheDocument();
    expect(screen.getByText('Personalized voter journey')).toBeInTheDocument();
    expect(screen.getByText('Mock polling booth simulator')).toBeInTheDocument();
    expect(screen.getByText('Election timeline quiz')).toBeInTheDocument();
    expect(screen.getByText('Myth vs fact')).toBeInTheDocument();
    expect(screen.getByText('Election glossary')).toBeInTheDocument();
    expect(screen.getByText('Official sources')).toBeInTheDocument();
    expect(screen.getByText('Accessible voting guide')).toBeInTheDocument();
    expect(screen.getByText('Voice narration')).toBeInTheDocument();
    expect(screen.getByText('Calendar reminder')).toBeInTheDocument();
  });

  it('builds a support-aware personalized plan and persists readiness progress', () => {
    renderLab();

    fireEvent.change(screen.getByLabelText('Support'), {
      target: { value: 'pwd', name: 'supportNeed' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Build my plan' }));

    expect(screen.getByText('Plan assistance early')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(READINESS_STORAGE_KEY))).toContain('process');
  });

  it('moves through the mock booth simulator', () => {
    renderLab();

    expect(screen.getByText('Join the queue')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('First officer check')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Join the queue')).toBeInTheDocument();
  });

  it('checks quiz answers and completes the quiz readiness task', () => {
    renderLab();

    quizQuestions.forEach((question, index) => {
      fireEvent.click(screen.getByLabelText(question.answer));
      fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
      expect(screen.getByText(/Correct/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', {
        name: index === quizQuestions.length - 1 ? 'Finish quiz' : 'Next question',
      }));
    });

    expect(JSON.parse(localStorage.getItem(READINESS_STORAGE_KEY))).toContain('quiz');
  });

  it('shows quiz feedback for incorrect answers', () => {
    renderLab();

    const wrongAnswer = quizQuestions[0].options.find((option) => option !== quizQuestions[0].answer);
    fireEvent.click(screen.getByLabelText(wrongAnswer));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByText(/Not quite/)).toBeInTheDocument();
  });

  it('reveals myth facts and filters glossary terms', () => {
    renderLab();

    fireEvent.click(screen.getByRole('button', {
      name: /Myth: I cannot vote unless I carry my Voter ID card/i,
    }));
    expect(screen.getByText(/other accepted photo ID documents/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search election glossary'), {
      target: { value: 'VVPAT' },
    });

    expect(screen.getByText('VVPAT')).toBeInTheDocument();
    expect(screen.queryByText('EPIC')).not.toBeInTheDocument();
  });

  it('exports calendar and PDF plans', async () => {
    renderLab();

    fireEvent.click(screen.getByRole('button', { name: 'Calendar reminder' }));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(READINESS_STORAGE_KEY))).toContain('export');

    fireEvent.click(screen.getByRole('button', { name: 'Download plan' }));
    await waitFor(() => expect(pdfMocks.doc.save).toHaveBeenCalledWith('votewise-personalized-plan.pdf'));
  });

  it('uses browser narration when available and handles unavailable narration', () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    window.speechSynthesis = { speak, cancel };
    window.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) {
      this.text = text;
    };

    renderLab();

    fireEvent.click(screen.getByRole('button', { name: 'Speak plan' }));
    expect(speak).toHaveBeenCalled();
    expect(screen.getByText('Speaking')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(cancel).toHaveBeenCalled();
    expect(screen.getByText('Stopped')).toBeInTheDocument();
  });

  it('announces unavailable narration when speech synthesis is missing', () => {
    renderLab();

    fireEvent.click(screen.getByRole('button', { name: 'Speak plan' }));

    expect(screen.getByText('Narration unavailable')).toBeInTheDocument();
  });

  it('toggles tracker tasks and marks accessibility reviewed', () => {
    renderLab();

    const registrationTask = screen.getByLabelText('Registration status checked');
    fireEvent.click(registrationTask);
    expect(JSON.parse(localStorage.getItem(READINESS_STORAGE_KEY))).toContain('registration');

    fireEvent.click(registrationTask);
    expect(JSON.parse(localStorage.getItem(READINESS_STORAGE_KEY))).not.toContain('registration');

    fireEvent.click(screen.getByRole('button', { name: 'Mark reviewed' }));
    expect(JSON.parse(localStorage.getItem(READINESS_STORAGE_KEY))).toContain('accessibility');
  });
});
