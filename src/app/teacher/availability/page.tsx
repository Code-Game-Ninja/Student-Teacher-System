"use client";
import { useAuthRedirect } from "@/utils/useAuthRedirect";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { motion } from "framer-motion";

interface Slot {
  id: string;
  date: string;
  time: string;
}

export default function TeacherAvailability() {
  const { loading, authorized } = useAuthRedirect("teacher");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [form, setForm] = useState({ date: "", time: "" });
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const teacherId = auth.currentUser?.uid;

  const fetchSlots = async () => {
    if (!teacherId) return;
    setFetching(true);
    const snap = await getDocs(collection(db, "availability", teacherId, "slots"));
    setSlots(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slot)));
    setFetching(false);
  };

  useEffect(() => {
    if (authorized && teacherId) fetchSlots();
    // eslint-disable-next-line
  }, [authorized, teacherId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!form.date || !form.time) throw new Error("Date and time required");
      await addDoc(collection(db, "availability", teacherId!, "slots"), {
        date: form.date,
        time: form.time,
        createdAt: Timestamp.now(),
      });
      setForm({ date: "", time: "" });
      await fetchSlots();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this slot?")) return;
    await deleteDoc(doc(db, "availability", teacherId!, "slots", id));
    await fetchSlots();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div></div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 via-green-100 to-purple-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10 text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Set Availability</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
          <input type="date" className="px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          <input type="time" className="px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
          <button type="submit" disabled={saving} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold shadow hover:scale-105 transition-transform">{saving ? "Adding..." : "Add Slot"}</button>
        </form>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Your Available Slots</h3>
          {fetching ? (
            <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
          ) : slots.length === 0 ? (
            <div className="text-gray-400">No slots set yet.</div>
          ) : (
            <ul className="space-y-2">
              {slots.map(slot => (
                <li key={slot.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-2 shadow">
                  <span>{slot.date} at {slot.time}</span>
                  <button onClick={() => handleDelete(slot.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
} 