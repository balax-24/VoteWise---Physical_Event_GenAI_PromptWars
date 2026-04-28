import React from 'react';
import ElectionTimeline from '../components/ElectionTimeline';

const Timeline = () => {
  return (
    <main id="main-content" role="main" className="flex-1 bg-bg/50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-4">The Election Lifecycle</h1>
        <p className="text-base md:text-lg text-muted max-w-2xl mx-auto">
          Understand the journey of a vote, from the official announcement to the declaration of results.
        </p>
      </div>

      <ElectionTimeline />
    </main>
  );
};

export default Timeline;
