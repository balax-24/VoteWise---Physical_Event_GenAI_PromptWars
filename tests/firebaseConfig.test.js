/**
 * @file Firebase config initialization tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const firebaseMocks = vi.hoisted(() => ({
  initializeApp: vi.fn(),
  getAuth: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  initializeApp: firebaseMocks.initializeApp,
}));

vi.mock('firebase/auth', () => ({
  getAuth: firebaseMocks.getAuth,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: firebaseMocks.getFirestore,
}));

const loadConfig = async () => {
  vi.resetModules();
  return import('../src/firebase/config');
};

describe('firebase config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'real-firebase-key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'votewise.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'votewise');
    firebaseMocks.initializeApp.mockReturnValue({ app: 'firebase-app' });
    firebaseMocks.getAuth.mockReturnValue({ auth: 'firebase-auth' });
    firebaseMocks.getFirestore.mockReturnValue({ db: 'firestore-db' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('initializes Firebase services when a real key is configured', async () => {
    const { auth, db } = await loadConfig();

    expect(firebaseMocks.initializeApp).toHaveBeenCalledWith({
      apiKey: 'real-firebase-key',
      authDomain: 'votewise.firebaseapp.com',
      projectId: 'votewise',
    });
    expect(auth).toEqual({ auth: 'firebase-auth' });
    expect(db).toEqual({ db: 'firestore-db' });
  });

  it('skips initialization for placeholder keys', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'your_firebase_key');

    const { auth, db } = await loadConfig();

    expect(firebaseMocks.initializeApp).not.toHaveBeenCalled();
    expect(auth).toBeUndefined();
    expect(db).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'Firebase config is missing or using placeholders. Firebase features will be disabled or mocked.'
    );
  });

  it('logs initialization failures without throwing', async () => {
    const error = new Error('init failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    firebaseMocks.initializeApp.mockImplementation(() => {
      throw error;
    });

    const { auth, db } = await loadConfig();

    expect(auth).toBeUndefined();
    expect(db).toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith('Firebase Initialization Error:', error);
  });
});
