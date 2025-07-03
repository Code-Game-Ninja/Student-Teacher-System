"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";

interface Teacher {
  id: string;
  email: string;
  name?: string;
  approved?: boolean;
}

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ email: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchTeachers = async () => {
    setLoading(true);
    const q = query(collection(db, "users"), where("role", "==", "teacher"));
    const snapshot = await getDocs(q);
    setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher)));
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openAddModal = () => {
    setEditTeacher(null);
    setForm({ email: "", name: "" });
    setModalOpen(true);
    setError("");
  };

  const openEditModal = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setForm({ email: teacher.email, name: teacher.name || "" });
    setModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTeacher(null);
    setForm({ email: "", name: "" });
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editTeacher) {
        await updateDoc(doc(db, "users", editTeacher.id), {
          email: form.email,
          name: form.name,
        });
      } else {
        await addDoc(collection(db, "users"), {
          email: form.email,
          name: form.name,
          role: "teacher",
          approved: true,
          createdAt: new Date(),
        });
      }
      await fetchTeachers();
      closeModal();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    await deleteDoc(doc(db, "users", id));
    await fetchTeachers();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-200 via-pink-200 to-yellow-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-700">Manage Teachers</h2>
          <button onClick={openAddModal} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-xl font-semibold shadow hover:scale-105 transition-transform">Add Teacher</button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>
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
              {teachers.map(teacher => (
                <tr key={teacher.id} className="border-b">
                  <td className="py-2">{teacher.email}</td>
                  <td className="py-2">{teacher.name || "-"}</td>
                  <td className="py-2 space-x-2">
                    <button onClick={() => openEditModal(teacher)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Edit</button>
                    <button onClick={() => handleDelete(teacher.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-700">{editTeacher ? "Edit Teacher" : "Add Teacher"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="email" placeholder="Email" className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <input type="text" placeholder="Name" className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded font-semibold hover:scale-105 transition-transform">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 