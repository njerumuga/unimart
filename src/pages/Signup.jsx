import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
    const { signup, googleSignIn } = useAuth();
    const [form, setForm] = useState({
        displayName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signup(form.email, form.password, form.displayName);
            nav("/");
        } catch (err) {
            setError(err.message || "Signup failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError("");
        setLoading(true);

        try {
            await googleSignIn();
            nav("/");
        } catch (err) {
            setError("Google Sign-up failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-soko-cream px-4 py-10 md:py-16">
            <div className="mx-auto w-full max-w-md rounded-3xl border border-yellow-100 bg-white p-6 shadow-soft md:p-8">
                <h2 className="text-center text-2xl font-extrabold text-soko-dark md:text-3xl">
                    Create Account
                </h2>
                <p className="mt-2 text-center text-sm text-soko-muted md:text-base">
                    Join SokoHub and start buying or selling on campus
                </p>

                {error && (
                    <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                        name="displayName"
                        placeholder="Full name"
                        value={form.displayName}
                        onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                        required
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-soko-dark px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <div className="my-5 text-center text-sm text-soko-muted">or</div>

                <button
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    className="w-full rounded-full bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    Continue with Google
                </button>

                <p className="mt-5 text-center text-sm text-soko-muted">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-green-700 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}