/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ClientDashboard } from './pages/ClientDashboard';
import { CarrierDashboard } from './pages/CarrierDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: 'CLIENT' | 'CARRIER' | 'ADMIN' }) => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== role) {
    return <Navigate to={user.role === 'CLIENT' ? '/client' : user.role === 'ADMIN' ? '/admin' : '/carrier'} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAppContext();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={
          user ? (
            <Navigate to={user.role === 'CLIENT' ? '/client' : user.role === 'ADMIN' ? '/admin' : '/carrier'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="client" element={
          <ProtectedRoute role="CLIENT">
            <ClientDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="carrier" element={
          <ProtectedRoute role="CARRIER">
            <CarrierDashboard />
          </ProtectedRoute>
        } />

        <Route path="admin" element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
