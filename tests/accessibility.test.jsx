/**
 * @file Accessibility tests — axe-core audits on all pages.
 */

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import Home from '../src/pages/Home';
import HowToVote from '../src/pages/HowToVote';
import Timeline from '../src/pages/Timeline';
import FindPollingBooth from '../src/pages/FindPollingBooth';
import NotFound from '../src/pages/NotFound';

expect.extend(toHaveNoViolations);

describe('Accessibility (Axe)', () => {
  it('Home page should have no violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('HowToVote page should have no violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <HowToVote />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Timeline page should have no violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Timeline />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FindPollingBooth page should have no violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <FindPollingBooth />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('NotFound page should have no violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
