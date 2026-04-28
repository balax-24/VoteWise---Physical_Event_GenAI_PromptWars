import React, { useState } from 'react';

const PollingFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [embedLocation, setEmbedLocation] = useState('India');
  const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setEmbedLocation(searchQuery.trim());

    // Track Analytics (GA4)
    if (window.gtag) {
      window.gtag('event', 'polling_booth_searched', {
        location: searchQuery.trim(),
      });
    }
  };

  // If key is missing, use a fallback view or instructional message
  const hasValidKey = MAPS_API_KEY && MAPS_API_KEY !== 'your_maps_key';
  
  // Construct URL
  const mapUrl = hasValidKey
    ? `https://www.google.com/maps/embed/v1/search?key=${MAPS_API_KEY}&q=polling+booth+near+${encodeURIComponent(embedLocation)}`
    : `https://www.google.com/maps/embed/v1/place?key=MOCK_KEY&q=${encodeURIComponent(embedLocation)}`; // Fallback pattern

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-surface rounded-xl shadow-lg border border-border">
      <h2 className="text-2xl font-display font-bold text-primary mb-2">Polling Booth Finder</h2>
      <p className="text-sm text-muted mb-6">Search your area to explore polling booths near you.</p>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex space-x-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter your city, pincode, or area..."
          className="flex-1 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
          aria-label="Search location for polling booths"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-surface px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          aria-label="Search"
        >
          Search
        </button>
      </form>

      {/* Map Embed Container */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-border bg-bg flex items-center justify-center">
        {hasValidKey ? (
          <iframe
            title="Google Maps Polling Booth Finder"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={mapUrl}
            allowFullScreen
            aria-label="Google Map showing polling booths"
          />
        ) : (
          <div className="text-center p-6 max-w-md">
            <span className="text-4xl mb-4 block" role="img" aria-label="Map">🗺️</span>
            <p className="text-sm font-semibold text-primary mb-2">Google Maps Integration Mode</p>
            <p className="text-xs text-muted mb-4">
              A valid Google Maps API Key is required to load the live map. (Configured location: "{embedLocation}")
            </p>
            <div className="bg-amber-50 text-amber-800 p-3 rounded text-xs border border-amber-200">
              <strong>Note:</strong> In production, the embed will display: <br/>
              <code className="text-[10px] break-all">{`https://www.google.com/maps/embed/v1/search?key=***&q=polling+booth+near+${embedLocation}`}</code>
            </div>
          </div>
        )}
      </div>

      {/* Official Link Note */}
      <div className="mt-6 p-4 bg-bg rounded-lg border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <p className="text-xs font-semibold text-primary mb-1">Important Notice:</p>
          <p className="text-xs text-muted">For your exact designated booth assignment, always verify via the official ECI voter portal.</p>
        </div>
        <a
          href="https://electoralsearch.eci.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent hover:bg-accent-dark text-primary font-semibold px-4 py-2 rounded text-xs shadow-sm transition-colors duration-200 text-center"
          aria-label="Visit official ECI voter portal"
        >
          Visit Official Portal
        </a>
      </div>
    </div>
  );
};

export default PollingFinder;
