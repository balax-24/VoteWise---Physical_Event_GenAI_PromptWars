import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ElectionTimeline from '../src/components/ElectionTimeline';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ElectionTimeline', () => {
  it('tracks the selected phase and opens chat with a contextual question', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    mockNavigate.mockReset();

    render(<ElectionTimeline />);

    fireEvent.click(screen.getAllByRole('button', { name: /Ask AI about the Announcement phase/i })[0]);

    expect(gtag).toHaveBeenCalledWith('event', 'timeline_phase_clicked', {
      phase: 'Announcement',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/chat', {
      state: {
        initialQuestion: 'Tell me more about the "Announcement" phase of the election process.',
      },
    });
  });
});
