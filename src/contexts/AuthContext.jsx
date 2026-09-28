import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, query, limit } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

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

    // 🔹 Google Sign-In via Redirect (Fixes COOP popup blocking)
    const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    };

    // 🔹 Logout
    const logout = () => signOut(auth);

    // 🔹 Watch auth changes & process Google redirect results
    useEffect(() => {
        // Handle post-redirect return from Google authentication
        getRedirectResult(auth)
            .then(async (res) => {
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
            })
            .catch((error) => {
                console.error("Error processing Google redirect result:", error);
            });

        const unsub = onAuthStateChanged(auth, async (u) => {
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

                    userIsAdmin = userData.isAdmin === true || adminSnap.exists();
                } catch (error) {
                    console.warn("Firestore access error, falling back to basic Auth user profile:", error);
                }

                setUser({
                    uid: u.uid,
                    email: u.email,
                    displayName: userData.displayName || u.displayName || "Comrade",
                    ...userData,
                    isAdmin: userIsAdmin,
                });

                setIsAdmin(userIsAdmin);
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
