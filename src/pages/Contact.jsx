import { useState, useEffect } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Clock, ExternalLink, Link2, Share2, User, CalendarDays, Users, Tag, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { company } from '../data/initialData';
import { trackEvent } from '../utils/analytics';
import { useSettings } from '../context/SettingsContext';
import { submitLeadAPI } from '../utils/apiUtils';
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

// ─── helpers ────────────────────────────────────────────────────────────────
function normalizeUrl(url) {
  if (!url) return '';
  if (/^(https?:\/\/|tel:|mailto:)/i.test(url)) return url;
  return `https://${url}`;
}

function hasValue(v) {
  return v && String(v).trim().length > 0;
}

// ─── contact card ────────────────────────────────────────────────────────────
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

// ─── social button ────────────────────────────────────────────────────────────
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
  const { settings } = useSettings();
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices).catch(console.error);
  }, []);

  const update = (event) => {
    let { name, value } = event.target;
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 15);
    if (name === 'name') value = value.replace(/[<>\{\}\[\]@#]/g, '');

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

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

      const payload = {
        ...form,
        date: form.preferredDate,
        preferredTime: form.preferredTime,
        guests: form.participants,
        serviceId: sId,
        serviceNameSnapshot: sName
      };

      const data = await submitLeadAPI(payload);
      
      trackEvent('contact_form_submit', { service: sName });
      toast.success('Inquiry submitted successfully!', { id: toastId });
      setSubmittedData(data);
      setForm(initialForm);
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

  // ── derived contact values ──────────────────────────────────────────────
  const phone = settings.hotline || company.hotline || '';
  const email = settings.email || company.email || '';
  const address = settings.address || company.address || '';
  const mapsUrl = settings.googleMapsUrl || settings.mapEmbed || '';
  const mapEmbed = settings.mapEmbed || company.mapEmbed || '';
  const workingHours = settings.workingHours || 'Mon – Sat: 8:00 AM – 6:00 PM';

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
        .premium-input-wrap > svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        .premium-input-wrap textarea ~ svg {
          top: 18px;
          transform: none;
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

      {/* Hero */}
      <section className="page-hero-immersive" style={{ minHeight: '400px' }}>
        <img src="/pics/product5.jpg" alt="Contact us background" />
        <ScrollReveal className="page-hero-immersive-content">
          <span className="eyebrow" style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '14px' }}>Let's Connect</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800' }}>Get in Touch</h1>
          <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', color: 'rgba(255,255,255,0.9)' }}>
            We'd love to hear from you. Send us a message and our team will respond within 24 hours.
          </p>
        </ScrollReveal>
      </section>

      <section className="section" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
        <div className="container contact-page-layout">
          
          {/* ── Left Column: Form ── */}
          <ScrollReveal>
            {submittedData ? (
              <div style={{ padding: '64px 40px', background: '#fff', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle2 size={40} color="var(--green)" />
                </div>
                <h3 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: '800', color: '#111827' }}>Request Received!</h3>
                <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '32px' }}>Thank you for reaching out. Our team will review your inquiry and contact you shortly.</p>
                
                <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px dashed #cbd5e1', display: 'inline-block', textAlign: 'left' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Reference Code</p>
                  <p style={{ margin: '0', fontSize: '28px', color: '#111827', fontWeight: '800', fontFamily: 'monospace' }}>{submittedData.lead.referenceCode}</p>
                </div>

                {submittedData.email?.customerConfirmation === 'failed' ? (
                  <p style={{ color: '#92400e', margin: '0 auto 32px', backgroundColor: '#fef3c7', padding: '16px', borderRadius: '12px', maxWidth: '500px', fontSize: '15px', lineHeight: '1.6' }}>
                    We received your request but couldn't send the confirmation email at this time. Please save your reference code above!
                  </p>
                ) : (
                  <p style={{ color: '#4b5563', margin: '0 auto 32px', maxWidth: '500px', fontSize: '15px', lineHeight: '1.6' }}>
                    A confirmation email has been sent to your address. Your booking is not confirmed until our team contacts you.
                  </p>
                )}
                
                <button className="btn btn-outline" onClick={() => setSubmittedData(null)} style={{ padding: '14px 32px', borderRadius: '40px' }}>
                  Send another message
                </button>
              </div>
            ) : (
              <div style={{ padding: '48px', background: '#fff', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                <h3 style={{ fontSize: '28px', marginBottom: '32px', fontWeight: '800', color: '#111827' }}>Send us a message</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Row 1: Name & Email */}
                  <div className="form-row">
                    <div>
                      <label htmlFor="ct-name" className="premium-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                      <div className="premium-input-wrap">
                        <User size={20} />
                        <input id="ct-name" name="name" value={form.name} onChange={update} style={errors.name ? { borderColor: '#ef4444' } : {}} required autoComplete="name" aria-invalid={Boolean(errors.name)} placeholder="John Doe" />
                      </div>
                      {errors.name && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="ct-email" className="premium-label">Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                      <div className="premium-input-wrap">
                        <Mail size={20} />
                        <input id="ct-email" type="email" inputMode="email" name="email" value={form.email} onChange={update} maxLength={254} style={errors.email ? { borderColor: '#ef4444' } : {}} required autoComplete="email" aria-invalid={Boolean(errors.email)} placeholder="john@example.com" />
                      </div>
                      {errors.email && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.email}</p>}
                    </div>
                  </div>

                  {/* Row 2: Phone & Service */}
                  <div className="form-row">
                    <div>
                      <label htmlFor="ct-phone" className="premium-label">Phone Number</label>
                      <div className="premium-input-wrap">
                        <Phone size={20} />
                        <input id="ct-phone" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={15} name="phone" value={form.phone} onChange={update} style={errors.phone ? { borderColor: '#ef4444' } : {}} autoComplete="tel" aria-invalid={Boolean(errors.phone)} placeholder="+1 234 567 890" />
                      </div>
                      {errors.phone && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.phone}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="ct-service" className="premium-label">Interested Service <span style={{ color: '#ef4444' }}>*</span></label>
                      <div className="premium-input-wrap">
                        <Tag size={20} />
                        <select id="ct-service" name="interestedService" value={form.interestedService} onChange={update} required style={errors.interestedService ? { borderColor: '#ef4444' } : {}} aria-invalid={Boolean(errors.interestedService)}>
                          <option value="" disabled>Select a service</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                          <option value="consultation">Not sure yet / Need consultation</option>
                        </select>
                        <ChevronDown size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                      </div>
                      {errors.interestedService && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: 0 }}>{errors.interestedService}</p>}
                    </div>
                  </div>

                  {/* Row 3: Date & Time */}
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

                  {/* Row 4: Guests if time was shown */}
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
                  
                  {/* Message */}
                  <div>
                    <label htmlFor="ct-msg" className="premium-label">Message / Special Requests</label>
                    <div className="premium-input-wrap">
                      <MessageCircle size={20} />
                      <textarea id="ct-msg" rows="5" name="message" value={form.message} onChange={update} placeholder="Tell us about your preferences, budget, or any questions you have..." style={{ paddingTop: '16px' }} />
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <button className="btn" type="submit" disabled={isSubmitting} style={{ marginTop: '8px', padding: '16px', fontSize: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {isSubmitting ? 'Submitting...' : 'Submit Booking Inquiry'} 
                    {!isSubmitting && <ArrowRight size={18} />}
                  </button>
                </form>
              </div>
            )}
          </ScrollReveal>

          {/* ── Right Column: Contact Panel ── */}
          <ScrollReveal delay={0.2}>
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <ContactCard icon={Phone} label="Call Us Anytime" value={phone} href={phone ? `tel:${phone.replace(/\s/g, '')}` : null} actionLabel={phone} />
                  <ContactCard icon={Mail} label="Email Address" value={email} href={email ? `mailto:${email}` : null} actionLabel={email} />
                  <ContactCard icon={MapPin} label="Our Location" value={address} />
                  {hasValue(workingHours) && (
                    <ContactCard icon={Clock} label="Working Hours" value={workingHours} />
                  )}
                </div>
              </div>

              {/* Social links */}
              {SOCIAL.some(s => hasValue(settings[s.key] || company[s.key])) && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Connect with us</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {SOCIAL.map(s => {
                      const url = settings[s.key] || company[s.key] || '';
                      return <SocialBtn key={s.key} href={url} label={s.label} icon={s.icon} />;
                    })}
                  </div>
                </div>
              )}

              {/* Map */}
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
      </section>

    </PageTransition>
  );
}
