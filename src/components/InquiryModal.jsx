import { useState, useEffect } from 'react';
import { X, CalendarDays, Users, Tag } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  preferredDate: '',
  participants: '',
  message: ''
};

export default function InquiryModal({ service, selectedPackage, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setErrors((prev) => ({ ...prev, [event.target.name]: null }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting inquiry...');
    try {
      const payload = {
        ...form,
        date: form.preferredDate,
        guests: form.participants,
        serviceId: service?.id || '',
        serviceNameSnapshot: service?.title || 'Need consultation',
        packageId: selectedPackage?.id || null,
        packageNameSnapshot: selectedPackage?.name || null,
        packagePriceSnapshot: selectedPackage?.price || null,
        packageCurrencySnapshot: selectedPackage?.currency || null
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        trackEvent('booking_inquiry', { service: service?.title, package: selectedPackage?.name });
        toast.success('Inquiry submitted successfully!', { id: toastId });
        setSubmitted(true);
      } else {
        if (data.fields) {
          setErrors(data.fields);
          toast.error('Please fix validation errors', { id: toastId });
        } else {
          toast.error(data.error || 'Failed to submit inquiry', { id: toastId });
        }
      }
    } catch (e) {
      toast.error('Failed to submit inquiry', { id: toastId });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '600px' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={22} /></button>
        {submitted ? (
          <div className="success-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <span className="success-icon" style={{ fontSize: '48px', color: 'var(--green)', display: 'block', marginBottom: '16px' }}>✓</span>
            <h2>Inquiry received</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>Thank you. Your lead has been saved in Admin → Leads. The sales team can contact the customer via phone, Zalo or WhatsApp.</p>
            <button className="btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <span className="eyebrow">Booking inquiry</span>
            <h2 style={{ marginBottom: '8px' }}>Request to book</h2>
            
            {service && (
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{service.title}</h3>
                {selectedPackage ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '14px' }}>
                    <Tag size={16} /> <strong>Package:</strong> {selectedPackage.name} - {selectedPackage.priceLabel || `${selectedPackage.price} ${selectedPackage.currency}`}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-light)', fontSize: '14px' }}>General inquiry</div>
                )}
              </div>
            )}

            <form className="form-grid" onSubmit={submit}>
              <label>Name <span style={{color: 'red'}}>*</span>
                <input name="name" value={form.name} onChange={update} style={{ border: errors.name ? '1px solid red' : '' }} required />
                {errors.name && <span style={{ color: 'red', fontSize: '12px', marginTop: '2px', display: 'block' }}>{errors.name}</span>}
              </label>
              <label>Phone number
                <input name="phone" value={form.phone} onChange={update} style={{ border: errors.contact ? '1px solid red' : '' }} />
              </label>
              <label>Email
                <input type="email" name="email" value={form.email} onChange={update} style={{ border: errors.contact ? '1px solid red' : '' }} />
              </label>
              {errors.contact && <span style={{ gridColumn: '1 / -1', color: 'red', fontSize: '12px' }}>{errors.contact}</span>}
              
              <label>Preferred date
                <div style={{ position: 'relative' }}>
                  <CalendarDays size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input type="date" name="preferredDate" value={form.preferredDate} onChange={update} style={{ paddingLeft: '40px' }} />
                </div>
              </label>
              <label>Participants
                <div style={{ position: 'relative' }}>
                  <Users size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input type="number" name="participants" value={form.participants} onChange={update} placeholder="e.g. 12" min="1" style={{ paddingLeft: '40px' }} />
                </div>
              </label>
              <label className="full">Message
                <textarea name="message" value={form.message} onChange={update} rows="4" placeholder="Tell us about your group, preferred format or special request" />
              </label>
              <button className="btn full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Booking Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
