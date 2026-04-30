/**
 * @file useAuth hook tests.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const loadHook = async ({ authValue, currentUser, signInResult, signInError } = {}) => {
  vi.resetModules();

  const signInAnonymously = vi.fn();
  if (signInError) {
    signInAnonymously.mockRejectedValue(signInError);
  } else {
    signInAnonymously.mockResolvedValue(signInResult ?? {
      user: { uid: 'signed-in-user', isAnonymous: true },
    });
  }

  const unsubscribe = vi.fn();
  const onAuthStateChanged = vi.fn((auth, callback) => {
    void callback(currentUser ?? null);
    return unsubscribe;
  });

  vi.doMock('../src/firebase/config', () => ({
    auth: authValue === undefined ? { app: 'firebase-auth' } : authValue,
  }));

  vi.doMock('firebase/auth', () => ({
    onAuthStateChanged,
    signInAnonymously,
  }));

  const { useAuth } = await import('../src/hooks/useAuth');
  return { useAuth, onAuthStateChanged, signInAnonymously, unsubscribe };
};

describe('useAuth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.doUnmock('../src/firebase/config');
    vi.doUnmock('firebase/auth');
  });

  it('returns a mock anonymous user when Firebase auth is not configured', async () => {
    const { useAuth, onAuthStateChanged } = await loadHook({ authValue: null });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual({ uid: 'mock-user-id', isAnonymous: true });
    expect(onAuthStateChanged).not.toHaveBeenCalled();
  });

  it('uses the existing Firebase user when one is already signed in', async () => {
    const existingUser = { uid: 'existing-user', isAnonymous: true };
    const { useAuth, onAuthStateChanged, signInAnonymously } = await loadHook({
      currentUser: existingUser,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBe(existingUser);
    expect(onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('signs in anonymously when Firebase has no current user', async () => {
    const signedInUser = { uid: 'new-user', isAnonymous: true };
    const { useAuth, signInAnonymously } = await loadHook({
      signInResult: { user: signedInUser },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(signInAnonymously).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBe(signedInUser);
  });

  it('surfaces anonymous sign-in errors', async () => {
    const authError = new Error('auth failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { useAuth } = await loadHook({ signInError: authError });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(authError);
    expect(consoleError).toHaveBeenCalledWith('Anonymous Auth Error:', authError);
  });
});
