import React, { useState } from 'react';
import { showToast, getApiErrorMessage } from '../../utils/toastHelper';
import { Upload } from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';

export default function AdminImageUploader({ currentImage, onUpload, value, onChange, label = "Upload Image", mode = "default" }) {
  const image = value || currentImage;
  const handleChange = onChange || onUpload;
  const [isUploading, setIsUploading] = useState(false);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!allowedTypes.includes(file.type)) {
      showToast({ type: 'error', title: 'File không hợp lệ', message: 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', title: 'Ảnh quá lớn', message: 'Dung lượng ảnh không được vượt quá 5 MB.' });
      return;
    }
    
    setIsUploading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (!data.image?.imageUrl || !data.image?.publicId) {
           throw new Error('Server không trả về thông tin ảnh hợp lệ.');
        }
        handleChange(data.image.imageUrl, data.image);
        showToast({ type: 'success', title: 'Tải ảnh thành công', message: 'Ảnh đã được tải lên. Hãy bấm Lưu để áp dụng thay đổi.' });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Không thể tải ảnh', message: getApiErrorMessage(err, 'Đã xảy ra lỗi khi tải ảnh.') });
    }
    setIsUploading(false);
  };

  if (mode === 'cover') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'block' }}>
        <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        
        <label style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 20
        }}>
          <Upload size={16} />
          {isUploading ? 'Uploading...' : 'Change Image'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={isUploading} style={{ display: 'none' }} />
        </label>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '14px', fontWeight: 'bold' }}>{label}</label>
      {image && (
        <img src={image} alt="Preview" style={{ height: '140px', width: '100%', borderRadius: '12px', objectFit: 'cover', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
      )}
      <input type="file" accept="image/*" onChange={handleUpload} style={{ padding: '8px 0', border: 'none', background: 'transparent' }} />
      {isUploading && <span style={{ color: 'var(--gold)', fontSize: '12px' }}>Uploading...</span>}
    </div>
  );
}
