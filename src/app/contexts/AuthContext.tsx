"use client"

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import env from "../config/env";
import { authClient } from "../lib/auth-client";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    authClient
      .getSession()
      .then((session) => {
        console.log("Session check result:", session); // Add logging
        if (session?.data) {
          setUser(session.data.user as any);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Session check error:", error);
        setLoading(false);
      });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${env.VITE_CLIENT_URL}/genie`,
      });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
