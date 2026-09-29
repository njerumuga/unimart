import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const { login, googleSignIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      nav("/");
    } catch (err) {
      console.error("Firebase Login Error:", err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Failed to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      await googleSignIn();
      nav("/");
    } catch (err) {
      console.error("Firebase Google Auth Error:", err);
      setError(err.message || "Google Sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");

    if (!form.email) {
      setError("Enter your email first to reset password.");
      return;
    }

    try {
      // 1. Check if the account uses Google Sign-In only
      const methods = await fetchSignInMethodsForEmail(auth, form.email);
      if (methods.includes("google.com") && !methods.includes("password")) {
        setError("This account uses Google Sign-In. Click 'Continue with Google' to log in.");
        return;
      }

      // 2. Explicit actionCodeSettings redirecting to your domain
      const actionCodeSettings = {
        url: "https://www.sokohubonline.co.ke/login",
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, form.email, actionCodeSettings);
      setResetMessage("Password reset email sent! Check your inbox and Spam folder.");
    } catch (err) {
      console.error("Reset Email Error:", err);
      setError(err.message || "Failed to send reset email.");
    }
  };

  return (
    <div className="bg-soko-cream px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-yellow-100 bg-white p-6 shadow-soft md:p-8">
        <h2 className="text-center text-2xl font-extrabold text-soko-dark md:text-3xl">
          Welcome Back 👋
        </h2>
        <p className="mt-2 text-center text-sm text-soko-muted md:text-base">
          Login to continue using SokoHub
        </p>

        {error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {resetMessage && (
          <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {resetMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
          />

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-green-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-soko-dark px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-5 text-center text-sm text-soko-muted">or</div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-full bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          Continue with Google
        </button>

        <p className="mt-5 text-center text-sm text-soko-muted">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-bold text-green-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
