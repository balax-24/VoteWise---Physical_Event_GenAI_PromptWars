import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveMessage, getChatHistory, logQuestion } from '../src/firebase/firestoreHelpers';
import { addDoc, getDocs } from 'firebase/firestore';

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

  it('logQuestion should append FAQ analytics entries', async () => {
    await logQuestion('What is VVPAT?');

    expect(addDoc).toHaveBeenCalledWith(undefined, {
      question: 'What is VVPAT?',
      timestamp: 'mock-timestamp',
    });
  });

  it('saveMessage returns null when Firestore writes fail', async () => {
    vi.mocked(addDoc).mockRejectedValueOnce(new Error('write failed'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const id = await saveMessage('user123', { text: 'Test', sender: 'user' });

    expect(id).toBeNull();
    expect(consoleError).toHaveBeenCalledWith('Error saving message to Firestore:', expect.any(Error));
  });

  it('getChatHistory returns an empty list when reads fail', async () => {
    vi.mocked(getDocs).mockRejectedValueOnce(new Error('read failed'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const history = await getChatHistory('user123');

    expect(history).toEqual([]);
    expect(consoleError).toHaveBeenCalledWith('Error getting chat history:', expect.any(Error));
  });
});
