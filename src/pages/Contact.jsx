import { useState, useEffect } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Clock, ExternalLink, Link2, Share2, User, CalendarDays, Users, Tag, ArrowRight, ChevronDown, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { trackEvent } from '../utils/analytics';
import { apiCall } from '../utils/apiFetch';
import * as valid from '../utils/validation';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  interestedService: '',
  preferredDate: '',
  preferredTime: '',
  participants: '',
  message: ''
};

function normalizeUrl(url) {
  if (!url) return '';
  if (/^(https?:\/\/|tel:|mailto:)/i.test(url)) return url;
  return `https://${url}`;
}

function hasValue(v) {
  return v && String(v).trim().length > 0;
}

function ContactCard({ icon: Icon, label, value, href, actionLabel }) {
  if (!hasValue(value)) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 16,
      padding: '24px', background: '#fff',
      border: '1px solid #e5e7eb', borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease',
      cursor: href ? 'pointer' : 'default'
    }}
    onMouseEnter={e => { if (href) e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { if (href) e.currentTarget.style.transform = 'translateY(0)'; }}
    onClick={() => { if (href) window.open(href, href.startsWith('http') ? '_blank' : '_self'); }}
    >
      <div style={{
        width: 48, height: 48, background: '#f0fdf4', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--green)', flexShrink: 0,
      }}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
          {label}
        </p>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.5 }}>
          {actionLabel || value}
        </p>
      </div>
    </div>
  );
}

