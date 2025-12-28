import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InternDashboard from './pages/InternDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/intern" 
              element={
                <ProtectedRoute requiredRole="intern">
                  <InternDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to={role === 'admin' ? '/admin' : '/intern'} replace />} />
            <Route path="/dashboard" element={<Navigate to={role === 'admin' ? '/admin' : '/intern'} replace />} />
            <Route path="/login" element={<Navigate to={role === 'admin' ? '/admin' : '/intern'} replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Navigate to="/login" replace />} />
          <Route path="/intern" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
