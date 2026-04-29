const GuidedJourneyGrid = ({ journeys, onSelect, disabled }) => {
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
};

export default GuidedJourneyGrid;
