import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  addDoc,
  orderBy,
} from "firebase/firestore";

export const firebaseOps = {
  loginUser: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, data: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  registerUser: async (email: string, password: string, data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        ...data,
        email,
        createdAt: new Date(),
        approved: data.role === "student" ? false : true, // students need approval
      });
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  getUsersByRole: async (role: string) => {
    try {
      const q = query(collection(db, "users"), where("role", "==", role));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  getAppointmentsByUser: async (uid: string, role: string) => {
    try {
      let q;
      if (role === "student") {
        q = query(collection(db, "appointments"), where("studentId", "==", uid), orderBy("createdAt", "desc"));
      } else {
        q = query(collection(db, "appointments"), where("teacherId", "==", uid), orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  getAllTeacherStatuses: async () => {
    try {
      const snap = await getDocs(collection(db, "teacherStatus"));
      const data = snap.docs.map((doc) => ({ teacherId: doc.id, ...doc.data() }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  createAppointment: async (data: any) => {
    try {
      await addDoc(collection(db, "appointments"), {
        ...data,
        createdAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  getTeacherStatus: async (uid: string) => {
    try {
      const docRef = doc(db, "teacherStatus", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: true, data: { available: true, onLeave: false } };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  updateAppointmentStatus: async (id: string, status: string) => {
    try {
      const docRef = doc(db, "appointments", id);
      await updateDoc(docRef, { status });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  updateTeacherStatus: async (uid: string, status: any) => {
    try {
      const docRef = doc(db, "teacherStatus", uid);
      await setDoc(docRef, status, { merge: true });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
}; 