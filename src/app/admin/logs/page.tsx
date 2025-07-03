"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { useAuthRedirect } from "@/utils/useAuthRedirect";

interface Appointment {
  id: string;
  student: string;
  teacher: string;
  date: string;
  time: string;
  status: string;
}

export default function ViewLogs() {
  const { loading: authLoading, authorized } = useAuthRedirect("admin");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "appointments"));
    setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    setLoading(false);
  };

  useEffect(() => {
    if (authorized) fetchAppointments();
  }, [authorized]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div></div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-yellow-100 via-purple-100 to-pink-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-3xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10">
        <h2 className="text-2xl font-bold text-yellow-700 mb-6">Appointment Logs</h2>
        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div></div>
        ) : appointments.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No appointments found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Student</th>
                <th className="py-2">Teacher</th>
                <th className="py-2">Date</th>
                <th className="py-2">Time</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id} className="border-b">
                  <td className="py-2">{app.student}</td>
                  <td className="py-2">{app.teacher}</td>
                  <td className="py-2">{app.date}</td>
                  <td className="py-2">{app.time}</td>
                  <td className="py-2">{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
} 