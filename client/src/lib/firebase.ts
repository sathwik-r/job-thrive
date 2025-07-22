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
            email: "user@example.com",
            displayName: "John Doe",
            photoURL: "https://via.placeholder.com/100",
          }
        });
      }, 1000);
    });
  },
  
  signOut: async (): Promise<void> => {
    localStorage.removeItem('circl_user');
    return Promise.resolve();
  },
  
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('circl_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setTimeout(() => callback(user), 100);
      } catch {
        setTimeout(() => callback(null), 100);
      }
    } else {
      setTimeout(() => callback(null), 100);
    }
    
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
