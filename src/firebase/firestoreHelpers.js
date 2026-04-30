/**
 * @file Firestore helpers — message persistence and FAQ analytics.
 *
 * All functions check `if (!db)` and skip gracefully when Firebase
 * is not configured, enabling local development without credentials.
 *
 * @module firebase/firestoreHelpers
 */

import { db } from './config';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

/**
 * Persists a chat message to `sessions/{userId}/messages`.
 *
 * @param   {string} userId  - Anonymous session UID
 * @param   {{ text: string, sender: string }} message - Message payload
 * @returns {Promise<string|null>} Firestore document ID, or null on failure
 */
export const saveMessage = async (userId, message) => {
  if (!db) {
    console.warn('Firestore not initialized. Skipping saveMessage.');
    return null;
  }

  try {
    const messagesRef = collection(db, 'sessions', userId, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving message to Firestore:', error);
    return null;
  }
};

/**
 * Fetches all messages for a user session, ordered by timestamp.
 *
 * @param   {string} userId - Anonymous session UID
 * @returns {Promise<Array<{ id: string, text: string, sender: string }>>}
 */
export const getChatHistory = async (userId) => {
  if (!db) {
    console.warn('Firestore not initialized. Returning empty history.');
    return [];
  }

  try {
    const messagesRef = collection(db, 'sessions', userId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

/**
 * Logs a user question to the `faq_analytics` collection for FAQ enrichment.
 *
 * @param {string} question - Raw question text
 * @returns {Promise<void>}
 */
export const logQuestion = async (question) => {
  if (!db) {
    console.warn('Firestore not initialized. Skipping logQuestion.');
    return;
  }

  try {
    const faqRef = collection(db, 'faq_analytics');
    // Use a sanitized version of the question as the ID or just add a new doc
    await addDoc(faqRef, {
      question,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging question:', error);
  }
};
