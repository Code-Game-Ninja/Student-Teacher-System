"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function ViewStats() {
  const { user, userData, loading } = useAuth() as any;
  const router = useRouter();
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    setLoadingStats(true);
    const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
    const teachersQuery = query(collection(db, "users"), where("role", "==", "teacher"));
    const studentsSnap = await getCountFromServer(studentsQuery);
    const teachersSnap = await getCountFromServer(teachersQuery);
    setStudentCount(studentsSnap.data().count);
    setTeacherCount(teachersSnap.data().count);
    setLoadingStats(false);
  };

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/");
    } else if (!loading) {
      fetchStats();
    }
  }, [user, userData, loading, router]);
  if (loading) return <LoadingSpinner />;
  if (!user || userData?.role !== "admin") return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-100 via-yellow-100 to-pink-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10 text-center">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">System Stats</h2>
        {loadingStats ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-2xl shadow-lg px-8 py-6 w-full">
              <h3 className="text-xl font-semibold mb-2">Total Students</h3>
              <div className="text-4xl font-bold">{studentCount}</div>
            </div>
            <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl shadow-lg px-8 py-6 w-full">
              <h3 className="text-xl font-semibold mb-2">Total Teachers</h3>
              <div className="text-4xl font-bold">{teacherCount}</div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
} 