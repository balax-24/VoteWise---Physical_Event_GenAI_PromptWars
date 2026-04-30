/**
 * @file LearningLab page tests.
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LearningLab from '../src/pages/LearningLab';

describe('LearningLab page', () => {
  it('renders the learning lab inside the main landmark', () => {
    render(
      <MemoryRouter>
        <LearningLab />
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Election Learning Lab')).toBeInTheDocument();
  });
});
