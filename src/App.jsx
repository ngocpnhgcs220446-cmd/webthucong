import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Route, Routes, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import AdminNavbar from './components/AdminNavbar';
import AdminBar from './admin/components/AdminBar';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Contact from './pages/Contact';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { initAnalytics, trackEvent } from './utils/analytics';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLeads = lazy(() => import('./pages/AdminLeads'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminContact = lazy(() => import('./pages/AdminContact'));

const ProtectedRoute = ({ children }) => {
  const { isAdmin, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading admin session...</div>;
  }

  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <>
      <AdminNavbar />
      <div style={{ minHeight: 'calc(100vh - 60px)', background: '#f9f9f9' }}>
        {children}
      </div>
    </>
  );
};

function ScrollAndTrack() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);
  return null;
}

export default function App() {
  const [language, setLanguage] = useState(localStorage.getItem('experience_language') || 'en');
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  const updateLanguage = (value) => {
    setLanguage(value);
    localStorage.setItem('experience_language', value);
  };

  return (
    <AuthProvider>
      <SettingsProvider>
        <ScrollAndTrack />
        <Toaster position="top-right" />
        <AdminBar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes - Wrapped in Layout */}
            <Route element={<Layout language={language} onLanguageChange={updateLanguage}><Outlet /></Layout>}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Routes - Wrapped in ProtectedRoute */}
            <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><AdminDashboard /></Suspense></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><AdminDashboard /></Suspense></ProtectedRoute>} />
            <Route path="/admin/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/admin/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><AdminProducts /></Suspense></ProtectedRoute>} />
            <Route path="/admin/contact-info" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><AdminContact /></Suspense></ProtectedRoute>} />
            <Route path="/admin/leads" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><AdminLeads /></Suspense></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><AdminContent /></Suspense></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><AdminSettings /></Suspense></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </SettingsProvider>
    </AuthProvider>
  );
}
