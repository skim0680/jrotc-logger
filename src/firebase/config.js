// Firebase configuration for AFJROTC CA-882 Management System
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// Your Firebase config (replace with your actual config from Firebase Console)
const firebaseConfig = {
  // Replace these with your actual Firebase project credentials
  apiKey: "your-api-key-here",
  authDomain: "afjrotc-ca882.firebaseapp.com", 
  projectId: "afjrotc-ca882",
  storageBucket: "afjrotc-ca882.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Helper functions for offline support
export const goOffline = () => disableNetwork(db);
export const goOnline = () => enableNetwork(db);

export default app;