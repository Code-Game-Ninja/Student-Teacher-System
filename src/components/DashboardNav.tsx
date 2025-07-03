import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { motion } from "framer-motion";

export default function DashboardNav({ role }: { role: string }) {
  const router = useRouter();
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };
  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between bg-white bg-opacity-80 shadow-lg rounded-2xl px-8 py-4 mb-8"
    >
      <div className="flex items-center space-x-6">
        <Link href={`/${role}`} className="font-bold text-xl text-purple-700 hover:underline">Dashboard</Link>
        {role === "admin" && (
          <>
            <Link href="/admin/teachers" className="text-gray-700 hover:text-purple-600">Manage Teachers</Link>
            <Link href="/admin/students" className="text-gray-700 hover:text-purple-600">Approve Students</Link>
            <Link href="/admin/logs" className="text-gray-700 hover:text-purple-600">View Logs</Link>
            <Link href="/admin/stats" className="text-gray-700 hover:text-purple-600">Stats</Link>
          </>
        )}
        {role === "teacher" && (
          <>
            <Link href="/teacher/availability" className="text-gray-700 hover:text-blue-600">Set Availability</Link>
            <Link href="/teacher/appointments" className="text-gray-700 hover:text-blue-600">Appointments</Link>
            <Link href="/teacher/messages" className="text-gray-700 hover:text-blue-600">Messages</Link>
            <Link href="/teacher/history" className="text-gray-700 hover:text-blue-600">History</Link>
            <Link href="/teacher/status" className="text-gray-700 hover:text-blue-600">On Leave</Link>
          </>
        )}
        {role === "student" && (
          <>
            <Link href="/student/search" className="text-gray-700 hover:text-green-600">Search Teacher</Link>
            <Link href="/student/appointments" className="text-gray-700 hover:text-green-600">My Appointments</Link>
            <Link href="/student/messages" className="text-gray-700 hover:text-green-600">Messages</Link>
          </>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-xl font-semibold shadow hover:scale-105 transition-transform"
      >
        Logout
      </button>
    </motion.nav>
  );
} 