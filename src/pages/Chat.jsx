import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ChatBot from '../components/ChatBot';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';

const Chat = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { sendMessage, historyLoading } = useChat(user?.uid);
  // Track whether we've already fired the initial question
  const firedRef = useRef(false);

  useEffect(() => {
    // Wait until auth AND history are both ready, then fire once
    if (authLoading || historyLoading) return;
    if (!user?.uid) return;
    if (!location.state?.initialQuestion) return;
    if (firedRef.current) return;

    firedRef.current = true;
    sendMessage(location.state.initialQuestion);
    // Clear navigation state so it won't replay on browser back/forward
    window.history.replaceState({}, document.title);
  }, [authLoading, historyLoading, user?.uid, location.state, sendMessage]);

  return (
    <main id="main-content" role="main" className="flex-1 bg-bg/50 py-8 px-4">
      <div className="max-w-4xl mx-auto text-center mb-6">
        <h1 className="text-2xl md:text-4xl font-display font-bold text-primary mb-2">
          Civic Knowledge Assistant
        </h1>
        <p className="text-xs md:text-sm text-muted">
          Ask anything about the voting process, eligibility, or your rights.
        </p>
      </div>

      <ChatBot />
    </main>
  );
};

export default Chat;
