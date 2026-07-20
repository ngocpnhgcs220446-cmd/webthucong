import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, ExternalLink, Save, Star, Upload } from 'lucide-react';
import { 
  PRODUCT_CATEGORIES, 
  PRODUCT_COLLECTIONS, 
  EXPERIENCE_TAGS, 
  BOOKING_TAGS, 
  PRIORITY_TAGS 
} from '../../config/productOptions';
import AdminImageUploader from './AdminImageUploader';
import AdminEditableList from './AdminEditableList';
import { uploadImage } from '../../utils/apiFetch';

function SectionGroup({ title, description, children }) {
  return (
    <div className="form-section">
      {title && <div className="form-section-title">{title}</div>}
      {description && <div className="form-section-description">{description}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {children}
      </div>
    </div>
  );
}

function ChipSelector({ options, selected, onChange }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(x => x !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(opt => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: isSelected ? '1px solid var(--green)' : '1px solid #e2e8f0',
              background: isSelected ? 'rgba(40,111,88,0.1)' : 'white',
              color: isSelected ? 'var(--green-darkest)' : '#475569',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: isSelected ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function safeArr(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

function normalizeService(s) {
  if (!s) return null;
  return {
    ...s,
    gallery: safeArr(s.gallery),
    highlights: safeArr(s.highlights),
    includes: safeArr(s.includes),
    suitableFor: safeArr(s.suitableFor),
    languages: safeArr(s.languages),
    excludes: safeArr(s.excludes),
    notAllowed: safeArr(s.notAllowed),
    whatToBring: safeArr(s.whatToBring),
    knowBeforeYouGo: safeArr(s.knowBeforeYouGo),
    experienceTags: safeArr(s.experienceTags),
    bookingTags: safeArr(s.bookingTags),
    priorityTags: safeArr(s.priorityTags),
    packages: safeArr(s.packages),
    reviews: safeArr(s.reviews),
    sortOrder: s.sortOrder ?? 0,
    active: s.active !== undefined ? s.active : true,
    featured: s.featured || false,
    freeCancellation: s.freeCancellation !== undefined ? s.freeCancellation : true,
    reserveNowPayLater: s.reserveNowPayLater !== undefined ? s.reserveNowPayLater : true,
    wheelchairAccessible: s.wheelchairAccessible || false,
    smallGroup: s.smallGroup || false,
    defaultEstimatedPrice: s.defaultEstimatedPrice ?? '',
    groupLimit: s.groupLimit ?? '',
    minGuests: s.minGuests ?? '',
    maxGuests: s.maxGuests ?? '',
    cancellationPolicy: s.cancellationPolicy || '',
    reservePolicy: s.reservePolicy || '',
    availabilityNote: s.availabilityNote || '',
    instructorDescription: s.instructorDescription || '',
    groupName: s.groupName || '',
    shortDescription: s.shortDescription || '',
    fullDescription: s.fullDescription || '',
    meetingPointTitle: s.meetingPointTitle || '',
    meetingPointDescription: s.meetingPointDescription || '',
    googleMapsUrl: s.googleMapsUrl || '',
    mapEmbed: s.mapEmbed || '',
  };
}

export default function FullProductEditor({ service, mode, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(
    normalizeService(service) || {
      title: '', slug: '', subtitle: '', description: '',
      price: '', duration: '', groupSize: '', location: '',
      category: PRODUCT_CATEGORIES[0].key, imageUrl: '', imagePublicId: '', featured: false,
      active: true, sortOrder: 0, minGuests: '', maxGuests: '', defaultEstimatedPrice: '',
      groupName: '', shortDescription: '', fullDescription: '',
      freeCancellation: true, cancellationPolicy: '', reserveNowPayLater: true, reservePolicy: '',
      availabilityNote: '', instructorDescription: '', languages: [], wheelchairAccessible: false,
      smallGroup: false, groupLimit: '', excludes: [], notAllowed: [], whatToBring: [], knowBeforeYouGo: [],
      meetingPointTitle: '', meetingPointDescription: '', googleMapsUrl: '', mapEmbed: '',
      gallery: [], highlights: [], includes: [], suitableFor: [], packages: [], reviews: [],
      experienceTags: [], bookingTags: [], priorityTags: []
    }
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tags', label: 'Tags & Positioning' },
    { id: 'packages', label: 'Pricing / Packages' },
    { id: 'experience', label: 'Experience Details' },
    { id: 'description', label: 'Description & Lists' },
    { id: 'meeting', label: 'Meeting Point' },
    { id: 'reviews', label: 'Reviews' }
  ];

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (name === 'defaultEstimatedPrice') {
      value = value.replace(/[^0-9.]/g, ''); // numeric only
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleTitleBlur = () => {
    if (mode === 'create' && !formData.slug && formData.title) {
      const generatedSlug = String(formData.title)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
      setErrors(prev => ({ ...prev, slug: null }));
    }
  };

  const handleArrayChange = (name, arr) => setFormData(prev => ({ ...prev, [name]: arr }));

  // Package Management
  const addPackage = () => {
    setFormData(prev => ({
      ...prev,
      packages: [
        ...prev.packages,
        { id: '', name: 'New Package', price: 0, currency: 'USD', duration: '', groupSize: '', active: true, description: '', priceLabel: '' }
      ]
    }));
  };

  const updatePackage = (index, field, value) => {
    const newPackages = [...formData.packages];
    if (field === 'price') value = value.replace(/[^0-9.]/g, '');
    newPackages[index][field] = value;
    setFormData(prev => ({ ...prev, packages: newPackages }));
  };

  const removePackage = (index) => {
    setFormData(prev => ({ ...prev, packages: prev.packages.filter((_, i) => i !== index) }));
  };

  // Review Management
  const addReview = () => {
    setFormData(prev => ({
      ...prev,
      reviews: [
        ...prev.reviews,
        { id: '', reviewerName: 'New Reviewer', reviewerCountry: 'Country', rating: 5, content: '', reviewDate: '' }
      ]
    }));
  };

  const updateReview = (index, field, value) => {
    const newReviews = [...formData.reviews];
    newReviews[index][field] = field === 'rating' ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, reviews: newReviews }));
  };

  const removeReview = (index) => {
    setFormData(prev => ({ ...prev, reviews: prev.reviews.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.slug) newErrors.slug = 'Slug is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveTab('overview');
      toast.error('Please fill in required fields');
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (mode === 'create') {
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
      }
      if (payload.defaultEstimatedPrice === '') payload.defaultEstimatedPrice = null;
      else payload.defaultEstimatedPrice = parseFloat(payload.defaultEstimatedPrice);
      
      await onSave(payload);
    } catch (error) {
      if (error.fields) {
        setErrors(error.fields);
        if (error.fields.featured) setActiveTab('overview');
        toast.error('Validation errors, please check the form.');
      } else {
        toast.error(error.error || error.message || 'Failed to save product');
      }
    }
    setIsSaving(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.55)' }}>
      <div className="product-modal" style={{ width: '100%', maxWidth: '960px', maxHeight: 'calc(100vh - 32px)', overflow: 'hidden', borderRadius: '16px', background: '#fff', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.24)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: 700 }}>
              {mode === 'edit' ? `Edit Product: ${formData.title}` : 'Add New Product'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Manage product details, packages, and rich content.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {mode === 'edit' && formData.slug && (
              <a href={`/services/${formData.slug}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                <ExternalLink size={14} /> Preview Product
              </a>
            )}
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }} aria-label="Close modal"><X size={22} /></button>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto', padding: '0 8px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
              style={{
                padding: '14px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--green)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--green-darkest)' : '#64748b',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
              {(tab.id === 'overview' && (errors.title || errors.slug || errors.featured)) && <span style={{ position: 'absolute', top: '10px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <form id="productForm" onSubmit={handleSubmit} className="admin-form-body" style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
          
          {/* TAB: OVERVIEW */}
          <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
            
            <SectionGroup title="Main Identity" description="Core details used to identify this product on the platform.">
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Product name <span style={{color: 'red'}}>*</span></label>
                  <input name="title" value={formData.title} onChange={handleChange} onBlur={handleTitleBlur} style={{ border: errors.title ? '1px solid red' : '' }} required placeholder="e.g. Traditional Lion Head Crafting" />
                  {errors.title && <span style={{ color: 'red', fontSize: '12px' }}>{errors.title}</span>}
                </div>
                <div className="form-field">
                  <label>URL Slug <span style={{color: 'red'}}>*</span></label>
                  <input name="slug" value={formData.slug} onChange={handleChange} style={{ border: errors.slug ? '1px solid red' : '' }} required placeholder="auto-generated-slug" />
                </div>
              </div>
              
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {PRODUCT_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Product group / Collection</label>
                  <select name="groupName" value={formData.groupName} onChange={handleChange}>
                    <option value="">None</option>
                    {PRODUCT_COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Media Gallery (Select 1 Cover) <span style={{ color: 'red' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginTop: '8px' }}>
                  {formData.gallery?.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: formData.imageUrl === url ? '3px solid var(--green)' : '1px solid #d1d5db' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      <button type="button" onClick={() => { setFormData(prev => ({...prev, imageUrl: url, imagePublicId: prev.galleryPublicIds?.[idx] || null})); setErrors(prev => ({...prev, imageUrl: null})); }} title="Set as Cover" style={{ position: 'absolute', top: 4, left: 4, background: formData.imageUrl === url ? 'var(--green)' : 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                        <Star size={14} fill={formData.imageUrl === url ? 'white' : 'none'} />
                      </button>
                      
                      <button type="button" onClick={() => {
                        const nextG = formData.gallery.filter((_, i) => i !== idx);
                        setFormData(prev => {
                          const newImage = prev.imageUrl === url ? (nextG.length ? nextG[0] : '') : prev.imageUrl;
                          return { ...prev, gallery: nextG, imageUrl: newImage };
                        });
                      }} title="Remove" style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                        <X size={14} />
                      </button>

                      {formData.imageUrl === url && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--green)', color: 'white', fontSize: 10, textAlign: 'center', padding: '4px 0', fontWeight: 'bold' }}>COVER</div>
                      )}
                    </div>
                  ))}
                  
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', border: '2px dashed #cbd5e1', borderRadius: 8, cursor: 'pointer', background: '#f8fafc', color: '#64748b' }}>
                    <Upload size={20} style={{ marginBottom: 4 }} />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>Upload</span>
                    <input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (!files.length) return;
                      const toastId = toast.loading(`Uploading ${files.length} images...`);
                      try {
                        const newUrls = [];
                        const newPublicIds = [];
                        for (const f of files) {
                          const res = await uploadImage(f);
                          if (res.image) {
                            newUrls.push(res.image.imageUrl);
                            newPublicIds.push(res.image.publicId);
                          }
                        }
                        setFormData(prev => {
                          const updatedGallery = [...(prev.gallery || []), ...newUrls];
                          const updatedPublicIds = [...(prev.galleryPublicIds || []), ...newPublicIds];
                          const newImageUrl = !prev.imageUrl && newUrls.length ? newUrls[0] : prev.imageUrl;
                          const newPublicId = !prev.imagePublicId && newPublicIds.length ? newPublicIds[0] : prev.imagePublicId;
                          return { ...prev, gallery: updatedGallery, galleryPublicIds: updatedPublicIds, imageUrl: newImageUrl, imagePublicId: newPublicId };
                        });
                        toast.success('Upload complete', { id: toastId });
                      } catch(err) {
                        toast.error('Upload failed: ' + err.message, { id: toastId });
                      }
                      e.target.value = '';
                    }} />
                  </label>
                </div>
                {errors.imageUrl && <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: 4 }}>{errors.imageUrl}</span>}
              </div>

              <div className="form-field">
                <label>Short Description (Subtitle)</label>
                <textarea name="shortDescription" value={formData.shortDescription || formData.subtitle} onChange={handleChange} rows="2" placeholder="A catchy one-liner..." style={{ minHeight: '60px' }} />
              </div>
            </SectionGroup>

            <SectionGroup title="Visibility & Ordering" description="Control where and how this product appears on the storefront.">
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  Active / Published
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} disabled={!formData.active} style={{ width: '18px', height: '18px' }} />
                  Featured on Home
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                  Sort Order:
                  <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} style={{ width: '80px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              {errors.featured && <div style={{ color: 'red', fontSize: '13px', marginTop: '8px' }}>{errors.featured}</div>}
            </SectionGroup>
          </div>

          {/* TAB: TAGS */}
          <div style={{ display: activeTab === 'tags' ? 'block' : 'none' }}>
            <SectionGroup title="Tag Assignment" description="Priority tags help highlight products on the Home page and product cards. Experience and Booking tags show as trust badges on the product detail page.">
              
              <div className="form-field">
                <label>Experience Tags</label>
                <ChipSelector options={EXPERIENCE_TAGS} selected={formData.experienceTags || []} onChange={(v) => setFormData(p => ({...p, experienceTags: v}))} />
              </div>
              
              <div className="form-field" style={{ marginTop: '16px' }}>
                <label>Booking Tags</label>
                <ChipSelector options={BOOKING_TAGS} selected={formData.bookingTags || []} onChange={(v) => setFormData(p => ({...p, bookingTags: v}))} />
              </div>

              <div className="form-field" style={{ marginTop: '16px' }}>
                <label>Priority Tags</label>
                <ChipSelector options={PRIORITY_TAGS} selected={formData.priorityTags || []} onChange={(v) => setFormData(p => ({...p, priorityTags: v}))} />
              </div>
            </SectionGroup>
          </div>

          {/* TAB: PRICING / PACKAGES */}
          <div style={{ display: activeTab === 'packages' ? 'block' : 'none' }}>
            <SectionGroup title="General Pricing" description="The starting price shown on product cards across the site.">
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Display Price Text (Public)</label>
                  <input name="price" value={formData.price} onChange={handleChange} placeholder="e.g. From $35 / person" />
                </div>
                <div className="field-grid-2">
                  <div className="form-field">
                    <label>Base Price Value</label>
                    <input name="defaultEstimatedPrice" type="number" step="0.01" value={formData.defaultEstimatedPrice || ''} onChange={handleChange} placeholder="35.00" />
                  </div>
                  <div className="form-field">
                    <label>Currency</label>
                    <select name="currency" value={formData.currency || 'USD'} onChange={handleChange}>
                      <option value="USD">USD</option>
                      <option value="VND">VND</option>
                    </select>
                  </div>
                </div>
              </div>
            </SectionGroup>

            <SectionGroup title="Packages & Tiers" description="Create multiple booking options for this experience.">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button type="button" onClick={addPackage} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0f172a', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <Plus size={16} /> Add Package
                </button>
              </div>

              {formData.packages.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', color: '#64748b' }}>
                  No packages added yet. Click "Add Package" to create your first tier.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {formData.packages.map((pkg, index) => (
                    <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', background: '#f8fafc', position: 'relative' }}>
                      <button type="button" onClick={() => removePackage(index)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#fee2e2', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      
                      <div className="field-grid-2" style={{ paddingRight: '40px' }}>
                        <div className="form-field">
                          <label>Package Name</label>
                          <input value={pkg.name} onChange={(e) => updatePackage(index, 'name', e.target.value)} required placeholder="e.g. Standard Experience" />
                        </div>
                        <div className="form-field">
                          <label>Display Price Label</label>
                          <input value={pkg.priceLabel || ''} onChange={(e) => updatePackage(index, 'priceLabel', e.target.value)} placeholder="e.g. $50 / person" />
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginTop: '16px', paddingRight: '40px' }}>
                        <div className="form-field">
                          <label>Base Price</label>
                          <input type="number" step="0.01" value={pkg.price} onChange={(e) => updatePackage(index, 'price', e.target.value)} />
                        </div>
                        <div className="form-field">
                          <label>Currency</label>
                          <input value={pkg.currency} onChange={(e) => updatePackage(index, 'currency', e.target.value)} />
                        </div>
                        <div className="form-field">
                          <label>Duration override</label>
                          <input value={pkg.duration || ''} onChange={(e) => updatePackage(index, 'duration', e.target.value)} placeholder="e.g. 1.5 hours" />
                        </div>
                        <div className="form-field">
                          <label>Group Size override</label>
                          <input value={pkg.groupSize || ''} onChange={(e) => updatePackage(index, 'groupSize', e.target.value)} placeholder="e.g. Up to 10" />
                        </div>
                      </div>
                      
                      <div className="form-field" style={{ marginTop: '16px', paddingRight: '40px' }}>
                        <label>Description</label>
                        <textarea value={pkg.description || ''} onChange={(e) => updatePackage(index, 'description', e.target.value)} placeholder="What's included in this package?" style={{ minHeight: '80px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionGroup>
          </div>

          {/* TAB: EXPERIENCE DETAILS */}
          <div style={{ display: activeTab === 'experience' ? 'block' : 'none' }}>
            <SectionGroup title="Details & Setup" description="Logistics and accessibility information for this experience.">
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Duration (General)</label>
                  <input name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 2 hours" />
                </div>
                <div className="form-field">
                  <label>Group Size (General)</label>
                  <input name="groupSize" value={formData.groupSize} onChange={handleChange} placeholder="e.g. Up to 15 people" />
                </div>
              </div>
              
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Instructor Description</label>
                  <input name="instructorDescription" value={formData.instructorDescription} onChange={handleChange} placeholder="e.g. Local artisan with 10 years experience" />
                </div>
                <div className="form-field">
                  <label>Languages</label>
                  <AdminEditableList items={formData.languages || []} onChange={(items) => handleArrayChange('languages', items)} placeholder="e.g. English" />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '32px', marginTop: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                  <input type="checkbox" name="wheelchairAccessible" checked={formData.wheelchairAccessible} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  Wheelchair Accessible
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                  <input type="checkbox" name="smallGroup" checked={formData.smallGroup} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  Small Group
                </label>
              </div>
            </SectionGroup>
            
            <SectionGroup title="Policies" description="Cancellation and reservation terms.">
              <div className="form-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#334155', marginBottom: '8px' }}>
                  <input type="checkbox" name="freeCancellation" checked={formData.freeCancellation} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  Free Cancellation
                </label>
                <label>Cancellation Policy Description</label>
                <input name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleChange} placeholder="e.g. Cancel up to 24 hours in advance for a full refund" />
              </div>
              
              <div className="form-field" style={{ marginTop: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#334155', marginBottom: '8px' }}>
                  <input type="checkbox" name="reserveNowPayLater" checked={formData.reserveNowPayLater} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  Reserve Now, Pay Later
                </label>
                <label>Reserve Policy Description</label>
                <input name="reservePolicy" value={formData.reservePolicy} onChange={handleChange} placeholder="e.g. Keep your travel plans flexible — book your spot and pay nothing today" />
              </div>
            </SectionGroup>
          </div>

          {/* TAB: DESCRIPTION */}
          <div style={{ display: activeTab === 'description' ? 'block' : 'none' }}>
            <SectionGroup title="Main Content">
              <div className="form-field">
                <label>Full Description (HTML Supported)</label>
                <textarea name="fullDescription" value={formData.fullDescription || formData.description} onChange={handleChange} rows="8" placeholder="<p>Detailed description here...</p>" style={{ fontFamily: 'monospace' }} />
              </div>
            </SectionGroup>
            
            <SectionGroup title="Bullet Points" description="Lists rendered on the product detail page.">
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Highlights</label>
                  <AdminEditableList items={formData.highlights || []} onChange={(items) => handleArrayChange('highlights', items)} placeholder="Add highlight..." />
                </div>
                <div className="form-field">
                  <label>Know Before You Go</label>
                  <AdminEditableList items={formData.knowBeforeYouGo || []} onChange={(items) => handleArrayChange('knowBeforeYouGo', items)} placeholder="Add info..." />
                </div>
              </div>
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Includes</label>
                  <AdminEditableList items={formData.includes || []} onChange={(items) => handleArrayChange('includes', items)} placeholder="Add included item..." />
                </div>
                <div className="form-field">
                  <label>What To Bring</label>
                  <AdminEditableList items={formData.whatToBring || []} onChange={(items) => handleArrayChange('whatToBring', items)} placeholder="Add item to bring..." />
                </div>
              </div>
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Excludes</label>
                  <AdminEditableList items={formData.excludes || []} onChange={(items) => handleArrayChange('excludes', items)} placeholder="Add excluded item..." />
                </div>
                <div className="form-field">
                  <label>Not Allowed</label>
                  <AdminEditableList items={formData.notAllowed || []} onChange={(items) => handleArrayChange('notAllowed', items)} placeholder="Add not allowed item..." />
                </div>
              </div>
            </SectionGroup>
          </div>

          {/* TAB: MEETING POINT */}
          <div style={{ display: activeTab === 'meeting' ? 'block' : 'none' }}>
            <SectionGroup title="Location Info">
              <div className="form-field">
                <label>Location Summary (for cards)</label>
                <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Hoi An Ancient Town" />
              </div>
              <div className="form-field">
                <label>Meeting Point Title</label>
                <input name="meetingPointTitle" value={formData.meetingPointTitle} onChange={handleChange} placeholder="e.g. The Workshop Studio" />
              </div>
              <div className="form-field">
                <label>Meeting Point Description</label>
                <textarea name="meetingPointDescription" value={formData.meetingPointDescription} onChange={handleChange} rows="3" placeholder="Detailed instructions..." />
              </div>
              <div className="form-field">
                <label>Google Maps URL (Link)</label>
                <input name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} placeholder="https://maps.google.com/..." />
              </div>
              <div className="form-field">
                <label>Google Maps Embed iFrame SRC</label>
                <input name="mapEmbed" value={formData.mapEmbed} onChange={handleChange} placeholder="https://www.google.com/maps/embed?pb=..." />
              </div>
            </SectionGroup>
          </div>

          {/* TAB: REVIEWS */}
          <div style={{ display: activeTab === 'reviews' ? 'block' : 'none' }}>
            <SectionGroup title="Product Reviews" description="Manage user reviews for this product.">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button type="button" onClick={addReview} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0f172a', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <Plus size={16} /> Add Review
                </button>
              </div>

              {formData.reviews.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', color: '#64748b' }}>
                  No reviews added yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {formData.reviews.map((review, index) => (
                    <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', background: '#f8fafc', position: 'relative' }}>
                      <button type="button" onClick={() => removeReview(index)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#fee2e2', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', paddingRight: '40px' }}>
                        <div className="form-field">
                          <label>Reviewer Name</label>
                          <input value={review.reviewerName} onChange={(e) => updateReview(index, 'reviewerName', e.target.value)} required />
                        </div>
                        <div className="form-field">
                          <label>Country</label>
                          <input value={review.reviewerCountry || ''} onChange={(e) => updateReview(index, 'reviewerCountry', e.target.value)} placeholder="e.g. USA" />
                        </div>
                        <div className="form-field">
                          <label>Rating (1-5)</label>
                          <input type="number" min="1" max="5" value={review.rating} onChange={(e) => updateReview(index, 'rating', e.target.value)} />
                        </div>
                        <div className="form-field">
                          <label>Date</label>
                          <input value={review.reviewDate || ''} onChange={(e) => updateReview(index, 'reviewDate', e.target.value)} placeholder="e.g. Oct 2023" />
                        </div>
                      </div>
                      <div className="form-field" style={{ marginTop: '16px', paddingRight: '40px' }}>
                        <label>Review Content</label>
                        <textarea value={review.content} onChange={(e) => updateReview(index, 'content', e.target.value)} rows="3" required />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionGroup>
          </div>

        </form>
        
        {/* Footer */}
        <div className="admin-form-footer">
          <button type="button" onClick={onClose} disabled={isSaving} style={{ padding: '10px 24px', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
            Cancel
          </button>
          <button type="submit" form="productForm" disabled={isSaving} style={{ padding: '10px 24px', background: isSaving ? '#64748b' : '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
