/**
 * @file PollingFinder — Google Maps embed for finding polling booths.
 *
 * If `VITE_MAPS_API_KEY` is missing or a placeholder, a graceful fallback
 * panel is shown with a direct link to the ECI electoral search portal.
 * Searches are debounced to prevent rapid iframe reloads.
 *
 * @module components/PollingFinder
 */

import { useState, useRef, useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { OFFICIAL_LINKS } from '../config/appConfig';
import { trackEvent } from '../lib/analytics';

/** Debounce delay for search in milliseconds. */
const DEBOUNCE_MS = 400;

const PollingFinder = memo(function PollingFinder() {
  const apiKey = import.meta.env.VITE_MAPS_API_KEY;
  const hasValidKey = apiKey && !apiKey.includes('your_') && !apiKey.includes('YOUR_');

  const [location, setLocation] = useState('');
  const [searchedLocation, setSearchedLocation] = useState('');
  const debounceRef = useRef(null);

  /** Build the Maps embed URL. Only recomputed when searchedLocation changes. */
  const mapSrc = useMemo(() => {
    if (!searchedLocation || !hasValidKey) return '';
    return `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=polling+booth+near+${encodeURIComponent(searchedLocation)}`;
  }, [searchedLocation, hasValidKey, apiKey]);

  /** Debounced search handler */
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const trimmed = location.trim();
    if (!trimmed) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      trackEvent('polling_booth_searched', { location: trimmed });
      setSearchedLocation(trimmed);
    }, DEBOUNCE_MS);
  }, [location]);

  /** Immediate search (for form submit) */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = location.trim();
    if (!trimmed) return;

    clearTimeout(debounceRef.current);
    trackEvent('polling_booth_searched', { location: trimmed });
    setSearchedLocation(trimmed);
  }, [location]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-display font-bold text-primary mb-6 text-center">Find Your Polling Booth</h2>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city, pincode, or area name"
          className="flex-1 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
          aria-label="Search location for polling booths"
        />
        <button
          type="submit"
          className="bg-accent hover:bg-amber-500 text-primary font-semibold px-6 py-2 rounded-lg text-sm shadow transition-colors duration-200"
        >
          Search
        </button>
      </form>

      {/* Map embed or fallback */}
      {hasValidKey ? (
        <div className="rounded-xl overflow-hidden shadow-lg border border-border">
          {searchedLocation ? (
            <iframe
              title="Polling booth map results"
              src={mapSrc}
              className="w-full h-[400px] md:h-[500px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="bg-bg/50 h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted">Enter a location above to search for nearby polling booths</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-bg/50 rounded-xl border border-border p-8 text-center">
          <span className="text-4xl mb-4 block" role="img" aria-label="Map">🗺️</span>
          <h3 className="font-display font-semibold text-lg text-primary mb-2">Google Maps Integration Mode</h3>
          <p className="text-sm text-muted mb-4">
            A valid Google Maps API Key is required to display the interactive map. You can still find your polling booth using the official ECI portal.
          </p>
          <a
            href={OFFICIAL_LINKS.voterSearch}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent hover:bg-amber-500 text-primary font-semibold px-6 py-2 rounded-lg text-sm shadow transition-colors duration-200"
          >
            Visit Official Voter Search ↗
          </a>
        </div>
      )}

      {/* ECI portal link */}
      <div className="mt-6 text-center">
        <a
          href={OFFICIAL_LINKS.voterSearch}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:underline font-semibold"
        >
          Or search on the official ECI Electoral Search Portal ↗
        </a>
      </div>
    </div>
  );
});

export default PollingFinder;
