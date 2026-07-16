import React, { useState } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import toast from 'react-hot-toast';

export default function LeadAdminCard({ lead, onUpdate }) {
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
    <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      <div>
        <strong style={{ display: 'block', fontSize: '18px', color: 'var(--green-darkest)', marginBottom: '8px' }}>{lead.name}</strong>
        <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '4px' }}>📞 {lead.phone}</div>
        <div style={{ color: 'var(--muted)', fontSize: '14px' }}>✉️ {lead.email}</div>
      </div>
      <div>
        <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px' }}><strong>Service:</strong> {lead.serviceNameSnapshot || lead.serviceId || 'Need consultation'}</div>
        <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px' }}><strong>Date:</strong> {lead.date || 'Flexible'}</div>
        <div style={{ color: 'var(--muted)', fontSize: '14px' }}><strong>Guests:</strong> {lead.guests || 'N/A'}</div>
      </div>
      <div style={{ gridColumn: '1 / -1', background: 'var(--soft-bg)', padding: '16px', borderRadius: '8px', fontSize: '14px' }}>
        <strong>Message from Customer:</strong><br />
        {lead.message || 'No message provided.'}
      </div>

      <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--line)', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
        <label style={{ flex: 1, minWidth: '150px' }}>
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

        <label style={{ flex: 1, minWidth: '150px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Assigned To</span>
          <input value={data.assignedTo} onChange={e => setData(d => ({ ...d, assignedTo: e.target.value }))} placeholder="Sales Rep Name" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
        </label>

        {data.status === 'lost' && (
          <label style={{ flex: 1, minWidth: '150px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Lost Reason <span style={{ color: 'red' }}>*</span></span>
            <input value={data.lostReason} onChange={e => setData(d => ({ ...d, lostReason: e.target.value }))} placeholder="Why was it lost?" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: errors.lostReason ? '1px solid red' : '1px solid var(--line)' }} required />
            {errors.lostReason && <span style={{ color: 'red', fontSize: '12px' }}>{errors.lostReason}</span>}
          </label>
        )}

        <label style={{ flex: 1, minWidth: '150px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Est. Revenue ($)</span>
          <input type="number" value={data.estimatedRevenue} onChange={e => setData(d => ({ ...d, estimatedRevenue: parseInt(e.target.value) || 0 }))} placeholder="0" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
        </label>

        <label style={{ flex: 2, minWidth: '250px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Internal Note</span>
          <textarea value={data.internalNote} onChange={e => setData(d => ({ ...d, internalNote: e.target.value }))} placeholder="Private notes for team..." rows="2" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', resize: 'vertical' }} />
        </label>

        <div style={{ gridColumn: '1 / -1', background: 'var(--soft-bg)', padding: '16px', borderRadius: '8px', marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', border: '1px solid var(--line)' }}>
          <h4 style={{ width: '100%', margin: 0, color: 'var(--green-darkest)', fontSize: '15px' }}>🗓 Booking Schedule</h4>

          <label style={{ flex: 1, minWidth: '150px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Event Date/Time</span>
            <input type="datetime-local" value={data.bookingDate ? new Date(new Date(data.bookingDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => setData(d => ({ ...d, bookingDate: e.target.value ? new Date(e.target.value).toISOString() : null }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
          </label>

          <label style={{ flex: 1, minWidth: '150px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>End Time</span>
            <input type="datetime-local" value={data.bookingEndDate ? new Date(new Date(data.bookingEndDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => setData(d => ({ ...d, bookingEndDate: e.target.value ? new Date(e.target.value).toISOString() : null }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
          </label>

          <label style={{ flex: 1, minWidth: '150px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Type</span>
            <select value={data.bookingType || ''} onChange={e => setData(d => ({ ...d, bookingType: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <option value="">None</option>
              <option value="offline">Offline Workshop</option>
              <option value="online">Online Class</option>
              <option value="corporate">Corporate Event</option>
              <option value="private">Private Group</option>
            </select>
          </label>

          <label style={{ flex: 1, minWidth: '150px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Total Attendees</span>
            <input type="number" value={data.attendees || ''} onChange={e => setData(d => ({ ...d, attendees: e.target.value ? parseInt(e.target.value) : null }))} placeholder="0" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
          </label>

          <label style={{ width: '100%' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Location</span>
            <input value={data.bookingLocation || ''} onChange={e => setData(d => ({ ...d, bookingLocation: e.target.value }))} placeholder="Workshop address or Zoom link..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} />
          </label>

          <label style={{ width: '100%' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Booking Note (Internal)</span>
            <textarea value={data.bookingNote || ''} onChange={e => setData(d => ({ ...d, bookingNote: e.target.value }))} placeholder="Any special arrangements for the event..." rows="2" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', resize: 'vertical' }} />
          </label>
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Updates'}
          </button>
        </div>
      </div>
    </div>
  );
}
