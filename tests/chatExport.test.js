import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportChatAsText } from '../src/lib/chatExport';
import * as analytics from '../src/lib/analytics';

vi.mock('../src/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('exportChatAsText', () => {
  let originalCreateObjectURL;
  let originalRevokeObjectURL;
  let mockClick;
  let mockRemoveChild;
  let mockAppendChild;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL methods
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:test-url');
    URL.revokeObjectURL = vi.fn();

    // Mock document methods
    mockClick = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: mockClick,
        };
      }
      return document.createElement.getMockImplementation()(tag);
    });

    mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it('does nothing if messages array is empty or undefined', () => {
    exportChatAsText([]);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    
    exportChatAsText();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('creates and downloads a text file with chat messages', () => {
    const messages = [
      { sender: 'user', text: 'Hello', timestamp: new Date('2024-01-01T10:00:00Z') },
      { sender: 'bot', text: 'Hi there! How can I help?', timestamp: new Date('2024-01-01T10:00:05Z') }
    ];

    exportChatAsText(messages, 'test-export.txt');

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(mockAppendChild).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockRemoveChild).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    
    expect(analytics.trackEvent).toHaveBeenCalledWith('chat_exported', { message_count: 2 });
  });
});
