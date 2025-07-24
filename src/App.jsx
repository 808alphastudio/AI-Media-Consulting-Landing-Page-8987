import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import { useSupabase } from './hooks/useSupabase';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function App() {
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  useEffect(() => {
    // Check if Supabase is configured correctly
    const checkSupabaseConfig = async () => {
      try {
        const supabase = await import('./lib/supabase').then(module => module.default);
        // Just try to access the auth object to verify it's properly initialized
        if (supabase && supabase.auth) {
          setIsSupabaseReady(true);
        }
      } catch (err) {
        console.error("Supabase initialization error:", err);
        setConnectionError(err.message);
      }
    };
    
    checkSupabaseConfig();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage isSupabaseReady={isSupabaseReady} connectionError={connectionError} />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;