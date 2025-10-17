import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // 🔹 Signup
    const signup = async (email, password, displayName = "") => {
        const res = await createUserWithEmailAndPassword(auth, email, password);

        // Check if first user becomes admin
        const usersSnapshot = await getDocs(collection(db, "users"));
        const isFirstUser = usersSnapshot.empty;

        await setDoc(doc(db, "users", res.user.uid), {
            displayName,
            email,
            isAdmin: isFirstUser,
        });

        return res;
    };

    // 🔹 Login
    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    // 🔹 Google Sign-In
    const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);

        const udoc = doc(db, "users", res.user.uid);
        const snap = await getDoc(udoc);

        if (!snap.exists()) {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const isFirstUser = usersSnapshot.empty;

            await setDoc(udoc, {
                displayName: res.user.displayName || "",
                email: res.user.email,
                isAdmin: isFirstUser,
            });
        }

        return res;
    };

    // 🔹 Logout
    const logout = () => signOut(auth);

    // 🔹 Watch for login changes
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                const udoc = doc(db, "users", u.uid);
                const snapshot = await getDoc(udoc);
                const userData = snapshot.exists() ? snapshot.data() : {};

                setUser({
                    uid: u.uid,
                    email: u.email,
                    displayName: userData.displayName || u.displayName || "",
                    isAdmin: userData.isAdmin || false,
                });

                // ✅ Check Firestore 'admins' collection
                const adminRef = doc(db, "admins", u.uid);
                const adminSnap = await getDoc(adminRef);
                setIsAdmin(adminSnap.exists()); // ← true if found
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return unsub;
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
            {loading ? <div className="loading">Loading...</div> : children}
        </AuthContext.Provider>
    );
}
