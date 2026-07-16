import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, MapPin, MessageCircle, Users, Star, Info, XCircle, Map, ShieldCheck, Languages, Accessibility, AlertTriangle } from 'lucide-react';
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

  if (loading) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>Loading experience...</h1>
        </div>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>Experience not found</h1>
          <Link className="btn" to="/services">Back to all experiences</Link>
        </div>
      </section>
    );
  }

  const hasReviews = service.reviews && service.reviews.length > 0;
  const hasPackages = service.packages && service.packages.length > 0;

  return (
    <>
      <SEO title={`${service.title} | ${settings.siteTitle || 'Experience Studio'}`} description={service.shortDescription || service.subtitle} image={service.image} />
      
      {/* Top Breadcrumb & Title */}
      <section className="section" style={{ paddingBottom: '0', paddingTop: '120px' }}>
        <div className="container">
          <Link to="/services" className="back-link" style={{ marginBottom: '16px', display: 'inline-flex' }}><ArrowLeft size={18} /> Back to experiences</Link>
          <div style={{ color: 'var(--text-light)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
            {service.groupName || service.category}
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{service.title}</h1>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={16} fill="var(--gold)" color="var(--gold)" />
              <span style={{ fontWeight: 'bold' }}>{service.rating} / 5</span>
              <span style={{ color: 'var(--text-light)' }}>({service.reviewCount} reviews)</span>
            </div>
            {service.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)' }}>
                <MapPin size={16} />
                <span>{service.location}</span>
              </div>
            )}
            
            {service.priorityTags && service.priorityTags.map(tag => (
              <span key={tag} style={{ background: 'var(--gold)', color: 'var(--green-darkest)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                {tag}
              </span>
            ))}
            
            {service.experienceTags && service.experienceTags.map(tag => (
              <span key={tag} style={{ background: 'rgba(23,66,54,0.1)', color: 'var(--green-darkest)', padding: '2px 8px', borderRadius: '4px' }}>
                {tag}
              </span>
            ))}
            
            {service.bookingTags && service.bookingTags.map(tag => (
              <span key={tag} style={{ border: '1px solid var(--green)', color: 'var(--green-darkest)', padding: '2px 8px', borderRadius: '4px' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <section className="section" style={{ paddingTop: '16px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'start' }}>
          
          <div className="activity-main" style={{ gridColumn: '1 / -1' }}>
            {/* Gallery Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', borderRadius: '16px', overflow: 'hidden', height: '400px', marginBottom: '40px' }}>
              <div style={{ width: '100%', height: '100%' }}>
                <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '12px', height: '100%' }}>
                {service.gallery && service.gallery[0] ? (
                   <img src={service.gallery[0]} alt="Gallery 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div style={{ background: '#eee', height: '100%' }} />}
                {service.gallery && service.gallery[1] ? (
                   <img src={service.gallery[1]} alt="Gallery 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div style={{ background: '#eee', height: '100%' }} />}
              </div>
            </div>
          </div>
          
          {/* Layout with Sidebar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', gridColumn: '1 / -1' }}>
            <article style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              {/* Trust & Key Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: '500' }}>{service.shortDescription || service.subtitle}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px' }}>
                  {service.freeCancellation && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <CalendarDays size={24} color="var(--green)" />
                      <div>
                        <strong>Free cancellation</strong>
                        <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: '4px 0 0' }}>{service.cancellationPolicy || 'Cancel up to 24 hours in advance for a full refund'}</p>
                      </div>
                    </div>
                  )}
                  {service.reserveNowPayLater && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <ShieldCheck size={24} color="var(--green)" />
                      <div>
                        <strong>Reserve now & pay later</strong>
                        <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: '4px 0 0' }}>{service.reservePolicy || 'Keep your travel plans flexible — book your spot and pay nothing today'}</p>
                      </div>
                    </div>
                  )}
                  {service.duration && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Clock size={24} />
                      <div>
                        <strong>Duration: {service.duration}</strong>
                        <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: '4px 0 0' }}>{service.availabilityNote || 'Check availability to see starting times'}</p>
                      </div>
                    </div>
                  )}
                  {service.instructorDescription && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Users size={24} />
                      <div>
                        <strong>Instructor</strong>
                        <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: '4px 0 0' }}>{service.instructorDescription}</p>
                      </div>
                    </div>
                  )}
                  {service.languages && service.languages.length > 0 && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Languages size={24} />
                      <div>
                        <strong>Languages</strong>
                        <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: '4px 0 0' }}>{service.languages.join(', ')}</p>
                      </div>
                    </div>
                  )}
                  {service.wheelchairAccessible && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Accessibility size={24} />
                      <div>
                        <strong>Wheelchair accessible</strong>
                      </div>
                    </div>
                  )}
                  {service.smallGroup && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Users size={24} />
                      <div>
                        <strong>Small group</strong>
                        <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: '4px 0 0' }}>{service.groupLimit ? `Limited to ${service.groupLimit} participants` : 'Limited size for a better experience'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--line)' }} />

              {/* Highlights */}
              {service.highlights && service.highlights.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Highlights</h2>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: 0, margin: 0, listStyle: 'none' }}>
                    {service.highlights.map(item => (
                      <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <CheckCircle2 size={20} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '16px', lineHeight: '1.5' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--line)' }} />

              {/* Full Description */}
              {(service.fullDescription || service.description) && (
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Full description</h2>
                  <div style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {service.fullDescription || service.description}
                  </div>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--line)' }} />

              {/* Includes / Excludes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
                {service.includes && service.includes.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Includes</h3>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {service.includes.map(item => (
                        <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '15px' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {service.excludes && service.excludes.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Excludes</h3>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {service.excludes.map(item => (
                        <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <XCircle size={18} color="var(--error)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '15px' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--line)' }} />
              
              {/* Not Suitable For */}
              {service.notSuitableFor && service.notSuitableFor.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Not suitable for</h3>
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {service.notSuitableFor.map(item => (
                      <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <XCircle size={18} color="var(--text-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '15px' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--line)' }} />

              {/* Meeting Point */}
              {(service.meetingPointTitle || service.meetingPointDescription) && (
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Meeting point</h2>
                  <div style={{ background: 'var(--surface-color, #f9f9f9)', padding: '24px', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>{service.meetingPointTitle}</h3>
                    <p style={{ margin: '0 0 16px 0', lineHeight: '1.6' }}>{service.meetingPointDescription}</p>
                    {service.googleMapsUrl && (
                      <a href={service.googleMapsUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Map size={18} /> Open in Google Maps
                      </a>
                    )}
                    {service.mapEmbed && (
                      <div style={{ marginTop: '24px', borderRadius: '8px', overflow: 'hidden', height: '300px' }}>
                        <iframe src={service.mapEmbed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--line)' }} />

              {/* Important Information */}
              {(service.notAllowed?.length > 0 || service.whatToBring?.length > 0 || service.knowBeforeYouGo?.length > 0) && (
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Important information</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {service.whatToBring?.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>What to bring</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {service.whatToBring.map(i => <li key={i} style={{ marginBottom: '8px' }}>{i}</li>)}
                        </ul>
                      </div>
                    )}
                    {service.notAllowed?.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Not allowed</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {service.notAllowed.map(i => <li key={i} style={{ marginBottom: '8px' }}>{i}</li>)}
                        </ul>
                      </div>
                    )}
                    {service.knowBeforeYouGo?.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Know before you go</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {service.knowBeforeYouGo.map(i => <li key={i} style={{ marginBottom: '8px' }}>{i}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--line)' }} />

              {/* Reviews */}
              {hasReviews && (
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>What travelers loved</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    {service.reviews.map(review => (
                      <div key={review.id} style={{ background: 'var(--surface-color, #f9f9f9)', padding: '24px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={16} fill={i < review.rating ? 'var(--gold)' : 'none'} color={i < review.rating ? 'var(--gold)' : '#ccc'} />
                          ))}
                        </div>
                        <p style={{ fontStyle: 'italic', margin: '0 0 16px 0', lineHeight: '1.6' }}>"{review.content}"</p>
                        <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                          <strong>{review.reviewerName}</strong>
                          {review.reviewerCountry && <span> – {review.reviewerCountry}</span>}
                          {review.reviewDate && <div style={{ marginTop: '4px' }}>{review.reviewDate}</div>}
                          {review.verifiedBooking && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: 'var(--green)' }}>
                              <ShieldCheck size={14} /> Verified booking
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </article>

            {/* Sidebar Pricing & Packages */}
            <aside style={{ flex: '1 1 350px', maxWidth: '400px' }}>
              <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Book now card */}
                <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '20px', margin: '0 0 24px 0' }}>Select your package</h3>
                  
                  {hasPackages ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {service.packages.map(pkg => (
                        <div key={pkg.id} style={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{pkg.name}</h4>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{pkg.priceLabel || `${pkg.price} ${pkg.currency}`}</div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-light)', marginBottom: '16px' }}>
                            {pkg.duration && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> {pkg.duration}</div>}
                            {pkg.groupSize && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> {pkg.groupSize}</div>}
                          </div>
                          
                          {pkg.description && <p style={{ fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>{pkg.description}</p>}
                          
                          <button className="btn full" onClick={() => handleReserve(pkg)}>Request Availability</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{service.price}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)' }}><Clock size={16} /> {service.duration}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)' }}><Users size={16} /> {service.groupSize}</div>
                      <button className="btn full" onClick={() => handleReserve(null)}>Request Availability</button>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <a className="btn btn-outline full" href={settings.whatsappUrl || '#'} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', justifyContent: 'center' }}><MessageCircle size={18} /> WhatsApp Support</a>
                  </div>
                </div>
                
              </div>
            </aside>
          </div>
        </div>
      </section>

      {modalOpen && <InquiryModal service={service} selectedPackage={selectedPackage} onClose={() => setModalOpen(false)} />}
    </>
  );
}
