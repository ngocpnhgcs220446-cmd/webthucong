import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import ServiceCard from '../components/ServiceCard';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { categories } from '../data/initialData';
import SmartProductForm from '../admin/components/SmartProductForm';
import FullProductEditor from '../admin/components/FullProductEditor';
import { useAuth, useAdminMode } from '../context/AuthContext';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState('');
  const [services, setServices] = useState([]);
  
  const { isAdmin, logout } = useAuth();
  const isAdminMode = useAdminMode();
  const [isFullEditorOpen, setIsFullEditorOpen] = useState(false);
  const [isSmartAddOpen, setIsSmartAddOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingService, setEditingService] = useState(null);

  const fetchServices = async () => {
    try {
      let res;
      if (isAdminMode) {
        res = await apiFetch('/api/admin/services');
      } else {
        res = await fetch('/api/services');
      }
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [isAdminMode]);

  const filtered = useMemo(() => {
    return services.filter((service) => {
      const matchCategory = category === 'all' || service.category === category;
      const matchQuery = [service.title, service.subtitle, service.description, service.location]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [services, category, query]);

  const changeCategory = (value) => {
    setCategory(value);
    if (value === 'all') setSearchParams({});
    else setSearchParams({ category: value });
  };

  const activeFeaturedCount = services.filter(s => s.featured && s.active).length;

  const handleSaveService = async (formData) => {
    const toastId = toast.loading('Saving...');
    try {
      if (formMode === 'edit') {
        if (!editingServiceId) {
          toast.error('Cannot update product without a valid ID.', { id: toastId });
          return;
        }
        const res = await apiFetch(`/api/services/${encodeURIComponent(editingServiceId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw res;
        toast.success('Product updated successfully', { id: toastId });
      } else {
        const res = await apiFetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw res;
        toast.success('Product created successfully', { id: toastId });
      }

      setIsFullEditorOpen(false);
      setIsSmartAddOpen(false);
      setFormMode('create');
      setEditingServiceId(null);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      if (err.json) {
        const errData = await err.json().catch(() => ({}));
        toast.error(errData.error || 'Operation failed', { id: toastId });
        const thrown = new Error(errData.error || 'Operation failed');
        thrown.fields = errData.fields || {};
        throw thrown;
      }
      toast.error(err.message || 'Network error', { id: toastId });
      throw err;
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await apiFetch(`/api/services/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Service deleted');
        fetchServices();
      } else {
        toast.error('Delete failed');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const openNewService = () => {
    setFormMode('create');
    setEditingServiceId(null);
    setEditingService(null);
    setIsSmartAddOpen(true);
  };

  const openEditService = (service) => {
    if (!service || typeof service.id !== 'string' || !service.id.trim()) {
      toast.error('Cannot edit because Product has no valid ID.');
      return;
    }
    setFormMode('edit');
    setEditingServiceId(service.id);
    setEditingService(service);
    setIsFullEditorOpen(true);
  };

  return (
    <PageTransition>
      <SEO title="Our Services | Conical Hat-Workshop group" description="Browse our conical hat making workshops, online experiences, and DIY kits." />
      <section className="page-hero-immersive">
        <img src="/pics/product1.jpg" alt="Services background" />
        <ScrollReveal className="page-hero-immersive-content">
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>Our Services</span>
          <h1>Explore Our Experiences</h1>
          <p>Each service includes images, a short description, reference pricing, and booking options.</p>
        </ScrollReveal>
      </section>

      <section className="section">
        <div className="container">
          {isAdminMode && (
            <div style={{
              background: activeFeaturedCount === 4 ? 'var(--green-light)' : (activeFeaturedCount > 4 ? '#fee2e2' : '#fef9c3'),
              color: activeFeaturedCount === 4 ? 'var(--green-darkest)' : (activeFeaturedCount > 4 ? '#991b1b' : '#854d0e'),
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: `1px solid ${activeFeaturedCount === 4 ? 'var(--green)' : (activeFeaturedCount > 4 ? '#f87171' : '#facc15')}`
            }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Featured Workshops: {activeFeaturedCount} / 4 selected</strong>
              {activeFeaturedCount < 4 && <span>Home needs exactly 4 featured workshops. Please select {4 - activeFeaturedCount} more.</span>}
              {activeFeaturedCount > 4 && <span>Only the first 4 featured workshops will be shown on Home. Please unfeature extra items.</span>}
              {activeFeaturedCount === 4 && <span>Featured section is ready.</span>}
            </div>
          )}

          <div className="service-toolbar">
            <div className="filter-buttons">
              <button className={category === 'all' ? 'active' : ''} onClick={() => changeCategory('all')}>All</button>
              {categories.map((item) => (
                <button key={item.key} className={category === item.key ? 'active' : ''} onClick={() => changeCategory(item.key)}>
                  {item.name}
                </button>
              ))}
            </div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." />
          </div>

          <div className="services-grid">
            {isAdminMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ height: '100%' }}
              >
                <div 
                  onClick={openNewService} 
                  style={{ 
                    height: '100%', minHeight: '300px', display: 'flex', flexDirection: 'column', 
                    alignItems: 'center', justifyContent: 'center', background: 'rgba(23, 66, 54, 0.05)', 
                    border: '1px solid rgba(23, 66, 54, 0.2)', borderRadius: '16px', cursor: 'pointer', 
                    color: 'var(--green)', transition: 'all 0.3s ease', boxShadow: 'inset 0 0 0 1px transparent' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(23, 66, 54, 0.1)';
                    e.currentTarget.style.boxShadow = 'inset 0 0 0 2px var(--green)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(23, 66, 54, 0.05)';
                    e.currentTarget.style.boxShadow = 'inset 0 0 0 1px transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ background: 'var(--white)', borderRadius: '50%', padding: '16px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                    <Plus size={32} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Add Product</h3>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {filtered.map((service, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={service.id}
                  className="admin-section-hover"
                  style={{ position: 'relative' }}
                >
                  {isAdminMode && (
                    <div className="admin-dock-container">
                      <div className="admin-dock">
                        <button onClick={(e) => { e.preventDefault(); openEditService(service); }} title="Edit"><Edit2 size={16} /></button>
                        <button className="danger" onClick={(e) => { e.preventDefault(); handleDeleteService(service.id); }} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )}
                  {isAdminMode && service.active === false && (
                    <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'var(--error)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      Inactive
                    </div>
                  )}
                  <div style={{ opacity: (!service.active && isAdminMode) ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                    <ServiceCard service={service} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="empty-state"
            >
              <h3>No services found</h3>
              <p>Try another keyword or clear the category filter.</p>
            </motion.div>
          )}
        </div>
      </section>

      {isSmartAddOpen && (
        <SmartProductForm 
          onClose={() => {
            setIsSmartAddOpen(false);
            setFormMode('create');
            setEditingServiceId(null);
            setEditingService(null);
          }}
          onSuccess={(res) => {
            setIsSmartAddOpen(false);
            setFormMode('create');
            setEditingServiceId(null);
            setEditingService(null);
            fetchServices();
          }}
          onOpenEditor={(res) => {
            setIsSmartAddOpen(false);
            setFormMode('create');
            setEditingServiceId(null);
            setEditingService(res);
            setIsFullEditorOpen(true);
          }}
        />
      )}

      {isFullEditorOpen && (
        <FullProductEditor 
          service={editingService}
          mode={formMode}
          onClose={() => {
            setIsFullEditorOpen(false);
            setFormMode('create');
            setEditingServiceId(null);
            setEditingService(null);
          }} 
          onSave={handleSaveService} 
        />
      )}
    </PageTransition>
  );
}
