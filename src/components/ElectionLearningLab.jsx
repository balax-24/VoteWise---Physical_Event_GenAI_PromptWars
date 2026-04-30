/**
 * @file ElectionLearningLab — ten interactive education features for Challenge 2.
 */

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  READINESS_STORAGE_KEY,
  accessibilitySupports,
  boothSimulatorSteps,
  buildPersonalizedJourney,
  calculateReadiness,
  createCalendarContent,
  downloadTextFile,
  glossaryTerms,
  mythFacts,
  officialSources,
  quizQuestions,
  readinessTasks,
} from '../data/electionLearning';
import { trackEvent } from '../lib/analytics';

const profileDefaults = {
  voterType: 'first-time',
  registrationStatus: 'not-sure',
  idStatus: 'not-ready',
  supportNeed: 'none',
};

const readStoredTasks = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(READINESS_STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const ElectionLearningLab = memo(function ElectionLearningLab() {
  const [profile, setProfile] = useState(profileDefaults);
  const [completedTasks, setCompletedTasks] = useState(() => readStoredTasks());
  const [boothStep, setBoothStep] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizScore, setQuizScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [revealedMyths, setRevealedMyths] = useState([]);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [narrationStatus, setNarrationStatus] = useState('Ready');
  const [isExporting, setIsExporting] = useState(false);

  const plan = useMemo(() => buildPersonalizedJourney(profile), [profile]);
  const readinessScore = calculateReadiness(completedTasks);
  const quizQuestion = quizQuestions[quizIndex];
  const currentBoothStep = boothSimulatorSteps[boothStep];
  const filteredGlossary = useMemo(() => {
    const query = glossarySearch.trim().toLowerCase();
    if (!query) return glossaryTerms;
    return glossaryTerms.filter((term) =>
      `${term.term} ${term.meaning}`.toLowerCase().includes(query)
    );
  }, [glossarySearch]);

  useEffect(() => {
    localStorage.setItem(READINESS_STORAGE_KEY, JSON.stringify(completedTasks));
  }, [completedTasks]);

  const markTask = useCallback((taskId) => {
    setCompletedTasks((prev) => (
      prev.includes(taskId) ? prev : [...prev, taskId]
    ));
  }, []);

  const toggleTask = useCallback((taskId) => {
    setCompletedTasks((prev) => (
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    ));
  }, []);

  const handleProfileChange = useCallback((event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBuildPlan = useCallback(() => {
    markTask('process');
    trackEvent('personalized_journey_built', profile);
  }, [markTask, profile]);

  const handleBoothNext = useCallback(() => {
    setBoothStep((prev) => {
      const next = Math.min(prev + 1, boothSimulatorSteps.length - 1);
      if (next === boothSimulatorSteps.length - 1) markTask('process');
      return next;
    });
  }, [markTask]);

  const handleQuizSubmit = useCallback(() => {
    if (!selectedAnswer) return;
    const isCorrect = selectedAnswer === quizQuestion.answer;
    if (isCorrect) setQuizScore((prev) => prev + 1);
    setAnswered(true);
    trackEvent('timeline_quiz_answered', {
      question_id: quizQuestion.id,
      correct: isCorrect.toString(),
    });
  }, [quizQuestion, selectedAnswer]);

  const handleQuizNext = useCallback(() => {
    if (quizIndex === quizQuestions.length - 1) {
      markTask('quiz');
      return;
    }
    setQuizIndex((prev) => prev + 1);
    setSelectedAnswer('');
    setAnswered(false);
  }, [markTask, quizIndex]);

  const revealMyth = useCallback((myth) => {
    setRevealedMyths((prev) => (
      prev.includes(myth) ? prev : [...prev, myth]
    ));
    trackEvent('myth_fact_revealed', { myth });
  }, []);

  const speakPlan = useCallback(() => {
    const text = [
      `Your VoteWise readiness score is ${readinessScore} percent.`,
      ...plan.map((item, index) => `${index + 1}. ${item.title}. ${item.detail}`),
    ].join(' ');

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setNarrationStatus('Narration unavailable');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.onend = () => setNarrationStatus('Finished');
    window.speechSynthesis.speak(utterance);
    setNarrationStatus('Speaking');
    markTask('process');
    trackEvent('voice_narration_started');
  }, [markTask, plan, readinessScore]);

  const stopNarration = useCallback(() => {
    window.speechSynthesis?.cancel();
    setNarrationStatus('Stopped');
  }, []);

  const downloadCalendar = useCallback(() => {
    downloadTextFile(
      'votewise-readiness-reminder.ics',
      createCalendarContent(plan),
      'text/calendar'
    );
    markTask('export');
    trackEvent('calendar_exported');
  }, [markTask, plan]);

  const downloadPdf = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(26, 58, 92);
      doc.text('VoteWise Personalized Readiness Plan', 20, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(28, 28, 30);
      let y = 34;
      plan.forEach((item, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${item.title}: ${item.detail}`, 170);
        doc.text(lines, 20, y);
        y += lines.length * 6 + 4;
      });
      doc.text(`Readiness score: ${readinessScore}%`, 20, y + 6);
      doc.save('votewise-personalized-plan.pdf');
      markTask('export');
      trackEvent('personalized_pdf_downloaded');
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, markTask, plan, readinessScore]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Election Learning Lab</p>
        <h2 className="font-display text-3xl font-bold text-primary">Practice, check, quiz, export, and ask better questions</h2>
        <p className="mx-auto max-w-3xl text-sm text-muted">
          Ten interactive tools for understanding the election process from registration to result day.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-primary">Readiness tracker</h3>
            <p className="text-sm text-muted">{readinessScore}% complete</p>
          </div>
          <div className="h-3 w-full rounded-full bg-bg md:max-w-sm" aria-label={`Readiness ${readinessScore}% complete`}>
            <div className="h-3 rounded-full bg-success transition-all duration-300" style={{ width: `${readinessScore}%` }} />
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {readinessTasks.map((task) => (
            <label key={task.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-primary">
              <input
                type="checkbox"
                checked={completedTasks.includes(task.id)}
                onChange={() => toggleTask(task.id)}
                className="h-4 w-4 accent-success"
              />
              <span>{task.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary">Personalized voter journey</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-primary">
              Voter type
              <select name="voterType" value={profile.voterType} onChange={handleProfileChange} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                <option value="first-time">First-time voter</option>
                <option value="returning">Returning voter</option>
              </select>
            </label>
            <label className="text-sm font-medium text-primary">
              Registration
              <select name="registrationStatus" value={profile.registrationStatus} onChange={handleProfileChange} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                <option value="not-sure">Not sure</option>
                <option value="registered">Registered</option>
                <option value="not-registered">Not registered</option>
              </select>
            </label>
            <label className="text-sm font-medium text-primary">
              ID document
              <select name="idStatus" value={profile.idStatus} onChange={handleProfileChange} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                <option value="not-ready">Not ready</option>
                <option value="ready">Ready</option>
              </select>
            </label>
            <label className="text-sm font-medium text-primary">
              Support
              <select name="supportNeed" value={profile.supportNeed} onChange={handleProfileChange} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                <option value="none">None</option>
                <option value="senior">Senior citizen</option>
                <option value="pwd">PwD/accessibility</option>
                <option value="nri">NRI/service voter</option>
              </select>
            </label>
          </div>
          <button onClick={handleBuildPlan} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface hover:bg-primary-dark">
            Build my plan
          </button>
          <ol className="mt-4 space-y-3">
            {plan.map((item) => (
              <li key={item.title} className="border-l-4 border-accent pl-3">
                <p className="text-sm font-semibold text-primary">{item.title}</p>
                <p className="text-sm text-muted">{item.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={downloadPdf} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-dark">
              {isExporting ? 'Preparing...' : 'Download plan'}
            </button>
            <button onClick={downloadCalendar} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary hover:border-accent">
              Calendar reminder
            </button>
            <Link to="/chat" state={{ initialQuestion: `Explain this personalized voter plan: ${plan.map((item) => item.title).join(', ')}` }} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary hover:border-accent">
              Ask AI
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary">Mock polling booth simulator</h3>
          <div className="mt-4 rounded-lg bg-bg/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Step {boothStep + 1} of {boothSimulatorSteps.length}</p>
            <h4 className="mt-2 text-lg font-bold text-primary">{currentBoothStep.title}</h4>
            <p className="mt-2 text-sm text-muted">{currentBoothStep.detail}</p>
            <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-primary">{currentBoothStep.action}</p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button onClick={() => setBoothStep((prev) => Math.max(prev - 1, 0))} disabled={boothStep === 0} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50">
              Previous
            </button>
            <button onClick={handleBoothNext} disabled={boothStep === boothSimulatorSteps.length - 1} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface disabled:opacity-50">
              Next
            </button>
          </div>
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-primary">Voice narration</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={speakPlan} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-dark">
                Speak plan
              </button>
              <button onClick={stopNarration} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary hover:border-accent">
                Stop
              </button>
              <span className="rounded-lg bg-bg px-3 py-2 text-sm text-muted" aria-live="polite">{narrationStatus}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary">Election timeline quiz</h3>
          <p className="mt-3 text-sm font-semibold text-primary">{quizQuestion.question}</p>
          <div className="mt-3 space-y-2">
            {quizQuestion.options.map((option) => (
              <label key={option} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-primary">
                <input
                  type="radio"
                  name="quiz"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(event) => setSelectedAnswer(event.target.value)}
                  disabled={answered}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {answered && (
            <p className="mt-3 rounded-lg bg-bg px-3 py-2 text-sm text-primary" role="status">
              {selectedAnswer === quizQuestion.answer ? 'Correct. ' : 'Not quite. '}
              {quizQuestion.explanation}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-sm text-muted">Score {quizScore}/{quizQuestions.length}</p>
            {answered ? (
              <button onClick={handleQuizNext} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface">
                {quizIndex === quizQuestions.length - 1 ? 'Finish quiz' : 'Next question'}
              </button>
            ) : (
              <button onClick={handleQuizSubmit} disabled={!selectedAnswer} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface disabled:opacity-50">
                Check answer
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary">Myth vs fact</h3>
          <div className="mt-3 space-y-2">
            {mythFacts.map((item) => {
              const isOpen = revealedMyths.includes(item.myth);
              return (
                <button
                  key={item.myth}
                  onClick={() => revealMyth(item.myth)}
                  className="w-full rounded-lg border border-border px-3 py-3 text-left hover:border-accent"
                  aria-expanded={isOpen}
                >
                  <span className="block text-sm font-semibold text-primary">Myth: {item.myth}</span>
                  {isOpen && <span className="mt-2 block text-sm text-muted">Fact: {item.fact}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <h3 className="font-display text-xl font-bold text-primary">Election glossary</h3>
          <input
            type="search"
            value={glossarySearch}
            onChange={(event) => setGlossarySearch(event.target.value)}
            placeholder="Search EVM, VVPAT, NOTA..."
            className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            aria-label="Search election glossary"
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {filteredGlossary.map((term) => (
              <div key={term.term} className="rounded-lg border border-border px-3 py-3">
                <p className="text-sm font-bold text-primary">{term.term}</p>
                <p className="mt-1 text-sm text-muted">{term.meaning}</p>
                <Link to="/chat" state={{ initialQuestion: term.prompt }} className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">
                  Ask AI
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary">Official sources</h3>
          <div className="mt-3 space-y-3">
            {officialSources.map((source) => (
              <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-border px-3 py-3 hover:border-accent">
                <span className="block text-sm font-semibold text-primary">{source.title}</span>
                <span className="mt-1 block text-sm text-muted">{source.description}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:col-span-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3 className="font-display text-xl font-bold text-primary">Accessible voting guide</h3>
            <button onClick={() => markTask('accessibility')} className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface">
              Mark reviewed
            </button>
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {accessibilitySupports.map((support) => (
              <li key={support} className="rounded-lg border border-border px-3 py-3 text-sm text-muted">
                {support}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});

export default ElectionLearningLab;
