import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, ArrowRight, ArrowLeft, Check, Edit3, AlertCircle } from 'lucide-react';
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

/* ─── Chip selector ─────────────────────────────────────────────────── */
function ChipSelector({ options, selected, onChange }) {
  const toggle = (opt) =>
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: active ? '2px solid var(--green)' : '1.5px solid var(--line)',
              background: active ? 'rgba(40,111,88,0.08)' : 'var(--white)',
              color: active ? 'var(--green-darkest)' : 'var(--text-light)',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: active ? 700 : 400,
              transition: 'all 0.15s',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Field wrapper ─────────────────────────────────────────────────── */
function Field({ label, required, error, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--green-darkest)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {required && <span style={{ color: '#e53e3e', fontSize: 16, lineHeight: 1 }}>*</span>}
      </label>
      {hint && <span style={{ fontSize: 12, color: 'var(--text-light)', marginTop: -2 }}>{hint}</span>}
      {children}
      {error && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#e53e3e', fontSize: 12, fontWeight: 600 }}>
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  );
}

/* ─── Step indicator ─────────────────────────────────────────────────── */
function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'Thông tin bắt buộc' },
    { n: 2, label: 'Thông tin bổ sung' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 24px' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: step >= s.n ? 'var(--green)' : '#e2e8f0',
              color: step >= s.n ? '#fff' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, flexShrink: 0,
              transition: 'all 0.25s',
            }}>
              {step > s.n ? <Check size={16} /> : s.n}
            </div>
            <span style={{
              fontSize: 13, fontWeight: step === s.n ? 700 : 400,
              color: step === s.n ? 'var(--green-darkest)' : '#94a3b8',
              transition: 'all 0.25s',
            }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: '0 12px',
              background: step > 1 ? 'var(--green)' : '#e2e8f0',
              transition: 'background 0.3s',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function SmartProductForm({ onClose, onSuccess, onOpenEditor }) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    /* ── Step 1: required ── */
    title: '',
    slug: '',
    category: PRODUCT_CATEGORIES[0].key,
    imageUrl: '',
    imagePublicId: '',
    price: '',
    duration: DURATION_OPTIONS[0],
    customDuration: '',
    groupSize: GROUP_SIZE_OPTIONS[0],
    customGroupSize: '',
    /* ── Step 2: optional ── */
    groupName: '',
    shortDescription: '',
    defaultEstimatedPrice: '',
    currency: 'USD',
    experienceTags: [],
    bookingTags: [],
    priorityTags: [],
    active: true,
    featured: false,
    sortOrder: 0,
    description: '',
  });

  /* ── Helpers ── */
  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (name === 'defaultEstimatedPrice') value = value.replace(/[^0-9.]/g, '');
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const autoSlug = () => {
    if (!formData.slug && formData.title) {
      const s = formData.title
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: s }));
    }
  };

  /* ── Validation step 1 ── */
  const validateStep1 = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Tên sản phẩm là bắt buộc';
    if (!formData.category) e.category = 'Danh mục là bắt buộc';
    if (!formData.imageUrl) e.imageUrl = 'Ảnh đại diện là bắt buộc';
    if (!formData.price.trim()) e.price = 'Giá hiển thị là bắt buộc';
    const dur = formData.duration === 'Custom' ? formData.customDuration : formData.duration;
    if (!dur.trim()) e.duration = 'Thời gian là bắt buộc';
    const gs = formData.groupSize === 'Custom' ? formData.customGroupSize : formData.groupSize;
    if (!gs.trim()) e.groupSize = 'Quy mô nhóm là bắt buộc';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep2 = () => {
    if (!validateStep1()) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    autoSlug();
    setStep(2);
  };

  /* ── Save ── */
  const buildPayload = () => {
    const p = { ...formData };
    p.duration = p.duration === 'Custom' ? p.customDuration : p.duration;
    p.groupSize = p.groupSize === 'Custom' ? p.customGroupSize : p.groupSize;
    p.defaultEstimatedPrice = p.defaultEstimatedPrice === '' ? null : parseFloat(p.defaultEstimatedPrice);
    delete p.customDuration;
    delete p.customGroupSize;
    return p;
  };

  const handleSave = async (openEditor = false) => {
    if (isSaving) return;

    // Always re-validate step 1 before saving (even from step 2)
    if (!validateStep1()) {
      setStep(1);
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc ở Bước 1');
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
        const errData = await res.json().catch(() => ({}));
        const err = new Error(errData.error || 'Không thể tạo sản phẩm');
        err.fields = errData.fields || {};
        throw err;
      }

      const created = await res.json();
      toast.success('Tạo sản phẩm thành công!', { id: toastId });

      if (openEditor && onOpenEditor) {
        onOpenEditor(created);
      } else {
        onSuccess(created);
      }
    } catch (err) {
      if (err.fields) {
        setErrors(err.fields);
        toast.error('Lỗi validation, kiểm tra lại form', { id: toastId });
      } else {
        toast.error(err.message || 'Không thể tạo sản phẩm', { id: toastId });
      }
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Render Step 1 ── */
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ background: 'rgba(40,111,88,0.06)', border: '1px solid rgba(40,111,88,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--green-darkest)' }}>
        Điền đầy đủ 6 trường bên dưới để tạo sản phẩm. Các thông tin chi tiết khác có thể thêm sau.
      </div>

      {/* Title */}
      <Field label="Tên sản phẩm" required error={errors.title}>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={autoSlug}
          placeholder="VD: Traditional Lion Head Crafting Workshop"
          style={{ border: errors.title ? '2px solid #e53e3e' : '' }}
          autoFocus
        />
      </Field>

      {/* Category */}
      <Field label="Danh mục" required error={errors.category}>
        <select name="category" value={formData.category} onChange={handleChange}
          style={{ border: errors.category ? '2px solid #e53e3e' : '' }}>
          {PRODUCT_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </Field>

      {/* Image */}
      <Field
        label="Ảnh đại diện"
        required
        error={errors.imageUrl}
        hint="Chỉ hỗ trợ JPG, PNG, WEBP · Tối đa 5MB"
      >
        <AdminImageUploader
          value={formData.imageUrl}
          onChange={(imageData) => {
            setFormData(prev => ({
              ...prev,
              imageUrl: imageData.imageUrl,
              imagePublicId: imageData.imagePublicId,
            }));
            setErrors(prev => ({ ...prev, imageUrl: null }));
          }}
        />
      </Field>

      {/* Price */}
      <Field label="Giá hiển thị" required error={errors.price} hint='Ví dụ: "From $35 / person" — đây là text hiển thị trực tiếp lên trang'>
        <input
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="From $35 / person"
          style={{ border: errors.price ? '2px solid #e53e3e' : '' }}
        />
      </Field>

      {/* Duration + Group size side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Field label="Thời gian" required error={errors.duration}>
          <select name="duration" value={formData.duration} onChange={handleChange}
            style={{ border: errors.duration ? '2px solid #e53e3e' : '' }}>
            {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {formData.duration === 'Custom' && (
            <input name="customDuration" value={formData.customDuration} onChange={handleChange}
              placeholder="VD: 2 ngày 1 đêm" style={{ marginTop: 8 }} />
          )}
        </Field>

        <Field label="Quy mô nhóm" required error={errors.groupSize}>
          <select name="groupSize" value={formData.groupSize} onChange={handleChange}
            style={{ border: errors.groupSize ? '2px solid #e53e3e' : '' }}>
            {GROUP_SIZE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {formData.groupSize === 'Custom' && (
            <input name="customGroupSize" value={formData.customGroupSize} onChange={handleChange}
              placeholder="VD: 1-20 người" style={{ marginTop: 8 }} />
          )}
        </Field>
      </div>
    </div>
  );

  /* ── Render Step 2 ── */
  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      <div style={{ background: '#f8fafc', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--text-light)' }}>
        Tất cả trường dưới đây là <strong>tùy chọn</strong>. Bạn có thể bỏ qua và chỉnh sửa chi tiết hơn sau khi tạo.
      </div>

      {/* Short description */}
      <Field label="Mô tả ngắn" hint="Một câu tóm tắt, hiển thị trên danh sách sản phẩm">
        <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange}
          rows={2} placeholder="VD: Tìm hiểu nghệ thuật làm nón lá truyền thống..." />
      </Field>

      {/* Collection */}
      <Field label="Collection / Nhóm sản phẩm" hint="Gom sản phẩm vào một bộ sưu tập">
        <select name="groupName" value={formData.groupName} onChange={handleChange}>
          <option value="">— Không có —</option>
          {PRODUCT_COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      {/* Base price + Currency */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Field label="Giá gốc (số)" hint="Dùng cho hệ thống tính toán, không hiển thị" error={errors.defaultEstimatedPrice}>
          <input name="defaultEstimatedPrice" type="number" step="0.01"
            value={formData.defaultEstimatedPrice} onChange={handleChange} placeholder="35"
            style={{ border: errors.defaultEstimatedPrice ? '2px solid #e53e3e' : '' }} />
        </Field>
        <Field label="Tiền tệ">
          <select name="currency" value={formData.currency} onChange={handleChange}>
            <option value="USD">USD</option>
            <option value="VND">VND</option>
          </select>
        </Field>
      </div>

      {/* Tags */}
      <Field label="Experience Tags" hint="Loại trải nghiệm">
        <ChipSelector options={EXPERIENCE_TAGS} selected={formData.experienceTags}
          onChange={(v) => setFormData(p => ({ ...p, experienceTags: v }))} />
      </Field>

      <Field label="Booking Tags" hint="Hình thức đặt chỗ">
        <ChipSelector options={BOOKING_TAGS} selected={formData.bookingTags}
          onChange={(v) => setFormData(p => ({ ...p, bookingTags: v }))} />
      </Field>

      <Field label="Priority Tags" hint="Nhãn nổi bật trên thẻ sản phẩm">
        <ChipSelector options={PRIORITY_TAGS} selected={formData.priorityTags}
          onChange={(v) => setFormData(p => ({ ...p, priorityTags: v }))} />
      </Field>

      {/* Publish settings */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, padding: '16px 20px' }}>
        <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 14, color: 'var(--green-darkest)' }}>Cài đặt hiển thị</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0, fontWeight: 500 }}>
            <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
            Active / Published
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0, fontWeight: 500 }}>
            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} disabled={!formData.active} />
            Nổi bật trên trang chủ
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontWeight: 500 }}>
            Thứ tự:
            <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange}
              style={{ width: 70, padding: '4px 8px' }} />
          </label>
        </div>
        {errors.featured && <p style={{ color: '#e53e3e', fontSize: 12, margin: '8px 0 0' }}>{errors.featured}</p>}
        <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-light)' }}>
          Trang chủ hiển thị tối đa 4 sản phẩm nổi bật.
        </p>
      </div>
    </div>
  );

  /* ── Render ── */
  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        style={{ maxWidth: 640, width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0, borderRadius: 16 }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)', background: 'var(--white)', borderRadius: '16px 16px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>Thêm sản phẩm mới</h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-light)' }}>
                {step === 1 ? 'Bước 1 / 2 — Thông tin bắt buộc' : 'Bước 2 / 2 — Thông tin bổ sung (tùy chọn)'}
              </p>
            </div>
            <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={onClose}>
              <X size={22} />
            </button>
          </div>
          <StepIndicator step={step} />
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
          {step === 1 ? renderStep1() : renderStep2()}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid var(--line)',
          background: 'var(--white)', borderRadius: '0 0 16px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}>
          {/* Left */}
          <div>
            {step === 2 && (
              <button type="button" className="btn btn-outline"
                onClick={() => setStep(1)} disabled={isSaving}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeft size={16} /> Quay lại
              </button>
            )}
            {step === 1 && (
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSaving}>
                Huỷ
              </button>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', gap: 10 }}>
            {step === 1 ? (
              <>
                {/* Save directly from step 1 */}
                <button type="button" className="btn btn-outline"
                  onClick={() => handleSave(false)} disabled={isSaving}>
                  {isSaving ? 'Đang tạo...' : 'Tạo nhanh'}
                </button>
                <button type="button" className="btn"
                  onClick={goToStep2} disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Tiếp theo <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-outline"
                  onClick={() => handleSave(false)} disabled={isSaving}>
                  {isSaving ? 'Đang tạo...' : 'Tạo sản phẩm'}
                </button>
                <button type="button" className="btn"
                  onClick={() => handleSave(true)} disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Edit3 size={16} />
                  {isSaving ? 'Đang tạo...' : 'Tạo & Chỉnh sửa chi tiết'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
