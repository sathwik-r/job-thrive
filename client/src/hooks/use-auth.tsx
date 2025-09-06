import React, { createContext, useContext, useMemo, useState } from "react";
import { CognitoAuth } from "@/lib/cognito";
import type { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthData {
  user: User;
  token: string;
  tokenType: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null, authData?: { token: string; tokenType: string }) => void;
  setAuthData: (authResponse: AuthData) => void;
  updateUser: (updates: Partial<User>) => User | null;
  isAuthenticated: () => boolean;
  getAuthToken: () => string | null;
  validateToken: () => Promise<boolean>;
  clearAuthData: () => void;
  setLoading: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialUser(): User | null {
  try {
    const saved = localStorage.getItem("circl_user");
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
}

function getAuthToken(): string | null {
  try {
    const authData = localStorage.getItem("circl_auth");
    if (authData) {
      const { token } = JSON.parse(authData);
      return token as string;
    }
    return null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: getInitialUser(),
    loading: false,
    error: null,
  });

  const setLoading = (value: boolean) => {
    setAuthState(prev => ({ ...prev, loading: value }));
  };

  const clearAuthData = () => {
    localStorage.removeItem("circl_user");
    localStorage.removeItem("circl_auth");
    setAuthState({ user: null, loading: false, error: null });
  };

  const validateToken = async (): Promise<boolean> => {
    try {
      const token = getAuthToken();
      if (!token) {
        return false;
      }
      const response = await fetch("/api/auth/validate", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        return true;
      }
      clearAuthData();
      return false;
    } catch {
      clearAuthData();
      return false;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const config = {
        userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID,
        domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN,
      };
      if (!config.userPoolId || !config.userPoolClientId || !config.domain) {
        throw new Error(
          "AWS Cognito configuration is incomplete. Please check your environment variables.",
        );
      }
      await CognitoAuth.signInWithGoogle();
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Sign in failed. Please check your AWS Cognito configuration.",
      }));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      localStorage.clear();
      setAuthState({ user: null, loading: false, error: null });
    } catch {
      localStorage.removeItem("circl_user");
      localStorage.removeItem("circl_auth");
      setAuthState({ user: null, loading: false, error: null });
    }
  };

  const setUser = (user: User | null, authData?: { token: string; tokenType: string }) => {
    if (user) {
      localStorage.setItem("circl_user", JSON.stringify(user));
      if (authData) {
        localStorage.setItem("circl_auth", JSON.stringify(authData));
      }
    } else {
      localStorage.removeItem("circl_user");
      localStorage.removeItem("circl_auth");
    }
    setAuthState({ user, loading: false, error: null });
  };

  const setAuthData = (authResponse: AuthData) => {
    const { user, token, tokenType } = authResponse;
    setUser(user, { token, tokenType });
  };

  const updateUser = (updates: Partial<User>): User | null => {
    try {
      if (!authState.user) {
        throw new Error("No user logged in");
      }
      const updatedUser = { ...authState.user, ...updates };
      const authData = localStorage.getItem("circl_auth");
      const parsedAuthData = authData ? JSON.parse(authData) : undefined;
      setUser(updatedUser, parsedAuthData);
      return updatedUser;
    } catch {
      return null;
    }
  };

  const isAuthenticated = (): boolean => {
    const authData = localStorage.getItem("circl_auth");
    return !!authData && !!authState.user;
  };

  const value: AuthContextValue = useMemo(
    () => ({
      user: authState.user,
      loading: authState.loading,
      error: authState.error,
      signInWithGoogle,
      signOut,
      setUser,
      setAuthData,
      updateUser,
      isAuthenticated,
      getAuthToken,
      validateToken,
      clearAuthData,
      setLoading,
    }),
    [authState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};


