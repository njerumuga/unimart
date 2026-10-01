import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { uploadToCloudinary } from "../cloudinary";
import { categories } from "../data/categories";
import { locations } from "../data/locations";

export default function PostItem() {
    const { user } = useAuth();

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
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-3xl mb-4">
                    📝
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Log in to Post an Item
                </h2>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                    Connect with thousands of students and buyers across Meru University and surrounding campus hostels.
                </p>
                <Link
                    to="/login"
                    className="rounded-2xl bg-[#00a651] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-emerald-600 transition"
                >
                    Go to Login
                </Link>
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
                whatsapp: phoneVal,
                phone: phoneVal,
                userId: user.uid,
                sellerId: user.uid,
                userName: user.displayName || user.email,
                sellerName: user.displayName || user.email || "Student Seller",
                createdAt: serverTimestamp(),
                isFeatured: false,
                requestFeatured: form.requestFeatured || false,
                paid: false,
                isApproved: false, // Explicitly set to unapproved until reviewed
            });

            // Redirect directly to WhatsApp Admin chat
            const adminPhone = "254704196402";
            const textMsg = encodeURIComponent(
                `Hello Admin, I have just posted '${form.title.trim()}' on SokoHub and need approval.`
            );

            window.location.href = `https://wa.me/${adminPhone}?text=${textMsg}`;
        } catch (err) {
            console.error("❌ Error posting item:", err);
            alert("Error: " + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fffb] py-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-[32px] border border-gray-100 bg-white p-6 sm:p-10 shadow-soft">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex rounded-2xl bg-green-50 p-3 text-[#00a651] mb-3">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        Post a New Listing
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Reach verified campus buyers in Meru and surrounding student hostels
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                            Item Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="title"
                            placeholder="e.g. iPhone 12 Pro 128GB, Wooden Study Desk, Bedding..."
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
                        />
                    </div>

                    {/* Price and Condition */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                                Price (KSh) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-xs font-black text-gray-400">
                                    KSh
                                </span>
                                <input
                                    name="price"
                                    type="number"
                                    placeholder="2500"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    required
                                    min="0"
                                    className="w-full rounded-2xl border border-gray-200 pl-14 pr-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                                Condition <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="condition"
                                value={form.condition}
                                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 bg-white"
                            >
                                <option value="Brand New">Brand New</option>
                                <option value="Used - Like New">Used - Like New</option>
                                <option value="Used - Good">Used - Good</option>
                                <option value="Refurbished">Refurbished</option>
                            </select>
                        </div>
                    </div>

                    {/* Category and Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                required
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 bg-white"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                                Campus / Area Zone <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="locationZone"
                                value={form.locationZone}
                                onChange={(e) => setForm({ ...form, locationZone: e.target.value })}
                                required
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 bg-white"
                            >
                                <option value="">Select Location</option>
                                {locations.map((loc) => (
                                    <option key={loc} value={loc}>
                                        📍 {loc}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                            WhatsApp / Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="sellerPhone"
                            placeholder="e.g. 0712345678 or +254712345678"
                            value={form.sellerPhone}
                            onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
                            required
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Interested buyers will message you directly on this WhatsApp number.
                        </p>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                            Product Photo
                        </label>
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center hover:border-[#00a651] transition bg-gray-50/50">
                            <input
                                type="file"
                                id="file-upload"
                                accept="image/*"
                                onChange={(e) => {
                                    const selected = e.target.files[0];
                                    setFile(selected);
                                    if (selected) setPreview(URL.createObjectURL(selected));
                                }}
                                className="hidden"
                            />
                            {preview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-48 w-48 sm:h-56 sm:w-56 rounded-2xl object-cover shadow-md mx-auto"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setPreview("");
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                                    <div className="w-12 h-12 rounded-full bg-green-100 text-[#00a651] flex items-center justify-center mx-auto text-xl">
                                        📷
                                    </div>
                                    <p className="text-xs font-bold text-gray-700">
                                        Click to upload high-quality item photo
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        PNG, JPG, WEBP up to 10MB
                                    </p>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            placeholder="Provide details about specs, condition, reasons for selling, pick-up points..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                            rows="4"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
                        />
                    </div>

                    {/* Request Feature Checkbox */}
                    <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.requestFeatured}
                                onChange={(e) =>
                                    setForm({ ...form, requestFeatured: e.target.checked })
                                }
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#00a651] focus:ring-[#00a651]"
                            />
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                                    ⭐ Request Featured Placement
                                </span>
                                <span className="text-[11px] text-amber-800/80">
                                    Highlight this listing on top of the home page for 7 days to get up to 5x more buyer contacts.
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-[#00a651] hover:bg-emerald-600 py-4 text-xs sm:text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Posting Item...</span>
                            </>
                        ) : (
                            <span>Post Item & Request Approval</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
