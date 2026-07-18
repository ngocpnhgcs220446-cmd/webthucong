import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, MapPin, MessageCircle, Users, Star, Info, XCircle, Map as MapIcon, ShieldCheck, Languages, Accessibility, ChevronRight, X, ChevronLeft } from 'lucide-react';
import SEO from '../components/SEO';
import InquiryModal from '../components/InquiryModal';
import { useSettings } from '../context/SettingsContext';

export default function ServiceDetail() {
  const { slug } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [service, setService] = useState(null);
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  
  // Image Viewer State
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  useEffect(() => {
    fetch(`/api/services/slug/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setService(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [slug]);

  const handleReserve = (pkg = null) => {
    setSelectedPackage(pkg);
    setModalOpen(true);
  };

  const allImages = service ? [service.image, ...(service.gallery || [])].filter(Boolean) : [];

  if (loading) {
    return (
      <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-light)', fontSize: '18px' }}>Loading experience...</div>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '24px' }}>Experience not found</h1>
          <Link className="btn btn-outline" to="/services">Back to all experiences</Link>
        </div>
      </section>
    );
  }

  const hasReviews = service.reviews && service.reviews.length > 0;
  const hasPackages = service.packages && service.packages.length > 0;

  return (
    <>
      <SEO title={`${service.title} | ${settings.siteTitle || 'Experience Studio'}`} description={service.shortDescription || service.subtitle} image={service.image} />
      
      {/* Dynamic Styles for Hover Effects */}
      <style>{`
        .bento-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .bento-box:hover .bento-img {
          transform: scale(1.03);
        }
        .package-card {
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 20px;
          background: #fff;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .package-card:hover {
          border-color: var(--green);
          box-shadow: 0 10px 24px rgba(22, 101, 52, 0.08);
          transform: translateY(-2px);
        }
        .sticky-sidebar {
          position: sticky;
          top: 100px;
        }
        .review-card {
          background: #fff;
          border: 1px solid var(--line);
          padding: 24px;
          border-radius: 16px;
          transition: box-shadow 0.3s ease;
        }
        .review-card:hover {
          box-shadow: 0 12px 30px rgba(0,0,0,0.06);
        }
      `}</style>
      
      {/* Top Header Section */}
      <section className="section" style={{ paddingBottom: '24px', paddingTop: '120px' }}>
        <div className="container">
          
          <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', textDecoration: 'none', fontWeight: '600', fontSize: '14px', marginBottom: '24px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--green)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-light)'}>
            <ArrowLeft size={16} /> Back to experiences
          </Link>
          
          <div style={{ color: 'var(--green)', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1.5px' }}>
            {service.groupName || service.category}
          </div>
          
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '20px', lineHeight: '1.1', fontWeight: '800', color: '#111827' }}>
            {service.title}
          </h1>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', fontSize: '15px', color: '#4b5563', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={18} fill="var(--gold)" color="var(--gold)" />
              <span style={{ fontWeight: '700', color: '#111827' }}>{service.rating}</span>
              <span>({service.reviewCount} reviews)</span>
            </div>
            
            {service.location && (
              <>
                <span style={{ color: '#d1d5db' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={18} color="var(--green)" />
                  <span style={{ fontWeight: '500' }}>{service.location}</span>
                </div>
              </>
            )}
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
              {service.priorityTags?.map(tag => (
                <span key={tag} style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }}>
                  {tag}
                </span>
              ))}
              {service.experienceTags?.map(tag => (
                <span key={tag} style={{ background: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '8px', fontWeight: '500', fontSize: '13px' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', alignItems: 'start' }}>
          
          {/* Gallery Bento Box */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr', 
              gap: '12px', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              height: 'clamp(300px, 60vh, 550px)',
              cursor: 'pointer'
            }}>
              {/* Main Image */}
              <div className="bento-box" style={{ width: '100%', height: '100%', overflow: 'hidden' }} onClick={() => setActiveImageIndex(0)}>
                <img src={service.image} alt={service.title} className="bento-img" />
              </div>
              
              {/* Side Images */}
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '12px', height: '100%' }}>
                <div className="bento-box" style={{ width: '100%', height: '100%', overflow: 'hidden' }} onClick={() => service.gallery?.[0] && setActiveImageIndex(1)}>
                  {service.gallery && service.gallery[0] ? (
                     <img src={service.gallery[0]} alt="Gallery 1" className="bento-img" />
                  ) : <div style={{ background: '#f3f4f6', height: '100%', width: '100%' }} />}
                </div>
                <div className="bento-box" style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }} onClick={() => service.gallery?.[1] && setActiveImageIndex(2)}>
                  {service.gallery && service.gallery[1] ? (
                    <>
                      <img src={service.gallery[1]} alt="Gallery 2" className="bento-img" />
                      {allImages.length > 3 && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                          +{allImages.length - 3}
                        </div>
                      )}
                    </>
                  ) : <div style={{ background: '#f3f4f6', height: '100%', width: '100%' }} />}
                </div>
              </div>
            </div>
          </div>
          
          {/* Layout with Sidebar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '64px', gridColumn: '1 / -1' }}>
            
            {/* Left Content Column */}
            <article style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '56px' }}>
              
              {/* Short Description */}
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>About</h2>
                <p style={{ fontSize: '18px', lineHeight: '1.7', color: '#4b5563', margin: 0, fontWeight: '400' }}>
                  {service.shortDescription || service.subtitle}
                </p>
              </div>

              {/* Quick Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                {service.duration && (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <Clock size={24} color="#374151" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '16px', color: '#111827', marginBottom: '4px' }}>Duration: {service.duration}</strong>
                      <span style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.4', display: 'block' }}>{service.availabilityNote || 'Check availability to see times'}</span>
                    </div>
                  </div>
                )}
                {service.freeCancellation && (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <CalendarDays size={24} color="#374151" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '16px', color: '#111827', marginBottom: '4px' }}>Free cancellation</strong>
                      <span style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.4', display: 'block' }}>{service.cancellationPolicy || 'Up to 24 hours in advance'}</span>
                    </div>
                  </div>
                )}
                {service.instructorDescription && (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <Users size={24} color="#374151" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '16px', color: '#111827', marginBottom: '4px' }}>Expert Instructor</strong>
                      <span style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.4', display: 'block' }}>{service.instructorDescription}</span>
                    </div>
                  </div>
                )}
                {service.languages?.length > 0 && (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <Languages size={24} color="#374151" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '16px', color: '#111827', marginBottom: '4px' }}>Languages</strong>
                      <span style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.4', display: 'block' }}>{service.languages.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />

              {/* Full Description */}
              {(service.fullDescription || service.description) && (
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '20px', fontWeight: '700' }}>Experience in detail</h2>
                  <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#4b5563', whiteSpace: 'pre-wrap' }}>
                    {service.fullDescription || service.description}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {service.highlights?.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '24px', marginBottom: '20px', fontWeight: '700' }}>Highlights</h3>
                  <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', padding: 0, margin: 0, listStyle: 'none' }}>
                    {service.highlights.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          <CheckCircle2 size={12} color="#4f46e5" />
                        </div>
                        <span style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />

              {/* Includes / Excludes */}
              {(service.includes?.length > 0 || service.excludes?.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                  {service.includes?.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '700' }}>Includes</h3>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {service.includes.map((item, idx) => (
                          <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '16px', color: '#4b5563' }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {service.excludes?.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '700' }}>Not included</h3>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {service.excludes.map((item, idx) => (
                          <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <XCircle size={20} color="#9ca3af" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '16px', color: '#4b5563', textDecoration: 'line-through' }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Meeting Point */}
              {(service.meetingPointTitle || service.meetingPointDescription) && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />
                  <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px', fontWeight: '700' }}>Meeting point</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>{service.meetingPointTitle}</h3>
                      <p style={{ margin: 0, lineHeight: '1.6', fontSize: '16px', color: '#4b5563' }}>{service.meetingPointDescription}</p>
                      
                      {service.googleMapsUrl && (
                        <div>
                          <a href={service.googleMapsUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--green)', fontWeight: '600', textDecoration: 'underline' }}>
                            <MapIcon size={18} /> Open in Google Maps
                          </a>
                        </div>
                      )}
                      
                      {service.mapEmbed && (
                        <div style={{ borderRadius: '16px', overflow: 'hidden', height: '300px', border: '1px solid #e5e7eb', marginTop: '8px' }}>
                          <iframe src={service.mapEmbed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {/* Important Information */}
              {(service.notAllowed?.length > 0 || service.whatToBring?.length > 0 || service.knowBeforeYouGo?.length > 0) && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />
                  <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px', fontWeight: '700' }}>Important information</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
                      {service.whatToBring?.length > 0 && (
                        <div>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            What to bring
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', lineHeight: '1.6', fontSize: '15px' }}>
                            {service.whatToBring.map(i => <li key={i} style={{ marginBottom: '8px' }}>{i}</li>)}
                          </ul>
                        </div>
                      )}
                      {service.notAllowed?.length > 0 && (
                        <div>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            Not allowed
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', lineHeight: '1.6', fontSize: '15px' }}>
                            {service.notAllowed.map(i => <li key={i} style={{ marginBottom: '8px' }}>{i}</li>)}
                          </ul>
                        </div>
                      )}
                      {service.knowBeforeYouGo?.length > 0 && (
                        <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            Know before you go
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', lineHeight: '1.6', fontSize: '15px' }}>
                            {service.knowBeforeYouGo.map(i => <li key={i} style={{ marginBottom: '8px' }}>{i}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Reviews */}
              {hasReviews && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />
                  <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '24px', fontWeight: '700' }}>What travelers loved</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                      {service.reviews.map((review, idx) => (
                        <div key={review.id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f3f4f6', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                              {review.reviewerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong style={{ display: 'block', fontSize: '16px', color: '#111827' }}>{review.reviewerName}</strong>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                                {review.reviewerCountry && <span>{review.reviewerCountry}</span>}
                                {review.reviewDate && <span>• {review.reviewDate}</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} fill={i < review.rating ? 'var(--gold)' : '#e5e7eb'} color={i < review.rating ? 'var(--gold)' : '#e5e7eb'} />
                            ))}
                          </div>
                          
                          <p style={{ margin: 0, lineHeight: '1.6', color: '#374151', fontSize: '16px' }}>{review.content}</p>
                          
                          {idx !== service.reviews.length - 1 && (
                            <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', marginTop: '32px', marginBottom: 0 }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </article>

            {/* Sidebar Pricing & Packages */}
            <aside style={{ flex: '1 1 350px', maxWidth: '420px' }}>
              <div className="sticky-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Book now card */}
                <div style={{ 
                  background: 'var(--white)', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '24px', 
                  padding: '32px', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.06)' 
                }}>
                  <h3 style={{ fontSize: '24px', margin: '0 0 24px 0', fontWeight: '800' }}>Select your package</h3>
                  
                  {hasPackages ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {service.packages.map(pkg => (
                        <div key={pkg.id} className="package-card" style={{ border: '2px solid #f3f4f6', borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f9fafb' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.background = '#f9fafb'; }} onClick={() => handleReserve(pkg)}>
                          <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>{pkg.name}</h4>
                          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--green-darkest)' }}>
                            {pkg.priceLabel || (/^\d+(\.\d+)?$/.test(String(pkg.price).trim()) ? `$${pkg.price} / person` : `${pkg.price} ${pkg.currency}`)}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px', color: '#4b5563' }}>
                            {pkg.duration && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={18} color="var(--green)" /> {pkg.duration}</div>}
                            {pkg.groupSize && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={18} color="var(--green)" /> {pkg.groupSize}</div>}
                          </div>
                          
                          {pkg.description && <p style={{ fontSize: '15px', color: '#374151', margin: '0', lineHeight: '1.6' }}>{pkg.description}</p>}
                          
                          <button className="btn" style={{ width: '100%', marginTop: '8px', padding: '14px', borderRadius: '12px' }} onClick={(e) => { e.stopPropagation(); handleReserve(pkg); }}>
                            Request Availability
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>
                        {/^\d+(\.\d+)?$/.test(String(service.price).trim()) ? `From $${service.price} / person` : service.price}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563' }}><Clock size={20} color="var(--green)" /> {service.duration}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563' }}><Users size={20} color="var(--green)" /> {service.groupSize}</div>
                      </div>
                      <button className="btn full" style={{ marginTop: '16px', padding: '16px', fontSize: '16px' }} onClick={() => handleReserve(null)}>Request Availability</button>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <a className="btn btn-outline full" href={settings.whatsappUrl || '#'} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', justifyContent: 'center', padding: '14px' }}>
                      <MessageCircle size={20} /> 
                      <span style={{ marginLeft: '8px' }}>Ask on WhatsApp</span>
                    </a>
                  </div>
                </div>
                
              </div>
            </aside>
          </div>
        </div>
      </section>

      {modalOpen && <InquiryModal service={service} selectedPackage={selectedPackage} onClose={() => setModalOpen(false)} />}
      
      {/* Fullscreen Image Viewer */}
      {activeImageIndex !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
        }}>
          <button 
            onClick={() => setActiveImageIndex(null)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '12px', borderRadius: '50%', cursor: 'pointer', zIndex: 2, display: 'flex' }}>
            <X size={24} />
          </button>
          
          {allImages.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1)); }}
              style={{ position: 'absolute', left: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '16px', borderRadius: '50%', cursor: 'pointer', zIndex: 2, display: 'flex' }}>
              <ChevronLeft size={32} />
            </button>
          )}

          <img 
            src={allImages[activeImageIndex]} 
            alt="Fullscreen view" 
            style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} 
          />

          {allImages.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0)); }}
              style={{ position: 'absolute', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '16px', borderRadius: '50%', cursor: 'pointer', zIndex: 2, display: 'flex' }}>
              <ChevronRight size={32} />
            </button>
          )}
          
          <div style={{ position: 'absolute', bottom: '24px', color: 'white', fontWeight: '500', letterSpacing: '1px' }}>
            {activeImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
}
