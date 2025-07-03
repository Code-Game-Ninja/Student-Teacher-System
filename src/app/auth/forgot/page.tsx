"use client";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-400 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <Image src="https://cdn.pixabay.com/photo/2017/01/31/13/13/online-2025932_1280.png" alt="Forgot Password" width={120} height={120} className="mb-2" />
          <h1 className="text-3xl font-bold text-pink-700 mb-2">Forgot Password?</h1>
          <p className="text-gray-500">Enter your email to reset your password</p>
        </div>
        <form onSubmit={handleForgot} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {message && <div className="text-green-600 text-sm text-center">{message}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>
        <div className="flex justify-center mt-6 text-sm">
          <a href="/auth/login" className="text-pink-600 hover:underline">Back to login</a>
        </div>
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-pink-300 rounded-full opacity-30 z-0"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full opacity-30 z-0"
      />
    </div>
  );
} 