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

// Log Firebase config status (without exposing sensitive keys)
console.log("[Firebase] Config status:", {
  projectId: firebaseConfig.projectId ? "✅ set" : "❌ missing",
  apiKey: firebaseConfig.apiKey ? "✅ set" : "❌ missing",
  authDomain: firebaseConfig.authDomain ? "✅ set" : "❌ missing",
});

let app: any = null;
let analytics: any = null;
let db: any = null;
let rtdb: any = null;
let auth: any = null;

try {
  // Initialize Firebase only if we have the required config
  if (firebaseConfig.projectId && firebaseConfig.apiKey) {
    console.log("[Firebase] Initializing with projectId:", firebaseConfig.projectId);
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    auth = getAuth(app);
    console.log("✅ [Firebase] Initialization successful");
    console.log("✅ [Firebase] db object:", db ? "valid" : "null");
  } else {
    console.warn("[Firebase] Configuration incomplete - using fallback/mock data");
    if (!firebaseConfig.projectId) console.warn("  - Missing: projectId");
    if (!firebaseConfig.apiKey) console.warn("  - Missing: apiKey");
  }
} catch (error) {
  console.error("❌ [Firebase] Initialization failed:", error);
  // Don't throw - let the app continue with fallback data
}

console.log("[Firebase] db export:", db ? "✅ valid Firestore instance" : "❌ null (using fallback)");

export { analytics, db, rtdb, auth };
export default app;
