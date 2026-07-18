import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Users, Star } from 'lucide-react';

export default function ServiceCard({ service }) {
  return (
    <article className="service-card">
      <Link to={`/services/${service.slug}`} className="service-image">
        <img src={service.image} alt={service.title} loading="lazy" />
        {service.featured && (
          <div style={{ position: 'absolute', top: 20, right: 20, background: 'var(--gold)', color: 'var(--green-darkest)', padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10, boxShadow: '0 8px 16px rgba(0,0,0,0.15)', fontFamily: 'var(--font-heading)' }}>
            <Star size={14} fill="currentColor" /> {service.priorityTags && service.priorityTags.length > 0 ? service.priorityTags[0] : 'Signature'}
          </div>
        )}
        <span>{/^\d+(\.\d+)?$/.test(String(service.price).trim()) ? `From $${service.price} / person` : service.price}</span>
      </Link>
      <div className="service-body">
        <p className="service-category">{service.category}</p>
        <h3>{service.title}</h3>
        <p>{service.subtitle}</p>
        <div className="service-meta">
          <span><Clock size={15} /> {service.duration}</span>
          <span><Users size={15} /> {service.groupSize}</span>
          <span><MapPin size={15} /> {service.location}</span>
        </div>
        <Link to={`/services/${service.slug}`} className="text-link">View details <ArrowRight size={16} /></Link>
      </div>
    </article>
  );
}
