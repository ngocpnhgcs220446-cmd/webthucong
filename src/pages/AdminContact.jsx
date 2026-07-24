import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/apiFetch';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import { showToast, getApiErrorMessage } from '../utils/toastHelper';

function ContactGroup({ title, children }) {
  return (
    <div className="admin-section">
      <h3 className="admin-section-title">{title}</h3>
      <div className="admin-field" style={{ marginTop: '16px' }}>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', fullWidth }) {
  return (
    <div className="admin-field" style={fullWidth ? { gridColumn: '1 / -1' } : {}}>
      <label>{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function AdminContact() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadContactInformation();
  }, []);

  async function loadContactInformation() {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSettings(data || {});
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể tải thông tin liên hệ.');
      setLoadError(message);
      showToast({ type: 'error', title: 'Không thể tải dữ liệu', message });
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      // Create a payload with only the contact-specific keys
      const contactKeys = [
        'phone', 'hotline', 'email', 'address', 'workingHours',
        'googleMapsUrl', 'mapEmbed', 'facebookUrl', 'instagramUrl',
        'tiktokUrl', 'youtubeUrl', 'zaloUrl', 'whatsappUrl', 'messengerUrl'
      ];
      const payload = {};
      for (const key of contactKeys) {
        if (settings[key] !== undefined) payload[key] = settings[key];
      }

      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        showToast({ type: 'success', title: 'Đã lưu liên hệ', message: 'Thông tin liên hệ đã được cập nhật thành công.' });
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
    } catch (e) {
      showToast({ type: 'error', title: 'Không thể lưu liên hệ', message: getApiErrorMessage(e) });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <PageTransition>
      <SEO title="Contact Info | Admin" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Contact Info</h1>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Manage the contact details shown on the public website.</p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: 8 }}>
            <p style={{ color: '#6b7280' }}>Đang tải thông tin liên hệ...</p>
          </div>
        ) : loadError ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: 8, color: '#b91c1c' }}>
            <p>{loadError}</p>
            <button onClick={loadContactInformation} className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>Thử lại</button>
          </div>
        ) : !settings || Object.keys(settings).length === 0 ? (
           <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: 8 }}>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>Chưa có thông tin liên hệ. Hãy nhập thông tin và bấm Lưu thay đổi.</p>
            <button onClick={() => setSettings({
              phone: '', hotline: '', email: '', address: '', workingHours: '',
              facebookUrl: '', instagramUrl: '', tiktokUrl: '', youtubeUrl: '',
              zaloUrl: '', whatsappUrl: '', messengerUrl: '', googleMapsUrl: '', mapEmbed: ''
            })} className="admin-btn admin-btn-primary">Bắt đầu nhập</button>
          </div>
        ) : (
          <div className="admin-card">
            <form id="contactForm" onSubmit={handleSaveAll}>
              <div className="admin-form-grid-2col">

              {/* LEFT COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <ContactGroup title="Business Contact">
                  <InputField label="Hotline" value={settings.hotline} onChange={v => handleChange('hotline', v)} fullWidth />
                  <InputField label="Phone (Secondary)" value={settings.phone} onChange={v => handleChange('phone', v)} fullWidth />
                  <InputField label="Email Address" value={settings.email} onChange={v => handleChange('email', v)} type="email" fullWidth />
                  <InputField label="Address" value={settings.address} onChange={v => handleChange('address', v)} type="textarea" fullWidth />
                  <InputField label="Working Hours" value={settings.workingHours} onChange={v => handleChange('workingHours', v)} fullWidth />
                </ContactGroup>

                <ContactGroup title="Social Links">
                  <InputField label="Facebook URL" value={settings.facebookUrl} onChange={v => handleChange('facebookUrl', v)} fullWidth />
                  <InputField label="Instagram URL" value={settings.instagramUrl} onChange={v => handleChange('instagramUrl', v)} fullWidth />
                  <InputField label="TikTok URL" value={settings.tiktokUrl} onChange={v => handleChange('tiktokUrl', v)} fullWidth />
                  <InputField label="YouTube URL" value={settings.youtubeUrl} onChange={v => handleChange('youtubeUrl', v)} fullWidth />
                  <InputField label="Zalo URL" value={settings.zaloUrl} onChange={v => handleChange('zaloUrl', v)} fullWidth />
                  <InputField label="WhatsApp URL" value={settings.whatsappUrl} onChange={v => handleChange('whatsappUrl', v)} fullWidth />
                  <InputField label="Messenger URL" value={settings.messengerUrl} onChange={v => handleChange('messengerUrl', v)} fullWidth />
                </ContactGroup>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <ContactGroup title="Map">
                  <InputField label="Google Maps URL" value={settings.googleMapsUrl} onChange={v => handleChange('googleMapsUrl', v)} placeholder="Link to open in Maps" fullWidth />
                  <InputField label="Map Embed (src)" value={settings.mapEmbed} onChange={v => handleChange('mapEmbed', v)} type="textarea" placeholder="https://www.google.com/maps/embed?..." fullWidth />

                  {settings.mapEmbed && settings.mapEmbed.includes('http') && !settings.mapEmbed.trim().startsWith('<') && (
                    <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                      <label>Preview Map</label>
                      <iframe
                        title="Map preview"
                        src={settings.mapEmbed}
                        style={{ width: '100%', height: 200, border: 0, borderRadius: 8, marginTop: 4 }}
                      />
                      {settings.googleMapsUrl && (
                        <a href={settings.googleMapsUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: '#166534', fontWeight: 600 }}>
                          ↗ Open in Google Maps
                        </a>
                      )}
                    </div>
                  )}
                </ContactGroup>

                <ContactGroup title="Public Preview">
                  <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>This is how your primary contact info will appear:</p>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
                      {settings.hotline && <p style={{ margin: '0 0 8px', fontSize: 14 }}><strong>Hotline:</strong> {settings.hotline}</p>}
                      {settings.email && <p style={{ margin: '0 0 8px', fontSize: 14 }}><strong>Email:</strong> {settings.email}</p>}
                      {settings.address && <p style={{ margin: '0 0 8px', fontSize: 14 }}><strong>Address:</strong> {settings.address}</p>}

                      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        {settings.facebookUrl && <span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: 20, fontSize: 12 }}>Facebook</span>}
                        {settings.instagramUrl && <span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: 20, fontSize: 12 }}>Instagram</span>}
                        {settings.zaloUrl && <span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: 20, fontSize: 12 }}>Zalo</span>}
                      </div>
                    </div>
                  </div>
                </ContactGroup>
              </div>

            </div>
          </form>

          <div className="admin-actions">
            <button type="submit" form="contactForm" disabled={isSaving} className="admin-btn admin-btn-primary">
              {isSaving ? 'Saving...' : 'Save Contact Info'}
            </button>
          </div>
        </div>
        )}
      </div>
    </PageTransition>
  );
}
