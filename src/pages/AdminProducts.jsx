import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Eye, Save, Upload, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import { apiCall, uploadImage } from '../utils/apiFetch';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_COLLECTIONS,
  EXPERIENCE_TAGS,
  BOOKING_TAGS,
  PRIORITY_TAGS,
  DURATION_OPTIONS,
  GROUP_SIZE_OPTIONS,
} from '../config/productOptions';

// ─── helpers ─────────────────────────────────────────────────────────────────
function safeArr(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const EMPTY_FORM = {
  title: '', slug: '', category: PRODUCT_CATEGORIES[0].key,
  groupName: '', image: '', shortDescription: '', description: 'Detailed description to be added.',
  price: '', duration: DURATION_OPTIONS[0], groupSize: GROUP_SIZE_OPTIONS[0],
  location: '',
  experienceTags: [], bookingTags: [], priorityTags: [],
  active: true, featured: false, sortOrder: 0,
  highlights: [], includes: [], whatToBring: [],
  gallery: [],
  freeCancellation: true, reserveNowPayLater: true,
  cancellationPolicy: '', reservePolicy: '',
  instructorDescription: '', languages: [],
  meetingPointTitle: '', meetingPointDescription: '',
};

// ─── sub-components ───────────────────────────────────────────────────────────
function ChipGroup({ label, options, selected, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => onChange(active ? selected.filter(x => x !== opt) : [...selected, opt])}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: active ? 700 : 400,
                border: active ? '1.5px solid #166534' : '1px solid #d1d5db',
                background: active ? '#dcfce7' : '#fff', color: active ? '#166534' : '#6b7280', transition: 'all .15s'
              }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EditableList({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const add = () => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(''); } };
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>{label}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={item} onChange={e => { const a = [...items]; a[i] = e.target.value; onChange(a); }}
              style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
              style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6 }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={placeholder || 'Add item…'}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
            style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
          <button type="button" onClick={add}
            style={{ padding: '6px 12px', background: '#166534', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>+</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{error}</p>}
    </div>
  );
}

