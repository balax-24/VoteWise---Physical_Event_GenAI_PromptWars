/**
 * @file Application configuration — constants, guided journeys, and starter questions.
 * @module config/appConfig
 */

/** @type {number} Maximum Gemini requests per anonymous session. */
export const SESSION_REQUEST_LIMIT = 10;

export const OFFICIAL_LINKS = {
  eciPortal: 'https://voters.eci.gov.in/',
  voterSearch: 'https://electoralsearch.eci.gov.in',
  candidateInfo: 'https://www.myneta.info/',
};

export const STARTER_QUESTIONS = [
  'How do I register to vote?',
  'What do I bring to the polling booth?',
  'How are votes counted?',
  'What is EVM and how does it work?',
  'When are results announced?',
];

export const GUIDED_JOURNEYS = [
  {
    id: 'first-time-voter',
    title: 'I am a first-time voter',
    description: 'Get a simple step-by-step plan from registration to casting your vote.',
    prompt: 'I am a first-time voter in India. Give me a step-by-step checklist from registration to polling day, in simple language.',
    cta: 'Start checklist',
  },
  {
    id: 'find-my-booth',
    title: 'I need to find my booth',
    description: 'Understand where to verify your assigned polling station and what details to keep ready.',
    prompt: 'Help me find my polling booth and explain how to verify the correct location using official Election Commission resources.',
    cta: 'Find my booth',
  },
  {
    id: 'polling-day',
    title: 'What happens on polling day?',
    description: 'See the order of events at the booth, what to carry, and how the process usually works.',
    prompt: 'Walk me through polling day from entering the booth to casting my vote, including what ID to carry and what officers will check.',
    cta: 'Preview polling day',
  },
  {
    id: 'counting-results',
    title: 'How are votes counted?',
    description: 'Learn how EVM counting, result declaration, and post-result steps work.',
    prompt: 'Explain how votes are counted in Indian elections, how results are declared, and what happens after the count.',
    cta: 'Explain counting',
  },
];
