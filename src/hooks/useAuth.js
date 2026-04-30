/**
 * @file useAuth — Firebase anonymous authentication hook.
 *
 * On mount, signs in anonymously if no user exists. Subscribes to
 * `onAuthStateChanged` to keep the user object in sync.
 * Falls back to a mock user when Firebase is not configured.
 *
 * @module hooks/useAuth
 */

import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

/**
 * @returns {{ user: import('firebase/auth').User|null, loading: boolean, error: Error|null }}
 */
export const useAuth = () => {
  const [user, setUser] = useState(() => (
    auth ? null : { uid: 'mock-user-id', isAnonymous: true }
  ));
  const [loading, setLoading] = useState(() => Boolean(auth));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (err) {
          console.error('Anonymous Auth Error:', err);
          setError(err);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};
