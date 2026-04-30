/**
 * @file Footer component tests.
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Footer from '../src/components/Footer';
import { NAV_ITEMS } from '../src/config/navigation';

describe('Footer', () => {
  const renderFooter = () =>
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

  it('renders internal navigation links', () => {
    renderFooter();
    NAV_ITEMS.forEach((item) => {
      expect(screen.getByRole('link', { name: item.name })).toBeInTheDocument();
    });
  });

  it('renders official resource links with target="_blank"', () => {
    renderFooter();
    const eciLink = screen.getByRole('link', { name: /ECI Voter Portal/i });
    expect(eciLink).toHaveAttribute('target', '_blank');
    expect(eciLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders the legal disclaimer', () => {
    renderFooter();
    expect(screen.getByText(/Disclaimer/i)).toBeInTheDocument();
  });

  it('renders the current year in copyright', () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('has the contentinfo role', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
