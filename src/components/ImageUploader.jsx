import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import toast from 'react-hot-toast';

export default function ImageUploader({ value, onUpload, className = '', style = {} }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        onUpload(data.url);
        toast.success('Image uploaded!', { id: toastId });
      } else {
        toast.error('Failed to upload image', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image', { id: toastId });
    }
    setIsUploading(false);
  };

  return (
    <div className={`image-uploader ${className}`} style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100px', ...style }}>
      {value && <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />}
      
      <label style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: value ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
        color: 'white',
        cursor: 'pointer',
        opacity: value ? 0 : 1,
        transition: 'opacity 0.2s',
        borderRadius: 'inherit'
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = 1}
      onMouseLeave={e => e.currentTarget.style.opacity = value ? 0 : 1}
      >
        <Upload size={24} style={{ marginBottom: '8px' }} />
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
        <input type="file" hidden accept="image/*" onChange={handleUpload} disabled={isUploading} />
      </label>
    </div>
  );
}
