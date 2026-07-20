import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Users, Star, Heart, ShieldCheck, Sparkles, ImagePlus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { SectionHeader } from '../components/Section';
import ServiceCard from '../components/ServiceCard';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import HeroCarousel from '../components/HeroCarousel';
import Marquee from '../components/Marquee';
import { achievements } from '../data/initialData';
import { useEffect, useState, useMemo } from 'react';
import { useAuth, useAdminMode } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { apiFetch } from '../utils/apiFetch';
import Editable from '../components/Editable';
import AdminSectionToolbar from '../admin/components/AdminSectionToolbar';
import FeaturedWorkshopsSection from '../components/FeaturedWorkshopsSection';

const productImages = [
  '/pics/product1.jpg',
  '/pics/product2.jpg',
  '/pics/product3.jpg',
  '/pics/product4.jpg',
  '/pics/product5.jpg',
  '/pics/product6.jpg',
  '/pics/product7.jpg',
];

export default function Home() {
  const [services, setServices] = useState([]);
  const { settings, refreshSettings } = useSettings();
  const [testimonials, setTestimonials] = useState([]);
  
  const [homeSections, setHomeSections] = useState(['hero', 'marquee', 'values', 'intro', 'featured', 'gallery', 'testimonials', 'cta']);
  const [hiddenSections, setHiddenSections] = useState([]);
  const [galleryImages, setGalleryImages] = useState(productImages);

  const { isAdmin, registerSave, clearSave } = useAuth();
  const isAdminMode = useAdminMode();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices).catch(console.error);
    if (settings.homeSections) setHomeSections(JSON.parse(settings.homeSections));
    if (settings.hiddenSections) setHiddenSections(JSON.parse(settings.hiddenSections));
    if (settings.galleryImages) setGalleryImages(JSON.parse(settings.galleryImages));
    fetch('/api/testimonials').then(r => r.json()).then(setTestimonials).catch(console.error);
  }, [settings]);


  const featured = useMemo(() => services.filter((service) => service.featured).slice(0, 4), [services]);


  const saveHomepageLayout = async () => {
    setIsSaving(true);
    try {
      const payload = {
        homeSections: JSON.stringify(homeSections),
        galleryImages: JSON.stringify(galleryImages),
        homeHeroEyebrow: settings.homeHeroEyebrow,
        homeHeroTitle: settings.homeHeroTitle,
        homeHeroDescription: settings.homeHeroDescription,
        homeValuesTitle: settings.homeValuesTitle,
        homeValuesDescription: settings.homeValuesDescription,
        homeIntroTitle: settings.homeIntroTitle,
        homeIntroBody: settings.homeIntroBody,
        homeFeaturedTitle: settings.homeFeaturedTitle,
        homeFeaturedDescription: settings.homeFeaturedDescription,
        homeCtaTitle: settings.homeCtaTitle,
        homeCtaDescription: settings.homeCtaDescription,
        homeHeroPrimaryCta: settings.homeHeroPrimaryCta,
        homeHeroSecondaryCta: settings.homeHeroSecondaryCta,
        homeCtaButtonText: settings.homeCtaButtonText,
        hiddenSections: JSON.stringify(hiddenSections)
      };
      await apiFetch('/api/settings', { 
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify(payload) 
      });
      await refreshSettings();
      toast.success('Homepage layout and content saved successfully!');
    } catch (e) { 
      toast.error('Failed to save layout and content.'); 
    }
    setIsSaving(false);
  };

  // Register this page's save function in AdminBar context
  useEffect(() => {
    registerSave(saveHomepageLayout);
    return () => clearSave();
  }, [homeSections, hiddenSections, galleryImages, settings]);

  const uploadImage = async (file) => {
    if (!file) return null;
    const toastId = toast.loading('Uploading image...');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await apiFetch('/api/upload', { 
        method: 'POST', 
        body: formData 
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      toast.success('Image uploaded!', { id: toastId });
      return data.image.imageUrl;
    } catch (e) {
      toast.error(e.message || 'Failed to upload image', { id: toastId });
      return null;
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setGalleryImages(prev => [...prev, url]);
    // Reset input so the same file can be uploaded again if needed
    e.target.value = null;
  };
  
  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveSection = (index, direction) => {
    const newSections = [...homeSections];
    if (direction === 'up' && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
    }
    setHomeSections(newSections);
  };

  const toggleVisibility = (sectionName) => {
    if (hiddenSections.includes(sectionName)) {
      setHiddenSections(hiddenSections.filter(s => s !== sectionName));
    } else {
      setHiddenSections([...hiddenSections, sectionName]);
    }
  };

  const renderSectionContent = (sectionName) => {
    switch(sectionName) {
      case 'hero':
        return (
          <section className="hero">
            <div className="hero-bg" />
            <div className="container">
              <div className="hero-grid">
                <motion.div
                  className="hero-copy"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                  <Editable value={settings.homeHeroEyebrow || 'Conical Hat Making Workshops'} onSave={(val) => setSettings(s => ({...s, homeHeroEyebrow: val}))} tag="span" className="eyebrow" />
                  <Editable value={settings.homeHeroTitle || 'The Art of Vietnamese Conical Hat Making'} onSave={(val) => setSettings(s => ({...s, homeHeroTitle: val}))} tag="h1" />
                  <Editable value={settings.homeHeroDescription || settings.shortIntro || 'We design hands-on Vietnamese cultural experiences.'} onSave={(val) => setSettings(s => ({...s, homeHeroDescription: val}))} tag="p" type="textarea" />
                  <div className="hero-actions">
                    <Link to="/services" className="btn" onClick={e => isAdminMode && e.preventDefault()}>
                      <Editable value={settings.homeHeroPrimaryCta || 'Explore services'} onSave={(val) => setSettings(s => ({...s, homeHeroPrimaryCta: val}))} tag="span" />
                      <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '8px' }} />
                    </Link>
                    <Link to="/contact" className="btn btn-ghost" onClick={e => isAdminMode && e.preventDefault()}>
                      <Editable value={settings.homeHeroSecondaryCta || 'Send inquiry'} onSave={(val) => setSettings(s => ({...s, homeHeroSecondaryCta: val}))} tag="span" />
                    </Link>
                  </div>
                </motion.div>
                <motion.div
                  className="hero-media"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                >
                  <HeroCarousel images={galleryImages.length > 0 ? galleryImages : productImages} />
                </motion.div>
              </div>
            </div>
          </section>
        );
      case 'marquee':
        return <Marquee />;
      case 'values':
        return (
          <section className="section soft-bg">
            <div className="container">
              <ScrollReveal>
                <SectionHeader 
                  align="center" 
                  eyebrow="Why Choose Us" 
                  title={<Editable value={settings.homeValuesTitle || 'The Authentic Experience'} onSave={(val) => setSettings(s => ({...s, homeValuesTitle: val}))} />}
                  description={<Editable value={settings.homeValuesDescription || 'We are dedicated to preserving heritage through high-quality, hands-on activities.'} onSave={(val) => setSettings(s => ({...s, homeValuesDescription: val}))} type="textarea" />}
                />
              </ScrollReveal>
              <div className="values-grid">
                <ScrollReveal delay={0.1}>
                  <div className="value-card">
                    <ShieldCheck />
                    <h3>Master Artisans</h3>
                    <p>Learn directly from local craftsmen with decades of traditional hat-making experience.</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <div className="value-card">
                    <Heart />
                    <h3>Cultural Immersion</h3>
                    <p>It's not just a craft class. It's a deep dive into the history and stories behind the iconic Nón Lá.</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.3}>
                  <div className="value-card">
                    <Sparkles />
                    <h3>Premium Materials</h3>
                    <p>We source only the highest quality palm leaves and bamboos to ensure your creation lasts.</p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>
        );
      case 'intro':
        return (
          <section className="section">
            <div className="container two-col">
              <ScrollReveal>
                <SectionHeader 
                  eyebrow="Our Story" 
                  title={<Editable value={settings.homeIntroTitle || 'Preserving a Vietnamese Tradition'} onSave={(val) => setSettings(s => ({...s, homeIntroTitle: val}))} />} 
                  description={<Editable value={settings.homeIntroBody || settings.mission || 'To make culture easier to experience, share and remember.'} onSave={(val) => setSettings(s => ({...s, homeIntroBody: val}))} type="textarea" />} 
                />
                <Link to="/about" className="text-link">Read more about us <ArrowRight size={16} /></Link>
              </ScrollReveal>
              <ScrollReveal delay={0.2} className="intro-stats">
                {achievements.slice(0, 2).map((item, index) => (
                  <div className="stat-card" key={item}>
                    <strong>{index === 0 ? '60+' : '100%'}</strong>
                    <span>{item}</span>
                  </div>
                ))}
              </ScrollReveal>
            </div>
          </section>
        );
      case 'featured':
        return (
          <FeaturedWorkshopsSection
            products={services}
            title={settings.homeFeaturedTitle || 'Featured Workshops'}
            description={settings.homeFeaturedDescription || 'Discover our most popular workshops, designed for individuals, groups, and corporate teams.'}
            isAdmin={isAdminMode}
          />
        );
      case 'gallery':
        return (
          <section className="section">
            <div className="container">
              <ScrollReveal>
                <SectionHeader align="center" eyebrow="Our Products" title="Conical Hat Gallery" description="Glimpse into the craftsmanship and the beautiful memories created in our studio." />
              </ScrollReveal>
              <div className="gallery-grid">
                {galleryImages.map((src, i) => (
                  <ScrollReveal key={src + '-' + i} delay={0} className="gallery-item" style={{ position: 'relative' }}>
                    <img src={src} alt="Conical hat product" loading="lazy" />
                    {isAdminMode && (
                      <div className="admin-dock-container" style={{ opacity: 1, transform: 'translateY(0)' }}>
                        <div className="admin-dock">
                          <button className="danger" onClick={() => removeGalleryImage(i)} title="Delete Image"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    )}
                  </ScrollReveal>
                ))}
                {isAdminMode && (
                  <label className="gallery-item admin-section-hover" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(23,66,54,0.2)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(23,66,54,0.05)', minHeight: '200px', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(23, 66, 54, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(23, 66, 54, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ background: 'var(--white)', borderRadius: '50%', padding: '16px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', color: 'var(--green)' }}>
                      <ImagePlus size={32} />
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--green-darkest)', fontWeight: 'bold' }}>Upload Image</span>
                    <input type="file" hidden accept="image/*" onChange={handleGalleryUpload} />
                  </label>
                )}
              </div>
            </div>
          </section>
        );
      case 'testimonials':
        return (
          <section className="section soft-bg">
            <div className="container">
              <ScrollReveal>
                <SectionHeader align="center" eyebrow="Testimonials" title="Loved by Travellers" description="See what our guests are saying about their cultural experience." />
              </ScrollReveal>
              <div className="testimonial-grid">
                {testimonials.map((t, i) => (
                  <ScrollReveal key={t.name} delay={i * 0.1}>
                    <div className="testimonial-card">
                      <div className="testimonial-content">
                        {t.comment}
                      </div>
                      <div className="testimonial-author">
                        <img src={t.avatar} alt={t.name} />
                        <div>
                          <h4>{t.name}</h4>
                          <p>{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        );
      case 'cta':
        return (
          <section className="section dark-section cta-section">
            <div className="container cta-card">
              <ScrollReveal>
                <Editable value={settings.homeCtaTitle || 'Ready to create your own masterpiece?'} onSave={(val) => setSettings(s => ({...s, homeCtaTitle: val}))} tag="h2" />
                <Editable value={settings.homeCtaDescription || 'Join our workshops or get a DIY kit to experience the art of conical hat making, wherever you are.'} onSave={(val) => setSettings(s => ({...s, homeCtaDescription: val}))} tag="p" type="textarea" />
              </ScrollReveal>
              <ScrollReveal delay={0.2} className="cta-actions">
                <Link to="/services" className="btn" onClick={e => isAdminMode && e.preventDefault()}>
                  <Editable value={settings.homeCtaButtonText || 'Explore All Services'} onSave={(val) => setSettings(s => ({...s, homeCtaButtonText: val}))} tag="span" />
                </Link>
              </ScrollReveal>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <SEO
        title="Conical Hat-Workshop group"
        description="The art of Vietnamese conical hat making. We design hands-on Vietnamese cultural experiences for travellers, teams and remote communities through offline workshops, online sessions and curated DIY kits."
      />
      
      {homeSections.map((sectionName, index) => {
        const isHidden = hiddenSections.includes(sectionName);
        if (!isAdminMode && isHidden) return null;
        
        const content = renderSectionContent(sectionName);
        if (!content) return null;
        return (
          <div key={sectionName} style={{ position: 'relative', opacity: isHidden ? 0.5 : 1 }}>
            <AdminSectionToolbar 
              index={index} 
              sectionName={sectionName} 
              totalSections={homeSections.length}
              moveSection={moveSection}
              toggleVisibility={toggleVisibility}
              isHidden={isHidden}
            />
            {content}
          </div>
        );
      })}
    </PageTransition>
  );
}
