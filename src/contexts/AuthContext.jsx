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
import { doc, setDoc, getDoc, collection, getDocs, query, limit } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // ✅ Improved Check: See if any users exist (to assign first admin)
    const checkIfFirstUser = async () => {
        const q = query(collection(db, "users"), limit(1));
        const snapshot = await getDocs(q);
        return snapshot.empty;
    };

    // 🔹 Signup
    const signup = async (email, password, displayName = "") => {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const isFirst = await checkIfFirstUser();

        await setDoc(doc(db, "users", res.user.uid), {
            displayName,
            email,
            isAdmin: isFirst,
            createdAt: new Date(),
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
            const isFirst = await checkIfFirstUser();
            await setDoc(udoc, {
                displayName: res.user.displayName || "",
                email: res.user.email,
                isAdmin: isFirst,
                createdAt: new Date(),
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
                // Fetch user data from Firestore to get Admin status
                const udoc = doc(db, "users", u.uid);
                const snapshot = await getDoc(udoc);
                
                if (snapshot.exists()) {
                    const userData = snapshot.data();
                    setUser({
                        uid: u.uid,
                        email: u.email,
                        displayName: userData.displayName || u.displayName || "Comrade",
                        ...userData
                    });
                    setIsAdmin(userData.isAdmin || false);
                } else {
                    // Fallback if document hasn't been created yet
                    setUser(u);
                    setIsAdmin(false);
                }
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
            {!loading ? children : (
                <div className="flex h-screen items-center justify-center bg-soko-cream">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-soko-yellow border-t-soko-dark"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
}