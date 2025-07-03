"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { motion } from "framer-motion";

export default function TeacherAppointments() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && (!user || userData?.role !== "teacher")) {
      router.push("/");
    }
  }, [user, userData, loading, router]);
  if (loading) return <LoadingSpinner />;
  if (!user || userData?.role !== "teacher") return null;
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Appointments</h2>
        <div className="text-gray-500">(Feature coming next: view, approve, and cancel appointments.)</div>
      </motion.div>
    </div>
  );
} 