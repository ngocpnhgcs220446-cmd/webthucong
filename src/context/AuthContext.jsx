import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getToken, setToken, removeToken } from '../utils/apiFetch';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const SESSION_MINUTES = 15;
const CHECK_INTERVAL_MS = 60 * 1000; // check every 1 minute

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [hasSaveFn, setHasSaveFn] = useState(false);
  const adminSaveRef = useRef(null);
  const checkIntervalRef = useRef(null);

  const doLogout = useCallback(() => {
    removeToken();
    setIsAdmin(false);
    setEditMode(false);
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  const verifyToken = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsAdmin(false);
      setIsCheckingAuth(false);
      return false;
    }
    try {
      const res = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setIsAdmin(true);
        return true;
      } else {
        doLogout();
        return false;
      }
    } catch (e) {
      doLogout();
      return false;
    }
  }, [doLogout]);

  // Initial auth check on mount
  useEffect(() => {
    verifyToken().finally(() => setIsCheckingAuth(false));
  }, [verifyToken]);

  // Periodic token validation — auto-logout when JWT expires
  useEffect(() => {
    if (isAdmin) {
      checkIntervalRef.current = setInterval(async () => {
        const token = getToken();
        if (!token) {
          doLogout();
          return;
        }
        try {
          const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) {
            doLogout();
            window.location.href = '/login';
          }
        } catch {
          // Network error — don't logout, just wait
        }
      }, CHECK_INTERVAL_MS);
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [isAdmin, doLogout]);

  const login = (token) => {
    setToken(token); // sessionStorage — cleared when tab closes
    setIsAdmin(true);
  };

  const logout = doLogout;

  const toggleEditMode = () => setEditMode(prev => !prev);

  const registerSave = useCallback((fn) => {
    adminSaveRef.current = fn;
    setHasSaveFn(true);
  }, []);

  const clearSave = useCallback(() => {
    adminSaveRef.current = null;
    setHasSaveFn(false);
  }, []);

  const triggerSave = () => adminSaveRef.current && adminSaveRef.current();

  return (
    <AuthContext.Provider value={{
      isAdmin, login, logout, isCheckingAuth,
      editMode, toggleEditMode,
      registerSave, clearSave, triggerSave, hasSaveFn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// isAdminMode = admin is logged in AND (editMode is on OR on /admin/* route)
export const useAdminMode = () => {
  const { isAdmin, editMode } = useAuth();
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  return isAdmin && (editMode || isAdminRoute);
};
