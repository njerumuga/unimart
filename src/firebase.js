import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD_upb6Vz1FawSYkrpvllGyEFmq241eAD4",
  // Updated authDomain to match your custom domain (fixes cross-origin pop-up / redirect blocks)
  authDomain: "sokohubonline.co.ke",
  projectId: "unimart-849a4",
  storageBucket: "unimart-849a4.firebasestorage.app",
  messagingSenderId: "457224866085",
  appId: "1:457224866085:web:1c738ba6d921e15a3eb2cc",
  measurementId: "G-N6NYPVGDXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Ensure local persistence for logged-in sessions across reloads
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Auth persistence error:", err);
});

// Safely initialize Analytics (prevents crashes in non-browser / SSR environments)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

console.log("✅ Firebase connected successfully");

export { auth, db, storage, analytics };
