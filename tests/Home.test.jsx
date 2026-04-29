import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Home from '../src/pages/Home';
import { GUIDED_JOURNEYS } from '../src/config/appConfig';

describe('Home page', () => {
  it('shows guided assistant journeys', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Choose a voting goal, then let VoteWise guide the next step')).toBeInTheDocument();

    GUIDED_JOURNEYS.forEach((journey) => {
      expect(screen.getByText(journey.title)).toBeInTheDocument();
    });
  });
});
