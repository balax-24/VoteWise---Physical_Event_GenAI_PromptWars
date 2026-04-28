import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveMessage, getChatHistory } from '../src/firebase/firestoreHelpers';

// Mock the config
vi.mock('../src/firebase/config', () => ({
  db: { fakeDb: true } // Mock non-null db
}));

// Mock firebase/firestore
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    addDoc: vi.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
    getDocs: vi.fn(() => Promise.resolve({
      docs: [
        { id: '1', data: () => ({ text: 'Hello', sender: 'user' }) },
        { id: '2', data: () => ({ text: 'Hi', sender: 'bot' }) }
      ],
      empty: false
    })),
    query: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp')
  };
});

describe('firestoreHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saveMessage should return doc ID', async () => {
    const id = await saveMessage('user123', { text: 'Test', sender: 'user' });
    expect(id).toBe('mock-doc-id');
  });

  it('getChatHistory should return formatted messages', async () => {
    const history = await getChatHistory('user123');
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual({ id: '1', text: 'Hello', sender: 'user' });
  });
});
