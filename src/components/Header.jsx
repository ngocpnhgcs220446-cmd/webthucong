import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageToggle from './LanguageToggle';
import { useSettings } from '../context/SettingsContext';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' }
];

export default function Header({ language, onLanguageChange }) {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          {settings.logo ? <img src={settings.logo} alt="Brand logo" /> : <img src="/pics/logo.jpg" alt="Default logo" />}
          <span>{settings.companyName || 'Experience Studio'}</span>
        </Link>

        <nav className={`nav ${open ? 'open' : ''}`}>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <LanguageToggle language={language} onChange={onLanguageChange} />
          <Link className="btn btn-small" to="/contact">Book now</Link>
          <button className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Open menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
