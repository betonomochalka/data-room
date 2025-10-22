import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthCallback } from './pages/AuthCallback';
import { DataRooms } from './pages/DataRooms';
import { DataRoomView } from './pages/DataRoomView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/" element={<DataRooms />} />
              <Route path="/data-rooms/:id" element={<DataRoomView />} />
              <Route path="/data-rooms/:id/folders/:folderId" element={<DataRoomView />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
