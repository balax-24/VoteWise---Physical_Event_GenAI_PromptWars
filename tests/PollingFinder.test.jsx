import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PollingFinder from '../src/components/PollingFinder';

describe('PollingFinder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('shows the fallback guidance when no Maps API key is configured', () => {
    render(<PollingFinder />);

    expect(screen.getByText('Google Maps Integration Mode')).toBeInTheDocument();
    expect(screen.getByText(/A valid Google Maps API Key is required/i)).toBeInTheDocument();
  });

  it('tracks a search when analytics is available', () => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    window.gtag = gtag;

    render(<PollingFinder />);

    fireEvent.change(screen.getByLabelText('Search location for polling booths'), {
      target: { value: 'Delhi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(gtag).toHaveBeenCalledWith('event', 'polling_booth_searched', {
      location: 'Delhi',
    });
  });

  it('renders a lazy Google Maps iframe after a valid search', () => {
    vi.stubEnv('VITE_MAPS_API_KEY', 'real-maps-key');

    render(<PollingFinder />);

    fireEvent.change(screen.getByLabelText('Search location for polling booths'), {
      target: { value: 'Bengaluru 560001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    const iframe = screen.getByTitle('Polling booth map results');
    expect(iframe).toHaveAttribute('loading', 'lazy');
    expect(iframe).toHaveAttribute(
      'src',
      expect.stringContaining('key=real-maps-key')
    );
    expect(iframe).toHaveAttribute(
      'src',
      expect.stringContaining('Bengaluru%20560001')
    );
  });
});
