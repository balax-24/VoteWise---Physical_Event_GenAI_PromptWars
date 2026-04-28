import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
// Guard against invalid config for local dev
let app;
let auth;
let db;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_key') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn('Firebase config is missing or using placeholders. Firebase features will be disabled or mocked.');
  }
} catch (error) {
  console.error('Firebase Initialization Error:', error);
}

export { auth, db };
