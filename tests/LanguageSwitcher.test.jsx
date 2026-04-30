/**
 * @file LanguageSwitcher component tests.
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LanguageSwitcher from '../src/components/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  afterEach(() => {
    document.getElementById('google-translate-script')?.remove();
    delete window.google;
    delete window.googleTranslateElementInit;
    vi.restoreAllMocks();
  });

  it('loads Google Translate only after the control is activated', async () => {
    const TranslateElement = vi.fn();
    render(<LanguageSwitcher />);

    expect(document.getElementById('google-translate-script')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open language selector' }));

    const script = document.getElementById('google-translate-script');
    expect(script).toHaveAttribute(
      'src',
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    );

    window.google = { translate: { TranslateElement } };
    await act(async () => {
      window.googleTranslateElementInit();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Open language selector' })).toHaveAttribute('aria-expanded', 'true');
    });
    expect(TranslateElement).toHaveBeenCalledWith(
      expect.objectContaining({
        pageLanguage: 'en',
        includedLanguages: 'hi,ta,te,bn,mr,gu,kn,ml,pa,ur',
      }),
      'google_translate_element'
    );
  });

  it('announces load failures without crashing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'Open language selector' }));
    await act(async () => {
      document.getElementById('google-translate-script').onerror();
    });

    expect(consoleError).toHaveBeenCalledWith('Google Translate load error:', expect.any(Error));
    expect(screen.getByText('Language selector could not load.')).toBeInTheDocument();
  });
});
