"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, Calendar, UserPlus, UserCheck, Clock } from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";

interface User {
  uid: string;
  name?: string;
  email: string;
  role: string;
  approved: boolean;
  subject?: string;
  grade?: string;
  createdAt?: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingApprovals: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "students" | "teachers">("pending");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch users
    const usersSnap = await getDocs(collection(db, "users"));
    const usersList = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
    setUsers(usersList);
    // Stats
    const totalStudents = usersList.filter(u => u.role === "student").length;
    const totalTeachers = usersList.filter(u => u.role === "teacher").length;
    const pendingApprovals = usersList.filter(u => u.role === "student" && !u.approved).length;
    // Appointments
    const appointmentsSnap = await getDocs(collection(db, "appointments"));
    setStats({
      totalStudents,
      totalTeachers,
      pendingApprovals,
      totalAppointments: appointmentsSnap.size,
    });
    setLoading(false);
  };

  const handleApproveUser = async (userId: string) => {
    await updateDoc(doc(db, "users", userId), { approved: true });
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, approved: true } : u));
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteDoc(doc(db, "users", userId));
    setUsers(prev => prev.filter(u => u.uid !== userId));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div></div>;
  }

  const pendingStudents = users.filter(u => u.role === "student" && !u.approved);
  const approvedStudents = users.filter(u => u.role === "student" && u.approved);
  const teachers = users.filter(u => u.role === "teacher");

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome, Admin</p>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Total Students</span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.totalStudents}</div>
            <p className="text-xs text-blue-600 mt-1">Active learners</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Total Teachers</span>
              <GraduationCap className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">{stats.totalTeachers}</div>
            <p className="text-xs text-green-600 mt-1">Educators</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700">Pending Approvals</span>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900">{stats.pendingApprovals}</div>
            <p className="text-xs text-orange-600 mt-1">Awaiting review</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Total Appointments</span>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">{stats.totalAppointments}</div>
            <p className="text-xs text-purple-600 mt-1">Scheduled sessions</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="mt-8">
          <div className="flex gap-4 mb-6">
            <button onClick={() => setTab("pending")} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${tab === "pending" ? "bg-orange-200 text-orange-900" : "bg-white text-gray-700 hover:bg-orange-50"}`}><UserPlus className="h-4 w-4" /> Pending Approvals ({pendingStudents.length})</button>
            <button onClick={() => setTab("students")} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${tab === "students" ? "bg-blue-200 text-blue-900" : "bg-white text-gray-700 hover:bg-blue-50"}`}><Users className="h-4 w-4" /> Students ({approvedStudents.length})</button>
            <button onClick={() => setTab("teachers")} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${tab === "teachers" ? "bg-green-200 text-green-900" : "bg-white text-gray-700 hover:bg-green-50"}`}><GraduationCap className="h-4 w-4" /> Teachers ({teachers.length})</button>
          </div>
          {/* Tab Content */}
          {tab === "pending" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><UserCheck className="h-5 w-5" /> Pending Student Approvals</h2>
                <p className="text-gray-500 mb-4">Review and approve student registrations</p>
                {pendingStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No pending approvals</div>
                ) : (
                  <div className="space-y-4">
                    {pendingStudents.map(student => (
                      <div key={student.uid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-semibold">{student.name || student.email}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Student</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveUser(student.uid)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                          <button onClick={() => handleDeleteUser(student.uid)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === "students" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><Users className="h-5 w-5" /> Approved Students</h2>
                <p className="text-gray-500 mb-4">Manage approved student accounts</p>
                {approvedStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No approved students yet</div>
                ) : (
                  <div className="space-y-4">
                    {approvedStudents.map(student => (
                      <div key={student.uid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-semibold">{student.name || student.email}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Approved</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteUser(student.uid)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === "teachers" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><GraduationCap className="h-5 w-5" /> Teachers</h2>
                <p className="text-gray-500 mb-4">Manage teacher accounts</p>
                {teachers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No teachers registered yet</div>
                ) : (
                  <div className="space-y-4">
                    {teachers.map(teacher => (
                      <div key={teacher.uid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-semibold">{teacher.name || teacher.email}</h3>
                          <p className="text-sm text-gray-600">{teacher.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Teacher</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteUser(teacher.uid)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 