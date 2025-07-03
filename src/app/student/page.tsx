"use client";

import { useAuth } from "@/lib/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Calendar, Clock, MessageSquare, User, BookOpen, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { firebaseOps } from "@/lib/firebase-test";

interface Teacher {
  uid: string;
  name: string;
  email: string;
  subject: string;
  available?: boolean;
  onLeave?: boolean;
}

interface Appointment {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  status: "pending" | "approved" | "cancelled";
  message?: string;
  createdAt: any;
}

export default function StudentDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    time: "",
    message: "",
  });
  const [loadingData, setLoadingData] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "student")) {
      router.push("/");
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (!loading && userData?.role === "student" && !userData?.approved) {
      toast({
        title: "Account Pending",
        description: "Your account is pending admin approval. Please wait for approval to access all features.",
        variant: "destructive",
      });
    }
  }, [userData, loading, toast]);

  useEffect(() => {
    if (user && userData?.role === "student") {
      fetchData();
    }
  }, [user, userData]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [teachersResult, appointmentsResult, statusesResult] = await Promise.all([
        firebaseOps.getUsersByRole("teacher"),
        firebaseOps.getAppointmentsByUser(user.uid, "student"),
        firebaseOps.getAllTeacherStatuses(),
      ]);

      if (teachersResult.success && statusesResult.success) {
        const teachers = teachersResult.data;
        const statuses = statusesResult.data;

        // Merge teacher data with their status
        const teachersWithStatus = teachers.map((teacher: any) => {
          const status = statuses.find((s: any) => s.teacherId === teacher.uid);
          return {
            ...teacher,
            available: status?.available ?? true,
            onLeave: status?.onLeave ?? false,
          };
        });

        setTeachers(teachersWithStatus);
      }

      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!user || !selectedTeacher || !appointmentForm.date || !appointmentForm.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const appointmentData = {
        studentId: user.uid,
        studentName: userData?.name,
        teacherId: selectedTeacher.uid,
        teacherName: selectedTeacher.name,
        date: appointmentForm.date,
        time: appointmentForm.time,
        message: appointmentForm.message,
        status: "pending",
      };

      const result = await firebaseOps.createAppointment(appointmentData);

      if (result.success) {
        toast({
          title: "Success",
          description: "Appointment request sent successfully",
        });

        setBookingDialogOpen(false);
        setAppointmentForm({ date: "", time: "", message: "" });
        setSelectedTeacher(null);
        fetchData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to book appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingData) {
    return <LoadingSpinner />;
  }

  if (!user || userData?.role !== "student") {
    return null;
  }

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending");
  const approvedAppointments = appointments.filter((apt) => apt.status === "approved");

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {userData?.name}</p>
            {!userData?.approved && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Your account is pending admin approval. Some features may be limited.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Available Teachers</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {teachers.filter((t) => t.available && !t.onLeave).length}
              </div>
              <p className="text-xs text-blue-600 mt-1">Ready to help</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{pendingAppointments.length}</div>
              <p className="text-xs text-orange-600 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Confirmed Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{approvedAppointments.length}</div>
              <p className="text-xs text-green-600 mt-1">Upcoming meetings</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="teachers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Find Teachers
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Appointments
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Teachers
                </CardTitle>
                <CardDescription>Find and book appointments with available teachers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by teacher name or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid gap-4">
                  {filteredTeachers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No teachers found</div>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <div key={teacher.uid} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{teacher.name}</h3>
                            <p className="text-gray-600">{teacher.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {teacher.subject}
                              </Badge>
                              {teacher.available && !teacher.onLeave ? (
                                <Badge className="bg-green-100 text-green-800">Available</Badge>
                              ) : teacher.onLeave ? (
                                <Badge className="bg-red-100 text-red-800">On Leave</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Unavailable</Badge>
                              )}
                            </div>
                          </div>
                          <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                disabled={!teacher.available || teacher.onLeave || !userData?.approved}
                                onClick={() => setSelectedTeacher(teacher)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Book Appointment
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Book Appointment</DialogTitle>
                                <DialogDescription>Schedule a session with {selectedTeacher?.name}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="date">Preferred Date</Label>
                                  <Input
                                    id="date"
                                    type="date"
                                    value={appointmentForm.date}
                                    onChange={(e) => setAppointmentForm((prev) => ({ ...prev, date: e.target.value }))}
                                    min={new Date().toISOString().split("T")[0]}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="time">Preferred Time</Label>
                                  <Input
                                    id="time"
                                    type="time"
                                    value={appointmentForm.time}
                                    onChange={(e) => setAppointmentForm((prev) => ({ ...prev, time: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="message">Message (Optional)</Label>
                                  <Textarea
                                    id="message"
                                    placeholder="Add any specific topics or questions..."
                                    value={appointmentForm.message}
                                    onChange={(e) =>
                                      setAppointmentForm((prev) => ({ ...prev, message: e.target.value }))
                                    }
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleBookAppointment}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Request
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setBookingDialogOpen(false);
                                      setAppointmentForm({ date: "", time: "", message: "" });
                                      setSelectedTeacher(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  My Appointments
                </CardTitle>
                <CardDescription>Track your appointment requests and confirmed sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No appointments yet. Book your first session!</div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{appointment.teacherName}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {appointment.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {appointment.time}
                              </span>
                            </div>
                            {appointment.message && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <strong>Your message:</strong> {appointment.message}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant={
                              appointment.status === "approved"
                                ? "default"
                                : appointment.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              appointment.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : appointment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
                <CardDescription>Communicate with your teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">Messaging feature coming soon!</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 