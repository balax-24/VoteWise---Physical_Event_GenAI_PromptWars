import { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { GUIDED_JOURNEYS, SESSION_REQUEST_LIMIT, STARTER_QUESTIONS } from '../config/appConfig';
import { trackEvent } from '../lib/analytics';

const GuidedJourneyGrid = lazy(() => import('./GuidedJourneyGrid'));

/** Render bot message text as Markdown so lists, bold, etc. display correctly */
const BotMessage = ({ text }) => (
  <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-primary">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {text}
    </ReactMarkdown>
  </div>
);

const ChatBot = () => {
  const { user, loading: authLoading } = useAuth();
  const { messages, sendMessage, isLoading, historyLoading, error, remainingRequests } = useChat(user?.uid);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || isSubmitting || remainingRequests <= 0) return;

    setIsSubmitting(true);
    setInput('');
    await sendMessage(trimmed);
    setIsSubmitting(false);
  };

  const handleStarterClick = async (question) => {
    if (isLoading || isSubmitting || remainingRequests <= 0) return;
    setIsSubmitting(true);
    trackEvent('chat_starter_selected', { question });
    await sendMessage(question);
    setIsSubmitting(false);
  };

  const handleJourneySelect = async (journey) => {
    if (isLoading || isSubmitting || remainingRequests <= 0) return;
    setIsSubmitting(true);
    trackEvent('guided_journey_started', { journey_id: journey.id });
    await sendMessage(journey.prompt);
    setIsSubmitting(false);
  };

  if (authLoading || historyLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3" aria-live="polite" aria-label="Loading chat">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm text-muted">{authLoading ? 'Signing in…' : 'Loading history…'}</p>
      </div>
    );
  }

  const isBusy = isLoading || isSubmitting;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-surface rounded-xl shadow-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-surface px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl" role="img" aria-label="Robot">🤖</span>
          <div>
            <h2 className="font-display text-lg font-semibold text-accent">VoteWise Assistant</h2>
            <p className="text-xs text-surface/80">AI-powered civic guide</p>
          </div>
        </div>
        <div
          className="text-xs bg-primary/80 border border-surface/20 px-3 py-1 rounded-full text-accent font-mono"
          aria-label={`${remainingRequests} questions remaining in this session`}
        >
          {remainingRequests}/{SESSION_REQUEST_LIMIT} remaining
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg/50"
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id || index}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <span className="w-7 h-7 rounded-full bg-primary text-surface text-xs flex items-center justify-center mr-2 mt-1 flex-shrink-0" aria-hidden="true">
                  AI
                </span>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-lg shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-accent text-primary font-medium rounded-br-none'
                    : 'bg-surface text-text border border-border rounded-bl-none'
                }`}
              >
                {/* Show typing dots while bot message is empty (streaming not started) */}
                {msg.sender === 'bot' && msg.text === '' ? (
                  <div className="flex space-x-1 items-center h-5" aria-label="Assistant is typing">
                    <div className="bg-muted w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="bg-muted w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="bg-muted w-2 h-2 rounded-full animate-bounce"></div>
                  </div>
                ) : msg.sender === 'bot' ? (
                  <BotMessage text={msg.text} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 text-red-700 px-4 py-2 text-xs border-t border-red-100 flex items-center space-x-2"
        >
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Starter Questions — only when conversation is fresh */}
      {messages.length <= 1 && (
        <div className="space-y-4 p-4 border-t border-border bg-surface">
          <div>
            <p className="text-xs font-semibold text-muted mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleStarterClick(q)}
                  disabled={isBusy || remainingRequests <= 0}
                  className="text-xs bg-bg hover:bg-accent/10 border border-border hover:border-accent text-primary px-3 py-1.5 rounded-full transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Ask: ${q}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg/50 p-4">
            <p className="text-sm font-semibold text-primary">Guided election journeys</p>
            <p className="mt-1 text-xs text-muted">
              Pick a goal and VoteWise will respond with a step-by-step explanation.
            </p>
            <div className="mt-3">
              <Suspense fallback={<p className="text-xs text-muted">Loading guided journeys…</p>}>
                <GuidedJourneyGrid
                  journeys={GUIDED_JOURNEYS}
                  disabled={isBusy || remainingRequests <= 0}
                  onSelect={handleJourneySelect}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-surface border-t border-border flex space-x-4" aria-label="Send a message">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={remainingRequests > 0 ? "Ask VoteWise about the election process..." : "Session limit reached."}
          disabled={isBusy || remainingRequests <= 0}
          className="flex-1 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none disabled:bg-bg disabled:cursor-not-allowed"
          aria-label="Type your message"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim() || remainingRequests <= 0}
          className="bg-primary hover:bg-primary-dark text-surface px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          aria-label="Send message"
        >
          {isBusy ? (
            <span className="animate-spin h-4 w-4 border-2 border-surface border-t-transparent rounded-full" aria-hidden="true" />
          ) : (
            <span>Send</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
