import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHj86R4clq3YXEDQGIWsigOeqRvYiNJnA",
  authDomain: "mimi-s-pantry-d61c6.firebaseapp.com",
  projectId: "mimi-s-pantry-d61c6",
  storageBucket: "mimi-s-pantry-d61c6.firebasestorage.app",
  messagingSenderId: "1061608997369",
  appId: "1:1061608997369:web:4cf06f3e87ed84a77e3d28",
  measurementId: "G-5RC04T6Q7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize & export services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);