/**
 * @file App shell tests.
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';

const trackPageView = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/analytics', () => ({
  trackPageView,
}));

vi.mock('../src/pages/Home', () => ({
  default: () => <main id="main-content">Home route</main>,
}));

vi.mock('../src/pages/HowToVote', () => ({
  default: () => <main id="main-content">How to vote route</main>,
}));

vi.mock('../src/pages/Timeline', () => ({
  default: () => <main id="main-content">Timeline route</main>,
}));

vi.mock('../src/pages/FindPollingBooth', () => ({
  default: () => <main id="main-content">Find booth route</main>,
}));

vi.mock('../src/pages/Chat', () => ({
  default: () => <main id="main-content">Chat route</main>,
}));

vi.mock('../src/pages/NotFound', () => ({
  default: () => <main id="main-content">Not found route</main>,
}));

describe('App', () => {
  beforeEach(() => {
    trackPageView.mockClear();
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'your_ga4_id');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    document.head
      .querySelectorAll('script[src*="googletagmanager.com"]')
      .forEach((script) => script.remove());
    delete window.gtag;
    delete window.dataLayer;
  });

  it('renders the app shell with navigation, skip link, route content, and footer', async () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('navigation', { name: 'Main Navigation' })).toBeInTheDocument();
    expect(await screen.findByText('Home route')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(trackPageView).toHaveBeenCalledWith('/');
  });

  it('injects GA4 scripts only when a valid measurement id is configured', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST1234');

    render(<App />);

    await waitFor(() => {
      expect(document.head.querySelector('script[src="https://www.googletagmanager.com/gtag/js?id=G-TEST1234"]')).toBeTruthy();
    });
    expect(Array.from(window.dataLayer.at(-1))).toEqual([
      'config',
      'G-TEST1234',
      { page_path: window.location.pathname },
    ]);
  });
});
