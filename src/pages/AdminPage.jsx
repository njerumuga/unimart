import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Admin.css";

export default function AdminPage() {
    const { user, isAdmin } = useAuth();
    const [pendingItems, setPendingItems] = useState([]);
    const [approvedItems, setApprovedItems] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");

    // 🕓 Fetch pending (unapproved) items
    useEffect(() => {
        if (!isAdmin) return;

        const q = query(collection(db, "items"), where("isApproved", "==", false));
        const unsub = onSnapshot(q, (snap) => {
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setPendingItems(arr);
        });

        return () => unsub();
    }, [isAdmin]);

    // ✅ Fetch approved items
    useEffect(() => {
        if (!isAdmin) return;

        const q = query(collection(db, "items"), where("isApproved", "==", true));
        const unsub = onSnapshot(q, (snap) => {
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setApprovedItems(arr);
        });

        return () => unsub();
    }, [isAdmin]);

    // 🔹 Approve or reject item
    const handleDecision = async (id, approved) => {
        const ref = doc(db, "items", id);
        await updateDoc(ref, { isApproved: approved });
        alert(approved ? "✅ Approved!" : "❌ Rejected");
    };

    // 🔹 Delete item permanently
    const handleDelete = async (id) => {
        const confirm = window.confirm("🗑️ Are you sure you want to delete this post?");
        if (!confirm) return;

        try {
            await deleteDoc(doc(db, "items", id));
            alert("✅ Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("❌ Failed to delete post. Check console for details.");
        }
    };

    // 🔁 Revoke approval
    const handleRevoke = async (id) => {
        const ref = doc(db, "items", id);
        await updateDoc(ref, { isApproved: false });
        alert("🔁 Approval revoked — moved back to pending list.");
    };

    if (!user) return <p>Please log in as admin.</p>;
    if (!isAdmin) return <p>⛔ Access denied — Admins only.</p>;

    const itemsToShow = activeTab === "pending" ? pendingItems : approvedItems;

    return (
        <div className="admin-page">
            <h2>🧑‍💼 Admin Dashboard</h2>

            {/* Tabs for navigation */}
            <div className="tab-buttons">
                <button
                    className={activeTab === "pending" ? "active" : ""}
                    onClick={() => setActiveTab("pending")}
                >
                    🕓 Pending ({pendingItems.length})
                </button>
                <button
                    className={activeTab === "approved" ? "active" : ""}
                    onClick={() => setActiveTab("approved")}
                >
                    ✅ Approved ({approvedItems.length})
                </button>
            </div>

            {itemsToShow.length === 0 ? (
                <p>
                    {activeTab === "pending"
                        ? "No pending items right now 🎉"
                        : "No approved items yet."}
                </p>
            ) : (
                <div className="admin-items">
                    {itemsToShow.map((item) => (
                        <div key={item.id} className="admin-card">
                            <img
                                src={item.imageUrl || "https://via.placeholder.com/200"}
                                alt={item.title}
                            />
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <p><strong>Price:</strong> {item.price}</p>
                            <p><strong>Category:</strong> {item.category}</p>

                            <div className="admin-buttons">
                                {activeTab === "pending" ? (
                                    <>
                                        <button
                                            className="approve"
                                            onClick={() => handleDecision(item.id, true)}
                                        >
                                            ✅ Approve
                                        </button>
                                        <button
                                            className="reject"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            ❌ Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="revoke"
                                            onClick={() => handleRevoke(item.id)}
                                        >
                                            🔁 Revoke
                                        </button>
                                        <button
                                            className="delete"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
