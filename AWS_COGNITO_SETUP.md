# AWS Cognito Setup Guide

This guide will help you set up AWS Cognito authentication with Google OAuth for your Circl application.

## Prerequisites

- AWS Account
- Google Developer Console access
- Node.js and npm installed

## Step 1: Create AWS Cognito User Pool

1. **Log in to AWS Console** and navigate to Amazon Cognito
2. **Create a User Pool**:
   - Click "Create user pool"
   - Choose "Email" as sign-in option
   - Configure password policy as needed
   - Skip MFA for now (can be enabled later)
   - Choose "Send email with Cognito" for email delivery

3. **Configure App Integration**:
   - Add an app client
   - Choose "Public client" (for web app)
   - Enable "ALLOW_USER_SRP_AUTH" and "ALLOW_REFRESH_TOKEN_AUTH"
   - Set callback URLs:
     - `http://localhost:5173/dashboard` (for development)
     - `https://yourdomain.com/dashboard` (for production)
   - Set sign-out URLs:
     - `http://localhost:5173/login` (for development)
     - `https://yourdomain.com/login` (for production)

4. **Configure OAuth 2.0**:
   - Enable OAuth 2.0 flows: Authorization code grant
   - OAuth scopes: email, openid, profile
   - Add Google as an identity provider (next step)

## Step 2: Set up Google OAuth

1. **Go to Google Cloud Console**:
   - Navigate to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Add authorized redirect URIs:
     - `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`

2. **Note down**:
   - Google Client ID
   - Google Client Secret

## Step 3: Configure Google as Identity Provider in Cognito

1. **In AWS Cognito User Pool**:
   - Go to "Sign-in experience" tab
   - Click "Add identity provider"
   - Select "Google"
   - Enter Google Client ID and Client Secret
   - Set attribute mapping:
     - Google attribute `email` → User pool attribute `email`
     - Google attribute `name` → User pool attribute `name`
     - Google attribute `picture` → User pool attribute `picture`

2. **Configure App Client**:
   - Go to "App integration" tab
   - Edit your app client
   - Enable Google as identity provider
   - Set OAuth flows and scopes

## Step 4: Configure Environment Variables

Create a `.env` file in the `client` directory:

```env
# AWS Cognito Configuration
VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_AWS_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AWS_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
```

Replace the values with:
- **VITE_AWS_USER_POOL_ID**: Found in User Pool > General settings
- **VITE_AWS_USER_POOL_CLIENT_ID**: Found in App integration > App clients
- **VITE_AWS_COGNITO_DOMAIN**: Your Cognito domain (can be custom or AWS provided)

## Step 5: Update Cognito Configuration

Edit `client/src/lib/cognito.ts` and replace the placeholder values with your actual configuration:

```typescript
const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_AWS_USER_POOL_ID || 'your-actual-user-pool-id',
      userPoolClientId: process.env.VITE_AWS_USER_POOL_CLIENT_ID || 'your-actual-client-id',
      loginWith: {
        oauth: {
          domain: process.env.VITE_AWS_COGNITO_DOMAIN || 'your-actual-domain.auth.region.amazoncognito.com',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [window.location.origin + '/dashboard'],
          redirectSignOut: [window.location.origin + '/login'],
          responseType: 'code' as const,
        },
        email: true,
      },
    },
  },
};
```

## Step 6: Test the Integration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the login page** and click "Continue with Gmail"

3. **Verify the flow**:
   - Should redirect to Google OAuth
   - After successful authentication, should redirect back to your app
   - User should be logged in and redirected to dashboard

## Troubleshooting

### Common Issues:

1. **Redirect URI Mismatch**:
   - Ensure callback URLs in Cognito match your app URLs
   - Check Google OAuth redirect URIs

2. **CORS Issues**:
   - Cognito domains should be properly configured
   - Check browser developer tools for CORS errors

3. **Token Issues**:
   - Verify OAuth scopes are correctly set
   - Check attribute mappings in identity provider settings

4. **Environment Variables**:
   - Ensure all VITE_ prefixed variables are set
   - Restart development server after changing .env

### Debug Tips:

- Check browser developer tools console for errors
- Verify network requests in Network tab
- Use AWS CloudWatch logs for Cognito debugging
- Test with a simple HTML page first if issues persist

## Security Considerations

1. **Never commit sensitive credentials** to version control
2. **Use different User Pools** for development and production
3. **Enable MFA** for production environments
4. **Regularly rotate** Google OAuth credentials
5. **Monitor AWS CloudTrail** for authentication events

## Production Deployment

1. **Update callback URLs** to production domains
2. **Set production environment variables**
3. **Enable CloudWatch logging**
4. **Configure custom domain** for Cognito (optional)
5. **Set up monitoring and alerts**

For more detailed information, refer to:
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS Amplify Auth Documentation](https://docs.amplify.aws/lib/auth/getting-started/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2) 