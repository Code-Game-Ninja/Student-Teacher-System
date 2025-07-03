"use client";
import { useAuthRedirect } from "@/utils/useAuthRedirect";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

interface Appointment {
  id: string;
  teacher: string;
  date: string;
  time: string;
  status: string;
}

export default function StudentAppointments() {
  const { loading, authorized } = useAuthRedirect("student");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetching, setFetching] = useState(true);
  const studentId = auth.currentUser?.uid;

  const fetchAppointments = async () => {
    if (!studentId) return;
    setFetching(true);
    const q = query(collection(db, "appointments"), where("studentId", "==", studentId));
    const snap = await getDocs(q);
    setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    setFetching(false);
  };

  useEffect(() => {
    if (authorized && studentId) fetchAppointments();
    // eslint-disable-next-line
  }, [authorized, studentId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div></div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 via-green-100 to-pink-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10 text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">My Appointments</h2>
        {fetching ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>
        ) : appointments.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No appointments found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Teacher</th>
                <th className="py-2">Date</th>
                <th className="py-2">Time</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id} className="border-b">
                  <td className="py-2">{app.teacher}</td>
                  <td className="py-2">{app.date}</td>
                  <td className="py-2">{app.time}</td>
                  <td className="py-2 capitalize">{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
} 