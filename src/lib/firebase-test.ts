export const firebaseOps = {
  loginUser: async (email: string, password: string) => ({ success: true }),
  registerUser: async (email: string, password: string, data: any) => ({ success: true }),
  getUsersByRole: async (role: string) => ({ success: true, data: [] }),
  getAppointmentsByUser: async (uid: string, role: string) => ({ success: true, data: [] }),
  getAllTeacherStatuses: async () => ({ success: true, data: [] }),
  createAppointment: async (data: any) => ({ success: true }),
  getTeacherStatus: async (uid: string) => ({ success: true, data: { available: true, onLeave: false } }),
  updateAppointmentStatus: async (id: string, status: string) => ({ success: true }),
  updateTeacherStatus: async (uid: string, status: any) => ({ success: true }),
}; 