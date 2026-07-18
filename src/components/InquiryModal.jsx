import { useState } from 'react';
import { X, CalendarDays, Users, Tag, Clock, ChevronDown } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { submitLeadAPI } from '../utils/apiUtils';
import * as valid from '../utils/validation';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  preferredDate: '',
  preferredTime: '',
  participants: '',
  message: ''
};

// Calculate today's date in YYYY-MM-DD for the min attribute
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function InquiryModal({ service, selectedPackage, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (event) => {
    let { name, value } = event.target;
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 15);
    if (name === 'name') value = value.replace(/[<>\{\}\[\]@#]/g, '');

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return; // Prevent double submit

    setErrors({});
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting request...');
    
    try {
      const payload = {
        ...form,
        date: form.preferredDate,
        preferredTime: form.preferredTime,
        guests: form.participants,
        serviceId: service?.id || '',
        packageId: selectedPackage?.id || ''
      };

      const data = await submitLeadAPI(payload);
      
      trackEvent('booking_inquiry', { service: service?.title, package: selectedPackage?.name });
      toast.success('Request submitted successfully!', { id: toastId });
      setSubmittedData(data);
    } catch (e) {
      if (e.data && e.data.fields) {
        setErrors(e.data.fields);
        toast.error('Please fix validation errors', { id: toastId });
      } else {
        const errorMsg = e.data?.error || e.message || 'Failed to submit inquiry';
        toast.error(errorMsg, { id: toastId });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '600px' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close" disabled={isSubmitting}><X size={22} /></button>
        {submittedData ? (
          <div className="success-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <span className="success-icon" style={{ fontSize: '48px', color: 'var(--green)', display: 'block', marginBottom: '16px' }}>✓</span>
            <h2>Thank you!</h2>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Reference Code:</strong> {submittedData.lead.referenceCode}</p>
              <p style={{ margin: '0', fontSize: '15px', color: '#475569' }}>Please save this reference code.</p>
            </div>
            
            {submittedData.email?.customerConfirmation === 'failed' ? (
              <p style={{ color: '#d97706', marginBottom: '24px', backgroundColor: '#fef3c7', padding: '12px', borderRadius: '6px' }}>
                Your request was received, but we could not send the confirmation email. Please save your reference code and our team will contact you shortly.
              </p>
            ) : (
              <p style={{ color: 'var(--text-light)', marginBottom: '24px', lineHeight: '1.6' }}>
                We have received your booking request.<br />
                A confirmation email has been sent to your email address.<br /><br />
                Our team will review your request and contact you shortly.<br />
                <strong>Your booking is not confirmed until our team contacts you.</strong>
              </p>
            )}
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
              <label htmlFor="inq-name">Name <span style={{color: 'red'}}>*</span></label>
              <input id="inq-name" name="name" value={form.name} onChange={update} style={{ border: errors.name ? '1px solid red' : '' }} required autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "inq-name-err" : undefined} />
              {errors.name && <p id="inq-name-err" role="alert" style={{ color: 'red', fontSize: '12px', marginTop: '2px', margin: 0 }}>{errors.name}</p>}
              
              <label htmlFor="inq-email">Email <span style={{color: 'red'}}>*</span></label>
              <input id="inq-email" type="email" inputMode="email" name="email" value={form.email} onChange={update} maxLength={254} style={{ border: errors.email ? '1px solid red' : '' }} required autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "inq-email-err" : undefined} />
              {errors.email && <p id="inq-email-err" role="alert" style={{ color: 'red', fontSize: '12px', marginTop: '2px', margin: 0 }}>{errors.email}</p>}

              <label htmlFor="inq-phone">Phone number</label>
              <input id="inq-phone" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={15} name="phone" value={form.phone} onChange={update} autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "inq-phone-err" : undefined} />
              {errors.phone && <p id="inq-phone-err" role="alert" style={{ color: 'red', fontSize: '12px', marginTop: '2px', margin: 0 }}>{errors.phone}</p>}
              
              <label htmlFor="inq-date">Preferred date</label>
              <div style={{ position: 'relative' }}>
                <CalendarDays size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input id="inq-date" type="date" name="preferredDate" value={form.preferredDate} onChange={update} min={valid.getLocalDateString()} style={{ paddingLeft: '40px', border: errors.date ? '1px solid red' : '' }} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "inq-date-err" : undefined} />
              </div>
              {errors.date && <p id="inq-date-err" role="alert" style={{ color: 'red', fontSize: '12px', marginTop: '2px', margin: 0 }}>{errors.date}</p>}
              
              {service?.timeSlots?.length > 0 && (
                <>
                  <label htmlFor="inq-time">Preferred time</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <select id="inq-time" name="preferredTime" value={form.preferredTime} onChange={update} style={{ paddingLeft: '40px', paddingRight: '40px', appearance: 'none', WebkitAppearance: 'none' }}>
                      <option value="" disabled>Select a time</option>
                      {service.timeSlots.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
                  </div>
                </>
              )}
              
              <label htmlFor="inq-guests">Participants</label>
              <div style={{ position: 'relative' }}>
                <Users size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input id="inq-guests" type="number" inputMode="numeric" name="participants" value={form.participants} onChange={update} placeholder="e.g. 12" min="1" max="999" step="1" onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }} style={{ paddingLeft: '40px', border: errors.participants ? '1px solid red' : '' }} aria-invalid={Boolean(errors.participants)} aria-describedby={errors.participants ? "inq-guests-err" : undefined} />
              </div>
              {errors.participants && <p id="inq-guests-err" role="alert" style={{ color: 'red', fontSize: '12px', marginTop: '2px', margin: 0 }}>{errors.participants}</p>}
              
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
