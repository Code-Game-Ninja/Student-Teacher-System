"use client";
import { useAuthRedirect } from "@/utils/useAuthRedirect";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

interface Message {
  sender: string;
  text: string;
  timestamp: any;
}
interface Thread {
  id: string;
  teacherId: string;
  messages: Message[];
}

export default function StudentMessages() {
  const { loading, authorized } = useAuthRedirect("student");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(true);
  const studentId = auth.currentUser?.uid;

  const fetchThreads = async () => {
    if (!studentId) return;
    setFetching(true);
    const q = query(collection(db, "messages"), where("studentId", "==", studentId));
    const snap = await getDocs(q);
    setThreads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Thread)));
    setFetching(false);
  };

  useEffect(() => {
    if (authorized && studentId) fetchThreads();
    // eslint-disable-next-line
  }, [authorized, studentId]);

  const openThread = async (thread: Thread) => {
    // Fetch latest messages
    const docSnap = await getDoc(doc(db, "messages", thread.id));
    setSelected({ ...thread, messages: docSnap.data()?.messages || [] });
  };

  const handleSend = async () => {
    if (!reply.trim() || !selected || !studentId) return;
    setSending(true);
    const msg = {
      sender: "student",
      text: reply,
      timestamp: new Date(),
    };
    await updateDoc(doc(db, "messages", selected.id), {
      messages: arrayUnion(msg),
    });
    setReply("");
    await openThread(selected);
    setSending(false);
  };

  // Start new thread (with teacherId)
  const startThread = async (teacherId: string) => {
    if (!studentId) return;
    const threadId = `${teacherId}_${studentId}`;
    await setDoc(doc(db, "messages", threadId), {
      teacherId,
      studentId,
      messages: [],
    }, { merge: true });
    const docSnap = await getDoc(doc(db, "messages", threadId));
    setSelected({ id: threadId, teacherId, messages: docSnap.data()?.messages || [] });
    await fetchThreads();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div></div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-pink-100 via-green-100 to-blue-100 p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-3xl bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 mt-10">
        <h2 className="text-2xl font-bold text-pink-700 mb-6">Messages</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <h3 className="font-semibold mb-2">Threads</h3>
            {fetching ? (
              <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>
            ) : threads.length === 0 ? (
              <div className="text-gray-400">No message threads.</div>
            ) : (
              <ul className="space-y-2">
                {threads.map(thread => (
                  <li key={thread.id}>
                    <button onClick={() => openThread(thread)} className={`w-full text-left px-4 py-2 rounded-lg ${selected?.id === thread.id ? "bg-pink-200" : "bg-pink-50 hover:bg-pink-100"}`}>Teacher: {thread.teacherId}</button>
                  </li>
                ))}
              </ul>
            )}
            {/* Optionally, add a way to start a new thread by teacherId */}
          </div>
          <div className="w-full md:w-2/3">
            {selected ? (
              <div>
                <h4 className="font-semibold mb-2">Conversation with Teacher: {selected.teacherId}</h4>
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4 flex flex-col gap-2">
                  {selected.messages.length === 0 ? (
                    <div className="text-gray-400">No messages yet.</div>
                  ) : (
                    selected.messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}>
                        <div className={`px-4 py-2 rounded-xl max-w-xs ${msg.sender === "student" ? "bg-pink-400 text-white" : "bg-gray-200 text-gray-800"}`}>{msg.text}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none" value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." />
                  <button onClick={handleSend} disabled={sending || !reply.trim()} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-xl font-semibold shadow hover:scale-105 transition-transform">{sending ? "Sending..." : "Send"}</button>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 mt-10">Select a thread to view messages.</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 