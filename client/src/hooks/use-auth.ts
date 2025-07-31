import { useState, useEffect } from 'react';
import { auth, GoogleAuthProvider, googleProvider, type User as FirebaseUser } from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';
import { type User } from '@shared/schema';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Simplified mock authentication for demo
    const mockUser = localStorage.getItem('circl_mock_user');
    if (mockUser) {
      try {
        const user = JSON.parse(mockUser);
        console.log('Loading mock user:', user);
        setAuthState({ user, loading: false, error: null });
        return;
      } catch (error) {
        console.error('Error loading mock user:', error);
        localStorage.removeItem('circl_mock_user');
      }
    }
    
    // Set loading to false if no user found
    setAuthState(prev => ({ ...prev, loading: false }));
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      console.log('Starting sign in...');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock user that hasn't completed onboarding
      const mockUser = {
        id: 1,
        email: "john.doe@gmail.com",
        name: "John Doe",
        googleId: "mock-google-id-1",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        company: null,
        role: "both" as const,
        totalEarnings: "0.00",
        totalSpent: "0.00",
        successfulReferrals: 0,
        active: true,
        onboardingCompleted: false, // Key: starts with incomplete onboarding
        position: null,
        department: null,
        workExperience: null,
        education: null,
        targetDomain: null,
        targetRole: null,
        experience: null,
        skills: null,
        createdAt: new Date(),
      };
      
      console.log('Created mock user:', mockUser);
      
      // Store mock user
      localStorage.setItem('circl_mock_user', JSON.stringify(mockUser));
      setAuthState({ user: mockUser, loading: false, error: null });
      
      console.log('Sign in completed successfully');
    } catch (error) {
      console.error('Google sign in error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      localStorage.clear(); // Clear all data for fresh start
      setAuthState({ user: null, loading: false, error: null });
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Helper function to clear storage for testing
  const clearStorage = () => {
    localStorage.clear();
    setAuthState({ user: null, loading: false, error: null });
    window.location.reload();
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle,
    signOut,
    clearStorage,
  };
};
