import { useState, useEffect } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Clock, ExternalLink, Link2, Share2 } from 'lucide-react';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { company } from '../data/initialData';
import { trackEvent } from '../utils/analytics';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  interestedService: '',
  preferredDate: '',
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
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '18px 20px', background: '#fff',
      border: '1px solid #e9ecef', borderRadius: 16,
      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 40, height: 40, background: '#f0fdf4', borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#166534', flexShrink: 0,
      }}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>
          {label}
        </p>
        {href ? (
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            style={{ fontSize: 15, fontWeight: 600, color: '#111827', textDecoration: 'none', display: 'block' }}>
            {actionLabel || value}
          </a>
        ) : (
          <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>{value}</p>
        )}
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
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 40,
        background: '#fff', color: '#374151', textDecoration: 'none',
        fontSize: 13, fontWeight: 600,
        transition: 'all 0.18s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#166534'; e.currentTarget.style.color = '#166534'; e.currentTarget.style.background = '#f0fdf4'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#fff'; }}
    >
      {Icon && <Icon size={14} />}
      {label}
    </a>
  );
}

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { settings, refreshSettings } = useSettings();
  const [services, setServices] = useState([]);
  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices).catch(console.error);
  }, []);

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
      const selectedService = services.find(s => s.id === form.interestedService);
      let sId = '';
      let sName = 'Need consultation';

      if (selectedService) {
        sId = selectedService.id;
        sName = selectedService.title;
      } else if (form.interestedService && form.interestedService !== 'consultation') {
        sName = form.interestedService;
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: form.preferredDate,
          guests: form.participants,
          serviceId: sId,
          serviceNameSnapshot: sName
        })
      });
      const data = await res.json();
      if (res.ok) {
        trackEvent('contact_form_submit', { service: sName });
        toast.success('Inquiry submitted successfully!', { id: toastId });
        setDone(true);
        setForm(initialForm);
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

  // Check if mapEmbed is a valid iframe src URL (not raw HTML)
  const isEmbedUrl = mapEmbed && !mapEmbed.trim().startsWith('<') && mapEmbed.includes('http');

  return (
    <PageTransition>
      <SEO title="Contact Us | Conical Hat-Workshop group" description="Get in touch with us via our contact form, phone, email, or social media." />

      {/* Hero */}
      <section className="page-hero-immersive">
        <img src="/pics/product5.jpg" alt="Contact us background" />
        <ScrollReveal className="page-hero-immersive-content">
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>Contact Us</span>
          <h1>Get in Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.</p>
        </ScrollReveal>
      </section>

      <section className="section">
        <div className="container contact-layout">
          {/* ── Form ── */}
          <ScrollReveal>
            {done ? (
              <div className="success-banner" style={{ padding: '40px', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Thank you for your inquiry!</h3>
                <p style={{ color: '#64748b' }}>We have received your message and will get back to you shortly.</p>
                <button className="btn" onClick={() => setDone(false)} style={{ marginTop: '24px' }}>Send another message</button>
              </div>
            ) : (
              <div style={{ padding: '40px', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '24px', color: '#0f172a' }}>Send us a message</h3>
                <form className="form-grid contact-form" onSubmit={submit}>
                  <label>Name <span style={{ color: 'red' }}>*</span>
                    <input name="name" value={form.name} onChange={update} style={errors.name ? { borderColor: 'red' } : {}} required />
                    {errors.name && <span style={{ color: 'red', fontSize: '12px', marginTop: '2px', display: 'block' }}>{errors.name}</span>}
                  </label>
                  <label>Phone number
                    <input name="phone" value={form.phone} onChange={update} style={errors.contact ? { borderColor: 'red' } : {}} />
                  </label>
                  <label>Email
                    <input type="email" name="email" value={form.email} onChange={update} style={errors.contact ? { borderColor: 'red' } : {}} />
                  </label>
                  {errors.contact && <span style={{ gridColumn: '1 / -1', color: 'red', fontSize: '12px' }}>{errors.contact}</span>}

                  <label>
                    Interested service <span style={{ color: 'red' }}>*</span>
                    <select name="interestedService" value={form.interestedService} onChange={update} required style={errors.interestedService ? { borderColor: 'red' } : {}}>
                      <option value="" disabled>Select a service</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                      <option value="consultation">Not sure yet / Need consultation</option>
                    </select>
                    {errors.interestedService && <span style={{ color: 'red', fontSize: '12px', marginTop: '2px', display: 'block' }}>{errors.interestedService}</span>}
                  </label>

                  <label>Preferred date<input type="date" name="preferredDate" value={form.preferredDate} onChange={update} /></label>
                  <label>Participants<input type="number" name="participants" value={form.participants} onChange={update} placeholder="e.g. 20" min="1" /></label>
                  <label className="full">Message<textarea rows="5" name="message" value={form.message} onChange={update} placeholder="Share your preferred format, venue, language, budget or special requests." style={{ resize: 'vertical' }} /></label>
                  <button className="btn full" type="submit" disabled={isSubmitting} style={{ marginTop: '12px', padding: '14px', fontSize: '16px' }}>
                    {isSubmitting ? 'Submitting...' : 'Submit booking inquiry'}
                  </button>
                </form>
              </div>
            )}
          </ScrollReveal>

          {/* ── Contact Panel ── */}
          <ScrollReveal delay={0.2}>
            <aside className="contact-panel">
              <h3>Contact information</h3>

              {/* Public contact cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ContactCard icon={Phone} label="Call us" value={phone}
                  href={phone ? `tel:${phone.replace(/\s/g, '')}` : null}
                  actionLabel={phone} />
                <ContactCard icon={Mail} label="Email us" value={email}
                  href={email ? `mailto:${email}` : null}
                  actionLabel={email} />
                <ContactCard icon={MapPin} label="Visit us" value={address} />
                {hasValue(workingHours) && (
                  <ContactCard icon={Clock} label="Working hours" value={workingHours} />
                )}
                {hasValue(mapsUrl) && (
                  <a href={normalizeUrl(mapsUrl)} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#166534', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                    <ExternalLink size={15} /> Get directions
                  </a>
                )}
              </div>

              {/* Social links */}
              {SOCIAL.some(s => hasValue(settings[s.key] || company[s.key])) && (
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connect with us</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SOCIAL.map(s => {
                      const url = settings[s.key] || company[s.key] || '';
                      return <SocialBtn key={s.key} href={url} label={s.label} icon={s.icon} />;
                    })}
                  </div>
                </div>
              )}

              {/* Map */}
              {isEmbedUrl && (
                <div style={{ marginTop: 24, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <iframe
                    title="Google Maps"
                    src={mapEmbed}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ width: '100%', height: 260, border: 0, display: 'block' }}
                  />
                  <a href={normalizeUrl(mapsUrl || mapEmbed)} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', fontSize: 13, color: '#166534', fontWeight: 600, textDecoration: 'none', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <ExternalLink size={13} /> Open in Google Maps
                  </a>
                </div>
              )}
            </aside>
          </ScrollReveal>
        </div>
      </section>

    </PageTransition>
  );
}