function inp(extra = {}) {
  return {
    style: { width: '100%', padding: '8px 12px', border: `1px solid ${extra.error ? '#ef4444' : '#d1d5db'}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', ...(extra.style || {}) },
    ...extra,
  };
}

// ─── IMAGE UPLOADER ───────────────────────────────────────────────────────────
function ImageUpload({ value, onChange, label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const handle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file);
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };
  return (
    <div>
      {value && <img src={value} alt="preview" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 8, border: '1px solid #d1d5db' }} />}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '7px 14px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
        <Upload size={14} /> {uploading ? 'Uploading…' : label}
        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handle} disabled={uploading} style={{ display: 'none' }} />
      </label>
    </div>
  );
}

// ─── PRODUCT MODAL ────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Use a flat form state
  const [form, setForm] = useState(() => {
    if (!product) return {
      title: '', slug: '', category: '', groupName: '',
      shortDescription: '', description: '', price: '',
      duration: '2 hours', groupSize: '1-10 people', location: '',
      image: '', gallery: [], priorityTags: [], experienceTags: [], bookingTags: [],
      languages: [], highlights: [], includes: [], whatToBring: [],
      sortOrder: 0, active: true, featured: false,
      freeCancellation: true, reserveNowPayLater: true,
      cancellationPolicy: '', reservePolicy: '',
      instructorDescription: '', meetingPointTitle: '', meetingPointDescription: ''
    };
    return {
      title: product.title || '',
      slug: product.slug || '',
      category: product.category || '',
      groupName: product.groupName || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      price: product.price || '',
      duration: product.duration || '2 hours',
      groupSize: product.groupSize || '1-10 people',
      location: product.location || '',
      image: product.image || '',
      gallery: safeArr(product.gallery),
      priorityTags: safeArr(product.priorityTags),
      experienceTags: safeArr(product.experienceTags),
      bookingTags: safeArr(product.bookingTags),
      highlights: safeArr(product.highlights),
      includes: safeArr(product.includes),
      whatToBring: safeArr(product.whatToBring),
      languages: safeArr(product.languages),
      sortOrder: product.sortOrder ?? 0,
      active: product.active !== undefined ? product.active : true,
      featured: product.featured || false,
      freeCancellation: product.freeCancellation !== undefined ? product.freeCancellation : true,
      reserveNowPayLater: product.reserveNowPayLater !== undefined ? product.reserveNowPayLater : true,
      cancellationPolicy: product.cancellationPolicy || '',
      reservePolicy: product.reservePolicy || '',
      instructorDescription: product.instructorDescription || '',
      meetingPointTitle: product.meetingPointTitle || '',
      meetingPointDescription: product.meetingPointDescription || ''
    };
  });

  const set = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: null }));
  };

  const field = (name) => ({
    value: form[name] ?? '',
    onChange: e => set(name, e.target.type === 'checkbox' ? e.target.checked : e.target.value),
  });
  const check = (name) => ({ type: 'checkbox', checked: !!form[name], onChange: e => set(name, e.target.checked) });

  const validate = () => {
    const e = {};
    if (!form.title?.trim()) e.title = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.image) e.image = 'Required';
    if (!form.price?.trim()) e.price = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the highlighted fields');
      return;
    }

    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    try {
      setSaving(true);
      const url = isEdit ? `/api/services/${product.id}` : '/api/services';
      const method = isEdit ? 'PUT' : 'POST';
      const result = await apiCall(url, { method, body: payload });
      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
      onSaved(result);
      onClose();
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="admin-form-shell product-modal" style={{ width: 'min(1120px, calc(100vw - 32px))', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>

        <div className="admin-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{isEdit ? `Edit Product: ${form.title}` : 'Add New Product'}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Manage product details, pricing, and media.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {isEdit && <a href={`/services/${form.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, textDecoration: 'none' }}><Eye size={14} /> Preview</a>}
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
          </div>
        </div>

        <form id="productForm" onSubmit={handleSubmit} className="admin-form-body product-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc' }}>
          <div className="admin-form-grid">

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-section">
                <div className="form-section-title">Media</div>
                <div className="form-section-description">Upload high-quality images. First image is the main cover.</div>

                <div className="form-field">
                  <label>Main Image <span style={{ color: 'red' }}>*</span></label>
                  <div className="image-upload-panel" style={{ minHeight: '320px' }}>
                    <ImageUpload value={form.image} onChange={url => set('image', url)} label="Upload Cover Image" />
                  </div>
                  {errors.image && <span style={{ color: 'red', fontSize: '12px' }}>{errors.image}</span>}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Visibility</div>
                <div className="form-section-description">Control where this product appears on the site.</div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}>
                  <input {...check('active')} style={{ width: 16, height: 16 }} /> Active (visible on website)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}>
                  <input {...check('featured')} disabled={!form.active} style={{ width: 16, height: 16 }} /> Featured on Home
                </label>

                <div className="form-field" style={{ marginTop: 8 }}>
                  <label>Sort order</label>
                  <input type="number" {...field('sortOrder')} style={{ maxWidth: 100 }} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-section">
                <div className="form-section-title">Basic Information</div>
                <div className="form-section-description">The core details of the product.</div>

                <div className="field-grid-2">
                  <div className="form-field">
                    <label>Product name <span style={{ color: 'red' }}>*</span></label>
                    <input {...field('title')} placeholder="e.g. Traditional Crafting" style={{ border: errors.title ? '1px solid red' : '' }} onBlur={() => { if (!form.slug && form.title) set('slug', slugify(form.title)); }} />
                    {errors.title && <span style={{ color: 'red', fontSize: '12px' }}>{errors.title}</span>}
                  </div>
                  <div className="form-field">
                    <label>URL Slug</label>
                    <input {...field('slug')} placeholder="auto-generated" />
                  </div>
                </div>

                <div className="field-grid-2">
                  <div className="form-field">
                    <label>Category <span style={{ color: 'red' }}>*</span></label>
                    <select {...field('category')} style={{ border: errors.category ? '1px solid red' : '' }}>
                      {PRODUCT_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                    {errors.category && <span style={{ color: 'red', fontSize: '12px' }}>{errors.category}</span>}
                  </div>
                  <div className="form-field">
                    <label>Collection / Group</label>
                    <select {...field('groupName')}>
                      <option value="">None</option>
                      {PRODUCT_COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Short description</label>
                  <textarea {...field('shortDescription')} rows={2} placeholder="Brief one-liner…" style={{ minHeight: 70 }} />
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Price & Booking</div>
                <div className="form-section-description">Rates, duration, and group details.</div>

                <div className="field-grid-2">
                  <div className="form-field">
                    <label>Display Price <span style={{ color: 'red' }}>*</span></label>
                    <input {...field('price')} placeholder="From $35 / person" style={{ border: errors.price ? '1px solid red' : '' }} />
                    {errors.price && <span style={{ color: 'red', fontSize: '12px' }}>{errors.price}</span>}
                  </div>
                  <div className="form-field">
                    <label>Duration</label>
                    <select {...field('duration')}>
                      {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="field-grid-2">
                  <div className="form-field">
                    <label>Group Size</label>
                    <select {...field('groupSize')}>
                      {GROUP_SIZE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input {...field('location')} placeholder="e.g. Studio" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Tags</div>
                <div className="form-section-description">Select tags for card display.</div>

                <ChipGroup label="Priority Tags" options={PRIORITY_TAGS} selected={form.priorityTags} onChange={v => set('priorityTags', v)} />
                <ChipGroup label="Experience Tags" options={EXPERIENCE_TAGS} selected={form.experienceTags} onChange={v => set('experienceTags', v)} />
                <ChipGroup label="Booking Tags" options={BOOKING_TAGS} selected={form.bookingTags} onChange={v => set('bookingTags', v)} />
              </div>
            </div>
          </div>
        </form>

        <div className="admin-form-footer product-modal-footer">
          <button type="button" onClick={onClose} disabled={saving} style={{ padding: '10px 24px', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#334155' }}>
            Cancel
          </button>
          <button type="submit" form="productForm" disabled={saving} style={{ padding: '10px 24px', background: saving ? '#64748b' : '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/admin/services');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[Products] Fetch failed', err);
      toast.error(err.message || 'Failed to load products');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    console.log('[Products] Add Product clicked');
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    console.log('[Products] Edit clicked', product);
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (product) => {
    console.log('[Products] Delete clicked', product.id);
    if (!window.confirm(`Delete "${product.title}"?\n\nThis cannot be undone.`)) return;
    try {
      setDeletingId(product.id);
      await apiCall(`/api/services/${product.id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast.success('Product deleted');
    } catch (err) {
      console.error('[Products] Delete failed', err);
      toast.error(err.message || 'Failed to delete product');
    }
    setDeletingId(null);
  };

  const handleToggleActive = async (product) => {
    try {
      const updated = await apiCall(`/api/services/${product.id}`, {
        method: 'PUT',
        body: { ...product, active: !product.active, featured: !product.active ? product.featured : false },
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...updated } : p));
      toast.success(`Product ${!product.active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleToggleFeatured = async (product) => {
    const featuredActive = products.filter(p => p.featured && p.active && p.id !== product.id).length;
    if (!product.featured && featuredActive >= 4) {
      toast.error('Home can only have 4 featured products. Unfeature another one first.');
      return;
    }
    try {
      const updated = await apiCall(`/api/services/${product.id}`, {
        method: 'PUT',
        body: { ...product, featured: !product.featured },
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...updated } : p));
      toast.success(`Product ${!product.featured ? 'featured' : 'unfeatured'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleSaved = (savedProduct) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === savedProduct.id);
      if (exists) return prev.map(p => p.id === savedProduct.id ? savedProduct : p);
      return [savedProduct, ...prev];
    });
  };

  const filtered = products.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = products.filter(p => p.featured && p.active).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Products / Workshops</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Manage workshops shown on your website.</p>
        </div>
        <button onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#166534', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Featured counter */}
      <div style={{
        padding: '12px 18px', borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12,
        background: featuredCount === 4 ? '#dcfce7' : featuredCount > 4 ? '#fee2e2' : '#fef9c3',
        color: featuredCount === 4 ? '#166534' : featuredCount > 4 ? '#991b1b' : '#854d0e',
        border: `1px solid ${featuredCount === 4 ? '#86efac' : featuredCount > 4 ? '#fca5a5' : '#fde047'}`,
      }}>
        <Star size={16} fill="currentColor" />
        Featured on Home: {featuredCount} / 4
        {featuredCount < 4 && <span style={{ fontWeight: 400 }}>— select {4 - featuredCount} more to complete the Home section</span>}
        {featuredCount > 4 && <span style={{ fontWeight: 400 }}>— too many! Backend will block adding more.</span>}
        {featuredCount === 4 && <span style={{ fontWeight: 400 }}>✓ Home section ready!</span>}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
        style={{ width: '100%', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 14, marginBottom: 20, boxSizing: 'border-box' }} />

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading products…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          {search ? 'No products match your search.' : 'No products yet. Click Add Product to create one!'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(product => (
            <div key={product.id} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px',
              display: 'flex', gap: 16, alignItems: 'center',
              opacity: product.active ? 1 : 0.6, transition: 'all .2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {/* Image */}
              <img src={product.image || '/pics/product1.jpg'} alt={product.title}
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #e5e7eb' }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{product.title}</span>
                  {!product.active && <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>Inactive</span>}
                  {product.featured && product.active && <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>⭐ Featured</span>}
                  {safeArr(product.priorityTags).slice(0, 1).map(t => (
                    <span key={t} style={{ background: '#f0fdf4', color: '#166534', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, border: '1px solid #86efac' }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
                  {product.category} · {product.price} · {product.duration} · {product.location}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button onClick={() => handleToggleActive(product)} title={product.active ? 'Deactivate' : 'Activate'}
                  style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {product.active ? <ToggleRight size={16} color="#166534" /> : <ToggleLeft size={16} color="#9ca3af" />}
                  {product.active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleToggleFeatured(product)} title={product.featured ? 'Unfeature' : 'Feature'}
                  disabled={!product.active}
                  style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: product.featured ? '#fef9c3' : '#fff', cursor: product.active ? 'pointer' : 'not-allowed', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={14} fill={product.featured ? '#854d0e' : 'none'} color={product.featured ? '#854d0e' : '#9ca3af'} />
                  {product.featured ? 'Featured' : 'Feature'}
                </button>
                <a href={`/services/${product.slug}`} target="_blank" rel="noreferrer"
                  style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: 'inherit' }}>
                  <Eye size={14} /> Preview
                </a>
                <button onClick={() => openEdit(product)}
                  style={{ padding: '6px 14px', border: '1px solid #166534', borderRadius: 8, background: '#fff', color: '#166534', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(product)} disabled={deletingId === product.id}
                  style={{ padding: '6px 14px', border: '1px solid #ef4444', borderRadius: 8, background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Trash2 size={14} /> {deletingId === product.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => { setModalOpen(false); setEditingProduct(null); }}
          onSaved={(saved) => { handleSaved(saved); }}
        />
      )}
    </div>
  );
}
