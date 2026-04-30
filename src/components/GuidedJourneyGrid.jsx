/**
 * @file GuidedJourneyGrid — Renders a grid of guided election journey cards.
 * Each card fires the `onSelect` callback when clicked.
 *
 * @module components/GuidedJourneyGrid
 */

import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * @param {Object}   props
 * @param {Array}    props.journeys  - Array of journey objects from appConfig
 * @param {Function} props.onSelect  - Called with the journey object on click
 * @param {boolean}  props.disabled  - Whether all buttons are disabled
 */
const GuidedJourneyGrid = memo(function GuidedJourneyGrid({ journeys, onSelect, disabled }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {journeys.map((journey) => (
        <button
          key={journey.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(journey)}
          className="rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Start guided journey: ${journey.title}`}
        >
          <p className="text-sm font-semibold text-primary">{journey.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{journey.description}</p>
          <span className="mt-3 inline-flex text-xs font-semibold text-accent">{journey.cta} →</span>
        </button>
      ))}
    </div>
  );
});

GuidedJourneyGrid.propTypes = {
  /** Array of guided journey configurations */
  journeys: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      prompt: PropTypes.string.isRequired,
      cta: PropTypes.string.isRequired,
    })
  ).isRequired,
  /** Callback invoked with the selected journey object */
  onSelect: PropTypes.func.isRequired,
  /** Disables all journey buttons */
  disabled: PropTypes.bool,
};

GuidedJourneyGrid.defaultProps = {
  disabled: false,
};

export default GuidedJourneyGrid;
