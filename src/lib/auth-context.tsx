"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Profile, ReferrerProfile } from "./types";
import { createClient } from "./supabase/client";

// ─── Context ─────────────────────────────────────────────

type AuthContextValue = {
  user: Profile | null;
  referrerProfile: ReferrerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<Profile | null>(null);
  const [referrerProfile, setReferrerProfile] = useState<ReferrerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setReferrerProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("webara_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      setReferrerProfile(null);
      // Profile doesn't exist yet — create it in the DB (trigger was removed)
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        const newProfile = {
          id: userId,
          display_name: authUser.user.user_metadata?.display_name || authUser.user.email?.split("@")[0] || "User",
          email: authUser.user.email || "",
          role: "user" as const,
          status: "pending" as const,
        };

        // Try to insert the profile
        await supabase.from("webara_profiles").insert(newProfile);
        setUser({ ...newProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
    } else {
      setUser(data as Profile);
      const { data: referrerData } = await supabase
        .from("webara_referrer_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      setReferrerProfile((referrerData as ReferrerProfile | null) || null);
    }
    setLoading(false);
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { error: error?.message || null };
  };

  const refreshProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await fetchProfile(authUser.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setReferrerProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, referrerProfile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// No longer mock — always real
export const IS_MOCK = false;
