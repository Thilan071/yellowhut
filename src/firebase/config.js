// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
