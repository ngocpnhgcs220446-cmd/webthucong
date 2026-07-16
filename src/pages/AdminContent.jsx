import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/apiFetch';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import ImageUploader from '../components/ImageUploader';
import Editable from '../components/Editable';
import { Plus, Trash2, Edit2, Check, X, MoveUp, MoveDown } from 'lucide-react';

function TestimonialCard({ data, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(!data.id);
  const [form, setForm] = useState(data);

  const save = () => {
    if (!form.name || !form.name.trim()) return alert('Name is required');
    if (!form.comment || !form.comment.trim()) return alert('Comment is required');
    onUpdate(data.id, form);
    setIsEditing(false);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ padding: '6px 14px', border: '1px solid #166534', borderRadius: 8, background: '#fff', color: '#166534', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Edit2 size={14} /> Edit
          </button>
        )}
        <button onClick={() => onDelete(data.id)} style={{ padding: '6px 14px', border: '1px solid #ef4444', borderRadius: 8, background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb' }}>
        {isEditing ? (
          <ImageUploader value={form.avatar} onUpload={url => setForm({ ...form, avatar: url })} />
        ) : (
          <img src={form.avatar || '/pics/avatar-placeholder.jpg'} alt={form.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: 160 }}>
        {isEditing ? (
          <>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role" style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Comment" rows={3} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }} />
            <div>
              <button onClick={save} className="admin-btn admin-btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>Save Testimonial</button>
            </div>
          </>
        ) : (
          <>
            <h4 style={{ margin: 0, fontSize: 16, color: '#111827' }}>{form.name}</h4>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>{form.role}</div>
            <p style={{ fontSize: '14px', margin: 0, color: '#374151', fontStyle: 'italic' }}>"{form.comment}"</p>
          </>
        )}
      </div>
    </div>
  );
}

function PartnerCard({ data, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(!data.id);
  const [form, setForm] = useState(data);

  const save = () => {
    if (!form.name || !form.name.trim()) return alert('Partner name is required');
    onUpdate(data.id, form);
    setIsEditing(false);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 24, position: 'relative', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ padding: '6px 14px', border: '1px solid #166534', borderRadius: 8, background: '#fff', color: '#166534', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Edit2 size={14} /> Edit
          </button>
        )}
        <button onClick={() => onDelete(data.id)} style={{ padding: '6px 14px', border: '1px solid #ef4444', borderRadius: 8, background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <div style={{ width: '120px', height: '80px', background: '#f9fafb', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isEditing ? (
          <ImageUploader value={form.logo} onUpload={url => setForm({ ...form, logo: url })} />
        ) : (
          <img src={form.logo} alt={form.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 8 }} />
        )}
      </div>

      <div style={{ flex: 1, paddingRight: 160 }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Partner Name" style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <button onClick={save} className="admin-btn admin-btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>Save Partner</button>
          </div>
        ) : (
          <h4 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{form.name}</h4>
        )}
      </div>
    </div>
  );
}

