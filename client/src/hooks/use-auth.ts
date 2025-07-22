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
      const result = await auth.signInWithPopup(googleProvider);
      console.log('Google sign in result:', result);
      // The onAuthStateChanged will handle the rest
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
