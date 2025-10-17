import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css"; // we'll style all auth pages here

export default function Login() {
    const { login, googleSignIn } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    // ---- EMAIL LOGIN ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(form.email, form.password);
            nav("/");
        } catch (err) {
            setError("Invalid email or password ❌");
        } finally {
            setLoading(false);
        }
    };

    // ---- GOOGLE LOGIN ----
    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await googleSignIn();
            nav("/");
        } catch (err) {
            setError("Google Sign-in failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <h2>Welcome Back 👋</h2>
                <p className="subtitle">Login to continue using UniMart</p>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="divider">or</div>

                <button onClick={handleGoogleLogin} className="google-btn" disabled={loading}>
                    Continue with Google
                </button>

                <p className="switch">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
