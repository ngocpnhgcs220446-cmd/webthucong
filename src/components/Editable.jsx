import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useAdminMode } from '../context/AuthContext';
import { Check, X, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const DRAFT_KEY = 'editable_draft';

export default function Editable({ 
  value, 
  onSave, 
  type = 'text', 
  tag: Tag = 'span',
  className = '',
  style = {}
}) {
  const isAdminMode = useAdminMode();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) inputRef.current.select();
      
      // Check for draft
      try {
        const draftStr = localStorage.getItem(DRAFT_KEY);
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          if (draft.originalValue === value && draft.tempValue !== value) {
            // Found a valid draft for this exact field
            setTempValue(draft.tempValue);
            toast('Restored unsaved draft', { icon: '📝', duration: 2000, style: { fontSize: '13px' } });
          }
        }
      } catch (e) {}
    }
  }, [isEditing, value]);

  // Auto-save draft
  useEffect(() => {
    if (isEditing && tempValue !== value) {
      const draft = { originalValue: value, tempValue, timestamp: Date.now() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [tempValue, isEditing, value]);

  if (!isAdminMode) {
    return <Tag className={className} style={style}>{value}</Tag>;
  }

  const handleSave = async (e) => {
    if (e) e.stopPropagation();
    if (tempValue === value) {
      localStorage.removeItem(DRAFT_KEY);
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(tempValue);
      localStorage.removeItem(DRAFT_KEY);
      toast.success('Saved!', { duration: 1500, style: { fontSize: '13px' } });
    } catch (err) {
      toast.error('Failed to save');
      setTempValue(value);
    }
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = (e) => {
    if (e) e.stopPropagation();
    localStorage.removeItem(DRAFT_KEY);
    setTempValue(value);
    setIsEditing(false);
  };

  const handleRestoreOriginal = (e) => {
    if (e) e.stopPropagation();
    setTempValue(value);
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (type !== 'textarea' || e.metaKey || e.ctrlKey) {
        e.preventDefault();
        handleSave();
      }
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const adjustHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    if (isEditing) {
      adjustHeight();
    }
  }, [tempValue, isEditing]);

  const handleFocus = (e) => {
    const val = e.target.value;
    e.target.value = '';
    e.target.value = val;
  };

  if (isEditing) {
    return (
      <Tag
        className={`editable-text-editing ${className}`}
        style={{ ...style, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <textarea
          ref={inputRef}
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="editable-text-input"
          placeholder="Click to edit"
          rows={1}
          style={{
            font: 'inherit',
            color: 'inherit',
            lineHeight: 'inherit',
            letterSpacing: 'inherit',
            textAlign: 'inherit',
            fontWeight: 'inherit',
            width: '100%',
            minWidth: '50px',
            margin: 0,
            padding: 0,
            border: 0,
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            overflow: 'hidden',
            boxSizing: 'border-box',
            display: 'block'
          }}
        />

        <div className="editable-actions" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, display: 'flex', gap: '4px', marginTop: '4px' }}>
          <button
            className="editable-action-btn save"
            onClick={handleSave}
            disabled={isSaving}
            title="Save (Enter or Cmd+Enter)"
          >
            <Check size={13} strokeWidth={3} />
          </button>
          {tempValue !== value && (
            <button
              className="editable-action-btn"
              style={{ background: '#f0f0f0', color: '#666' }}
              onClick={handleRestoreOriginal}
              title="Reset to original"
            >
              <RotateCcw size={13} strokeWidth={3} />
            </button>
          )}
          <button
            className="editable-action-btn cancel"
            onClick={handleCancel}
            title="Cancel (Esc)"
          >
            <X size={13} strokeWidth={3} />
          </button>
        </div>
      </Tag>
    );
  }

  return (
    <Tag
      className={`editable-text-display ${className}`}
      style={{
        ...style,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: '2px solid transparent',
        outlineOffset: '2px'
      }}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      title="Click to edit"
      onMouseEnter={e => e.currentTarget.style.outlineColor = 'rgba(59, 130, 246, 0.3)'}
      onMouseLeave={e => e.currentTarget.style.outlineColor = 'transparent'}
    >
      {value || <span style={{ opacity: 0.5 }}>Click to edit</span>}
    </Tag>
  );
}
