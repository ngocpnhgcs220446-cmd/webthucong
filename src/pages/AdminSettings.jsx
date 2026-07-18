import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { apiFetch } from '../utils/apiFetch';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import ImageUploader from '../components/ImageUploader';
import toast from 'react-hot-toast';

function SettingsGroup({ title, children, description }) {
  return (
    <div className="admin-section">
      <h3 className="admin-section-title">{title}</h3>
      {description && <p className="admin-section-description">{description}</p>}
      <div className="admin-field" style={{ marginTop: '16px' }}>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', required, error, fullWidth }) {
  return (
    <div className="admin-field" style={fullWidth ? { gridColumn: '1 / -1' } : {}}>
      <label>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ border: error ? '1px solid #ef4444' : '' }}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ border: error ? '1px solid #ef4444' : '' }}
        />
      )}
      {error && <span style={{ color: '#ef4444', fontSize: '12px' }}>{error}</span>}
    </div>
  );
}

export default function AdminSettings() {
  const { isAdmin } = useAuth();
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(console.error);
  }, []);

  const handleChange = (key, value) => {
    if (key === 'hotline') value = value.replace(/\D/g, '');
    setSettings(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrors({});
    const toastId = toast.loading('Saving settings...');
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Settings saved successfully', { id: toastId });
        await refreshSettings(); // Sync global state
        fetch('/api/settings').then(r => r.json()).then(setSettings).catch(console.error);
      } else {
        if (data.fields) {
          setErrors(data.fields);
          toast.error('Please fix the highlighted fields', { id: toastId });
        } else {
          toast.error(data.error || 'Failed to save settings', { id: toastId });
        }
      }
    } catch (e) {
      toast.error('Failed to save settings', { id: toastId });
    }
    setIsSaving(false);
  };

  if (!isAdmin) return null;

  return (
    <PageTransition>
      <SEO title="Settings | Admin" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Settings</h1>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Manage brand, theme, and SEO settings.</p>
          </div>
        </div>

        <div className="admin-card">
          <form id="settingsForm" onSubmit={handleSaveAll}>
            <div className="admin-form-grid-2col">

              {/* LEFT COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SettingsGroup title="Brand & SEO" description="Visual identity and search engine information.">
                  <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Company Logo</label>
                    <div className="image-upload-panel" style={{ minHeight: '200px' }}>
                      <ImageUploader value={settings.logo} onUpload={url => handleChange('logo', url)} />
                    </div>
                  </div>
                  <InputField label="Site Title" value={settings.siteTitle} onChange={v => handleChange('siteTitle', v)} placeholder="e.g. Conical Hat Workshop" fullWidth />
                  <InputField label="Site Description (SEO)" value={settings.siteDescription} onChange={v => handleChange('siteDescription', v)} type="textarea" placeholder="Meta description for search engines" fullWidth />
                </SettingsGroup>

                <SettingsGroup title="Contact Shortcut" description="Manage your phone, email, map, and social media links.">
                  <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '14px', marginBottom: '16px' }}>Contact information is managed separately.</p>
                    <a href="/admin/contact" style={{ display: 'inline-block', padding: '10px 16px', background: '#e2e8f0', color: '#1e293b', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                      Edit Contact Info →
                    </a>
                  </div>
                </SettingsGroup>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SettingsGroup title="Business Information" description="Official company details.">
                  <InputField label="Company Name" value={settings.companyName} onChange={v => handleChange('companyName', v)} required error={errors.companyName} fullWidth />
                  <InputField label="Tagline" value={settings.tagline} onChange={v => handleChange('tagline', v)} fullWidth />
                  <InputField label="Short Intro" value={settings.shortIntro} onChange={v => handleChange('shortIntro', v)} type="textarea" placeholder="Brief summary of your business" fullWidth />
                  <InputField label="Tax Code" value={settings.taxCode} onChange={v => handleChange('taxCode', v)} fullWidth />
                </SettingsGroup>
              </div>

            </div>
          </form>

          <div className="admin-actions">
            <button type="submit" form="settingsForm" disabled={isSaving} className="admin-btn admin-btn-primary">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
