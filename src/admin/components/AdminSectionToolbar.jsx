import React from 'react';
import { ChevronUp, ChevronDown, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useAdminMode } from '../../context/AuthContext';

const SECTION_LABELS = {
  hero: 'Hero',
  marquee: 'Marquee',
  values: 'Why Us',
  intro: 'Our Story',
  featured: 'Featured',
  gallery: 'Gallery',
  testimonials: 'Reviews',
  cta: 'CTA',
};

export default function AdminSectionToolbar({ index, sectionName, totalSections, moveSection, toggleVisibility, isHidden }) {
  const isAdminMode = useAdminMode();
  if (!isAdminMode) return null;

  const label = SECTION_LABELS[sectionName] || sectionName;

  return (
    <div className={`section-toolbar ${isHidden ? 'hidden' : ''}`}>
      <div className="section-toolbar-inner">
        <GripVertical size={13} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
        <span className="section-toolbar-label">{label}</span>
        {isHidden && <span className="section-hidden-badge">Hidden</span>}

        <div className="section-toolbar-actions">
          {moveSection && (
            <>
              <button
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
                className="section-toolbar-btn"
                title="Move Up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => moveSection(index, 'down')}
                disabled={index === totalSections - 1}
                className="section-toolbar-btn"
                title="Move Down"
              >
                <ChevronDown size={14} />
              </button>
            </>
          )}

          {toggleVisibility && (
            <button
              onClick={() => toggleVisibility(sectionName)}
              className={`section-toolbar-btn ${isHidden ? 'warn' : ''}`}
              title={isHidden ? 'Show Section' : 'Hide Section'}
            >
              {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
