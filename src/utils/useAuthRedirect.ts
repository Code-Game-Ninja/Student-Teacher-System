"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export function useAuthRedirect(expectedRole: string) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        setLoading(false);
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;
      if (role !== expectedRole) {
        router.replace(`/${role}`);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [expectedRole, router, pathname]);

  return { loading, authorized };
} 