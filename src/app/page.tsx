"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-400 via-blue-400 to-pink-400 relative overflow-hidden">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur shadow flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}> 
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500">Student-Teacher</span>
        </div>
        <div className="flex gap-6">
          <button onClick={() => router.push("/")} className="text-gray-700 font-semibold hover:text-purple-600 transition">Home</button>
          <button onClick={() => router.push("/auth/login")} className="text-gray-700 font-semibold hover:text-purple-600 transition">Login</button>
          <button onClick={() => router.push("/auth/register")} className="text-gray-700 font-semibold hover:text-blue-600 transition">Register</button>
          <button onClick={() => {
            const about = document.getElementById("about-section");
            if (about) about.scrollIntoView({ behavior: "smooth" });
          }} className="text-gray-700 font-semibold hover:text-green-600 transition">About Us</button>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 w-full max-w-xl z-10 text-center mt-16"
        >
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 mb-4">Student-Teacher System</h1>
          <p className="text-lg text-gray-700 mb-8">A modern platform for students, teachers, and admins to connect, schedule, and manage appointments with ease. Enjoy a beautiful, animated, and secure experience!</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/auth/login")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/auth/register")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-green-400 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform"
            >
              Register
            </button>
          </div>
        </motion.div>
      </div>
      {/* About Us Section */}
      <motion.section
        id="about-section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full flex justify-center py-20 px-4 bg-white/80 backdrop-blur-lg mt-16"
      >
        <div className="max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">About Us</h2>
          <p className="text-gray-700 text-lg mb-4">
            Our Student-Teacher System is designed to streamline communication and scheduling between students, teachers, and administrators. Whether you are booking appointments, managing your teaching schedule, or overseeing the entire system as an admin, our platform provides a seamless, secure, and visually engaging experience for all users.
          </p>
          <p className="text-gray-600">
            Built with Next.js, Firebase, and modern UI/UX best practices, our mission is to empower educational communities with technology that is both powerful and easy to use.
          </p>
        </div>
      </motion.section>
      {/* Animated Background Circles */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-pink-300 rounded-full opacity-30 z-0"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-blue-300 rounded-full opacity-30 z-0"
      />
    </div>
  );
}
