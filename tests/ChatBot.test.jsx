import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatBot from '../src/components/ChatBot';
import { GUIDED_JOURNEYS } from '../src/config/appConfig';

// Mock the hooks
vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'test-user' }, loading: false })
}));

const mockSendMessage = vi.fn();
let mockChatState = {
  messages: [{ id: '1', sender: 'bot', text: 'Hello' }],
  sendMessage: mockSendMessage,
  isLoading: false,
  historyLoading: false,
  error: null,
  remainingRequests: 10,
};

vi.mock('../src/hooks/useChat', () => ({
  useChat: () => mockChatState
}));

describe('ChatBot Component', () => {
  beforeEach(() => {
    mockSendMessage.mockReset();
    mockChatState = {
      messages: [{ id: '1', sender: 'bot', text: 'Hello' }],
      sendMessage: mockSendMessage,
      isLoading: false,
      historyLoading: false,
      error: null,
      remainingRequests: 10,
    };
  });

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

  it('starts a guided journey from the quick actions panel', async () => {
    render(<ChatBot />);

    fireEvent.click(await screen.findByRole('button', { name: `Start guided journey: ${GUIDED_JOURNEYS[0].title}` }));

    expect(mockSendMessage).toHaveBeenCalledWith(GUIDED_JOURNEYS[0].prompt);
  });

  it('shows the session limit state when no requests remain', () => {
    mockChatState = {
      ...mockChatState,
      remainingRequests: 0,
    };

    render(<ChatBot />);

    expect(screen.getByPlaceholderText('Session limit reached.')).toBeDisabled();
    expect(screen.getByText('0/10 remaining')).toBeInTheDocument();
  });

  it('renders safe markdown links and strips unsafe markdown hrefs', () => {
    mockChatState = {
      ...mockChatState,
      messages: [{
        id: 'link-answer',
        sender: 'bot',
        text: '[ECI](https://eci.gov.in) [bad](javascript:alert(1))',
      }],
    };

    render(<ChatBot />);

    expect(screen.getByRole('link', { name: 'ECI' })).toHaveAttribute('href', 'https://eci.gov.in');
    expect(screen.queryByRole('link', { name: 'bad' })).not.toBeInTheDocument();
    expect(screen.getByText('bad')).toBeInTheDocument();
  });
});
