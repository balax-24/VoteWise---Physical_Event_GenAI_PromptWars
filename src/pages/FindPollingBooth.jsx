import React from 'react';
import PollingFinder from '../components/PollingFinder';

const FindPollingBooth = () => {
  return (
    <main id="main-content" role="main" className="flex-1 bg-bg/50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-4">Locate Your Polling Booth</h1>
        <p className="text-base md:text-lg text-muted max-w-2xl mx-auto">
          Ensure you know where to go on election day. Find your assigned station below.
        </p>
      </div>

      <PollingFinder />
    </main>
  );
};

export default FindPollingBooth;
