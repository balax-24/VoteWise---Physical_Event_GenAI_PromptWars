/**
 * @file LanguageSwitcher — on-demand Google Translate widget loader.
 *
 * Loads the Google Translate script only when the visitor asks for it, keeping
 * initial page load lean while preserving multilingual support.
 *
 * @module components/LanguageSwitcher
 */

import { memo, useCallback, useId, useState } from 'react';

const TRANSLATE_SCRIPT_ID = 'google-translate-script';
let translateScriptPromise = null;

const loadGoogleTranslate = () => {
  if (window.google?.translate?.TranslateElement) {
    window.googleTranslateElementInit?.();
    return Promise.resolve();
  }

  if (translateScriptPromise) {
    if (document.getElementById(TRANSLATE_SCRIPT_ID)) return translateScriptPromise;
    translateScriptPromise = null;
  }

  translateScriptPromise = new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) {
        translateScriptPromise = null;
        reject(new Error('Google Translate widget unavailable.'));
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'hi,ta,te,bn,mr,gu,kn,ml,pa,ur',
          autoDisplay: false,
        },
        'google_translate_element'
      );
      resolve();
    };

    const existingScript = document.getElementById(TRANSLATE_SCRIPT_ID);
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = TRANSLATE_SCRIPT_ID;
    script.async = true;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.onerror = () => {
      translateScriptPromise = null;
      reject(new Error('Unable to load Google Translate.'));
    };
    document.head.appendChild(script);
  });

  return translateScriptPromise;
};

const LanguageSwitcher = memo(function LanguageSwitcher() {
  const widgetId = useId();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setHasError(false);
    try {
      await loadGoogleTranslate();
      setIsLoaded(true);
    } catch (error) {
      console.error('Google Translate load error:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={handleLoad}
        className="rounded-md bg-surface/10 px-2.5 py-1.5 text-sm font-semibold text-surface transition-colors duration-200 hover:bg-surface/20"
        aria-controls="google_translate_element"
        aria-expanded={isLoaded}
        aria-label="Open language selector"
        title="Language"
      >
        <span aria-hidden="true">🌐</span>
      </button>
      <div
        id="google_translate_element"
        className={`min-h-8 rounded bg-surface px-2 py-1 text-sm text-text shadow-sm ${isLoaded ? 'block' : 'sr-only'}`}
        aria-label="Select Language"
      />
      <span id={widgetId} className="sr-only" aria-live="polite">
        {hasError ? 'Language selector could not load.' : isLoading ? 'Loading language selector.' : 'Language selector ready.'}
      </span>
    </div>
  );
});

export default LanguageSwitcher;
