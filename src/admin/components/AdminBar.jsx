import React, { useState, useEffect } from 'react';
import { useAuth, useAdminMode } from '../../context/AuthContext';
import { Eye, Save, Pencil } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function AdminBar() {
  const { isAdmin, editMode, toggleEditMode, triggerSave, hasSaveFn } = useAuth();
  const isAdminMode = useAdminMode();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  if (!isAdmin || !location.pathname.startsWith('/admin')) return null;

  const handleSave = async () => {
    if (!hasSaveFn) return;
    setIsSaving(true);
    try {
      await triggerSave();
    } finally {
      setIsSaving(false);
    }
  };

  // Contextual title based on current path
  let contextTitle = '';
  if (location.pathname === '/admin/home') contextTitle = 'Editing Home Page';
  else if (location.pathname === '/admin/services') contextTitle = 'Managing Products';
  else if (location.pathname === '/admin/about') contextTitle = 'Editing About Page';
  else if (location.pathname === '/admin/contact') contextTitle = 'Editing Contact Settings';
  
  // If there's no specific context and we don't have save function/edit mode, hide the bar completely
  if (!contextTitle && !hasSaveFn) return null;

  return (
    <div
      className="admin-floating-bar"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(16px)',
      }}
    >
      <div className="admin-floating-brand">
        <div className="admin-floating-dot" />
        <span style={{ fontWeight: 600 }}>{contextTitle || 'Admin Mode'}</span>
      </div>

      <div className="admin-floating-divider" />

      {/* Edit mode toggle (only if relevant to inline editing) */}
      <button
        className={`admin-edit-toggle ${isAdminMode ? 'active' : ''}`}
        onClick={toggleEditMode}
        title={isAdminMode ? 'Exit Edit Mode' : 'Turn on Edit Mode'}
      >
        {isAdminMode ? <Eye size={14} /> : <Pencil size={14} />}
        <span>{isAdminMode ? 'Preview Mode' : 'Edit Mode'}</span>
      </button>

      {/* Save button — shown when a page has registered a save function */}
      {isAdminMode && hasSaveFn && (
        <button
          className="admin-save-btn"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save size={14} />
          <span>{isSaving ? 'Saving…' : 'Save changes'}</span>
        </button>
      )}
    </div>
  );
}
