/**
 * @file EligibilityChecker — Interactive voter eligibility calculator.
 *
 * Users enter their date of birth and the component instantly shows
 * whether they are eligible to vote (18+ on the qualifying date),
 * their exact age, and contextual next steps. No API calls needed —
 * pure client-side calculation.
 *
 * @module components/EligibilityChecker
 */

import { useState, useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { trackEvent } from '../lib/analytics';

/**
 * Calculates the age in years, months, and days from a birth date to a
 * reference date.
 *
 * @param   {Date} birthDate     - User's date of birth
 * @param   {Date} referenceDate - Date to calculate age at (default: today)
 * @returns {{ years: number, months: number, days: number }}
 */
const calculateAge = (birthDate, referenceDate = new Date()) => {
  let years = referenceDate.getFullYear() - birthDate.getFullYear();
  let months = referenceDate.getMonth() - birthDate.getMonth();
  let days = referenceDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

/** Minimum voting age in India */
const VOTING_AGE = 18;

/**
 * Result panel shown after eligibility check.
 * @param {Object} props
 * @param {boolean} props.eligible - Whether the user is eligible
 * @param {{ years: number, months: number, days: number }} props.age
 * @param {string} props.dob - Formatted date of birth string
 */
const ResultPanel = memo(function ResultPanel({ eligible, age, dob }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-6 rounded-xl border-2 p-6 text-center transition-all duration-300 ${
        eligible
          ? 'border-success bg-green-50'
          : 'border-amber-400 bg-amber-50'
      }`}
    >
      <span className="text-4xl block mb-3" role="img" aria-label={eligible ? 'Checkmark' : 'Hourglass'}>
        {eligible ? '✅' : '⏳'}
      </span>
      <h3 className="font-display text-xl font-bold mb-2" style={{ color: eligible ? '#16a34a' : '#d97706' }}>
        {eligible ? 'You Are Eligible to Vote!' : 'Not Yet Eligible'}
      </h3>
      <p className="text-sm text-muted mb-3">
        Born on <strong>{dob}</strong> — you are currently{' '}
        <strong>{age.years} years, {age.months} months, and {age.days} days</strong> old.
      </p>
      {eligible ? (
        <div className="space-y-2">
          <p className="text-sm text-success font-medium">
            You meet the minimum age requirement of {VOTING_AGE} years.
          </p>
          <a
            href="https://voters.eci.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 bg-success hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow transition-colors duration-200"
          >
            Register on ECI Portal ↗
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-amber-700 font-medium">
            You need to be at least {VOTING_AGE} years old to vote.
            You will be eligible in{' '}
            <strong>{VOTING_AGE - age.years - 1} year{VOTING_AGE - age.years - 1 !== 1 ? 's' : ''}</strong> and{' '}
            <strong>{12 - age.months} month{12 - age.months !== 1 ? 's' : ''}</strong>.
          </p>
          <p className="text-xs text-muted">
            In the meantime, learn about the election process and be ready for your first vote!
          </p>
        </div>
      )}
    </div>
  );
});

ResultPanel.propTypes = {
  eligible: PropTypes.bool.isRequired,
  age: PropTypes.shape({
    years: PropTypes.number.isRequired,
    months: PropTypes.number.isRequired,
    days: PropTypes.number.isRequired,
  }).isRequired,
  dob: PropTypes.string.isRequired,
};

/**
 * Interactive voter eligibility checker component.
 */
const EligibilityChecker = memo(function EligibilityChecker() {
  const [dateInput, setDateInput] = useState('');
  const [result, setResult] = useState(null);

  /** Maximum allowed date (today) for the date input. */
  const maxDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  /** Minimum allowed date (120 years ago). */
  const minDate = useMemo(() => {
    const min = new Date();
    min.setFullYear(min.getFullYear() - 120);
    return min.toISOString().split('T')[0];
  }, []);

  const handleCheck = useCallback((e) => {
    e.preventDefault();
    if (!dateInput) return;

    const birthDate = new Date(dateInput);
    if (isNaN(birthDate.getTime())) return;

    const age = calculateAge(birthDate);
    const eligible = age.years >= VOTING_AGE;

    trackEvent('eligibility_checked', {
      eligible: eligible.toString(),
      age_years: age.years,
    });

    setResult({
      eligible,
      age,
      dob: birthDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    });
  }, [dateInput]);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-surface rounded-xl border border-border shadow-md p-6">
        <div className="text-center mb-6">
          <span className="text-3xl block mb-2" role="img" aria-label="ID card">🪪</span>
          <h3 className="font-display font-bold text-lg text-primary">
            Voter Eligibility Checker
          </h3>
          <p className="text-xs text-muted mt-1">
            Enter your date of birth to check if you're eligible to vote in Indian elections.
          </p>
        </div>

        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label htmlFor="dob-input" className="block text-sm font-medium text-primary mb-1">
              Date of Birth
            </label>
            <input
              id="dob-input"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              max={maxDate}
              min={minDate}
              required
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              aria-describedby="dob-hint"
            />
            <p id="dob-hint" className="text-xs text-muted mt-1">
              You must be at least {VOTING_AGE} years old on the qualifying date.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-surface font-semibold py-2.5 rounded-lg text-sm shadow transition-colors duration-200"
          >
            Check Eligibility
          </button>
        </form>

        {result && (
          <ResultPanel
            eligible={result.eligible}
            age={result.age}
            dob={result.dob}
          />
        )}
      </div>
    </div>
  );
});

export default EligibilityChecker;
