"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

export type UserRole = "CITIZEN" | "OFFICIAL" | "ADMIN" | "DEVELOPER";

interface UserProfile {
  age?: number;
  gender?: string;
  state?: string;
  district?: string;
  occupation?: string;
  annual_income?: number;
  category?: string;
  is_student?: boolean;
  is_farmer?: boolean;
  is_business?: boolean;
  has_disability?: boolean;
  education_level?: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  switchRole: (newRole: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "CITIZEN",
  token: null,
  isLoading: true,
  switchRole: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("CITIZEN");
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await api.auth.getMe();
      setUser(data);
      if (data.role) {
        setRole(data.role as UserRole);
      }
    } catch (err) {
      console.warn("Could not fetch user profile:", err);
      // Auto login as Demo Citizen on initial fresh visit
      await switchRole("CITIZEN");
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.auth.demoLogin(newRole);
      localStorage.setItem("finsaarthi_token", res.access_token);
      setToken(res.access_token);
      setRole(newRole);
      await fetchProfile();
    } catch (err) {
      console.error("Failed to switch role:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const existingToken = localStorage.getItem("finsaarthi_token");
    if (existingToken) {
      setToken(existingToken);
      fetchProfile();
    } else {
      switchRole("CITIZEN");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        switchRole,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
