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
        <div className="min-h-[85vh] flex items-center justify-center bg-[#f9fffb] px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md rounded-[32px] border border-gray-100 bg-white p-8 sm:p-10 shadow-soft">
                <div className="text-center mb-8">
                    <div className="inline-flex rounded-2xl bg-green-50 p-3 text-[#00a651] mb-3">
                        <div className="rounded-xl bg-[#ffb800] px-2.5 py-1 text-xs font-black text-black">
                            SH
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        Create Account 🚀
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Join SokoHub and buy or sell across Meru campus
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                            Full Name
                        </label>
                        <input
                            name="displayName"
                            placeholder="e.g. Kelvin Mwiti"
                            value={form.displayName}
                            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                            required
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            placeholder="comrade@must.ac.ke"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-[#00a651] hover:bg-emerald-600 py-4 text-xs sm:text-sm font-black uppercase tracking-widest text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60 active:scale-98 flex items-center justify-center gap-2"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <span className="relative bg-white px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                        or sign up with
                    </span>
                </div>

                <button
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    className="w-full rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 py-3.5 text-xs font-black uppercase tracking-wider text-gray-700 shadow-sm transition flex items-center justify-center gap-3 disabled:opacity-60"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                    </svg>
                    Google
                </button>

                <p className="mt-8 text-center text-xs font-medium text-gray-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-black text-[#00a651] hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}