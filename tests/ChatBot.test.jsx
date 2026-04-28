import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatBot from '../src/components/ChatBot';

// Mock the hooks
vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'test-user' }, loading: false })
}));

const mockSendMessage = vi.fn();
vi.mock('../src/hooks/useChat', () => ({
  useChat: () => ({
    messages: [{ id: '1', sender: 'bot', text: 'Hello' }],
    sendMessage: mockSendMessage,
    isLoading: false,
    error: null,
    remainingRequests: 10
  })
}));

describe('ChatBot Component', () => {
  it('renders welcome message', () => {
    render(<ChatBot />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('calls sendMessage on submit', () => {
    render(<ChatBot />);
    const input = screen.getByPlaceholderText('Ask VoteWise about the election process...');
    const button = screen.getByRole('button', { name: 'Send message' });

    fireEvent.change(input, { target: { value: 'How do I vote?' } });
    fireEvent.click(button);

    expect(mockSendMessage).toHaveBeenCalledWith('How do I vote?');
  });
});
