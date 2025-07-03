"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function TeacherStatus() {
  const { user, userData, loading } = useAuth() as any;
  const router = useRouter();
  const [onLeave, setOnLeave] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const teacherId = auth.currentUser?.uid;

  const fetchStatus = async () => {
    if (!teacherId) return;
    setFetching(true);
    const userDoc = await getDoc(doc(db, "users", teacherId));
    setOnLeave(userDoc.data()?.onLeave || false);
    setFetching(false);
  };

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "teacher")) {
      router.push("/");
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (user && userData?.role === "teacher" && teacherId) fetchStatus();
    // eslint-disable-next-line
  }, [user, userData, teacherId]);

  const handleToggle = async () => {
    if (!teacherId) return;
    setSaving(true);
    await updateDoc(doc(db, "users", teacherId), { onLeave: !onLeave });
    setOnLeave(!onLeave);
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!user || userData?.role !== "teacher") return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-100 via-purple-100 to-blue-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-6">On Leave Status</h2>
        {fetching ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>
        ) : (
          <div>
            <div className="mb-6 text-lg">
              You are currently <span className={onLeave ? "text-red-600 font-bold" : "text-green-600 font-bold"}>{onLeave ? "ON LEAVE" : "AVAILABLE"}</span>.
            </div>
            <button onClick={handleToggle} disabled={saving} className={`px-8 py-3 rounded-xl font-semibold shadow transition-transform ${onLeave ? "bg-green-500 hover:scale-105 text-white" : "bg-red-500 hover:scale-105 text-white"}`}>
              {saving ? "Updating..." : onLeave ? "Set as Available" : "Set as On Leave"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
} 