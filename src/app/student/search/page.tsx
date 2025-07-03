"use client";
import { useAuthRedirect } from "@/utils/useAuthRedirect";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { motion } from "framer-motion";

interface Teacher {
  id: string;
  email: string;
  name?: string;
}
interface Slot {
  id: string;
  date: string;
  time: string;
}

export default function StudentSearchTeacher() {
  const { loading, authorized } = useAuthRedirect("student");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Teacher[]>([]);
  const [fetching, setFetching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFetching(true);
    let q = query(collection(db, "users"), where("role", "==", "teacher"));
    const snap = await getDocs(q);
    const teachers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
    const filtered = teachers.filter(t =>
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.name && t.name.toLowerCase().includes(search.toLowerCase()))
    );
    setResults(filtered);
    setFetching(false);
  };

  useEffect(() => { setResults([]); }, [search]);

  const openBookModal = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
    setSlotLoading(true);
    setBookError("");
    const snap = await getDocs(collection(db, "availability", teacher.id, "slots"));
    setSlots(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slot)));
    setSlotLoading(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTeacher(null);
    setSlots([]);
    setBookError("");
  };

  const handleBook = async (slot: Slot) => {
    if (!selectedTeacher || !auth.currentUser) return;
    setBooking(true);
    setBookError("");
    try {
      await addDoc(collection(db, "appointments"), {
        student: auth.currentUser.email,
        studentId: auth.currentUser.uid,
        teacher: selectedTeacher.email,
        teacherId: selectedTeacher.id,
        date: slot.date,
        time: slot.time,
        status: "pending",
        createdAt: new Date(),
      });
      closeModal();
      alert("Appointment requested!");
    } catch (err: any) {
      setBookError(err.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div></div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-100 via-blue-100 to-pink-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Search Teacher</h2>
        <form onSubmit={handleSearch} className="flex gap-4 mb-8">
          <input type="text" className="flex-1 px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none" value={search} onChange={e => setSearch(e.target.value)} placeholder="Enter teacher name or email..." required />
          <button type="submit" disabled={fetching} className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold shadow hover:scale-105 transition-transform">{fetching ? "Searching..." : "Search"}</button>
        </form>
        <div className="mt-6">
          {fetching ? (
            <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div></div>
          ) : results.length === 0 && search ? (
            <div className="text-gray-400">No teachers found.</div>
          ) : (
            <ul className="space-y-2">
              {results.map(teacher => (
                <li key={teacher.id} className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-2 shadow">
                  <span>{teacher.name || teacher.email} <span className="text-xs text-gray-400">({teacher.email})</span></span>
                  <button onClick={() => openBookModal(teacher)} className="px-4 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded hover:scale-105 transition-transform">Book</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-green-700">Book Appointment with {selectedTeacher?.name || selectedTeacher?.email}</h3>
            {slotLoading ? (
              <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div></div>
            ) : slots.length === 0 ? (
              <div className="text-gray-400">No available slots.</div>
            ) : (
              <ul className="space-y-2 mb-4">
                {slots.map(slot => (
                  <li key={slot.id} className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-2 shadow">
                    <span>{slot.date} at {slot.time}</span>
                    <button onClick={() => handleBook(slot)} disabled={booking} className="px-4 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded hover:scale-105 transition-transform">{booking ? "Booking..." : "Book"}</button>
                  </li>
                ))}
              </ul>
            )}
            {bookError && <div className="text-red-500 text-sm mb-2">{bookError}</div>}
            <div className="flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 