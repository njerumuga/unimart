import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PostItem from "./pages/PostItem";
import ItemDetails from "./pages/ItemDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminPage from "./pages/AdminPage"; // ✅ Import your admin page
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Advertise from "./pages/Advertise";

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <main className="content">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/post" element={<PostItem />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/profile" element={<Profile />} />

                        {/* ✅ Admin-only route */}
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/advertise" element={<Advertise />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;