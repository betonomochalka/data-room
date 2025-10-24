import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { api } from '../lib/api';

export const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


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

      // Check if Google script is already loaded
      if (window.google?.accounts?.id) {
        initializeGoogleAuth(clientId);
      } else {
        // Load Google Identity Services
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          console.log('📜 Google script loaded');
          initializeGoogleAuth(clientId);
        };

        script.onerror = () => {
          console.error('❌ Failed to load Google script');
          setError('Failed to load Google authentication');
          setLoading(false);
        };
      }
    } catch (err: any) {
      console.error('❌ Google login error:', err);
      setError('Failed to initialize Google login');
      setLoading(false);
    }
  };

  const initializeGoogleAuth = (clientId: string) => {
    try {
      console.log('🚀 Initializing Google Auth with client ID:', clientId);
      
      if (!window.google?.accounts?.id) {
        console.error('❌ Google accounts not available');
        setError('Google authentication not available');
        setLoading(false);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            console.log('📝 Google callback received');
            const result = await api.post('/auth?action=google', {
              credential: response.credential,
            });

            if (result.data.success) {
              localStorage.setItem('token', result.data.data.token);
              localStorage.setItem('user', JSON.stringify(result.data.data.user));
              navigate('/');
            }
          } catch (err: any) {
            console.error('❌ API call failed:', err);
            setError('Google login failed');
          } finally {
            setLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt();
      console.log('✅ Google prompt triggered');
    } catch (err) {
      console.error('❌ Google auth initialization failed:', err);
      setError('Failed to initialize Google authentication');
      setLoading(false);
    }
  };

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

            <div className="text-xs text-center text-muted-foreground">
              <p>Sign in with your Google account to access the data room</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

