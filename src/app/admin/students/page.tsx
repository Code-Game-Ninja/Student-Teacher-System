"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useAuthRedirect } from "@/utils/useAuthRedirect";

interface Student {
  id: string;
  email: string;
  name?: string;
  approved?: boolean;
}

export default function ApproveStudents() {
  const { loading: authLoading, authorized } = useAuthRedirect("admin");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    const q = query(collection(db, "users"), where("role", "==", "student"), where("approved", "==", false));
    const snapshot = await getDocs(q);
    setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    setLoading(false);
  };

  useEffect(() => {
    if (authorized) fetchStudents();
  }, [authorized]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    await updateDoc(doc(db, "users", id), { approved: true });
    await fetchStudents();
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    setActionLoading(id);
    await deleteDoc(doc(db, "users", id));
    await fetchStudents();
    setActionLoading(null);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div></div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-pink-200 via-yellow-100 to-purple-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10">
        <h2 className="text-2xl font-bold text-pink-700 mb-6">Approve Students</h2>
        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>
        ) : students.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No students pending approval.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Email</th>
                <th className="py-2">Name</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b">
                  <td className="py-2">{student.email}</td>
                  <td className="py-2">{student.name || "-"}</td>
                  <td className="py-2 space-x-2">
                    <button onClick={() => handleApprove(student.id)} disabled={actionLoading === student.id} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50">{actionLoading === student.id ? "Approving..." : "Approve"}</button>
                    <button onClick={() => handleDelete(student.id)} disabled={actionLoading === student.id} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50">{actionLoading === student.id ? "Deleting..." : "Delete"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
} 