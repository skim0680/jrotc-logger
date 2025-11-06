// Firebase configuration for AFJROTC CA-882 Management System
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// Your Firebase config - AFJROTC CA-882 Project
const firebaseConfig = {
  apiKey: "AIzaSyDqmP2WyVxcA3kyONaz9lYcX14MtCIL9-k",
  authDomain: "afjrotc-ca882.firebaseapp.com",
  projectId: "afjrotc-ca882",
  storageBucket: "afjrotc-ca882.firebasestorage.app",
  messagingSenderId: "605358215031",
  appId: "1:605358215031:web:744c15470e5c1edf995b72",
  measurementId: "G-30TGF7ZL7D"
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