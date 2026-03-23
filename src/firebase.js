import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyD_upb6Vz1FawSYkrpvllGyEFmq241eAD4",
    authDomain: "unimart-849a4.firebaseapp.com",
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
const analytics = getAnalytics(app);

console.log("✅ Firebase connected successfully");

export { auth, db, storage, analytics };