function SocialBtn({ href, label, icon: Icon }) {
  if (!hasValue(href)) return null;
  return (
    <a href={normalizeUrl(href)} target="_blank" rel="noreferrer"
      aria-label={label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 20px', border: '1px solid #e5e7eb', borderRadius: '12px',
        background: '#fff', color: '#374151', textDecoration: 'none',
        fontSize: 14, fontWeight: 600,
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = '#f0fdf4'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#fff'; }}
    >
      {Icon && <Icon size={18} />}
      {label}
    </a>
  );
}

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [services, setServices] = useState([]);

  // Data fetching states
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadContactInfo = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [resSettings, resServices] = await Promise.all([
        fetch('/api/settings').then(res => res.json()),
        fetch('/api/services').then(res => res.json())
      ]);
      setSettings(resSettings);
      
      if (Array.isArray(resServices)) {
        setServices(resServices);
      } else if (resServices && Array.isArray(resServices.services)) {
        setServices(resServices.services);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error('[Contact] Error loading page data:', err);
      setLoadError('Failed to load contact information. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContactInfo();
  }, []);

  const update = (event) => {
    let { name, value } = event.target;
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 15);
    if (name === 'name') value = value.replace(/[<>\{\}\[\]@#]/g, '');

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateContactForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Please enter your name.';
    if (!form.email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    return newErrors;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateContactForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the highlighted errors.');
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting inquiry...');
    
    try {
      const selectedService = services.find(s => s.id === form.interestedService);
      let sId = '';
      let sName = 'Need consultation';

      if (selectedService) {
        sId = selectedService.id;
        sName = selectedService.title;
      } else if (form.interestedService && form.interestedService !== 'consultation') {
        sName = form.interestedService;
      }

      // Payload matched to backend expectations: name, email, phone, date, message, guests
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        date: form.preferredDate.trim(),
        guests: form.participants || 1,
        source: 'contact-page',
        serviceId: sId || undefined
      };

      console.log('[Lead Submit]', {
        name: payload?.name || null,
        email: payload?.email || null,
        hasPhone: Boolean(payload?.phone),
        hasMessage: Boolean(payload?.message),
        serviceId: payload?.serviceId || null,
        source: payload?.source || null,
      });

      const data = await apiCall('/api/leads', {
        method: 'POST',
        body: payload
      });
      
      const responseData = data;
      const savedLead = responseData?.lead;
      const referenceCode = savedLead?.referenceCode || responseData?.referenceCode || responseData?.requestId || responseData?.leadId || null;

      if (!responseData?.success) {
        throw new Error(responseData?.error || 'The request could not be saved.');
      }

      trackEvent('contact_form_submit', { service: sName });
      
      toast.success(
        referenceCode ? `Mã yêu cầu: ${referenceCode}` : 'Yêu cầu đã được lưu thành công.', 
        { id: toastId, duration: 5000 }
      );

      setSubmittedData({
        id: savedLead?.id || null,
        referenceCode,
        warning: responseData?.warning,
        email: responseData?.email
      });
      setForm(initialForm);
    } catch (e) {
      console.error('[Lead Submit Failed]', {
        status: e.status,
        response: e.message,
        fields: e.fields,
        submittedKeys: Object.keys(payload || {}),
      });

      if (e.fields && Object.keys(e.fields).length > 0) {
        setErrors(e.fields);
        toast.error('Vui lòng kiểm tra lại thông tin.', { id: toastId });
      } else {
        const errorMsg = e.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.';
        toast.error(errorMsg, { id: toastId });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <SEO title="Contact Us | Conical Hat-Workshop group" />
        <section className="section" style={{ paddingTop: '140px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <div className="spinner" style={{ border: '4px solid #e5e7eb', borderTop: '4px solid var(--green)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p>Loading contact information...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </section>
      </PageTransition>
    );
  }

  if (loadError) {
    return (
      <PageTransition>
        <SEO title="Contact Us" />
        <section className="section" style={{ paddingTop: '140px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', background: '#fee2e2', padding: '40px', borderRadius: '16px', border: '1px solid #fca5a5', maxWidth: '500px' }}>
            <AlertTriangle size={48} color="#dc2626" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#991b1b', marginBottom: '8px' }}>Unable to load page</h2>
            <p style={{ color: '#7f1d1d', marginBottom: '24px' }}>{loadError}</p>
            <button onClick={loadContactInfo} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={18} /> Try Again
            </button>
          </div>
        </section>
      </PageTransition>
    );
  }

  const phone = settings?.hotline || '';
  const email = settings?.email || '';
  const address = settings?.address || '';
  const mapsUrl = settings?.googleMapsUrl || settings?.mapEmbed || '';
  const mapEmbed = settings?.mapEmbed || '';
  const workingHours = settings?.workingHours || '';

  const SOCIAL = [
    { key: 'facebookUrl', label: 'Facebook', icon: Share2 },
    { key: 'instagramUrl', label: 'Instagram', icon: Share2 },
    { key: 'zaloUrl', label: 'Zalo', icon: MessageCircle },
    { key: 'whatsappUrl', label: 'WhatsApp', icon: Phone },
    { key: 'messengerUrl', label: 'Messenger', icon: MessageCircle },
    { key: 'tiktokUrl', label: 'TikTok', icon: Link2 },
    { key: 'youtubeUrl', label: 'YouTube', icon: Link2 },
  ];

  const isEmbedUrl = mapEmbed && !mapEmbed.trim().startsWith('<') && mapEmbed.includes('http');
  const hasAnyContactInfo = phone || email || address || workingHours || SOCIAL.some(s => hasValue(settings?.[s.key]));

  return (
    <PageTransition>
      <SEO title="Contact Us | Conical Hat-Workshop group" description="Get in touch with us via our contact form, phone, email, or social media." />

      <style>{`
        .contact-page-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: flex-start;
        }
        @media (min-width: 1024px) {
          .contact-page-layout {
            grid-template-columns: 3fr 2fr;
            gap: 64px;
          }
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }
        .premium-input-wrap {
          position: relative;
        }
        .premium-input-wrap > svg:first-of-type {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .premium-input-wrap input, .premium-input-wrap select, .premium-input-wrap textarea {
          padding-left: 48px;
          padding-right: 16px;
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          min-height: 52px;
          font-size: 15px;
          transition: all 0.2s ease;
          background: #f9fafb;
        }
        .premium-input-wrap select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding-right: 48px;
        }
        .premium-input-wrap input:focus, .premium-input-wrap select:focus, .premium-input-wrap textarea:focus {
          background: #fff;
          border-color: var(--green);
          box-shadow: 0 0 0 4px rgba(22, 101, 52, 0.1);
          outline: none;
        }
        .premium-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
      `}</style>

      <section className="section" style={{ paddingTop: '140px', paddingBottom: '40px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', marginBottom: '64px' }}>
            <span className="eyebrow">Get in Touch</span>
            <h1 style={{ fontSize: '48px', margin: '16px 0 24px', letterSpacing: '-0.02em', color: 'var(--green-dark)' }}>
              Let's craft your <span style={{ color: 'var(--gold)' }}>perfect experience</span>
            </h1>
            <p className="subtitle">
              Whether you want to book a workshop, plan a private event, or have a question about our kits, we're here to help.
            </p>
          </div>

          <div className="contact-page-layout">
            <ScrollReveal>
              {submittedData ? (
                <div style={{ background: submittedData?.warning ? '#fffbeb' : '#f0fdf4', border: submittedData?.warning ? '1px solid #fde68a' : '1px solid #bbf7d0', borderRadius: '24px', padding: '48px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '80px', height: '80px', background: submittedData?.warning ? '#fef3c7' : '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    {submittedData?.warning ? <AlertTriangle size={40} color="#d97706" /> : <CheckCircle2 size={40} color="#16a34a" />}
                  </div>
                  <h2 style={{ fontSize: '28px', color: submittedData?.warning ? '#92400e' : '#166534', marginBottom: '16px' }}>{submittedData?.warning ? 'Yêu cầu đã được ghi nhận.' : 'Yêu cầu đã được gửi thành công.'}</h2>
                  
                  {submittedData?.referenceCode && (
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left', border: '1px solid #e2e8f0', color: '#000' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Mã yêu cầu:</strong> {submittedData.referenceCode}</p>
                      <p style={{ margin: '0', fontSize: '15px', color: '#475569' }}>Vui lòng lưu lại mã này để tra cứu.</p>
                    </div>
                  )}

                  {submittedData?.warning || submittedData?.email?.customerConfirmationSent === false ? (
                    <p style={{ fontSize: '16px', color: '#b45309', lineHeight: 1.6, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                      Hệ thống hiện chưa thể xác nhận việc gửi email. Nhóm của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
                    </p>
                  ) : (
                    <p style={{ fontSize: '16px', color: '#15803d', lineHeight: 1.6, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                      Email xác nhận đã được gửi đến địa chỉ của bạn.<br/>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Vui lòng kiểm tra cả Hộp thư đến và Thư rác (Spam).</span>
                    </p>
                  )}
                  
                  <button className="btn" onClick={() => setSubmittedData(null)} style={{ background: submittedData?.warning ? '#d97706' : 'var(--green)' }}>Gửi yêu cầu khác</button>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                  <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} noValidate>
                    
                    <div className="form-row">
                      <div>
                        <label htmlFor="ct-name" className="premium-label">Your Name <span style={{color: '#ef4444'}}>*</span></label>
                        <div className="premium-input-wrap">
                          <User size={20} />
                          <input id="ct-name" type="text" name="name" value={form.name} onChange={update} placeholder="John Doe" required style={errors.name ? { borderColor: '#ef4444' } : {}} aria-invalid={Boolean(errors.name)} />
                        </div>
                        {errors.name && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="ct-phone" className="premium-label">Phone Number</label>
                        <div className="premium-input-wrap">
                          <Phone size={20} />
                          <input id="ct-phone" type="tel" name="phone" value={form.phone} onChange={update} placeholder="+84 123 456 789" style={errors.phone ? { borderColor: '#ef4444' } : {}} aria-invalid={Boolean(errors.phone)} />
                        </div>
                        {errors.phone && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div>
                        <label htmlFor="ct-email" className="premium-label">Email Address <span style={{color: '#ef4444'}}>*</span></label>
                        <div className="premium-input-wrap">
                          <Mail size={20} />
                          <input id="ct-email" type="email" name="email" value={form.email} onChange={update} placeholder="john@example.com" required style={errors.email ? { borderColor: '#ef4444' } : {}} aria-invalid={Boolean(errors.email)} />
                        </div>
                        {errors.email && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.email}</p>}
                      </div>
                      <div>
                        <label htmlFor="ct-service" className="premium-label">Interested Service</label>
                        <div className="premium-input-wrap">
                          <Tag size={20} />
                          <select id="ct-service" name="interestedService" value={form.interestedService} onChange={update}>
                            <option value="">Select a service</option>
                            {services.map(s => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                            <option value="consultation">Not sure yet / Need consultation</option>
                          </select>
                          <ChevronDown size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div>
                        <label htmlFor="ct-date" className="premium-label">Preferred Date</label>
                        <div className="premium-input-wrap">
                          <CalendarDays size={20} />
                          <input id="ct-date" type="date" name="preferredDate" value={form.preferredDate} onChange={update} min={valid.getLocalDateString()} style={errors.date ? { borderColor: '#ef4444' } : {}} aria-invalid={Boolean(errors.date)} />
                        </div>
                        {errors.date && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.date}</p>}
                      </div>
                      
                      {services.find(s => s.id === form.interestedService)?.timeSlots?.length > 0 ? (
                        <div>
                          <label htmlFor="ct-time" className="premium-label">Preferred Time</label>
                          <div className="premium-input-wrap">
                            <Clock size={20} />
                            <select id="ct-time" name="preferredTime" value={form.preferredTime} onChange={update} required>
                              <option value="" disabled>Select a time</option>
                              {services.find(s => s.id === form.interestedService).timeSlots.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <ChevronDown size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="ct-guests" className="premium-label">Number of Participants</label>
                          <div className="premium-input-wrap">
                            <Users size={20} />
                            <input id="ct-guests" type="number" inputMode="numeric" name="participants" value={form.participants} onChange={update} placeholder="e.g. 4" min="1" max="999" step="1" onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }} style={errors.participants ? { borderColor: '#ef4444' } : {}} aria-invalid={Boolean(errors.participants)} />
                          </div>
                          {errors.participants && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.participants}</p>}
                        </div>
                      )}
                    </div>

                    {services.find(s => s.id === form.interestedService)?.timeSlots?.length > 0 && (
                      <div className="form-row">
                        <div>
                          <label htmlFor="ct-guests" className="premium-label">Number of Participants</label>
                          <div className="premium-input-wrap">
                            <Users size={20} />
                            <input id="ct-guests" type="number" inputMode="numeric" name="participants" value={form.participants} onChange={update} placeholder="e.g. 4" min="1" max="999" step="1" onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }} style={errors.participants ? { borderColor: '#ef4444' } : {}} aria-invalid={Boolean(errors.participants)} />
                          </div>
                          {errors.participants && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.participants}</p>}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="ct-msg" className="premium-label">Message / Special Requests</label>
                      <div className="premium-input-wrap">
                        <MessageCircle size={20} style={{ position: 'absolute', top: '16px', left: '16px', transform: 'none', color: '#9ca3af' }} />
                        <textarea id="ct-msg" rows="5" name="message" value={form.message} onChange={update} placeholder="Tell us about your preferences, budget, or any questions you have..." style={{ paddingTop: '16px' }} />
                      </div>
                    </div>
                    
                    <button className="btn" type="submit" disabled={isSubmitting} style={{ marginTop: '8px', padding: '16px', fontSize: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'} 
                      {!isSubmitting && <ArrowRight size={18} />}
                    </button>
                  </form>
                </div>
              )}
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>Contact Information</h3>
                  {!hasAnyContactInfo ? (
                    <div style={{ padding: '24px', background: '#f9fafb', borderRadius: '20px', border: '1px dashed #d1d5db', textAlign: 'center', color: '#6b7280' }}>
                      <p>Contact information is currently unavailable.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <ContactCard icon={Phone} label="Call Us Anytime" value={phone} href={phone ? `tel:${phone.replace(/\s/g, '')}` : null} actionLabel={phone} />
                      <ContactCard icon={Mail} label="Email Address" value={email} href={email ? `mailto:${email}` : null} actionLabel={email} />
                      <ContactCard icon={MapPin} label="Our Location" value={address} />
                      {hasValue(workingHours) && (
                        <ContactCard icon={Clock} label="Working Hours" value={workingHours} />
                      )}
                    </div>
                  )}
                </div>

                {SOCIAL.some(s => hasValue(settings?.[s.key])) && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Connect with us</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {SOCIAL.map(s => {
                        const url = settings?.[s.key] || '';
                        return <SocialBtn key={s.key} href={url} label={s.label} icon={s.icon} />;
                      })}
                    </div>
                  </div>
                )}

                {isEmbedUrl && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Find Us</h3>
                    <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                      <iframe
                        title="Google Maps"
                        src={mapEmbed}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        style={{ width: '100%', height: 280, border: 0, display: 'block' }}
                      />
                      <a href={normalizeUrl(mapsUrl || mapEmbed)} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', fontSize: 14, color: 'var(--green)', fontWeight: 700, textDecoration: 'none', borderTop: '1px solid #e5e7eb', background: '#f9fafb', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
                      >
                        <MapPin size={16} /> Open in Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </aside>
            </ScrollReveal>
          </div>
        </div>
      </section>

    </PageTransition>
  );
}
