import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Upload, Camera, AlertTriangle } from 'lucide-react';
import AdminImageUploader from './AdminImageUploader';
import {
  PRODUCT_CATEGORIES,
  DURATION_OPTIONS,
  GROUP_SIZE_OPTIONS
} from '../../config/productOptions';
import { apiFetch } from '../../utils/apiFetch';

/* ─────────────────────────────────────────────────────────────
   Big field — dành cho người không quen dùng máy tính
   ──────────────────────────────────────────────────────────── */
function BigField({ label, sublabel, required, error, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <label style={{
        display: 'block',
        fontSize: 18,
        fontWeight: 700,
        color: '#1a3a2a',
        marginBottom: 4,
      }}>
        {label}
        {required && <span style={{ color: '#c0392b', marginLeft: 4 }}>*</span>}
      </label>
      {sublabel && (
        <p style={{ margin: '0 0 10px', fontSize: 14, color: '#6b7c74', lineHeight: 1.5 }}>
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
   Progress bar
   ──────────────────────────────────────────────────────────── */
function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  const labels = ['Tên & Danh mục', 'Ảnh sản phẩm', 'Giá & Thời gian'];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        {labels.map((l, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: i + 1 === step ? '#286f58' : i + 1 < step ? '#52b788' : '#b0c4ba',
            fontWeight: i + 1 === step ? 700 : 500,
            fontSize: 13,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: i + 1 < step ? '#52b788' : i + 1 === step ? '#286f58' : '#e2eae6',
              color: i + 1 <= step ? '#fff' : '#9db5ab',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {i + 1 < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span style={{ display: window.innerWidth < 500 ? 'none' : 'inline' }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 6, background: '#e2eae6', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #52b788, #286f58)',
          borderRadius: 3,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Chọn category bằng card lớn
   ──────────────────────────────────────────────────────────── */
const CAT_INFO = {
  offline: { emoji: '🏠', desc: 'Workshop tại chỗ, trải nghiệm trực tiếp' },
  online:  { emoji: '💻', desc: 'Workshop trực tuyến qua Zoom / Meet' },
  diy:     { emoji: '📦', desc: 'Bộ kit tự làm tại nhà' },
};

function CategoryCards({ value, onChange }) {
  const cats = [
    { key: 'offline', label: 'Offline (Tại chỗ)' },
    { key: 'online',  label: 'Online (Trực tuyến)' },
    { key: 'diy',     label: 'DIY Kit (Tự làm)' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {cats.map(c => {
        const info = CAT_INFO[c.key];
        const selected = value === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px',
              borderRadius: 12,
              border: selected ? '2.5px solid #286f58' : '2px solid #dce8e2',
              background: selected ? 'rgba(40,111,88,0.06)' : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              boxShadow: selected ? '0 0 0 3px rgba(40,111,88,0.12)' : 'none',
            }}
          >
            <span style={{ fontSize: 32 }}>{info.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1a3a2a' }}>{c.label}</div>
              <div style={{ fontSize: 13, color: '#6b7c74', marginTop: 2 }}>{info.desc}</div>
            </div>
            <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: selected ? 'none' : '2px solid #b0c4ba',
                background: selected ? '#286f58' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected && <CheckCircle2 size={22} color="#fff" />}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function SmartProductForm({ onClose, onSuccess, onOpenEditor }) {
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
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

  /* ── Validation by step ── */
  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.title.trim()) e.title = 'Bạn chưa nhập tên sản phẩm';
    }
    if (s === 2) {
      if (!form.imageUrl) e.imageUrl = 'Bạn chưa chọn ảnh cho sản phẩm';
    }
    if (s === 3) {
      if (!form.price.trim()) e.price = 'Bạn chưa nhập giá';
      const dur = form.duration === 'Custom' ? form.customDuration : form.duration;
      if (!dur.trim()) e.duration = 'Bạn chưa nhập thời gian';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) {
      toast.error('Vui lòng điền thông tin còn thiếu');
      return;
    }
    if (step === 1) autoSlug();
    setStep(s => s + 1);
  };

  const goBack = () => setStep(s => s - 1);

  /* ── Save ── */
  const buildPayload = () => {
    const p = { ...form };
    p.duration = p.duration === 'Custom' ? p.customDuration : p.duration;
    p.groupSize = p.groupSize === 'Custom' ? p.customGroupSize : p.groupSize;
    delete p.customDuration;
    delete p.customGroupSize;
    return p;
  };

  const handleSave = async (openEditor = false) => {
    if (isSaving) return;
    // validate all steps
    const allValid = validateStep(1) && validateStep(2) && validateStep(3);
    if (!allValid) {
      toast.error('Vui lòng kiểm tra lại thông tin');
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

  /* ── Step 1: Tên & Danh mục ── */
  const renderStep1 = () => (
    <div>
      <BigField
        label="Tên sản phẩm / Workshop"
        sublabel='Nhập tên đầy đủ của hoạt động. Ví dụ: "Lớp làm nón lá truyền thống"'
        required
        error={errors.title}
      >
        <input
          name="title"
          value={form.title}
          onChange={handle}
          onBlur={autoSlug}
          placeholder="Nhập tên ở đây..."
          autoFocus
          style={{
            fontSize: 17,
            padding: '14px 16px',
            border: errors.title ? '2px solid #e53e3e' : '2px solid #dce8e2',
            borderRadius: 10,
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </BigField>

      <BigField
        label="Loại hoạt động"
        sublabel="Chọn hình thức tổ chức của sản phẩm này"
        required
      >
        <CategoryCards value={form.category} onChange={(v) => set('category', v)} />
      </BigField>

      <BigField
        label="Mô tả ngắn (không bắt buộc)"
        sublabel="1–2 câu tóm tắt. Hiển thị dưới tên sản phẩm trong danh sách."
      >
        <textarea
          name="shortDescription"
          value={form.shortDescription}
          onChange={handle}
          rows={3}
          placeholder="VD: Khám phá nghệ thuật làm nón lá trong không gian truyền thống..."
          style={{
            fontSize: 15,
            padding: '12px 14px',
            border: '2px solid #dce8e2',
            borderRadius: 10,
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            lineHeight: 1.6,
          }}
        />
      </BigField>
    </div>
  );

  /* ── Step 2: Ảnh ── */
  const renderStep2 = () => (
    <div>
      <BigField
        label="Ảnh đại diện sản phẩm"
        sublabel="Chọn 1 ảnh đẹp cho sản phẩm. Ảnh phải là JPG, PNG hoặc WEBP, dung lượng tối đa 5MB."
        required
        error={errors.imageUrl}
      >
        {/* Big upload area */}
        {!form.imageUrl ? (
          <div style={{
            border: errors.imageUrl ? '2.5px dashed #e53e3e' : '2.5px dashed #52b788',
            borderRadius: 14,
            padding: '40px 20px',
            textAlign: 'center',
            background: errors.imageUrl ? '#fff5f5' : 'rgba(82,183,136,0.04)',
          }}>
            <Camera size={48} color={errors.imageUrl ? '#e53e3e' : '#52b788'} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 17, fontWeight: 600, color: '#1a3a2a', margin: '0 0 8px' }}>
              Nhấn vào nút bên dưới để chọn ảnh từ máy tính
            </p>
            <p style={{ fontSize: 13, color: '#6b7c74', margin: '0 0 20px' }}>
              Ảnh sẽ được lưu tự động lên đám mây
            </p>
            <AdminImageUploader
              value={form.imageUrl}
              onChange={(imageData) => {
                set('imageUrl', imageData.imageUrl);
                setForm(p => ({ ...p, imagePublicId: imageData.imagePublicId }));
              }}
            />
          </div>
        ) : (
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '2px solid #52b788', position: 'relative' }}>
            <img
              src={form.imageUrl}
              alt="Preview"
              style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <AdminImageUploader
                value={form.imageUrl}
                onChange={(imageData) => {
                  set('imageUrl', imageData.imageUrl);
                  setForm(p => ({ ...p, imagePublicId: imageData.imagePublicId }));
                }}
              />
            </div>
            <div style={{
              position: 'absolute', top: 10, right: 10,
              background: '#286f58', color: '#fff',
              borderRadius: 20, padding: '4px 12px',
              fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <CheckCircle2 size={14} /> Đã chọn ảnh
            </div>
          </div>
        )}
      </BigField>

      <div style={{
        background: '#f0faf4',
        border: '1px solid #b7e4c7',
        borderRadius: 10,
        padding: '14px 16px',
        fontSize: 14,
        color: '#2d6a4f',
        lineHeight: 1.6,
      }}>
        💡 <strong>Mẹo:</strong> Chọn ảnh ngang (landscape), có ánh sáng tốt, và thể hiện rõ hoạt động của workshop.
      </div>
    </div>
  );

  /* ── Step 3: Giá & Thời gian ── */
  const renderStep3 = () => (
    <div>
      <BigField
        label="Giá hiển thị"
        sublabel='Nhập giá như bạn muốn khách thấy. Ví dụ: "Từ 350.000đ / người" hoặc "From $35 / person"'
        required
        error={errors.price}
      >
        <input
          name="price"
          value={form.price}
          onChange={handle}
          placeholder="Ví dụ: From $35 / person"
          style={{
            fontSize: 17,
            padding: '14px 16px',
            border: errors.price ? '2px solid #e53e3e' : '2px solid #dce8e2',
            borderRadius: 10,
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </BigField>

      <BigField
        label="Thời gian thực hiện"
        sublabel="Workshop thường kéo dài bao lâu?"
        required
        error={errors.duration}
      >
        <select
          name="duration"
          value={form.duration}
          onChange={handle}
          style={{
            fontSize: 16,
            padding: '13px 14px',
            border: errors.duration ? '2px solid #e53e3e' : '2px solid #dce8e2',
            borderRadius: 10,
            width: '100%',
            background: '#fff',
          }}
        >
          {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {form.duration === 'Custom' && (
          <input
            name="customDuration"
            value={form.customDuration}
            onChange={handle}
            placeholder="Nhập thời gian, ví dụ: 2 ngày 1 đêm"
            style={{ fontSize: 15, padding: '12px 14px', border: '2px solid #dce8e2', borderRadius: 10, width: '100%', boxSizing: 'border-box', marginTop: 10 }}
          />
        )}
      </BigField>

      <BigField
        label="Số lượng khách"
        sublabel="Tối đa bao nhiêu người có thể tham gia?"
      >
        <select
          name="groupSize"
          value={form.groupSize}
          onChange={handle}
          style={{
            fontSize: 16,
            padding: '13px 14px',
            border: '2px solid #dce8e2',
            borderRadius: 10,
            width: '100%',
            background: '#fff',
          }}
        >
          {GROUP_SIZE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        {form.groupSize === 'Custom' && (
          <input
            name="customGroupSize"
            value={form.customGroupSize}
            onChange={handle}
            placeholder="Ví dụ: 1-20 người"
            style={{ fontSize: 15, padding: '12px 14px', border: '2px solid #dce8e2', borderRadius: 10, width: '100%', boxSizing: 'border-box', marginTop: 10 }}
          />
        )}
      </BigField>

      {/* Publish toggle */}
      <div style={{
        background: '#f8faf9',
        border: '2px solid #dce8e2',
        borderRadius: 12,
        padding: '16px 20px',
      }}>
        <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 16, color: '#1a3a2a' }}>
          Hiển thị sản phẩm
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 10 }}>
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handle}
            style={{ width: 22, height: 22, cursor: 'pointer' }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Hiển thị ngay sau khi tạo</div>
            <div style={{ fontSize: 13, color: '#6b7c74' }}>Khách có thể thấy sản phẩm này trên website</div>
          </div>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handle}
            disabled={!form.active}
            style={{ width: 22, height: 22, cursor: form.active ? 'pointer' : 'not-allowed', opacity: form.active ? 1 : 0.4 }}
          />
          <div style={{ opacity: form.active ? 1 : 0.5 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Hiển thị nổi bật trên trang chủ</div>
            <div style={{ fontSize: 13, color: '#6b7c74' }}>Sản phẩm sẽ xuất hiện ở vị trí ưu tiên</div>
          </div>
        </label>
      </div>
    </div>
  );

  const stepContent = [renderStep1, renderStep2, renderStep3];
  const isLastStep = step === TOTAL_STEPS;

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        width: '95%',
        maxWidth: 620,
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}>
        {/* ── Header ── */}
        <div style={{
          padding: '20px 24px 14px',
          borderBottom: '1px solid #e8f0ec',
          background: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, color: '#1a3a2a' }}>Thêm sản phẩm mới</h2>
              <p style={{ margin: '3px 0 0', fontSize: 14, color: '#6b7c74' }}>
                Bước {step} / {TOTAL_STEPS} — {['Tên & Loại hoạt động', 'Ảnh sản phẩm', 'Giá & Thời gian'][step - 1]}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f2', border: 'none', borderRadius: 8,
                width: 36, height: 36, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={20} color="#286f58" />
            </button>
          </div>
          <ProgressBar step={step} total={TOTAL_STEPS} />
        </div>

        {/* ── Body ── */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          background: '#fafcfb',
        }}>
          {stepContent[step - 1]()}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e8f0ec',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Back */}
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#f1f5f2', border: 'none', borderRadius: 10,
                  padding: '12px 20px', fontSize: 15, fontWeight: 600,
                  color: '#286f58', cursor: 'pointer',
                }}
              >
                <ArrowLeft size={18} /> Quay lại
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                style={{
                  background: '#f1f5f2', border: 'none', borderRadius: 10,
                  padding: '12px 20px', fontSize: 15, fontWeight: 600,
                  color: '#6b7c74', cursor: 'pointer',
                }}
              >
                Huỷ
              </button>
            )}
          </div>

          {/* Next / Save */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!isLastStep ? (
              <button
                type="button"
                onClick={goNext}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#286f58', border: 'none', borderRadius: 10,
                  padding: '13px 28px', fontSize: 16, fontWeight: 700,
                  color: '#fff', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(40,111,88,0.3)',
                }}
              >
                Tiếp theo <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  style={{
                    background: '#f1f5f2', border: '2px solid #286f58',
                    borderRadius: 10, padding: '12px 20px',
                    fontSize: 15, fontWeight: 600, color: '#286f58', cursor: 'pointer',
                  }}
                >
                  {isSaving ? 'Đang tạo...' : '✓ Tạo sản phẩm'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  style={{
                    background: '#286f58', border: 'none', borderRadius: 10,
                    padding: '13px 22px', fontSize: 15, fontWeight: 700,
                    color: '#fff', cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(40,111,88,0.3)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {isSaving ? 'Đang tạo...' : '✓ Tạo & Chỉnh sửa thêm'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
