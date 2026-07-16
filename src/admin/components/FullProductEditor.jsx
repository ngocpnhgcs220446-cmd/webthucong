import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, ExternalLink, Save } from 'lucide-react';
import { 
  PRODUCT_CATEGORIES, 
  PRODUCT_COLLECTIONS, 
  EXPERIENCE_TAGS, 
  BOOKING_TAGS, 
  PRIORITY_TAGS 
} from '../../config/productOptions';
import AdminImageUploader from './AdminImageUploader';
import AdminEditableList from './AdminEditableList';

function SectionGroup({ title, children }) {
  return (
    <div style={{ marginBottom: '32px', background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
      {title && <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', color: 'var(--green-darkest)', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>{title}</h3>}
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
              padding: '6px 12px',
              borderRadius: '20px',
              border: isSelected ? '1px solid var(--green)' : '1px solid var(--line)',
              background: isSelected ? 'rgba(40,111,88,0.1)' : 'var(--white)',
              color: isSelected ? 'var(--green-darkest)' : 'var(--text-light)',
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

export default function FullProductEditor({ service, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(
    normalizeService(service) || {
      title: '', slug: '', subtitle: '', description: '',
      price: '', duration: '', groupSize: '', location: '',
      category: PRODUCT_CATEGORIES[0].key, image: '', featured: false,
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleTitleBlur = () => {
    if (!formData.slug && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
      setErrors(prev => ({ ...prev, slug: null }));
    }
  };

  const handleArrayChange = (name, arr) => setFormData(prev => ({ ...prev, [name]: arr }));

  const handleGalleryAdd = (url) => setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
  const handleGalleryRemove = (index) => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));

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
      if (payload.defaultEstimatedPrice === '') {
        payload.defaultEstimatedPrice = null;
      } else {
        payload.defaultEstimatedPrice = parseFloat(payload.defaultEstimatedPrice);
      }
      
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
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', position: 'sticky', top: 0, zIndex: 10 }}>
          <h2 style={{ margin: 0 }}>{service ? `Edit Product: ${formData.title}` : 'Add New Product'}</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {service && (
              <a href={`/services/${formData.slug}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--green-darkest)', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                <ExternalLink size={16} /> Preview Product
              </a>
            )}
            <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={onClose} aria-label="Close"><X size={22} /></button>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', background: 'var(--surface-color)', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
              style={{
                padding: '16px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--green)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--green-darkest)' : 'var(--text-light)',
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                position: 'relative'
              }}
            >
              {tab.label}
              {/* Show error indicator on tab if there's an error in its fields */}
              {(tab.id === 'overview' && (errors.title || errors.slug || errors.featured)) && <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'red' }}></span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f5f7f9' }}>
          <form id="productForm" onSubmit={handleSubmit}>
            
            {/* TAB: OVERVIEW */}
            <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
              <SectionGroup title="Main Identity">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label>Product name <span style={{color: 'red'}}>*</span>
                    <input name="title" value={formData.title} onChange={handleChange} onBlur={handleTitleBlur} style={{ border: errors.title ? '1px solid red' : '' }} required />
                    {errors.title && <span style={{ color: 'red', fontSize: '12px' }}>{errors.title}</span>}
                  </label>
                  <label>URL Slug <span style={{color: 'red'}}>*</span>
                    <input name="slug" value={formData.slug} onChange={handleChange} style={{ border: errors.slug ? '1px solid red' : '' }} required />
                  </label>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label>Category
                    <select name="category" value={formData.category} onChange={handleChange}>
                      {PRODUCT_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </label>
                  <label>Product group / Collection
                    <select name="groupName" value={formData.groupName} onChange={handleChange}>
                      <option value="">None</option>
                      {PRODUCT_COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                </div>

                <label>Main Image <span style={{color: 'red'}}>*</span>
                  <AdminImageUploader 
                    value={formData.image} 
                    onChange={(url) => { setFormData(prev => ({ ...prev, image: url })); setErrors(prev => ({...prev, image: null})); }} 
                  />
                  {errors.image && <span style={{color: 'red', fontSize: '12px'}}>{errors.image}</span>}
                </label>

                <label>Gallery Images
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '8px' }}>
                    {(formData.gallery || []).map((img, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => handleGalleryRemove(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div style={{ aspectRatio: '1', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AdminImageUploader onChange={handleGalleryAdd} minimal={true} />
                    </div>
                  </div>
                </label>

                <label>Short Description (Subtitle)
                  <textarea name="shortDescription" value={formData.shortDescription || formData.subtitle} onChange={handleChange} rows="2" />
                </label>
              </SectionGroup>

              <SectionGroup title="Visibility & Ordering">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
                    Active (Visible on site)
                  </label>
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} disabled={!formData.active} />
                    Featured on Home
                  </label>
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    Sort Order:
                    <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} style={{ width: '80px', padding: '4px' }} />
                  </label>
                </div>
                {errors.featured && <div style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>{errors.featured}</div>}
              </SectionGroup>
            </div>

            {/* TAB: TAGS */}
            <div style={{ display: activeTab === 'tags' ? 'block' : 'none' }}>
              <SectionGroup title="Tag Assignment">
                <div style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '24px' }}>
                  Priority tags help highlight products on the Home page and product cards. Experience and Booking tags show as trust badges on the product detail page.
                </div>
                
                <label style={{ marginBottom: '8px' }}>Experience Tags</label>
                <ChipSelector options={EXPERIENCE_TAGS} selected={formData.experienceTags || []} onChange={(v) => setFormData(p => ({...p, experienceTags: v}))} />
                
                <label style={{ margin: '24px 0 8px' }}>Booking Tags</label>
                <ChipSelector options={BOOKING_TAGS} selected={formData.bookingTags || []} onChange={(v) => setFormData(p => ({...p, bookingTags: v}))} />

                <label style={{ margin: '24px 0 8px' }}>Priority Tags</label>
                <ChipSelector options={PRIORITY_TAGS} selected={formData.priorityTags || []} onChange={(v) => setFormData(p => ({...p, priorityTags: v}))} />
              </SectionGroup>
            </div>

            {/* TAB: PRICING / PACKAGES */}
            <div style={{ display: activeTab === 'packages' ? 'block' : 'none' }}>
              <SectionGroup title="General Pricing">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label>Display Price Text (Public)
                    <input name="price" value={formData.price} onChange={handleChange} placeholder="e.g. From $35" />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label>Base Price Value
                      <input name="defaultEstimatedPrice" type="number" step="0.01" value={formData.defaultEstimatedPrice || ''} onChange={handleChange} placeholder="35" />
                    </label>
                    <label>Currency
                      <select name="currency" value={formData.currency || 'USD'} onChange={handleChange}>
                        <option value="USD">USD</option>
                        <option value="VND">VND</option>
                      </select>
                    </label>
                  </div>
                </div>
              </SectionGroup>

              <SectionGroup title="Packages & Tiers">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <button type="button" className="btn btn-small" onClick={addPackage} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={16} /> Add Package
                  </button>
                </div>

                {formData.packages.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    No packages added yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {formData.packages.map((pkg, index) => (
                      <div key={index} style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '16px', background: '#fafafa', position: 'relative' }}>
                        <button type="button" onClick={() => removePackage(index)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={20} /></button>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingRight: '40px' }}>
                          <label>Package Name
                            <input value={pkg.name} onChange={(e) => updatePackage(index, 'name', e.target.value)} required />
                          </label>
                          <label>Display Price Label (e.g. "$50 / person")
                            <input value={pkg.priceLabel || ''} onChange={(e) => updatePackage(index, 'priceLabel', e.target.value)} />
                          </label>
                          <label>Base Price (Numeric)
                            <input type="number" step="0.01" value={pkg.price} onChange={(e) => updatePackage(index, 'price', e.target.value)} />
                          </label>
                          <label>Currency
                            <input value={pkg.currency} onChange={(e) => updatePackage(index, 'currency', e.target.value)} />
                          </label>
                          <label>Duration override
                            <input value={pkg.duration || ''} onChange={(e) => updatePackage(index, 'duration', e.target.value)} />
                          </label>
                          <label>Group Size override
                            <input value={pkg.groupSize || ''} onChange={(e) => updatePackage(index, 'groupSize', e.target.value)} />
                          </label>
                          <label style={{ gridColumn: '1 / -1' }}>Description
                            <input value={pkg.description || ''} onChange={(e) => updatePackage(index, 'description', e.target.value)} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionGroup>
            </div>

            {/* TAB: EXPERIENCE DETAILS */}
            <div style={{ display: activeTab === 'experience' ? 'block' : 'none' }}>
              <SectionGroup title="Details & Setup">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label>Duration (General)
                    <input name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 2 hours" />
                  </label>
                  <label>Group Size (General)
                    <input name="groupSize" value={formData.groupSize} onChange={handleChange} placeholder="e.g. Up to 15 people" />
                  </label>
                  <label>Instructor Description
                    <input name="instructorDescription" value={formData.instructorDescription} onChange={handleChange} placeholder="e.g. Local artisan with 10 years experience" />
                  </label>
                  <label>Languages
                    <AdminEditableList items={formData.languages || []} onChange={(items) => handleArrayChange('languages', items)} placeholder="e.g. English" />
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="wheelchairAccessible" checked={formData.wheelchairAccessible} onChange={handleChange} />
                    Wheelchair Accessible
                  </label>
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="smallGroup" checked={formData.smallGroup} onChange={handleChange} />
                    Small Group
                  </label>
                </div>
              </SectionGroup>
              
              <SectionGroup title="Policies">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="freeCancellation" checked={formData.freeCancellation} onChange={handleChange} />
                    Free Cancellation
                  </label>
                  <label>Cancellation Policy Description
                    <input name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleChange} placeholder="e.g. Cancel up to 24 hours in advance for a full refund" />
                  </label>
                  
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                    <input type="checkbox" name="reserveNowPayLater" checked={formData.reserveNowPayLater} onChange={handleChange} />
                    Reserve Now, Pay Later
                  </label>
                  <label>Reserve Policy Description
                    <input name="reservePolicy" value={formData.reservePolicy} onChange={handleChange} placeholder="e.g. Keep your travel plans flexible — book your spot and pay nothing today" />
                  </label>
                </div>
              </SectionGroup>
            </div>

            {/* TAB: DESCRIPTION */}
            <div style={{ display: activeTab === 'description' ? 'block' : 'none' }}>
              <SectionGroup title="Main Content">
                <label>Full Description
                  <textarea name="fullDescription" value={formData.fullDescription || formData.description} onChange={handleChange} rows="6" />
                </label>
              </SectionGroup>
              
              <SectionGroup title="Bullet Points">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <label>Highlights
                    <AdminEditableList items={formData.highlights || []} onChange={(items) => handleArrayChange('highlights', items)} placeholder="Add highlight..." />
                  </label>
                  <label>Includes
                    <AdminEditableList items={formData.includes || []} onChange={(items) => handleArrayChange('includes', items)} placeholder="Add included item..." />
                  </label>
                  <label>Excludes
                    <AdminEditableList items={formData.excludes || []} onChange={(items) => handleArrayChange('excludes', items)} placeholder="Add excluded item..." />
                  </label>
                  <label>What To Bring
                    <AdminEditableList items={formData.whatToBring || []} onChange={(items) => handleArrayChange('whatToBring', items)} placeholder="Add item to bring..." />
                  </label>
                  <label>Not Allowed
                    <AdminEditableList items={formData.notAllowed || []} onChange={(items) => handleArrayChange('notAllowed', items)} placeholder="Add not allowed item..." />
                  </label>
                  <label>Know Before You Go
                    <AdminEditableList items={formData.knowBeforeYouGo || []} onChange={(items) => handleArrayChange('knowBeforeYouGo', items)} placeholder="Add info..." />
                  </label>
                </div>
              </SectionGroup>
            </div>

            {/* TAB: MEETING POINT */}
            <div style={{ display: activeTab === 'meeting' ? 'block' : 'none' }}>
              <SectionGroup title="Location Info">
                <label>Location Summary (for cards)
                  <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Hoi An Ancient Town" />
                </label>
                <label>Meeting Point Title
                  <input name="meetingPointTitle" value={formData.meetingPointTitle} onChange={handleChange} placeholder="e.g. The Workshop Studio" />
                </label>
                <label>Meeting Point Description
                  <textarea name="meetingPointDescription" value={formData.meetingPointDescription} onChange={handleChange} rows="3" placeholder="Detailed instructions..." />
                </label>
                <label>Google Maps URL (Link)
                  <input name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} placeholder="https://maps.google.com/..." />
                </label>
                <label>Google Maps Embed iFrame SRC
                  <input name="mapEmbed" value={formData.mapEmbed} onChange={handleChange} placeholder="https://www.google.com/maps/embed?pb=..." />
                </label>
              </SectionGroup>
            </div>

            {/* TAB: REVIEWS */}
            <div style={{ display: activeTab === 'reviews' ? 'block' : 'none' }}>
              <SectionGroup title="Product Reviews">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <button type="button" className="btn btn-small" onClick={addReview} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={16} /> Add Review
                  </button>
                </div>

                {formData.reviews.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    No reviews added yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {formData.reviews.map((review, index) => (
                      <div key={index} style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '16px', background: '#fafafa', position: 'relative' }}>
                        <button type="button" onClick={() => removeReview(index)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={20} /></button>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', paddingRight: '40px' }}>
                          <label>Reviewer Name
                            <input value={review.reviewerName} onChange={(e) => updateReview(index, 'reviewerName', e.target.value)} required />
                          </label>
                          <label>Country
                            <input value={review.reviewerCountry || ''} onChange={(e) => updateReview(index, 'reviewerCountry', e.target.value)} />
                          </label>
                          <label>Rating (1-5)
                            <input type="number" min="1" max="5" value={review.rating} onChange={(e) => updateReview(index, 'rating', e.target.value)} />
                          </label>
                          <label>Date
                            <input value={review.reviewDate || ''} onChange={(e) => updateReview(index, 'reviewDate', e.target.value)} placeholder="e.g. Oct 2023" />
                          </label>
                          <label style={{ gridColumn: '1 / -1' }}>Review Content
                            <textarea value={review.content} onChange={(e) => updateReview(index, 'content', e.target.value)} rows="3" required />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionGroup>
            </div>

          </form>
        </div>
        
        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', background: 'var(--white)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" form="productForm" className="btn" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
