/**
 * @file FAQSection Firestore enrichment tests.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FAQSection from '../src/components/FAQSection';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((...args) => ({ type: 'query', args })),
  limit: vi.fn((count) => ({ type: 'limit', count })),
}));

vi.mock('../src/firebase/config', () => ({
  db: { fakeDb: true },
}));

vi.mock('../src/config/env', () => ({
  HAS_FIREBASE: true,
}));

vi.mock('firebase/firestore', () => firestoreMocks);

describe('FAQSection Firestore enrichment', () => {
  it('appends unique logged questions from Firestore', async () => {
    firestoreMocks.getDocs.mockResolvedValue({
      empty: false,
      docs: [
        { data: () => ({ question: 'How do I vote by postal ballot?' }) },
        { data: () => ({ question: 'How do I vote by postal ballot?' }) },
        { data: () => ({ question: 'What is VVPAT?' }) },
      ],
    });

    render(<FAQSection />);

    await waitFor(() => {
      expect(screen.getByText('How do I vote by postal ballot?')).toBeInTheDocument();
    });
    expect(screen.getByText('What is VVPAT?')).toBeInTheDocument();
    expect(firestoreMocks.collection).toHaveBeenCalledWith({ fakeDb: true }, 'faq_analytics');
    expect(firestoreMocks.limit).toHaveBeenCalledWith(5);
  });

  it('keeps default FAQs if Firestore returns no logged questions', async () => {
    firestoreMocks.getDocs.mockResolvedValue({ empty: true, docs: [] });

    render(<FAQSection />);

    expect(screen.getByText('What is the Model Code of Conduct?')).toBeInTheDocument();
    await waitFor(() => expect(firestoreMocks.getDocs).toHaveBeenCalled());
  });
});
