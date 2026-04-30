/**
 * @file ErrorBoundary — React class component that catches runtime errors.
 *
 * Renders a friendly fallback UI instead of a blank screen and logs errors
 * to the console. In development mode, displays the raw error stack.
 *
 * @module components/ErrorBoundary
 */

import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center"
        >
          <span className="text-5xl mb-4" role="img" aria-label="Error">⚠️</span>
          <h2 className="font-display text-2xl font-bold text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-muted mb-6 max-w-md">
            An unexpected error occurred in this section. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent hover:bg-amber-500 text-primary font-semibold px-6 py-2 rounded-lg text-sm shadow transition-colors duration-200"
          >
            Refresh Page
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-6 text-left text-xs bg-red-50 text-red-700 border border-red-200 rounded p-4 max-w-xl overflow-auto">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  /** React component tree to wrap with error protection */
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
