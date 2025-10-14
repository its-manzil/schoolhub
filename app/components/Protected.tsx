"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../lib/types";

export default function Protected({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (roles && !roles.includes(user.role)) router.replace("/dashboard");
  }, [user, roles, router]);

  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return <>{children}</>;
}
