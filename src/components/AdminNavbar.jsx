import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Briefcase, Mail, Settings, MessageSquare, Box } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { path: '/admin/home', label: 'Home Page', icon: <Home size={18} /> },
    { path: '/admin/services', label: 'Products', icon: <Box size={18} /> },
    { path: '/admin/about', label: 'About Page', icon: <Briefcase size={18} /> },
    { path: '/admin/content', label: 'Content', icon: <Box size={18} /> },
    { path: '/admin/contact-info', label: 'Contact Information', icon: <Mail size={18} /> },
    { path: '/admin/leads', label: 'Customer Leads', icon: <MessageSquare size={18} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="admin-navbar">
      <div className="admin-navbar-brand">
        <span className="admin-badge">Admin Workspace</span>
      </div>
      <div className="admin-navbar-links">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
      <button className="admin-logout-btn" onClick={handleLogout} title="Log Out">
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </div>
  );
}
