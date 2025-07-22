// Firebase configuration for Google OAuth
// This would typically import from firebase/auth but we'll simulate the interface

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface AuthResult {
  user: User;
  credential?: any;
}

// Mock Firebase Auth for development
export const auth = {
  signInWithPopup: async (provider: any): Promise<AuthResult> => {
    // In production, this would use actual Firebase Auth
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            uid: "mock-user-id-" + Date.now(),
            email: process.env.NODE_ENV === 'development' ? "user@example.com" : "",
            displayName: process.env.NODE_ENV === 'development' ? "John Doe" : "",
            photoURL: process.env.NODE_ENV === 'development' ? "https://via.placeholder.com/100" : undefined,
          }
        });
      }, 1000);
    });
  },
  
  signOut: async (): Promise<void> => {
    return Promise.resolve();
  },
  
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    // Mock auth state
    setTimeout(() => {
      callback(null);
    }, 100);
    
    return () => {}; // unsubscribe function
  }
};

class GoogleAuthProvider {
  static PROVIDER_ID = 'google.com';
  
  static credentialFromResult(result: AuthResult) {
    return result.credential;
  }
}

export { GoogleAuthProvider };
export const googleProvider = new GoogleAuthProvider();
