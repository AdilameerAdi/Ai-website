// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAD8ydMSdvFyxaSxbBzknQCZPxbhouuKPE",
  authDomain: "ai-website-902e3.firebaseapp.com",
  projectId: "ai-website-902e3",
  storageBucket: "ai-website-902e3.appspot.com",
  messagingSenderId: "11244699428",
  appId: "1:11244699428:web:fd2118701107227be53db1",
  measurementId: "G-7R6B0F7685"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Helper function for Google login
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user; // returns user info
  } catch (error) {
    throw error;
  }
};
