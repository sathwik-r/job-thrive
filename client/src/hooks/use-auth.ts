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
    // Clear all storage on app start for fresh experience
    localStorage.clear();
    
    // Check for mock user first (for testing)
    const mockUser = localStorage.getItem('circl_mock_user');
    if (mockUser) {
      try {
        const user = JSON.parse(mockUser);
        setAuthState({ user, loading: false, error: null });
        return;
      } catch (error) {
        localStorage.removeItem('circl_mock_user');
      }
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Send user data to backend to create/update user
          const response = await apiRequest('POST', '/api/auth/google', {
            email: firebaseUser.email,
            name: firebaseUser.displayName || '',
            googleId: firebaseUser.uid,
            photoUrl: firebaseUser.photoURL,
          });
          
          const user = await response.json();
          // Save user to localStorage for persistence
          localStorage.setItem('circl_user', JSON.stringify(firebaseUser));
          setAuthState({ user, loading: false, error: null });
        } catch (error) {
          console.error('Auth error:', error);
          setAuthState({ 
            user: null, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Authentication failed' 
          });
        }
      } else {
        setAuthState({ user: null, loading: false, error: null });
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      
      // Store mock user
      localStorage.setItem('circl_mock_user', JSON.stringify(mockUser));
      setAuthState({ user: mockUser, loading: false, error: null });
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
      await auth.signOut();
      localStorage.removeItem('circl_mock_user');
      localStorage.removeItem('circl_user');
      setAuthState({ user: null, loading: false, error: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle,
    signOut,
  };
};
