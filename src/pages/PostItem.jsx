import React, { useState } from "react";
import "../styles/PostItem.css";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../cloudinary";

export default function PostItem() {
    const { user } = useAuth();
    const nav = useNavigate();

    const [form, setForm] = useState({
        title: "",
        price: "",
        description: "",
        category: "",
        sellerPhone: "", // ✅ renamed for consistency
        requestFeatured: false,
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="post-item">
                <h2>You must be logged in to post an item</h2>
                <button onClick={() => nav("/login")}>Go to Login</button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 🔹 Upload image to Cloudinary
            let imageUrl = "";
            if (file) {
                imageUrl = await uploadToCloudinary(file);
            }

            // 🔹 Save to Firestore (pending for admin approval)
            await addDoc(collection(db, "items"), {
                title: form.title,
                price: form.price,
                description: form.description,
                category: form.category,
                imageUrl,
                sellerPhone: form.sellerPhone, // ✅ same field name used in ItemDetails
                userId: user.uid,
                userName: user.displayName || user.email,
                createdAt: serverTimestamp(),
                isFeatured: false,
                requestFeatured: form.requestFeatured || false,
                paid: false,
                isApproved: false,
            });

            alert("✅ Item posted successfully! Pending admin approval.");
            nav("/");
        } catch (err) {
            console.error("❌ Error posting item:", err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-item">
            <h2>Post a New Item</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="title"
                    placeholder="Item title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                />
                <input
                    name="price"
                    placeholder="Price (e.g. 15000)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                />
                <input
                    name="sellerPhone"
                    placeholder="WhatsApp number (e.g. 2547XXXXXXXX)"
                    value={form.sellerPhone}
                    onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
                    required
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const selected = e.target.files[0];
                        setFile(selected);
                        if (selected) setPreview(URL.createObjectURL(selected));
                    }}
                />

                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: "200px",
                            borderRadius: "8px",
                            marginTop: "10px",
                        }}
                    />
                )}

                <textarea
                    name="description"
                    placeholder="Item description"
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                    required
                />

                <select
                    name="category"
                    value={form.category}
                    onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                    }
                    required
                >
                    <option value="">Select category</option>
                    <option>Electronics</option>
                    <option>Books</option>
                    <option>Fashion</option>
                    <option>Furniture</option>
                    <option>Other</option>
                </select>

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={form.requestFeatured}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                requestFeatured: e.target.checked,
                            })
                        }
                    />
                    Request admin to feature this listing
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? "Posting..." : "Post Item"}
                </button>
            </form>
        </div>
    );
}
