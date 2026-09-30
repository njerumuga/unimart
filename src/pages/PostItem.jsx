import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../cloudinary";
import { categories } from "../data/categories";
import { locations } from "../data/locations";

export default function PostItem() {
    const { user } = useAuth();
    const nav = useNavigate();

    const [form, setForm] = useState({
        title: "",
        price: "",
        description: "",
        category: "",
        locationZone: "",
        condition: "Used - Good",
        sellerPhone: "",
        requestFeatured: false,
    });

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="mx-auto max-w-xl px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-soko-dark">
                    You must be logged in to post an item
                </h2>
                <button
                    onClick={() => nav("/login")}
                    className="mt-6 rounded-full bg-soko-dark px-6 py-3 font-semibold text-white hover:bg-green-700"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";
            if (file) {
                imageUrl = await uploadToCloudinary(file);
            }

            const phoneVal = form.sellerPhone.trim();

            await addDoc(collection(db, "items"), {
                title: form.title.trim(),
                price: Number(form.price),
                description: form.description.trim(),
                category: form.category,
                locationZone: form.locationZone || "Main Gate",
                condition: form.condition,
                imageUrl,
                sellerPhone: phoneVal,
                whatsapp: phoneVal, // Unified key for Android app compatibility
                phone: phoneVal,
                userId: user.uid,
                userName: user.displayName || user.email,
                sellerName: user.displayName || user.email || "Student Seller",
                createdAt: serverTimestamp(),
                isFeatured: false,
                requestFeatured: form.requestFeatured || false,
                paid: false,
                isApproved: false, // Forces Pending Admin Approval
            });

            // Prepare WhatsApp prompt for Admin (254704196402)
            const adminPhone = "254704196402";
            const textMsg = encodeURIComponent(
                `Hello Admin, I have just posted '${form.title.trim()}' on SokoHub and need approval.`
            );
            const waUrl = `https://wa.me/${adminPhone}?text=${textMsg}`;

            // Open WhatsApp in new tab (bypasses browser pop-up blockers & single-page navigation conflicts)
            window.open(waUrl, "_blank");

            // Redirect seller to homepage
            nav("/");
        } catch (err) {
            console.error("❌ Error posting item:", err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-soko-cream px-4 py-10">
            <div className="mx-auto max-w-2xl rounded-3xl border border-yellow-100 bg-white p-6 shadow-soft md:p-8">
                <h2 className="mb-6 text-center text-2xl font-extrabold text-soko-dark">
                    Post a New Item
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        name="title"
                        placeholder="Item title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            name="price"
                            type="number"
                            placeholder="Price (e.g. 15000)"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            required
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                        />

                        <select
                            name="condition"
                            value={form.condition}
                            onChange={(e) => setForm({ ...form, condition: e.target.value })}
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                        >
                            <option value="Brand New">Brand New</option>
                            <option value="Like New">Used - Like New</option>
                            <option value="Used - Good">Used - Good</option>
                            <option value="Refurbished">Refurbished</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            name="category"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            required
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <select
                            name="locationZone"
                            value={form.locationZone}
                            onChange={(e) => setForm({ ...form, locationZone: e.target.value })}
                            required
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                        >
                            <option value="">Select Location/Area</option>
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input
                        name="sellerPhone"
                        placeholder="WhatsApp number (e.g. 07XXXXXXXX or 2547XXXXXXXX)"
                        value={form.sellerPhone}
                        onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
                        required
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const selected = e.target.files[0];
                            setFile(selected);
                            if (selected) setPreview(URL.createObjectURL(selected));
                        }}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3"
                    />

                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-56 w-full rounded-2xl object-cover"
                        />
                    )}

                    <textarea
                        name="description"
                        placeholder="Item description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                        rows="4"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-soko-yellow"
                    />

                    <label className="flex items-center gap-3 text-sm font-medium text-soko-dark">
                        <input
                            type="checkbox"
                            checked={form.requestFeatured}
                            onChange={(e) =>
                                setForm({ ...form, requestFeatured: e.target.checked })
                            }
                        />
                        Request admin to feature this listing
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-soko-dark px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
                    >
                        {loading ? "Posting..." : "Post Item"}
                    </button>
                </form>
            </div>
        </div>
    );
}
