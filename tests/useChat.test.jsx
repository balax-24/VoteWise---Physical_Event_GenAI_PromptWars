/**
 * @file useChat hook tests.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChat } from '../src/hooks/useChat';

const mocks = vi.hoisted(() => ({
  getGeminiResponseStream: vi.fn(),
  getRemainingRequests: vi.fn(),
  saveMessage: vi.fn(),
  getChatHistory: vi.fn(),
  logQuestion: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock('../src/gemini/geminiClient', () => ({
  getGeminiResponseStream: mocks.getGeminiResponseStream,
  getRemainingRequests: mocks.getRemainingRequests,
}));

vi.mock('../src/firebase/firestoreHelpers', () => ({
  saveMessage: mocks.saveMessage,
  getChatHistory: mocks.getChatHistory,
  logQuestion: mocks.logQuestion,
}));

vi.mock('../src/lib/analytics', () => ({
  trackEvent: mocks.trackEvent,
}));

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getChatHistory.mockResolvedValue([]);
    mocks.getRemainingRequests.mockReturnValue(10);
    mocks.saveMessage.mockResolvedValue('saved-message');
    mocks.logQuestion.mockResolvedValue();
    mocks.getGeminiResponseStream.mockImplementation(async (userId, message, onChunk) => {
      onChunk('Hello');
      onChunk(' voter');
    });
  });

  it('does nothing until a user id is available', () => {
    const { result } = renderHook(() => useChat(undefined));

    expect(result.current.messages).toEqual([]);
    expect(result.current.historyLoading).toBe(false);
    expect(mocks.getChatHistory).not.toHaveBeenCalled();
  });

  it('loads saved history for the user', async () => {
    const history = [{ id: 'm1', sender: 'user', text: 'Saved question' }];
    mocks.getChatHistory.mockResolvedValue(history);

    const { result } = renderHook(() => useChat('user-1'));

    await waitFor(() => expect(result.current.historyLoading).toBe(false));
    expect(mocks.getChatHistory).toHaveBeenCalledWith('user-1');
    expect(result.current.messages).toEqual(history);
    expect(result.current.remainingRequests).toBe(10);
  });

  it('uses a local welcome message when no history exists', async () => {
    const { result } = renderHook(() => useChat('user-1'));

    await waitFor(() => expect(result.current.messages[0]?.id).toBe('welcome'));
    expect(result.current.messages[0].sender).toBe('bot');
  });

  it('streams and persists a Gemini response', async () => {
    const { result } = renderHook(() => useChat('user-1'));
    await waitFor(() => expect(result.current.historyLoading).toBe(false));

    await act(async () => {
      await result.current.sendMessage('How do I vote?');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mocks.saveMessage).toHaveBeenCalledWith('user-1', expect.objectContaining({
      sender: 'user',
      text: 'How do I vote?',
    }));
    expect(mocks.saveMessage).toHaveBeenCalledWith('user-1', expect.objectContaining({
      sender: 'bot',
      text: 'Hello voter',
    }));
    expect(mocks.logQuestion).toHaveBeenCalledWith('How do I vote?');
    expect(mocks.trackEvent).toHaveBeenCalledWith('chat_question_asked', {
      question: 'How do I vote?',
    });
    expect(result.current.messages.at(-1)).toEqual(expect.objectContaining({
      sender: 'bot',
      text: 'Hello voter',
    }));
  });

  it('sets an error and removes the bot placeholder when Gemini fails', async () => {
    mocks.getGeminiResponseStream.mockRejectedValue(new Error('Gemini failed'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useChat('user-1'));
    await waitFor(() => expect(result.current.historyLoading).toBe(false));

    await act(async () => {
      await result.current.sendMessage('Break please');
    });

    expect(result.current.error).toBe('Gemini failed');
    expect(result.current.messages.some((msg) => msg.id?.startsWith('bot-'))).toBe(false);
    expect(consoleError).toHaveBeenCalledWith('Chat Error:', expect.any(Error));
  });
});
