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
 * Role guard — redirects if user doesn't have one of the allowed roles.
 * By default, admins can access any role-gated page.
 */
export function useRequireRole(role: "referrer" | "admin"): boolean {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user) {
      // Admins can access everything. Otherwise must match exact role.
      if (user.role !== role && user.role !== "admin") {
        router.push("/portal");
      }
    }
  }, [user, loading, router, role]);

  return loading;
}
