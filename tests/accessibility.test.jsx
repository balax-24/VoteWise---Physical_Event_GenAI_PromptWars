import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import Home from '../src/pages/Home';
import HowToVote from '../src/pages/HowToVote';

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
});
