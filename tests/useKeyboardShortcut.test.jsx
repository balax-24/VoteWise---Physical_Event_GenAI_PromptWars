import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeyboardShortcut } from '../src/hooks/useKeyboardShortcut';

describe('useKeyboardShortcut hook', () => {
  let callback;

  beforeEach(() => {
    callback = vi.fn();
  });

  const triggerKeydown = (key, ctrlKey = false, metaKey = false, shiftKey = false) => {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey,
      metaKey,
      shiftKey,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  it('triggers callback when shortcut is pressed', () => {
    renderHook(() => useKeyboardShortcut('k', callback));
    
    // Test Ctrl+K
    triggerKeydown('k', true, false, false);
    expect(callback).toHaveBeenCalledTimes(1);

    // Test Meta+K (Mac Cmd+K)
    triggerKeydown('k', false, true, false);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('does not trigger callback when modifiers are missing', () => {
    renderHook(() => useKeyboardShortcut('k', callback));
    
    // Just 'k'
    triggerKeydown('k', false, false, false);
    expect(callback).not.toHaveBeenCalled();

    // Shift+K
    triggerKeydown('k', false, false, true);
    expect(callback).not.toHaveBeenCalled();
  });

  it('does not trigger when active element is an input', () => {
    renderHook(() => useKeyboardShortcut('k', callback));
    
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    triggerKeydown('k', true, false, false);
    
    expect(callback).not.toHaveBeenCalled();
    
    document.body.removeChild(input);
  });
});
