import React from 'react';
import { useNavigate } from 'react-router-dom';

// Redirect to login page - we only use Google OAuth now
export const Signup: React.FC = () => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return null;
};

