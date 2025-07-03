"use client";

import { useAuth } from "@/lib/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { firebaseOps } from "@/lib/firebase-test";

interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  date: string;
  time: string;
  status: "pending" | "approved" | "cancelled";
  message?: string;
  createdAt: any;
}

interface TeacherStatus {
  available: boolean;
  onLeave: boolean;
}

export default function TeacherDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [teacherStatus, setTeacherStatus] = useState<TeacherStatus>({
    available: true,
    onLeave: false,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "teacher")) {
      router.push("/");
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (user && userData?.role === "teacher") {
      fetchData();
    }
  }, [user, userData]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [appointmentsResult, statusResult] = await Promise.all([
        firebaseOps.getAppointmentsByUser(user.uid, "teacher"),
        firebaseOps.getTeacherStatus(user.uid),
      ]);

      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data);
      }

      if (statusResult.success) {
        setTeacherStatus(statusResult.data);
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

  const handleAppointmentAction = async (appointmentId: string, action: "approve" | "cancel") => {
    try {
      const status = action === "approve" ? "approved" : "cancelled";
      const result = await firebaseOps.updateAppointmentStatus(appointmentId, status);

      if (result.success) {
        setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt)));
        toast({
          title: "Success",
          description: `Appointment ${action === "approve" ? "approved" : "cancelled"} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${action} appointment`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} appointment`,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (field: keyof TeacherStatus, value: boolean) => {
    if (!user) return;

    try {
      const newStatus = { ...teacherStatus, [field]: value };
      const result = await firebaseOps.updateTeacherStatus(user.uid, newStatus);

      if (result.success) {
        setTeacherStatus(newStatus);
        toast({
          title: "Success",
          description: "Status updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingData) {
    return <LoadingSpinner />;
  }

  if (!user || userData?.role !== "teacher") {
    return null;
  }

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending");
  const approvedAppointments = appointments.filter((apt) => apt.status === "approved");
  const cancelledAppointments = appointments.filter((apt) => apt.status === "cancelled");

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {userData?.name}</p>
          </div>
        </div>

        {/* Status Controls */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Status Settings
            </CardTitle>
            <CardDescription>Manage your availability and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="available">Available for Appointments</Label>
                <p className="text-sm text-gray-600">Students can book appointments with you</p>
              </div>
              <Switch
                id="available"
                checked={teacherStatus.available}
                onCheckedChange={(checked) => handleStatusChange("available", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="onLeave">On Leave</Label>
                <p className="text-sm text-gray-600">Mark yourself as on leave</p>
              </div>
              <Switch
                id="onLeave"
                checked={teacherStatus.onLeave}
                onCheckedChange={(checked) => handleStatusChange("onLeave", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{pendingAppointments.length}</div>
              <p className="text-xs text-orange-600 mt-1">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Approved Sessions</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{approvedAppointments.length}</div>
              <p className="text-xs text-green-600 mt-1">Confirmed appointments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{appointments.length}</div>
              <p className="text-xs text-blue-600 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved ({approvedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              History ({appointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Appointment Requests
                </CardTitle>
                <CardDescription>Review and respond to student appointment requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No pending appointment requests</div>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{appointment.studentName}</h3>
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
                                <strong>Message:</strong> {appointment.message}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAppointmentAction(appointment.id, "cancel")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Approved Appointments
                </CardTitle>
                <CardDescription>Your confirmed upcoming sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {approvedAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No approved appointments</div>
                ) : (
                  <div className="space-y-4">
                    {approvedAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{appointment.studentName}</h3>
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
                            <Badge className="mt-2 bg-green-100 text-green-800">Confirmed</Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAppointmentAction(appointment.id, "cancel")}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment History
                </CardTitle>
                <CardDescription>All your past and current appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No appointment history</div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{appointment.studentName}</h3>
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
        </Tabs>
      </div>
    </div>
  );
} 