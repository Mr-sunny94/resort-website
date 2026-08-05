/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/public/Home';
import Reservation from './pages/public/Reservation';
import AdminLogin from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Reservations from './pages/admin/Reservations';
import Rooms from './pages/admin/Rooms';
import Amenities from './pages/admin/Amenities';
import BlockedDates from './pages/admin/BlockedDates';
import ReceptionHours from './pages/admin/ReceptionHours';
import Gallery from './pages/admin/Gallery';
import Settings from './pages/admin/Settings';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-950 p-6 text-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md w-full border border-stone-100 dark:border-slate-800">
          <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 mb-4">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">You are signed in, but you are not authorized as an admin.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default function App() {
  React.useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reserve" element={<Reservation />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="amenities" element={<Amenities />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="blocked-dates" element={<BlockedDates />} />
              <Route path="reception-hours" element={<ReceptionHours />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}


