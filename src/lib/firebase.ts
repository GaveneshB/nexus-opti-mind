// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

let app: any = null;
let analytics: any = null;
let db: any = null;
let rtdb: any = null;
let auth: any = null;

try {
  // Initialize Firebase only if we have the required config
  if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    auth = getAuth(app);
    console.log("✅ Firebase initialized successfully");
  } else {
    console.warn("⚠️ Firebase config missing - using fallback/mock data");
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  // Don't throw - let the app continue with fallback data
}

export { analytics, db, rtdb, auth };
export default app;
