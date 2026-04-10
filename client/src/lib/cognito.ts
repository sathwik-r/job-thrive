import { Amplify } from 'aws-amplify';

// Minimal Amplify configuration - disable automatic OAuth handling
const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || 'ap-south-1_6Jz6IuH4j',
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID || '55fvkviiqqa309chmtvgpmdm9g',
      // Remove OAuth config to prevent automatic token exchange
    },
  },
};

// Configure Amplify with minimal config
Amplify.configure(cognitoConfig);

export interface CognitoUser {
  userId: string;
  username: string;
  email?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export class CognitoAuth {
  static async signInWithGoogle(): Promise<void> {
    try {
      const config = {
        domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN,
        clientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID ,
        redirectUri: encodeURIComponent(window.location.origin + '/post-login')
      };
      
      // Manual OAuth URL construction to avoid Amplify's automatic token exchange
      const oauthUrl = `https://${config.domain}/oauth2/authorize?identity_provider=Google&redirect_uri=${config.redirectUri}&response_type=CODE&client_id=${config.clientId}&scope=openid+email+profile`;
      
      // Direct redirect - no Amplify interference
      window.location.href = oauthUrl;
      
    } catch (error) {
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      const config = {
        domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN || 'ap-south-16jz6iuh4j.auth.ap-south-1.amazoncognito.com',
        clientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID || '55fvkviiqqa309chmtvgpmdm9g',
        redirectUri: encodeURIComponent(window.location.origin + '/login')
      };

      // Clear local storage
      localStorage.clear();
      
      // Redirect to Cognito logout
      const logoutUrl = `https://${config.domain}/logout?client_id=${config.clientId}&logout_uri=${config.redirectUri}`;
      window.location.href = logoutUrl;
      
    } catch (error) {
      // Fallback: just clear local storage and redirect
      localStorage.clear();
      window.location.href = '/login';
    }
  }

  static getCurrentUser(): CognitoUser | null {
    // This would typically get the current user from Cognito
    // For now, we'll use our localStorage approach
    try {
      const userData = localStorage.getItem('circl_user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static async getAccessToken(): Promise<string | null> {
    // Not applicable for manual flow
    return null;
  }

  static async getIdToken(): Promise<string | null> {
    // Not applicable for manual flow
    return null;
  }
}

export default CognitoAuth; 