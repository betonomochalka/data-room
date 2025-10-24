import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

export const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);

      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      
      if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
        setError('Google OAuth Client ID not configured. Please check your environment variables.');
        setLoading(false);
        return;
      }

      console.log('🔑 Google Client ID:', clientId);
      console.log('🚀 Starting OAuth redirect flow...');

      // Use OAuth redirect flow instead of One Tap
      const responseType = 'code';
      
      // Build URL parameters
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: window.location.origin + '/auth/callback',
        response_type: responseType,
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      console.log('🔗 Redirecting to:', authUrl);
      console.log('🔗 URL length:', authUrl.length);
      console.log('🔗 Client ID:', clientId);
      console.log('🔗 Redirect URI:', window.location.origin + '/auth/callback');
      
      // Test the URL first
      try {
        const testUrl = new URL(authUrl);
        console.log('✅ URL is valid:', testUrl.href);
      } catch (urlError) {
        console.error('❌ Invalid URL:', urlError);
        setError('Invalid OAuth URL generated');
        setLoading(false);
        return;
      }
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
      
    } catch (err: any) {
      console.error('❌ Google login error:', err);
      setError('Failed to initialize Google login');
      setLoading(false);
    }
  };

  // Removed initializeGoogleAuth function as we're now using OAuth redirect flow

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Data Room</CardTitle>
          <CardDescription>Secure document management for your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
                    const params = new URLSearchParams({
                      client_id: clientId!,
                      redirect_uri: window.location.origin + '/auth/callback',
                      response_type: 'code',
                      scope: 'openid email profile',
                      access_type: 'offline',
                      prompt: 'select_account'
                    });
                    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
                    console.log('🔧 Test OAuth URL:', authUrl);
                    console.log('🔧 Opening in new tab for testing...');
                    window.open(authUrl, '_blank');
                  }}
                >
                  🔧 Test OAuth URL
                </Button>


            <div className="text-xs text-center text-muted-foreground">
              <p>Sign in with your Google account to access the data room</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

