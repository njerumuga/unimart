import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { uploadMultipleToCloudinary } from "../cloudinary";
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

    const [files, setFiles] = useState([]); // Array of { file, preview, type, id }
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");

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

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (!selectedFiles.length) return;

        // Limit to 8 media files total
        const remainingSlots = 8 - files.length;
        if (remainingSlots <= 0) {
            alert("Maximum 8 photos/videos allowed per listing.");
            return;
        }

        const allowedFiles = selectedFiles.slice(0, remainingSlots);
        const newFileEntries = allowedFiles.map((f) => ({
            file: f,
            preview: URL.createObjectURL(f),
            type: f.type.startsWith("video/") ? "video" : "image",
            id: Math.random().toString(36).substring(7),
        }));

        setFiles((prev) => [...prev, ...newFileEntries]);
        e.target.value = ""; // Reset input
    };

    const handleRemoveFile = (idToRemove) => {
        setFiles((prev) => {
            const item = prev.find((f) => f.id === idToRemove);
            if (item && item.preview) URL.revokeObjectURL(item.preview);
            return prev.filter((f) => f.id !== idToRemove);
        });
    };

    const handleSetCover = (index) => {
        if (index === 0) return;
        setFiles((prev) => {
            const copy = [...prev];
            const [selected] = copy.splice(index, 1);
            copy.unshift(selected);
            return copy;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploadStatus("Uploading media files to Cloudinary...");

        try {
            let uploadedMedia = [];
            if (files.length > 0) {
                const rawFiles = files.map((item) => item.file);
                uploadedMedia = await uploadMultipleToCloudinary(
                    rawFiles,
                    (done, total, percent) => {
                        setUploadStatus(`Uploading media (${done}/${total}) — ${percent}%...`);
                    }
                );
            }

            // Determine image URLs and video URL
            const imageUrls = uploadedMedia
                .filter((m) => m.type === "image")
                .map((m) => m.url);
            
            const videoMedia = uploadedMedia.find((m) => m.type === "video");
            const videoUrl = videoMedia ? videoMedia.url : "";

            // Primary image
            const primaryImageUrl = imageUrls.length > 0
                ? imageUrls[0]
                : uploadedMedia.length > 0
                ? uploadedMedia[0].url
                : "https://via.placeholder.com/600x400?text=No+Image";

            const phoneVal = form.sellerPhone.trim();

            setUploadStatus("Saving listing to SokoHub...");

            await addDoc(collection(db, "items"), {
                title: form.title.trim(),
                price: Number(form.price),
                description: form.description.trim(),
                category: form.category,
                locationZone: form.locationZone || "Main Gate",
                condition: form.condition,
                imageUrl: primaryImageUrl,
                imageUrls: imageUrls.length > 0 ? imageUrls : [primaryImageUrl],
                videoUrl: videoUrl,
                media: uploadedMedia,
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
                `Hello Admin, I have just posted '${form.title.trim()}' on SokoHub with ${uploadedMedia.length} media files and need approval.`
            );

            window.location.href = `https://wa.me/${adminPhone}?text=${textMsg}`;
        } catch (err) {
            console.error("❌ Error posting item:", err);
            alert("Error: " + err.message);
            setLoading(false);
            setUploadStatus("");
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
                        Reach verified campus buyers in Meru with photos and product demo videos
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
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 font-bold"
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
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 bg-white font-bold"
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
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 bg-white font-bold"
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
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 bg-white font-bold"
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
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 font-bold"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Interested buyers will message you directly on this WhatsApp number.
                        </p>
                    </div>

                    {/* Multi-Photo & Video Upload Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                                Product Photos & Demo Video ({files.length}/8)
                            </label>
                            <span className="text-[10px] font-bold text-[#00a651]">
                                Images (JPG/PNG) & Videos (MP4/WebM)
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Upload Dropzone */}
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center hover:border-[#00a651] transition bg-gray-50/50">
                                <input
                                    type="file"
                                    id="multi-file-upload"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label htmlFor="multi-file-upload" className="cursor-pointer space-y-2 block">
                                    <div className="w-12 h-12 rounded-full bg-green-100 text-[#00a651] flex items-center justify-center mx-auto text-xl">
                                        📸
                                    </div>
                                    <p className="text-xs font-bold text-gray-700">
                                        Click to upload multiple product photos or demo videos
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        Upload up to 8 photos & videos showing item condition and usage demonstration
                                    </p>
                                </label>
                            </div>

                            {/* Media Previews Grid */}
                            {files.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {files.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="group relative aspect-square rounded-2xl overflow-hidden bg-black/5 border-2 border-gray-200 hover:border-[#00a651] shadow-sm"
                                        >
                                            {item.type === "video" ? (
                                                <div className="w-full h-full relative bg-black flex items-center justify-center">
                                                    <video
                                                        src={item.preview}
                                                        className="w-full h-full object-cover opacity-80"
                                                        muted
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-8 h-8 rounded-full bg-white/80 text-black flex items-center justify-center text-xs font-black">
                                                            ▶
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img
                                                    src={item.preview}
                                                    alt={`Preview ${index}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                                                {index === 0 ? (
                                                    <span className="bg-[#00a651] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                                                        Main Cover
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetCover(index)}
                                                        className="bg-black/70 hover:bg-[#00a651] text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md transition"
                                                    >
                                                        Set Cover
                                                    </button>
                                                )}
                                                {item.type === "video" && (
                                                    <span className="bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                                        🎥 Video
                                                    </span>
                                                )}
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(item.id)}
                                                className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md transition"
                                                title="Remove file"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
                            placeholder="Provide details about specs, condition, how the item is used, reasons for selling, pick-up points..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                            rows="4"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 font-medium"
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

                    {/* Upload Status Alert */}
                    {uploadStatus && (
                        <div className="p-3 bg-green-50 border border-green-200 text-[#00a651] rounded-2xl text-xs font-bold flex items-center gap-2">
                            <div className="w-3.5 h-3.5 border-2 border-[#00a651] border-t-transparent rounded-full animate-spin"></div>
                            <span>{uploadStatus}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-[#00a651] hover:bg-emerald-600 py-4 text-xs sm:text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing & Uploading...</span>
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
