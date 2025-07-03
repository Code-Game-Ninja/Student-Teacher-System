"use client";
import { useAuthRedirect } from "@/utils/useAuthRedirect";
import { motion } from "framer-motion";

export default function TeacherAppointments() {
  const { loading, authorized } = useAuthRedirect("teacher");
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div></div>;
  if (!authorized) return null;
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Appointments</h2>
        <div className="text-gray-500">(Feature coming next: view, approve, and cancel appointments.)</div>
      </motion.div>
    </div>
  );
} 