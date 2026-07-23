import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Camera, AlertTriangle } from 'lucide-react';
import AdminImageUploader from './AdminImageUploader';
import {
  PRODUCT_CATEGORIES,
  DURATION_OPTIONS,
  GROUP_SIZE_OPTIONS
} from '../../config/productOptions';
import { apiFetch } from '../../utils/apiFetch';

/* ─────────────────────────────────────────────────────────────
   Big field — dễ nhìn, dễ điền cho người lớn tuổi
   ──────────────────────────────────────────────────────────── */
function BigField({ label, sublabel, required, error, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <label style={{
        display: 'block',
        fontSize: 18,
        fontWeight: 700,
        color: '#1a3a2a',
        marginBottom: 6,
      }}>
        {label}
        {required && <span style={{ color: '#c0392b', marginLeft: 4 }}>*</span>}
      </label>
      {sublabel && (
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7c74', lineHeight: 1.5 }}>
          {sublabel}
        </p>
      )}
      {children}
      {error && (
        <div style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: 8,
          padding: '8px 12px',
          color: '#c0392b',
          fontSize: 14,
          fontWeight: 600,
        }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Category Cards
   ──────────────────────────────────────────────────────────── */
const CAT_INFO = {
  offline: { emoji: '🏠', desc: 'Workshop tại chỗ' },
  online:  { emoji: '💻', desc: 'Trực tuyến (Zoom/Meet)' },
  diy:     { emoji: '📦', desc: 'Bộ kit tự làm' },
};

function CategoryCards({ value, onChange }) {
  const cats = [
    { key: 'offline', label: 'Offline' },
    { key: 'online',  label: 'Online' },
    { key: 'diy',     label: 'DIY Kit' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
      {cats.map(c => {
        const info = CAT_INFO[c.key];
        const selected = value === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '16px',
              borderRadius: 12,
              border: selected ? '2.5px solid #286f58' : '2px solid #dce8e2',
              background: selected ? 'rgba(40,111,88,0.06)' : '#fff',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s',
              boxShadow: selected ? '0 0 0 3px rgba(40,111,88,0.12)' : 'none',
            }}
          >
            <span style={{ fontSize: 32 }}>{info.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1a3a2a' }}>{c.label}</div>
              <div style={{ fontSize: 13, color: '#6b7c74', marginTop: 2 }}>{info.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT - 2 STEPS
   ═══════════════════════════════════════════════════════════ */
export default function SmartProductForm({ onClose, onSuccess, onOpenEditor }) {
  const TOTAL_STEPS = 2;
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1: Bắt buộc
    title: '',
    slug: '',
    category: 'offline',
    imageUrl: '',
    imagePublicId: '',
    price: '',
    duration: DURATION_OPTIONS[0],
    customDuration: '',
    groupSize: GROUP_SIZE_OPTIONS[0],
    customGroupSize: '',
    
    // Step 2: Không bắt buộc
    shortDescription: '',
    active: true,
    featured: false,
    description: '',
  });

  const set = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: null }));
  };

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    set(name, type === 'checkbox' ? checked : value);
  };

  const autoSlug = () => {
    if (!form.slug && form.title) {
      const s = form.title
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setForm(p => ({ ...p, slug: s }));
    }
  };

  /* ── Validation ── */
  const validateStep1 = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Bạn chưa nhập tên sản phẩm';
    if (!form.imageUrl) e.imageUrl = 'Bạn chưa chọn ảnh cho sản phẩm';
    if (!form.price.trim()) e.price = 'Bạn chưa nhập giá';
    
    const dur = form.duration === 'Custom' ? form.customDuration : form.duration;
    if (!dur.trim()) e.duration = 'Bạn chưa nhập thời gian';
    
    const size = form.groupSize === 'Custom' ? form.customGroupSize : form.groupSize;
    if (!size.trim()) e.groupSize = 'Bạn chưa chọn số lượng khách';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep1()) {
      toast.error('Vui lòng điền đủ các trường bắt buộc có dấu *');
      // Scroll to top to see errors
      document.querySelector('.admin-form-body')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    autoSlug();
    setStep(2);
  };

  /* ── Save ── */
  const buildPayload = () => {
    const p = { ...form };
    p.duration = p.duration === 'Custom' ? p.customDuration : p.duration;
    p.groupSize = p.groupSize === 'Custom' ? p.customGroupSize : p.groupSize;
    // Fix image not showing in FullProductEditor: inject it into gallery array
    p.gallery = p.imageUrl ? [p.imageUrl] : [];
    
    delete p.customDuration;
    delete p.customGroupSize;
    return p;
  };

  const handleSave = async (openEditor = false) => {
    if (isSaving) return;
    
    // Always validate step 1
    if (!validateStep1()) {
      setStep(1);
      toast.error('Vui lòng kiểm tra lại thông tin bắt buộc');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Đang tạo sản phẩm...');
    try {
      const payload = buildPayload();
      const res = await apiFetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw Object.assign(new Error(d.error || 'Lỗi tạo sản phẩm'), { fields: d.fields || {} });
      }
      
      const created = await res.json();
      toast.success('✅ Tạo sản phẩm thành công!', { id: toastId });
      openEditor && onOpenEditor ? onOpenEditor(created) : onSuccess(created);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      toast.error(err.message || 'Không thể tạo sản phẩm', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = (err) => ({
    fontSize: 16,
    padding: '14px 16px',
    border: err ? '2px solid #e53e3e' : '2px solid #dce8e2',
    borderRadius: 10,
    width: '100%',
    boxSizing: 'border-box',
    background: '#fff'
  });

  /* ── Trang 1: Thông tin bắt buộc ── */
  const renderStep1 = () => (
    <div>
      <div style={{
        background: '#e6f4ea', color: '#1e4620', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 15, fontWeight: 500
      }}>
        Tất cả các mục ở trang này là <strong>bắt buộc phải có</strong> để sản phẩm có thể hiển thị lên website.
      </div>

      <BigField label="1. Tên sản phẩm / Workshop" required error={errors.title}>
        <input
          name="title"
          value={form.title}
          onChange={handle}
          onBlur={autoSlug}
          placeholder="Ví dụ: Lớp làm nón lá truyền thống"
          autoFocus
          style={inputStyle(errors.title)}
        />
      </BigField>

      <BigField label="2. Loại hoạt động" required>
        <CategoryCards value={form.category} onChange={(v) => set('category', v)} />
      </BigField>

      <BigField 
        label="3. Ảnh đại diện sản phẩm" 
        sublabel="Ảnh này sẽ hiển thị ở trang chủ và trên thẻ sản phẩm. Dung lượng tối đa 5MB." 
        required 
        error={errors.imageUrl}
      >
        {!form.imageUrl ? (
          <div style={{
            border: errors.imageUrl ? '2.5px dashed #e53e3e' : '2.5px dashed #52b788',
            borderRadius: 14,
            padding: '30px 20px',
            textAlign: 'center',
            background: errors.imageUrl ? '#fff5f5' : 'rgba(82,183,136,0.04)',
          }}>
            <Camera size={40} color={errors.imageUrl ? '#e53e3e' : '#52b788'} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1a3a2a', margin: '0 0 16px' }}>
              Bấm vào đây để chọn ảnh từ máy tính
            </p>
            <AdminImageUploader
              value={form.imageUrl}
              onChange={(img) => {
                set('imageUrl', img.imageUrl);
                setForm(p => ({ ...p, imagePublicId: img.imagePublicId }));
              }}
            />
          </div>
        ) : (
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '2px solid #52b788', position: 'relative' }}>
            <img src={form.imageUrl} alt="Preview" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <AdminImageUploader
                value={form.imageUrl}
                onChange={(img) => {
                  set('imageUrl', img.imageUrl);
                  setForm(p => ({ ...p, imagePublicId: img.imagePublicId }));
                }}
              />
            </div>
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: '#286f58', color: '#fff',
              borderRadius: 20, padding: '6px 14px',
              fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <CheckCircle2 size={16} /> Ảnh đã được chọn
            </div>
          </div>
        )}
      </BigField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <BigField label="4. Giá tiền" required error={errors.price}>
          <input name="price" value={form.price} onChange={handle} placeholder="VD: 350.000đ" style={inputStyle(errors.price)} />
        </BigField>

        <BigField label="5. Thời gian làm" required error={errors.duration}>
          <select name="duration" value={form.duration} onChange={handle} style={inputStyle(errors.duration)}>
            {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {form.duration === 'Custom' && (
            <input name="customDuration" value={form.customDuration} onChange={handle} placeholder="Nhập thời gian..." style={{...inputStyle(false), marginTop: 8}} />
          )}
        </BigField>
      </div>

      <BigField label="6. Số lượng khách" required error={errors.groupSize}>
        <select name="groupSize" value={form.groupSize} onChange={handle} style={inputStyle(errors.groupSize)}>
          {GROUP_SIZE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        {form.groupSize === 'Custom' && (
          <input name="customGroupSize" value={form.customGroupSize} onChange={handle} placeholder="Nhập số lượng..." style={{...inputStyle(false), marginTop: 8}} />
        )}
      </BigField>
    </div>
  );

  /* ── Trang 2: Thông tin tùy chọn ── */
  const renderStep2 = () => (
    <div>
      <div style={{
        background: '#f8fafc', color: '#475569', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 15, fontWeight: 500, border: '1px solid #e2e8f0'
      }}>
        Trang 2: Các mục dưới đây là <strong>không bắt buộc</strong>. Có thể bỏ trống và bổ sung sau.
      </div>

      <BigField label="Mô tả ngắn" sublabel="Tóm tắt 1-2 câu để khách xem nhanh.">
        <textarea
          name="shortDescription"
          value={form.shortDescription}
          onChange={handle}
          rows={3}
          placeholder="VD: Tìm hiểu cách làm nón lá và mang về kỷ niệm..."
          style={{ ...inputStyle(false), resize: 'vertical' }}
        />
      </BigField>

      <BigField label="Cài đặt hiển thị trên web">
        <div style={{ border: '2px solid #dce8e2', borderRadius: 12, padding: '16px 20px', background: '#fff' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 16 }}>
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handle}
              style={{ width: 24, height: 24, cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#1a3a2a' }}>Đăng bán ngay lập tức</div>
              <div style={{ fontSize: 14, color: '#6b7c74' }}>Khách có thể đặt mua trên web</div>
            </div>
          </label>

          <div style={{ height: 1, background: '#e8f0ec', margin: '0 -20px 16px' }} />

          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handle}
              disabled={!form.active}
              style={{ width: 24, height: 24, cursor: form.active ? 'pointer' : 'not-allowed', opacity: form.active ? 1 : 0.4 }}
            />
            <div style={{ opacity: form.active ? 1 : 0.5 }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#1a3a2a' }}>Đưa lên trang chủ (Mục Nổi Bật)</div>
              <div style={{ fontSize: 14, color: '#6b7c74' }}>Giúp khách dễ thấy sản phẩm này nhất</div>
            </div>
          </label>
        </div>
      </BigField>
    </div>
  );

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div style={{
        background: '#f8faf9',
        borderRadius: 20,
        width: '95%',
        maxWidth: 680,
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {/* ── Header ── */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #e8f0ec', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, color: '#1a3a2a', fontWeight: 800 }}>Thêm sản phẩm mới</h2>
              <p style={{ margin: '6px 0 0', fontSize: 15, color: '#6b7c74', fontWeight: 500 }}>
                Trang {step} / {TOTAL_STEPS} — {step === 1 ? 'Thông tin bắt buộc' : 'Thông tin mở rộng (Tùy chọn)'}
              </p>
            </div>
            <button onClick={onClose} style={{
              background: '#f1f5f2', border: 'none', borderRadius: '50%',
              width: 44, height: 44, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}>
              <X size={24} color="#1a3a2a" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="admin-form-body" style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          {step === 1 ? renderStep1() : renderStep2()}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '20px 28px', borderTop: '1px solid #e8f0ec', background: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        }}>
          <div>
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#f1f5f2', border: 'none', borderRadius: 12,
                  padding: '14px 24px', fontSize: 16, fontWeight: 700,
                  color: '#286f58', cursor: 'pointer',
                }}
              >
                <ArrowLeft size={20} /> Quay lại
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                style={{
                  background: 'transparent', border: 'none',
                  padding: '14px 16px', fontSize: 16, fontWeight: 600,
                  color: '#6b7c74', cursor: 'pointer',
                }}
              >
                Huỷ bỏ
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {step === 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#286f58', border: 'none', borderRadius: 12,
                  padding: '14px 32px', fontSize: 16, fontWeight: 700,
                  color: '#fff', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(40,111,88,0.3)',
                }}
              >
                Tiếp tục (Trang 2) <ArrowRight size={20} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  style={{
                    background: '#f1f5f2', border: '2px solid #286f58',
                    borderRadius: 12, padding: '14px 24px',
                    fontSize: 16, fontWeight: 700, color: '#286f58', cursor: 'pointer',
                  }}
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  style={{
                    background: '#286f58', border: 'none', borderRadius: 12,
                    padding: '14px 24px', fontSize: 16, fontWeight: 700,
                    color: '#fff', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(40,111,88,0.3)',
                  }}
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu & Sửa thêm chi tiết'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
