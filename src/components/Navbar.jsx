import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <h1 className="logo">
                    <Link to="/">UniMart</Link>
                </h1>

                <div className="nav-links">
                    <Link to="/">Home</Link>
                    {user && <Link to="/post">Post Item</Link>}
                    {isAdmin && <Link to="/admin">🧑‍💼 Admin Dashboard</Link>}

                    {/* ⭐ Advertise button visible to everyone */}
                    <Link to="/advertise" className="advertise-btn">
                        ⭐ Advertise
                    </Link>

                    {user ? (
                        <>
                            <Link to="/profile">
                                {user.displayName || "Profile"}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="link-button logout"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup" className="signup-btn">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
