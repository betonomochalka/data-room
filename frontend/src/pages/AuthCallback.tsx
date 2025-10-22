import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 [AuthCallback] Starting authentication callback...');
        
        // Get the session from Supabase after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('📦 [AuthCallback] Session data:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          provider: session?.user?.app_metadata?.provider,
        });
        
        if (sessionError) {
          console.error('❌ [AuthCallback] Session error:', sessionError);
          throw sessionError;
        }
        
        if (!session) {
          console.error('❌ [AuthCallback] No session found');
          setError('No authentication session found. Please try again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        if (!session.user) {
          console.error('❌ [AuthCallback] No user data in session');
          console.log('Session keys:', Object.keys(session));
          setError('Google authentication incomplete. Please try again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        console.log('✅ [AuthCallback] Got valid session with user data');
        console.log('👤 [AuthCallback] User:', {
          id: session.user.id,
          email: session.user.email,
        });
        
        // Send Supabase user data to our backend to create/get user in our database
        console.log('📤 [AuthCallback] Sending user data to backend API...');
        const response = await api.post('/auth/google', {
          supabaseUser: session.user,
        });
        
        console.log('✅ [AuthCallback] Backend response:', {
          success: response.data.success,
          hasUser: !!response.data.data?.user,
          hasToken: !!response.data.data?.token,
        });
        
        // Store our JWT token
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
          console.log('✅ [AuthCallback] JWT token stored');
        }
        
        // Store user data
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          console.log('✅ [AuthCallback] User data stored:', response.data.data.user.email);
        }
        
        // Redirect to home
        console.log('🚀 [AuthCallback] Redirecting to home page...');
        navigate('/');
        
      } catch (error: any) {
        console.error('💥 [AuthCallback] Error during authentication:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          fullError: error,
        });
        
        const errorMessage = error.response?.data?.error || error.message || 'Failed to complete authentication';
        setError(errorMessage);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Signing you in...</h2>
            <p className="text-gray-600">Please wait while we complete your authentication</p>
          </>
        )}
      </div>
    </div>
  );
};

