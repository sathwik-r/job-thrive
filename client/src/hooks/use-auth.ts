import { useState } from "react";
import { apiRequest } from '@/lib/queryClient';
import { CognitoAuth } from "@/lib/cognito";
import type { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthData {
  user: User;
  token: string;
  tokenType: string;
}

export const useAuth = () => {
  // Initialize user from localStorage if available
  const getInitialUser = (): User | null => {
    try {
      const saved = localStorage.getItem('circl_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const [authState, setAuthState] = useState<AuthState>({
    user: getInitialUser(),
    loading: false,
    error: null,
  });

  // Validate token with backend
  const validateToken = async (): Promise<boolean> => {
    try {
      const token = getAuthToken();
      if (!token) {
        return false;
      }

      // Make a request to validate the token
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return true;
      } else {
        // Token is invalid, clear auth data
        clearAuthData();
        return false;
      }
    } catch (error) {
      // If validation fails, clear auth data
      clearAuthData();
      return false;
    }
  };

  // Clear all authentication data
  const clearAuthData = () => {
    localStorage.removeItem('circl_user');
    localStorage.removeItem('circl_auth');
    setAuthState({ user: null, loading: false, error: null });
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if Cognito is configured
      const config = {
        userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID,
        domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN
      };
      
      if (!config.userPoolId || !config.userPoolClientId || !config.domain) {
        throw new Error('AWS Cognito configuration is incomplete. Please check your environment variables.');
      }
      
      await CognitoAuth.signInWithGoogle();
      // User will be redirected, so no need to handle response here
      
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed. Please check your AWS Cognito configuration.' 
      }));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      localStorage.clear(); // Clear all data for fresh start
      setAuthState({ user: null, loading: false, error: null });
    } catch (error) {
      // Fallback: clear local state
      localStorage.removeItem('circl_user');
      localStorage.removeItem('circl_auth');
      setAuthState({ user: null, loading: false, error: null });
    }
  };

  // Helper function to set user and auth data
  const setUser = (user: User | null, authData?: { token: string; tokenType: string }) => {
    // Update localStorage
    if (user) {
      localStorage.setItem('circl_user', JSON.stringify(user));
      
      // Store auth data separately if provided
      if (authData) {
        localStorage.setItem('circl_auth', JSON.stringify(authData));
      }
    } else {
      localStorage.removeItem('circl_user');
      localStorage.removeItem('circl_auth');
    }
    
    // Update React state
    setAuthState({
      user: user,
      loading: false,
      error: null
    });
  };

  // Helper function to set auth data from Cognito callback
  const setAuthData = (authResponse: AuthData) => {
    const { user, token, tokenType } = authResponse;
    setUser(user, { token, tokenType });
  };

  // Helper function to update user data
  const updateUser = (updates: Partial<User>): User | null => {
    try {
      if (!authState.user) {
        throw new Error('No user logged in');
      }

      const updatedUser = { ...authState.user, ...updates };
      
      // Use setUser to sync with localStorage (preserve auth data)
      const authData = localStorage.getItem('circl_auth');
      const parsedAuthData = authData ? JSON.parse(authData) : undefined;
      setUser(updatedUser, parsedAuthData);

      return updatedUser;
    } catch (error) {
      return null;
    }
  };

  // Helper function to check if user is authenticated
  const isAuthenticated = (): boolean => {
    const authData = localStorage.getItem('circl_auth');
    return !!authData && !!authState.user;
  };

  // Helper function to get current auth token
  const getAuthToken = (): string | null => {
    try {
      const authData = localStorage.getItem('circl_auth');
      if (authData) {
        const { token } = JSON.parse(authData);
        return token;
      }
      return null;
    } catch {
      return null;
    }
  };

  return {
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
  };
};
