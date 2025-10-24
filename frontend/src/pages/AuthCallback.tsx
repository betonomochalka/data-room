import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          console.error('❌ OAuth error:', error);
          setError(`OAuth error: ${error}`);
          setLoading(false);
          return;
        }

        if (!code) {
          console.error('❌ No authorization code received');
          setError('No authorization code received');
          setLoading(false);
          return;
        }

        console.log('📝 Authorization code received:', code);

        // Exchange code for token
        const response = await api.post('/auth?action=google', {
          code: code,
          redirect_uri: window.location.origin + '/auth/callback'
        });

        if (response.data.success) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          console.log('✅ Login successful, redirecting...');
          navigate('/');
        } else {
          setError('Login failed');
        }
      } catch (err: any) {
        console.error('❌ OAuth callback error:', err);
        setError('Login failed: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing Google login...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};
