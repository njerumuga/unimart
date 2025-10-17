import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";


export default function Signup() {
    const { signup, googleSignIn } = useAuth();
    const [form, setForm] = useState({ displayName: "", email: "", password: "" });
    const [error, setError] = useState("");
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signup(form.email, form.password, form.displayName);
            nav("/");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <h2>Create account</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="displayName" placeholder="Full name" value={form.displayName} onChange={(e)=>setForm({...form, displayName: e.target.value})} required />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required />
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} required />
                <button type="submit">Sign up</button>
            </form>
            <p>or</p>
            <button onClick={async ()=> { await googleSignIn(); nav("/"); }}>Continue with Google</button>
        </div>
    );
}
