import React, { useState } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function LeadAdminCard({ lead, onUpdate, onClose }) {
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState({
    status: lead.status || 'new',
    assignedTo: lead.assignedTo || '',
    internalNote: lead.internalNote || '',
    estimatedRevenue: lead.estimatedRevenue || 0,
    bookingDate: lead.bookingDate || null,
    bookingEndDate: lead.bookingEndDate || null,
    bookingLocation: lead.bookingLocation || '',
    bookingType: lead.bookingType || '',
    capacity: lead.capacity || '',
    attendees: lead.attendees || '',
    bookingNote: lead.bookingNote || '',
    lostReason: lead.lostReason || ''
  });
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    const toastId = toast.loading('Saving lead...');
    try {
      const res = await apiFetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lastContactedAt: new Date().toISOString() })
      });
      const resData = await res.json();
      if (res.ok) {
        onUpdate();
        toast.success('Lead updated successfully', { id: toastId });
      } else {
        if (resData.fields) {
          setErrors(resData.fields);
          toast.error('Please fix validation errors', { id: toastId });
        } else {
          toast.error(resData.error || 'Failed to update lead', { id: toastId });
        }
      }
    } catch (e) {
      toast.error('Failed to update lead', { id: toastId });
    }
    setIsSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', zIndex: 9999,
      display: 'flex', justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Slide-over panel */}
      <div style={{
        width: '100%', maxWidth: '600px', height: '100%',
        background: 'var(--white)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--white)', position: 'sticky', top: 0, zIndex: 10
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--green-darkest)' }}>Lead: {lead.referenceCode || 'N/A'}</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontSize: '13px' }}>Created: {new Date(lead.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-light)' }} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Customer Info Section */}
          <section>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text)', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>Customer Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Name</span>
                <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{lead.name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Phone</span>
                <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{lead.phone}</strong>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Email</span>
                <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{lead.email}</strong>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Interested In</span>
                <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{lead.serviceNameSnapshot || lead.serviceId || 'General Inquiry'}</span>
                {lead.packageNameSnapshot && (
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    Package: {lead.packageNameSnapshot}
                  </div>
                )}
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Requested Date</span>
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>{lead.date || 'Flexible'}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Requested Time</span>
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>{lead.preferredTime || 'Flexible'}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Guests</span>
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>{lead.guests || 'N/A'}</span>
              </div>
              {lead.message && (
                <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Customer Message</span>
                  <div style={{ fontSize: '13px', color: 'var(--text)', background: 'var(--white)', padding: '12px', borderRadius: '6px', border: '1px solid var(--line)', whiteSpace: 'pre-wrap' }}>
                    {lead.message}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Lead Management Section */}
          <section>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text)', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>Lead Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Status</span>
                <select value={data.status} onChange={e => setData(d => ({ ...d, status: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="lost">Lost</option>
                </select>
              </label>

              <label>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Assigned To</span>
                <input value={data.assignedTo} onChange={e => setData(d => ({ ...d, assignedTo: e.target.value }))} placeholder="Rep Name" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
              </label>

              {data.status === 'lost' && (
                <label style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Lost Reason <span style={{ color: 'red' }}>*</span></span>
                  <input value={data.lostReason} onChange={e => setData(d => ({ ...d, lostReason: e.target.value }))} placeholder="Why was it lost?" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: errors.lostReason ? '1px solid red' : '1px solid var(--line)' }} required />
                  {errors.lostReason && <span style={{ color: 'red', fontSize: '12px' }}>{errors.lostReason}</span>}
                </label>
              )}

              <label>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Est. Revenue ($)</span>
                <input type="number" inputMode="numeric" min="0" value={data.estimatedRevenue} onChange={e => setData(d => ({ ...d, estimatedRevenue: e.target.value.replace(/\D/g, '') }))} placeholder="0" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
              </label>

              <label style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Internal Note</span>
                <textarea value={data.internalNote} onChange={e => setData(d => ({ ...d, internalNote: e.target.value }))} placeholder="Private notes for team..." rows="2" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', resize: 'vertical' }} />
              </label>
            </div>
          </section>

          {/* Booking Schedule Section */}
          <section>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text)', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>Booking Schedule</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Event Date/Time</span>
                <input type="datetime-local" value={data.bookingDate ? new Date(new Date(data.bookingDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => setData(d => ({ ...d, bookingDate: e.target.value ? new Date(e.target.value).toISOString() : null }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
              </label>

              <label>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>End Time</span>
                <input type="datetime-local" value={data.bookingEndDate ? new Date(new Date(data.bookingEndDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => setData(d => ({ ...d, bookingEndDate: e.target.value ? new Date(e.target.value).toISOString() : null }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
              </label>

              <label>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Type</span>
                <select value={data.bookingType || ''} onChange={e => setData(d => ({ ...d, bookingType: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <option value="">None</option>
                  <option value="offline">Offline Workshop</option>
                  <option value="online">Online Class</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="private">Private Group</option>
                </select>
              </label>

              <label>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Total Attendees</span>
                <input type="number" inputMode="numeric" min="0" max="999" value={data.attendees || ''} onChange={e => setData(d => ({ ...d, attendees: e.target.value.replace(/\D/g, '') }))} placeholder="0" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
              </label>

              <label style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Location</span>
                <input value={data.bookingLocation || ''} onChange={e => setData(d => ({ ...d, bookingLocation: e.target.value }))} placeholder="Workshop address or Zoom link..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
              </label>

              <label style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Booking Note (Internal)</span>
                <textarea value={data.bookingNote || ''} onChange={e => setData(d => ({ ...d, bookingNote: e.target.value }))} placeholder="Any special arrangements for the event..." rows="2" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', resize: 'vertical' }} />
              </label>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'flex-end', gap: '12px',
          background: '#f9fafb'
        }}>
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Updates'}
          </button>
        </div>
        
      </div>
      
      {/* Required simple keyframes for animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
