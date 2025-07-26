// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnL50fhdzLKWESttYVHJnQ2lJ_mtoCvrA",
  authDomain: "yellowhut-518e3.firebaseapp.com",
  projectId: "yellowhut-518e3",
  storageBucket: "yellowhut-518e3.firebasestorage.app",
  messagingSenderId: "420577692373",
  appId: "1:420577692373:web:de9ad72bf113afef5e305c",
  measurementId: "G-2E7HVPMWZX"
};

console.log('🔥 Initializing Firebase with config:', firebaseConfig);

// Initialize Firebase
let app;
let db;
let auth;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  // Initialize Firebase services
  db = getFirestore(app);
  console.log('✅ Firestore initialized successfully');
  
  auth = getAuth(app);
  console.log('✅ Auth initialized successfully');
  
  // Initialize Analytics only in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
    console.log('✅ Analytics initialized successfully');
  }
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Export Firebase services
export { db, auth, analytics };
export default app;
