import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, query, limit } from "firebase/firestore";

// Known Administrator Emails (automatically recognized as Admin on login)
export const ADMIN_EMAILS = [
  "knjeru13@gmail.com",
  "admin@sokohub.com",
  "admin@unimart.com",
  "kevin@sokohub.com",
];

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper to check if an email is a recognized admin
  const checkEmailIsAdmin = (email) => {
    if (!email) return false;
    return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.trim().toLowerCase());
  };

  // Check if any users exist (to assign first user as admin)
  const checkIfFirstUser = async () => {
    try {
      const q = query(collection(db, "users"), limit(1));
      const snapshot = await getDocs(q);
      return snapshot.empty;
    } catch (error) {
      console.error("Error checking first user status:", error);
      return false;
    }
  };

  // 🔹 Signup
  const signup = async (email, password, displayName = "") => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const isFirst = await checkIfFirstUser();

    // Update native Firebase Auth user profile displayName
    if (displayName && res.user) {
      try {
        await updateProfile(res.user, { displayName });
      } catch (err) {
        console.error("Error updating native profile displayName:", err);
      }
    }

    try {
      await setDoc(doc(db, "users", res.user.uid), {
        displayName,
        email,
        isAdmin: isFirst,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error creating user doc on signup:", error);
    }

    return res;
  };

  // 🔹 Login
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // 🔹 Google Sign-In (Attempts Popup first, falls back to Redirect)
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const res = await signInWithPopup(auth, provider);
      if (res?.user) {
        const udoc = doc(db, "users", res.user.uid);
        const snap = await getDoc(udoc);
        if (!snap.exists()) {
          const isFirst = await checkIfFirstUser();
          await setDoc(udoc, {
            displayName: res.user.displayName || "",
            email: res.user.email,
            isAdmin: isFirst,
            createdAt: new Date(),
          });
        }
      }
      return res;
    } catch (err) {
      console.warn("Popup blocked or failed. Fallback to redirect:", err);
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        await signInWithRedirect(auth, provider);
      } else {
        throw err;
      }
    }
  };

  // 🔹 Logout
  const logout = () => signOut(auth);

  // 🔹 Process Redirect Result & Monitor Auth State Sequence
  useEffect(() => {
    let isSubscribed = true;

    const initAuth = async () => {
      // 1. Process Google Redirect Result First
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) {
          const udoc = doc(db, "users", res.user.uid);
          const snap = await getDoc(udoc);

          if (!snap.exists()) {
            const isFirst = await checkIfFirstUser();
            await setDoc(udoc, {
              displayName: res.user.displayName || "",
              email: res.user.email,
              isAdmin: isFirst,
              createdAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error("Error processing Google redirect result:", error);
      }

      // 2. Attach Listener for Current Auth User
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (!isSubscribed) return;

        if (u) {
          let userData = {};
          let userIsAdmin = false;

          try {
            const udoc = doc(db, "users", u.uid);
            const snapshot = await getDoc(udoc);
            if (snapshot.exists()) {
              userData = snapshot.data();
            }

            const adminRef = doc(db, "admins", u.uid);
            const adminSnap = await getDoc(adminRef);

            userIsAdmin =
              userData.isAdmin === true ||
              adminSnap.exists() ||
              checkEmailIsAdmin(u.email);
          } catch (error) {
            console.warn(
              "Firestore access error, checking email admin status fallback:",
              error
            );
            userIsAdmin = checkEmailIsAdmin(u.email);
          }

          if (isSubscribed) {
            const nameToDisplay =
              userData.displayName ||
              userData.name ||
              u.displayName ||
              u.email?.split("@")[0] ||
              "Comrade";

            setUser({
              uid: u.uid,
              email: u.email,
              ...userData,
              displayName: nameToDisplay,
              isAdmin: userIsAdmin,
            });
            setIsAdmin(userIsAdmin);
          }
        } else {
          if (isSubscribed) {
            setUser(null);
            setIsAdmin(false);
          }
        }

        if (isSubscribed) {
          setLoading(false);
        }
      });

      return unsub;
    };

    let unsubFn;
    initAuth().then((unsub) => {
      unsubFn = unsub;
    });

    return () => {
      isSubscribed = false;
      if (unsubFn) unsubFn();
    };
  }, []);

  const value = {
    user,
    signup,
    login,
    logout,
    googleSignIn,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        children
      ) : (
        <div className="flex h-screen items-center justify-center bg-soko-cream">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ffb800] border-t-[#00a651]"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
