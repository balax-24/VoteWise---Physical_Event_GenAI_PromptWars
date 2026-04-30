import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EligibilityChecker from '../src/components/EligibilityChecker';
import * as analytics from '../src/lib/analytics';

// Mock analytics
vi.mock('../src/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('EligibilityChecker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and has ARIA labels', () => {
    render(<EligibilityChecker />);
    expect(screen.getByText('Voter Eligibility Checker')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check Eligibility' })).toBeInTheDocument();
  });

  it('calculates eligibility correctly for eligible user', async () => {
    render(<EligibilityChecker />);
    
    const input = screen.getByLabelText('Date of Birth');
    // Set date to exactly 20 years ago
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);
    const dateStr = date.toISOString().split('T')[0];

    await act(async () => {
      fireEvent.change(input, { target: { value: dateStr } });
      fireEvent.click(screen.getByRole('button', { name: 'Check Eligibility' }));
    });

    expect(screen.getByText('You Are Eligible to Vote!')).toBeInTheDocument();
    expect(analytics.trackEvent).toHaveBeenCalledWith('eligibility_checked', {
      eligible: 'true',
      age_years: 20,
    });
  });

  it('calculates eligibility correctly for ineligible user', async () => {
    render(<EligibilityChecker />);
    
    const input = screen.getByLabelText('Date of Birth');
    // Set date to exactly 16 years ago
    const date = new Date();
    date.setFullYear(date.getFullYear() - 16);
    const dateStr = date.toISOString().split('T')[0];

    await act(async () => {
      fireEvent.change(input, { target: { value: dateStr } });
      fireEvent.click(screen.getByRole('button', { name: 'Check Eligibility' }));
    });

    expect(screen.getByText('Not Yet Eligible')).toBeInTheDocument();
    expect(screen.getByText(/You will be eligible in/)).toBeInTheDocument();
    expect(analytics.trackEvent).toHaveBeenCalledWith('eligibility_checked', {
      eligible: 'false',
      age_years: 16,
    });
  });

  it('does not crash or show result when submitting empty date', async () => {
    render(<EligibilityChecker />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Check Eligibility' }));
    });

    expect(screen.queryByText('You Are Eligible to Vote!')).not.toBeInTheDocument();
    expect(screen.queryByText('Not Yet Eligible')).not.toBeInTheDocument();
  });
});
