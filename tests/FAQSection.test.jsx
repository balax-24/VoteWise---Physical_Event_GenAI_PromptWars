/**
 * @file FAQSection component tests.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FAQSection from '../src/components/FAQSection';

// Mock Firebase so the component doesn't try to fetch from Firestore
vi.mock('../src/firebase/config', () => ({
  db: null,
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  limit: vi.fn(),
}));

describe('FAQSection', () => {
  it('renders the default FAQ questions', () => {
    render(<FAQSection />);
    expect(screen.getByText('How do I check if I am registered to vote?')).toBeInTheDocument();
    expect(screen.getByText('What IDs are accepted at the polling station?')).toBeInTheDocument();
    expect(screen.getByText('What is the Model Code of Conduct?')).toBeInTheDocument();
  });

  it('toggles accordion open/closed on click', () => {
    render(<FAQSection />);
    const firstButton = screen.getByText('How do I check if I am registered to vote?').closest('button');

    // Initially collapsed
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    // Click to collapse
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('has correct ARIA attributes for accordion', () => {
    render(<FAQSection />);
    const buttons = screen.getAllByRole('button');

    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-controls', `faq-answer-${index}`);
      expect(button).toHaveAttribute('aria-expanded');
    });
  });

  it('renders answer regions with proper labelledby attributes', () => {
    render(<FAQSection />);
    const regions = screen.getAllByRole('region', { hidden: true });

    regions.forEach((region, index) => {
      expect(region).toHaveAttribute('aria-labelledby', `faq-question-${index}`);
    });
  });
});