function FAQCard({ data, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(!data.id);
  const [form, setForm] = useState(data);

  const save = () => {
    if (!form.question || !form.question.trim()) return alert('Question is required');
    if (!form.answer || !form.answer.trim()) return alert('Answer is required');
    onUpdate(data.id, form);
    setIsEditing(false);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', position: 'relative', opacity: form.active ? 1 : 0.6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ padding: '6px 14px', border: '1px solid #166534', borderRadius: 8, background: '#fff', color: '#166534', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Edit2 size={14} /> Edit
          </button>
        )}
        <button onClick={() => onDelete(data.id)} style={{ padding: '6px 14px', border: '1px solid #ef4444', borderRadius: 8, background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: 160 }}>
        {isEditing ? (
          <>
            <input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="Question" style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 'bold' }} />
            <textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} placeholder="Answer" rows={3} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 16, height: 16 }} />
                Active (Visible on website)
              </label>
              <button onClick={save} className="admin-btn admin-btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>Save FAQ</button>
            </div>
          </>
        ) : (
          <>
            <h4 style={{ margin: 0, fontSize: 16, color: '#111827' }}>{form.question}</h4>
            <p style={{ fontSize: '14px', margin: 0, color: '#4b5563', lineHeight: 1.5 }}>{form.answer}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminContent() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('testimonials');

  const [testimonials, setTestimonials] = useState([]);
  const [partners, setPartners] = useState([]);
  const [faqs, setFaqs] = useState([]);

  const fetchData = async () => {
    try {
      const [tRes, pRes, fRes] = await Promise.all([
        fetch('/api/testimonials').then(r => r.json()),
        fetch('/api/partners').then(r => r.json()),
        fetch('/api/faqs').then(r => r.json())
      ]);
      setTestimonials(tRes);
      setPartners(pRes);
      setFaqs(fRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!isAdmin) return null;

  const handleCreate = async (endpoint, draftId, data, setter) => {
    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const newItem = await res.json();
        setter(prev => prev.map(item => item.id === draftId ? newItem : item));
      }
    } catch (e) {
      alert('Failed to create item');
    }
  };

  const handleUpdate = async (endpoint, id, data, setter) => {
    if (String(id).startsWith('draft-')) {
      // It's a new item being saved for the first time
      handleCreate(endpoint, id, data, setter);
      return;
    }
    try {
      const res = await apiFetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updatedItem = await res.json();
        setter(prev => prev.map(item => item.id === id ? updatedItem : item));
      }
    } catch (e) {
      alert('Failed to update item');
    }
  };

  const handleDelete = async (endpoint, id, setter) => {
    if (!id) {
      // It's a draft item that wasn't saved yet
      setter(prev => prev.filter(item => item.id !== id));
      return;
    }
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setter(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      alert('Failed to delete item');
    }
  };

  const addDraftTestimonial = () => {
    setTestimonials([{ id: `draft-${crypto.randomUUID()}`, name: 'New Client', role: 'Role', comment: '...', avatar: '' }, ...testimonials]);
  };

  const addDraftPartner = () => {
    setPartners([{ id: `draft-${crypto.randomUUID()}`, name: 'New Partner', logo: '' }, ...partners]);
  };

  const addDraftFaq = () => {
    setFaqs([{ id: `draft-${crypto.randomUUID()}`, question: 'New Question?', answer: 'Answer...', active: true }, ...faqs]);
  };

  return (
    <PageTransition>
      <SEO title="Manage Content | Admin" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Content Management</h1>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Manage testimonials, partners, and FAQs.</p>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {['Testimonials', 'Partners', 'FAQs'].map(opt => {
              const value = opt.toLowerCase();
              const active = activeTab === value;
              return (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  style={{
                    padding: '6px 16px', borderRadius: 20, fontSize: 14, cursor: 'pointer', fontWeight: active ? 700 : 500,
                    border: active ? '1.5px solid #166534' : '1px solid #d1d5db',
                    background: active ? '#f0fdf4' : '#fff', color: active ? '#166534' : '#6b7280', transition: 'all .15s'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div style={{ border: 'none' }}>
            {activeTab === 'testimonials' && (
              <div>
                <button className="admin-btn admin-btn-primary" onClick={addDraftTestimonial} style={{ marginBottom: '20px' }}><Plus size={16} /> Add Testimonial</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {testimonials.map((t, idx) => (
                    <TestimonialCard
                      key={t.id || idx}
                      data={t}
                      onUpdate={(id, data) => handleUpdate('/api/testimonials', id, data, setTestimonials)}
                      onDelete={(id) => handleDelete('/api/testimonials', id, setTestimonials)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'partners' && (
              <div>
                <button className="admin-btn admin-btn-primary" onClick={addDraftPartner} style={{ marginBottom: '20px' }}><Plus size={16} /> Add Partner</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {partners.map((p, idx) => (
                    <PartnerCard
                      key={p.id || idx}
                      data={p}
                      onUpdate={(id, data) => handleUpdate('/api/partners', id, data, setPartners)}
                      onDelete={(id) => handleDelete('/api/partners', id, setPartners)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faqs' && (
              <div>
                <button className="admin-btn admin-btn-primary" onClick={addDraftFaq} style={{ marginBottom: '20px' }}><Plus size={16} /> Add FAQ</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {faqs.map((f, idx) => (
                    <FAQCard
                      key={f.id || idx}
                      data={f}
                      onUpdate={(id, data) => handleUpdate('/api/faqs', id, data, setFaqs)}
                      onDelete={(id) => handleDelete('/api/faqs', id, setFaqs)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
