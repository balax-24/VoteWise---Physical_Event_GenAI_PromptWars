/**
 * @file Data and helpers for the interactive election learning lab.
 */

import { OFFICIAL_LINKS } from '../config/appConfig';

export const READINESS_STORAGE_KEY = 'votewise-readiness-v1';

export const boothSimulatorSteps = [
  {
    title: 'Join the queue',
    detail: 'Check the queue for your polling station room and keep your voter slip or booth details ready.',
    action: 'Queue ready',
  },
  {
    title: 'First officer check',
    detail: 'The polling officer matches your name in the electoral roll and checks an accepted identity document.',
    action: 'Identity checked',
  },
  {
    title: 'Ink and signature',
    detail: 'Your finger is marked with indelible ink and you sign or thumb-mark the register.',
    action: 'Marked',
  },
  {
    title: 'EVM ballot unit',
    detail: 'Press the blue button next to the candidate or NOTA option you choose.',
    action: 'Button pressed',
  },
  {
    title: 'VVPAT confirmation',
    detail: 'A paper slip is visible briefly in the VVPAT window so you can verify the symbol and name.',
    action: 'Verified',
  },
  {
    title: 'Exit calmly',
    detail: 'Leave the voting compartment without sharing your choice inside the polling station.',
    action: 'Finished',
  },
];

export const quizQuestions = [
  {
    id: 'mcc-start',
    question: 'When does the Model Code of Conduct usually begin?',
    options: ['When election dates are announced', 'Only on polling day', 'After results are declared'],
    answer: 'When election dates are announced',
    explanation: 'The Model Code of Conduct comes into force after the Election Commission announces the schedule.',
  },
  {
    id: 'roll-name',
    question: 'What is the most important condition for casting a vote?',
    options: ['Your name is on the electoral roll', 'You carry any local bill', 'You know the booth officer'],
    answer: 'Your name is on the electoral roll',
    explanation: 'Accepted ID helps verify identity, but your name must be present on the electoral roll.',
  },
  {
    id: 'vvpat',
    question: 'What does VVPAT help a voter verify?',
    options: ['The selected candidate/symbol', 'The final constituency result', 'The campaign spending report'],
    answer: 'The selected candidate/symbol',
    explanation: 'The VVPAT slip lets voters briefly verify that the recorded selection matches their choice.',
  },
  {
    id: 'counting',
    question: 'What happens during vote counting?',
    options: ['Votes are counted under supervision', 'Polling booths reopen', 'New nominations are filed'],
    answer: 'Votes are counted under supervision',
    explanation: 'Counting is conducted under official supervision with candidate agents and observers where applicable.',
  },
];

export const mythFacts = [
  {
    myth: 'I cannot vote unless I carry my Voter ID card.',
    fact: 'If your name is on the electoral roll, other accepted photo ID documents may also be used.',
  },
  {
    myth: 'NOTA means the election is automatically cancelled.',
    fact: 'NOTA records voter dissatisfaction, but the candidate with the highest valid votes still wins under current rules.',
  },
  {
    myth: 'A first-time voter can register only during election month.',
    fact: 'Eligible citizens can apply or update details through official voter services before the relevant deadline.',
  },
  {
    myth: 'The VVPAT slip can be taken home.',
    fact: 'The slip is visible briefly inside the VVPAT unit and remains sealed for verification procedures.',
  },
];

export const glossaryTerms = [
  {
    term: 'EPIC',
    meaning: 'Electors Photo Identity Card, commonly called the Voter ID card.',
    prompt: 'Explain EPIC and how it is used in Indian elections.',
  },
  {
    term: 'EVM',
    meaning: 'Electronic Voting Machine used to record votes at polling stations.',
    prompt: 'Explain how EVM voting works for a first-time voter.',
  },
  {
    term: 'VVPAT',
    meaning: 'Voter Verifiable Paper Audit Trail that shows a brief paper confirmation of the vote.',
    prompt: 'Explain VVPAT and why it matters.',
  },
  {
    term: 'MCC',
    meaning: 'Model Code of Conduct, guidelines for parties and candidates during elections.',
    prompt: 'Explain the Model Code of Conduct in simple language.',
  },
  {
    term: 'NOTA',
    meaning: 'None of the Above option on the ballot unit.',
    prompt: 'Explain NOTA and what happens when voters choose it.',
  },
  {
    term: 'BLO',
    meaning: 'Booth Level Officer who supports voter roll and polling station information.',
    prompt: 'What does a Booth Level Officer do?',
  },
  {
    term: 'Postal Ballot',
    meaning: 'Voting method available for specific eligible groups under election rules.',
    prompt: 'Explain postal ballots and who may be eligible.',
  },
];

