import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { MessageCircle, Phone, MapPin, Mail, Phone as PhoneIcon, MessageSquare } from 'lucide-react';

const Facebook = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Instagram = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

function normalizeUrl(url) {
  if (!url) return '';
  if (/^(https?:\/\/|tel:|mailto:)/i.test(url)) return url;
  return `https://${url}`;
}

function hasValue(v) {
  return v && String(v).trim().length > 0;
}

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="footer-brand">
            {settings.logo ? <img src={settings.logo} alt="Brand logo" /> : <img src="/pics/logo.jpg" alt="Default logo" />}
            <strong>{settings.companyName || 'Experience Studio'}</strong>
          </Link>
          <p>{settings.shortIntro}</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4>Contact</h4>
          {hasValue(settings.hotline) && (
            <a href={`tel:${settings.hotline.replace(/\\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneIcon size={16} />
              {settings.hotline}
            </a>
          )}
          {hasValue(settings.email) && (
            <a href={`mailto:${settings.email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} />
              {settings.email}
            </a>
          )}
          {hasValue(settings.address) && (
            <span style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={16} style={{ flexShrink: 0, marginTop: '4px' }} />
              {settings.address}
            </span>
          )}
          {hasValue(settings.taxCode) && <span>Tax Code: {settings.taxCode}</span>}
        </div>
        <div>
          <h4>Connect</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {hasValue(settings.facebookUrl) && (
              <a href={normalizeUrl(settings.facebookUrl)} target="_blank" rel="noreferrer" aria-label="Facebook" className="social-icon-btn">
                <Facebook size={20} />
              </a>
            )}
            {hasValue(settings.instagramUrl) && (
              <a href={normalizeUrl(settings.instagramUrl)} target="_blank" rel="noreferrer" aria-label="Instagram" className="social-icon-btn">
                <Instagram size={20} />
              </a>
            )}
            {hasValue(settings.whatsappUrl) && (
              <a href={normalizeUrl(settings.whatsappUrl)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="social-icon-btn">
                <MessageCircle size={20} />
              </a>
            )}
            {hasValue(settings.zaloUrl) && (
              <a href={normalizeUrl(settings.zaloUrl)} target="_blank" rel="noreferrer" aria-label="Zalo" className="social-icon-btn">
                <MessageSquare size={20} />
              </a>
            )}
            {hasValue(settings.messengerUrl) && (
              <a href={normalizeUrl(settings.messengerUrl)} target="_blank" rel="noreferrer" aria-label="Messenger" className="social-icon-btn">
                <MessageCircle size={20} />
              </a>
            )}
          </div>
          <style>{`
            .social-icon-btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: rgba(22, 101, 52, 0.1);
              color: var(--green-darkest);
              transition: all 0.2s;
            }
            .social-icon-btn:hover {
              background: var(--green-darkest);
              color: var(--white);
              transform: translateY(-2px);
            }
          `}</style>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {settings.companyName || 'Experience Studio'}. All rights reserved.</span>
      </div>
    </footer>
  );
}
