"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role,
        createdAt: new Date(),
        approved: role === "student" ? false : true, // students need approval
      });
      router.push("/auth/login");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <Image src="https://cdn.pixabay.com/photo/2016/11/29/09/08/online-1869826_1280.png" alt="Register" width={120} height={120} className="mb-2" />
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Create Account</h1>
          <p className="text-gray-500">Register as Student or Teacher</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="flex space-x-4 justify-center">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === "student"}
                onChange={() => setRole("student")}
                className="accent-blue-500"
              />
              <span>Student</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === "teacher"}
                onChange={() => setRole("teacher")}
                className="accent-purple-500"
              />
              <span>Teacher</span>
            </label>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="flex justify-center mt-6 text-sm">
          <a href="/auth/login" className="text-blue-600 hover:underline">Already have an account?</a>
        </div>
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-blue-300 rounded-full opacity-30 z-0"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-300 rounded-full opacity-30 z-0"
      />
    </div>
  );
} 