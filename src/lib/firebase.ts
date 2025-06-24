import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCtrEKzJP65OSNyD1FaeXFqzNNhCEPoqdM",
  authDomain: "certificate-system-67bee.firebaseapp.com",
  projectId: "certificate-system-67bee",
  storageBucket: "certificate-system-67bee.firebasestorage.app",
  messagingSenderId: "837913697904",
  appId: "1:837913697904:web:70d27fe5091a770bcc5eb5",
  measurementId: "G-MBVHMRDYNP"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage }; 