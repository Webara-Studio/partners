"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

/**
 * Auth guard for protected pages.
 * Redirects to /login if not authenticated.
 */
export function useRequireAuth(redirectPath = "/login"): boolean {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  return loading;
}

/**
 * Role guard — redirects if user doesn't have the required role.
 */
export function useRequireRole(role: "referrer" | "admin"): boolean {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && user.role !== role) {
      router.push(user.role === "admin" ? "/admin" : "/portal");
    }
  }, [user, loading, router, role]);

  return loading;
}
