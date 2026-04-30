/**
 * @file Chat page — hosts the AI civic assistant.
 * Passes an optional initial question (from guided‑journey links) to the ChatBot
 * via location state. ChatBot manages its own auth / chat lifecycle internally
 * so this page does NOT duplicate those hooks.
 * @module pages/Chat
 */

import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';

const ChatBot = lazy(() => import('../components/ChatBot'));

const Chat = () => {
  const location = useLocation();
  const initialQuestion = location.state?.initialQuestion ?? null;

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

      <Suspense
        fallback={
          <div className="mx-auto flex h-64 max-w-4xl items-center justify-center rounded-xl border border-border bg-surface shadow-sm">
            <p className="text-sm text-muted">Loading assistant…</p>
          </div>
        }
      >
        <ChatBot initialQuestion={initialQuestion} />
      </Suspense>
    </main>
  );
};

export default Chat;
