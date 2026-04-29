import { useState, useEffect, useCallback } from 'react';
import { getGeminiResponseStream, getRemainingRequests } from '../gemini/geminiClient';
import { saveMessage, getChatHistory, logQuestion } from '../firebase/firestoreHelpers';
import { trackEvent } from '../lib/analytics';

const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'bot',
  text: 'Hello! I am **VoteWise**, your civic assistant. 🗳️\n\nHow can I help you understand the election process today?',
  timestamp: new Date(),
};

export const useChat = (userId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remainingRequests, setRemainingRequests] = useState(10);

  // Load history once on mount / when userId changes
  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await getChatHistory(userId);
        if (cancelled) return;

        setMessages(history.length > 0 ? history : [WELCOME_MESSAGE]);
        setRemainingRequests(getRemainingRequests(userId));
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading chat history:', err);
        setError('Failed to load chat history.');
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    void loadHistory();
    return () => { cancelled = true; };
  }, [userId]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !userId) return;

    // Guard: don't send while already streaming
    if (isLoading) return;

    const userMessage = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Fire-and-forget Firestore save + question log
    saveMessage(userId, userMessage).catch(console.error);
    logQuestion(userMessage.text).catch(console.error);

    // Prepare streaming bot placeholder
    const botMessageId = `bot-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: botMessageId, sender: 'bot', text: '', timestamp: new Date() }
    ]);

    try {
      let accumulatedText = '';

      await getGeminiResponseStream(userId, userMessage.text, (chunk) => {
        accumulatedText += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
          )
        );
      });

      // Save the complete response
      saveMessage(userId, {
        sender: 'bot',
        text: accumulatedText,
        timestamp: new Date(),
      }).catch(console.error);

      trackEvent('chat_question_asked', { question: userMessage.text });

    } catch (err) {
      console.error('Chat Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      // Remove the empty placeholder on error
      setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId));
    } finally {
      setIsLoading(false);
      setRemainingRequests(getRemainingRequests(userId));
    }
  }, [userId, isLoading]);

  return {
    messages,
    sendMessage,
    isLoading,
    historyLoading,
    error,
    remainingRequests,
  };
};
