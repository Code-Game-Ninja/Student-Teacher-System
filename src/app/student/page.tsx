"use client";
import { useAuthRedirect } from "@/utils/useAuthRedirect";
import DashboardNav from "@/components/DashboardNav";

export default function StudentDashboard() {
  const { loading, authorized } = useAuthRedirect("student");
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div></div>;
  if (!authorized) return null;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-blue-400 to-pink-400">
      <div className="w-full max-w-3xl mt-10">
        <DashboardNav role="student" />
        <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 text-center">
          <h1 className="text-4xl font-bold text-green-700 mb-4">Student Dashboard</h1>
          <p className="text-lg text-gray-700">Welcome, Student! Here you can search teachers, book appointments, and send messages.</p>
        </div>
      </div>
    </div>
  );
} 