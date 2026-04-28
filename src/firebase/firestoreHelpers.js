import { db } from './config';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, setDoc } from 'firebase/firestore';

// Save message to user session
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

// Get chat history for user
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

// Log popular questions for FAQ analytics
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