export const accessibilitySupports = [
  'Check whether wheelchair access and ramps are available at your polling station.',
  'Ask polling officials about assistance if you are a senior citizen or voter with disability.',
  'Eligible voters should review postal ballot and home voting rules through official ECI resources.',
  'Carry required documents and reach early to avoid peak crowding.',
  'Use the official helpline or ECI portal for local support before polling day.',
];

export const officialSources = [
  {
    title: 'ECI Voter Portal',
    description: 'Registration, correction, and voter services.',
    href: OFFICIAL_LINKS.eciPortal,
  },
  {
    title: 'Electoral Search',
    description: 'Search name, EPIC, and polling station details.',
    href: OFFICIAL_LINKS.voterSearch,
  },
  {
    title: 'Candidate Affidavits',
    description: 'Candidate background and affidavit reference.',
    href: OFFICIAL_LINKS.candidateInfo,
  },
];

export const readinessTasks = [
  { id: 'registration', label: 'Registration status checked' },
  { id: 'booth', label: 'Polling booth identified' },
  { id: 'id', label: 'Accepted ID document ready' },
  { id: 'process', label: 'Polling process reviewed' },
  { id: 'quiz', label: 'Timeline quiz completed' },
  { id: 'accessibility', label: 'Accessibility support reviewed' },
  { id: 'export', label: 'Plan exported' },
];

export const buildPersonalizedJourney = ({ voterType, registrationStatus, idStatus, supportNeed }) => {
  const plan = [];

  if (registrationStatus !== 'registered') {
    plan.push({
      title: 'Confirm or complete registration',
      detail: 'Use the ECI voter services portal to apply, correct details, or confirm your status before the deadline.',
    });
  } else {
    plan.push({
      title: 'Verify electoral roll details',
      detail: 'Search your name or EPIC number and save the polling station details from the official portal.',
    });
  }

  if (idStatus !== 'ready') {
    plan.push({
      title: 'Prepare an accepted photo ID',
      detail: 'Keep EPIC or another accepted photo identity document ready before polling day.',
    });
  }

  if (supportNeed !== 'none') {
    plan.push({
      title: 'Plan assistance early',
      detail: 'Review accessibility, companion, senior citizen, PwD, or postal ballot support through official channels.',
    });
  }

  if (voterType === 'first-time') {
    plan.push({
      title: 'Practice the booth flow',
      detail: 'Review the queue, officer verification, EVM button press, VVPAT confirmation, and exit steps.',
    });
  }

  plan.push(
    {
      title: 'Learn the election timeline',
      detail: 'Understand announcement, nomination, campaign, polling, counting, and result declaration phases.',
    },
    {
      title: 'Create polling-day checklist',
      detail: 'Save your booth details, accepted ID, travel plan, and a reminder for polling hours.',
    }
  );

  return plan;
};

export const calculateReadiness = (completedIds, total = readinessTasks.length) =>
  total === 0 ? 0 : Math.round((completedIds.length / total) * 100);

export const createCalendarContent = (plan, date = new Date()) => {
  const eventDate = new Date(date);
  eventDate.setDate(eventDate.getDate() + 7);
  const stamp = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0];
  const description = plan.map((item, index) => `${index + 1}. ${item.title}: ${item.detail}`).join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VoteWise//Election Readiness//EN',
    'BEGIN:VEVENT',
    `UID:votewise-readiness-${stamp}@votewise`,
    `DTSTAMP:${stamp}Z`,
    `DTSTART:${stamp}Z`,
    'SUMMARY:Review VoteWise election readiness plan',
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

export const downloadTextFile = (filename, content, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
