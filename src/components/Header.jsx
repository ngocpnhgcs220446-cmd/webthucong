import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          {settings.logo ? <img src={settings.logo} alt="Brand logo" /> : <img src="/pics/logo.jpg" alt="Default logo" />}
          <span>{settings.companyName || 'Experience Studio'}</span>
        </Link>

        {open && <div className="mobile-menu-overlay" onClick={() => setOpen(false)}></div>}

        <nav className={`nav ${open ? 'open' : ''}`}>
          <div className="mobile-menu-close-header">
            <span className="mobile-menu-title">Menu</span>
            <button className="menu-close-btn" onClick={() => setOpen(false)}>
              <X size={24} />
            </button>
          </div>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="btn btn-small" to="/contact">Book now</Link>
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
