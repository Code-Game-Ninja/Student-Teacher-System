import { useAuthRedirect } from "@/utils/useAuthRedirect";
import DashboardNav from "@/components/DashboardNav";

export default function AdminDashboard() {
  const { loading, authorized } = useAuthRedirect("admin");
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div></div>;
  if (!authorized) return null;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400">
      <div className="w-full max-w-3xl mt-10">
        <DashboardNav role="admin" />
        <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 text-center">
          <h1 className="text-4xl font-bold text-purple-700 mb-4">Admin Dashboard</h1>
          <p className="text-lg text-gray-700">Welcome, Admin! Here you can manage teachers, approve students, and view logs.</p>
          <div className="mt-6">
            <a href="/admin/teachers" className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition-transform">Go to Manage Teachers</a>
          </div>
          <div className="mt-4">
            <a href="/admin/students" className="inline-block bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition-transform">Go to Approve Students</a>
          </div>
          <div className="mt-4">
            <a href="/admin/logs" className="inline-block bg-gradient-to-r from-yellow-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition-transform">Go to View Logs</a>
          </div>
          <div className="mt-4">
        </div>
      </div>
    </div>
  );
} 