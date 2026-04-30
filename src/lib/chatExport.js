/**
 * @file chatExport — Exports chat conversation as a downloadable text file.
 *
 * Generates a timestamped `.txt` file of the entire conversation,
 * allowing users to save their civic Q&A session for future reference.
 *
 * @module lib/chatExport
 */

import { trackEvent } from './analytics';

/**
 * Exports an array of chat messages as a downloadable .txt file.
 *
 * @param {Array<{ sender: string, text: string, timestamp?: Date }>} messages
 * @param {string} [filename] - Optional custom filename
 */
export const exportChatAsText = (messages, filename) => {
  if (!messages || messages.length === 0) return;

  const header = [
    '═══════════════════════════════════════',
    '        VoteWise — Chat Export',
    '═══════════════════════════════════════',
    `Exported: ${new Date().toLocaleString('en-IN')}`,
    `Messages: ${messages.length}`,
    '',
    '───────────────────────────────────────',
    '',
  ].join('\n');

  const body = messages.map((msg) => {
    const label = msg.sender === 'user' ? '👤 You' : '🤖 VoteWise';
    const time = msg.timestamp
      ? new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : '';
    return `[${label}] ${time}\n${msg.text}\n`;
  }).join('\n───────────────────────────────────────\n\n');

  const footer = [
    '',
    '───────────────────────────────────────',
    'Disclaimer: This is an AI-generated civic guide.',
    'For official information, visit https://voters.eci.gov.in',
    '═══════════════════════════════════════',
  ].join('\n');

  const content = header + body + footer;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `votewise-chat-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  trackEvent('chat_exported', { message_count: messages.length });
};
