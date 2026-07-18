import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Save, Edit3 } from 'lucide-react';
import AdminImageUploader from './AdminImageUploader';
import { 
  PRODUCT_CATEGORIES, 
  PRODUCT_COLLECTIONS, 
  EXPERIENCE_TAGS, 
  BOOKING_TAGS, 
  PRIORITY_TAGS, 
  DURATION_OPTIONS, 
  GROUP_SIZE_OPTIONS 
} from '../../config/productOptions';
import { apiFetch } from '../../utils/apiFetch';

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

export default function SmartProductForm({ onClose, onSuccess, onOpenEditor }) {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: PRODUCT_CATEGORIES[0].key,
    groupName: '',
    image: '',
    shortDescription: '',
    experienceTags: [],
    bookingTags: [],
    priorityTags: [],
    price: '',
    defaultEstimatedPrice: '',
    currency: 'USD',
    duration: DURATION_OPTIONS[0],
    customDuration: '',
    groupSize: GROUP_SIZE_OPTIONS[0],
    customGroupSize: '',
    active: true,
    featured: false,
    sortOrder: 0,
    description: 'Detailed description to be added...'
  });

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    // Quick sanitization
    if (name === 'defaultEstimatedPrice') {
      value = value.replace(/[^0-9.]/g, ''); // only allow digits and dots
    }
    
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

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.image) newErrors.image = 'Main image is required';
    if (!formData.price.trim()) newErrors.price = 'Display price is required';
    
    if (formData.defaultEstimatedPrice && isNaN(parseFloat(formData.defaultEstimatedPrice))) {
      newErrors.defaultEstimatedPrice = 'Base price must be a number';
    }
    
    const finalDuration = formData.duration === 'Custom' ? formData.customDuration : formData.duration;
    if (!finalDuration.trim()) newErrors.duration = 'Duration is required';
    
    const finalGroupSize = formData.groupSize === 'Custom' ? formData.customGroupSize : formData.groupSize;
    if (!finalGroupSize.trim()) newErrors.groupSize = 'Group size is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPayload = () => {
    const payload = { ...formData };
    payload.duration = payload.duration === 'Custom' ? payload.customDuration : payload.duration;
    payload.groupSize = payload.groupSize === 'Custom' ? payload.customGroupSize : payload.groupSize;
    
    // Arrays sent directly, backend will stringify
    
    if (payload.defaultEstimatedPrice === '') {
      payload.defaultEstimatedPrice = null;
    } else {
      payload.defaultEstimatedPrice = parseFloat(payload.defaultEstimatedPrice);
    }
    
    return payload;
  };

  const handleSave = async (openEditor = false) => {
    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Creating product...');
    
    try {
      const payload = getPayload();
      const res = await apiFetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const err = new Error(errData.error || 'Failed to create product');
        err.fields = errData.fields || {};
        throw err;
      }

      const created = await res.json();
      toast.success('Product created successfully', { id: toastId });
      
      if (openEditor && onOpenEditor) {
        onOpenEditor(created);
      } else {
        onSuccess(created);
      }
    } catch (err) {
      if (err.fields) {
        setErrors(err.fields);
        toast.error(err.error || 'Validation errors', { id: toastId });
      } else {
        toast.error(err.message || 'Failed to create product', { id: toastId });
      }
    }
    setIsSaving(false);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', position: 'sticky', top: 0, zIndex: 10 }}>
          <h2 style={{ margin: 0 }}>Smart Add Product</h2>
          <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={onClose} aria-label="Close"><X size={22} /></button>
        </div>
        
        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f5f7f9' }}>
          <form>
            <SectionGroup title="1. Basic Info">
              <label>Product name <span style={{color: 'red'}}>*</span>
                <input name="title" value={formData.title} onChange={handleChange} onBlur={handleTitleBlur} style={{ border: errors.title ? '1px solid red' : '' }} placeholder="e.g. Traditional Lion Head Crafting Workshop" />
                {errors.title && <span style={{ color: 'red', fontSize: '12px' }}>{errors.title}</span>}
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>Category <span style={{color: 'red'}}>*</span>
                  <select name="category" value={formData.category} onChange={handleChange} style={{ border: errors.category ? '1px solid red' : '' }}>
                    <option value="" disabled>Select category</option>
                    {PRODUCT_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                  {errors.category && <span style={{ color: 'red', fontSize: '12px' }}>{errors.category}</span>}
                </label>
                
                <label>Product group / Collection
                  <select name="groupName" value={formData.groupName} onChange={handleChange}>
                    <option value="">None</option>
                    {PRODUCT_COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              <label>Main image <span style={{color: 'red'}}>*</span>
                <AdminImageUploader 
                  value={formData.image} 
                  onChange={(url) => { setFormData(prev => ({ ...prev, image: url })); setErrors(prev => ({...prev, image: null})); }} 
                />
                {errors.image && <span style={{ color: 'red', fontSize: '12px' }}>{errors.image}</span>}
              </label>

              <label>Short description
                <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="2" placeholder="Brief summary of the experience..." />
              </label>
            </SectionGroup>

            <SectionGroup title="2. Quick Tags">
              <label style={{ marginBottom: '8px' }}>Experience Tags</label>
              <ChipSelector options={EXPERIENCE_TAGS} selected={formData.experienceTags} onChange={(v) => setFormData(p => ({...p, experienceTags: v}))} />
              
              <label style={{ margin: '20px 0 8px' }}>Booking Tags</label>
              <ChipSelector options={BOOKING_TAGS} selected={formData.bookingTags} onChange={(v) => setFormData(p => ({...p, bookingTags: v}))} />

              <label style={{ margin: '20px 0 8px' }}>Priority Tags (Highlights)</label>
              <ChipSelector options={PRIORITY_TAGS} selected={formData.priorityTags} onChange={(v) => setFormData(p => ({...p, priorityTags: v}))} />
            </SectionGroup>

            <SectionGroup title="3. Price & Duration">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>Display price <span style={{color: 'red'}}>*</span>
                  <input name="price" value={formData.price} onChange={handleChange} placeholder="From $35 per person" style={{ border: errors.price ? '1px solid red' : '' }} />
                  {errors.price && <span style={{ color: 'red', fontSize: '12px' }}>{errors.price}</span>}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <label>Base price value (optional)
                    <input name="defaultEstimatedPrice" type="number" step="0.01" value={formData.defaultEstimatedPrice} onChange={handleChange} placeholder="35" style={{ border: errors.defaultEstimatedPrice ? '1px solid red' : '' }} />
                    {errors.defaultEstimatedPrice && <span style={{ color: 'red', fontSize: '12px' }}>{errors.defaultEstimatedPrice}</span>}
                  </label>
                  <label>Currency
                    <select name="currency" value={formData.currency} onChange={handleChange}>
                      <option value="USD">USD</option>
                      <option value="VND">VND</option>
                    </select>
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>Duration <span style={{color: 'red'}}>*</span>
                  <select name="duration" value={formData.duration} onChange={handleChange} style={{ border: errors.duration ? '1px solid red' : '' }}>
                    {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {formData.duration === 'Custom' && (
                    <input name="customDuration" value={formData.customDuration} onChange={handleChange} placeholder="e.g. 2 days" style={{ marginTop: '8px' }} />
                  )}
                  {errors.duration && <span style={{ color: 'red', fontSize: '12px' }}>{errors.duration}</span>}
                </label>
                <label>Group size <span style={{color: 'red'}}>*</span>
                  <select name="groupSize" value={formData.groupSize} onChange={handleChange} style={{ border: errors.groupSize ? '1px solid red' : '' }}>
                    {GROUP_SIZE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {formData.groupSize === 'Custom' && (
                    <input name="customGroupSize" value={formData.customGroupSize} onChange={handleChange} placeholder="e.g. 1-20 pax" style={{ marginTop: '8px' }} />
                  )}
                  {errors.groupSize && <span style={{ color: 'red', fontSize: '12px' }}>{errors.groupSize}</span>}
                </label>
              </div>
            </SectionGroup>

            <SectionGroup title="4. Publish">
              <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
                  Active / Published
                </label>
                <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} disabled={!formData.active} />
                  Featured on Home
                </label>
                <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', margin: 0 }}>
                  Sort Order:
                  <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} style={{ width: '80px', padding: '4px' }} />
                </label>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
                Note: Home page displays exactly 4 featured products.
                {errors.featured && <div style={{ color: 'red', marginTop: '4px' }}>{errors.featured}</div>}
              </div>
            </SectionGroup>
          </form>
        </div>
        
        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', background: 'var(--white)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="button" className="btn btn-outline" onClick={() => handleSave(false)} disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Create Product'}
          </button>
          <button type="button" className="btn" onClick={() => handleSave(true)} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={18} />
            {isSaving ? 'Creating...' : 'Create & Edit Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
