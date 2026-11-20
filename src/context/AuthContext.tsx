"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { signOut as betterAuthSignOut, useSession } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api";
import type { UserProfile } from "@/types";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isPending: sessionPending } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  const fetchFullProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const res = await fetch("/api/auth/token", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setUser(null);
        return null;
      }
      const data = await res.json();
      if (data?.user) {
        setUser(data.user as UserProfile);
        return data.user as UserProfile;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionPending) return;
    if (sessionData?.user) {
      fetchFullProfile();
    } else {
      clearAuthTokenCache();
      setUser(null);
      setProfileLoading(false);
    }
  }, [sessionData?.user, sessionPending, fetchFullProfile]);

  const logout = useCallback(async () => {
    clearAuthTokenCache();
    await betterAuthSignOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  const loading = sessionPending || profileLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser: fetchFullProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
