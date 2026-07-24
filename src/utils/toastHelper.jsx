import React from 'react';
import toast from 'react-hot-toast';

export function showToast({ type, title, message, id }) {
  const toastContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontWeight: 600, fontSize: '15px' }}>{title}</div>
      {message && <div style={{ fontSize: '14px', color: 'inherit', opacity: 0.9 }}>{message}</div>}
    </div>
  );

  const toastOptions = {
    id,
    duration: 5000,
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  };

  switch (type) {
    case 'success':
      return toast.success(toastContent, toastOptions);
    case 'error':
      return toast.error(toastContent, { ...toastOptions, duration: 6000 });
    case 'warning':
      return toast(toastContent, {
        ...toastOptions,
        icon: '⚠️',
        style: { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' },
      });
    case 'info':
    default:
      return toast(toastContent, toastOptions);
  }
}

export function getApiErrorMessage(error, fallback = 'Đã xảy ra lỗi không xác định.') {
  const status = error?.status || error?.response?.status;
  const serverMessage = error?.data?.error || error?.response?.data?.error || error?.message;

  if (serverMessage && typeof serverMessage === 'string' && serverMessage !== 'Failed to fetch') {
    return serverMessage;
  }

  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 413) return 'File tải lên quá lớn.';
  if (status === 503) return 'Dịch vụ hiện chưa sẵn sàng. Vui lòng kiểm tra cấu hình.';

  return fallback;
}
