/**
 * @file useKeyboardShortcut — Global keyboard shortcut handler.
 *
 * Registers a keyboard shortcut (e.g. Ctrl+K) that triggers a callback.
 * Automatically cleans up on unmount.
 *
 * @module hooks/useKeyboardShortcut
 */

import { useEffect, useCallback } from 'react';

/**
 * @param {string}   key       - Key to listen for (e.g. 'k', '/')
 * @param {Function} callback  - Function to call when shortcut is triggered
 * @param {{ ctrl?: boolean, meta?: boolean, shift?: boolean }} [modifiers]
 */
export const useKeyboardShortcut = (key, callback, modifiers = { ctrl: true }) => {
  const handler = useCallback((e) => {
    const ctrlMatch = modifiers.ctrl ? (e.ctrlKey || e.metaKey) : true;
    const shiftMatch = modifiers.shift ? e.shiftKey : true;

    if (ctrlMatch && shiftMatch && e.key.toLowerCase() === key.toLowerCase()) {
      // Don't fire if user is typing in an input/textarea
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      e.preventDefault();
      callback();
    }
  }, [key, callback, modifiers]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
};
