import { useAuthRedirect } from "@/utils/useAuthRedirect";
import DashboardNav from "@/components/DashboardNav";

export default function TeacherDashboard() {
  const { loading, authorized } = useAuthRedirect("teacher");
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div></div>;
  if (!authorized) return null;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 via-green-400 to-purple-400">
      <div className="w-full max-w-3xl mt-10">
        <DashboardNav role="teacher" />
        <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">Teacher Dashboard</h1>
          <p className="text-lg text-gray-700">Welcome, Teacher! Here you can manage your availability, appointments, and messages.</p>
        </div>
      </div>
    </div>
  );
} 