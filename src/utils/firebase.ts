// .env.local template:
// NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
// NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Default (primary) Firestore database
export const db = getFirestore(app);

// Secondary Firestore database (replace 'your-secondary-db-id' with your actual database ID)
export const secondaryDb = initializeFirestore(app, {}, 'rokomari-aff');

export const storage = getStorage(app);