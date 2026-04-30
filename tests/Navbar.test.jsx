/**
 * @file Navbar component tests.
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Navbar from '../src/components/Navbar';
import { NAV_ITEMS } from '../src/config/navigation';

describe('Navbar', () => {
  const renderNavbar = (initialRoute = '/') =>
    render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Navbar />
      </MemoryRouter>
    );

  it('renders all nav items', () => {
    renderNavbar();
    NAV_ITEMS.forEach((item) => {
      const links = screen.getAllByText(item.name);
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('marks the active route with aria-current', () => {
    renderNavbar('/how-to-vote');
    const activeLinks = screen.getAllByText('How to Vote');
    const hasAriaCurrent = activeLinks.some(
      (link) => link.getAttribute('aria-current') === 'page'
    );
    expect(hasAriaCurrent).toBe(true);
  });

  it('renders the main navigation landmark', () => {
    renderNavbar();
    const navElements = screen.getAllByRole('navigation');
    expect(navElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the brand logo link', () => {
    renderNavbar();
    expect(screen.getAllByLabelText('VoteWise Home').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the mobile navigation with aria-label', () => {
    renderNavbar();
    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument();
  });
});
