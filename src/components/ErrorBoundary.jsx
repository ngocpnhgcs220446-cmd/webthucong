import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', margin: '40px auto', maxWidth: '600px' }}>
          <h2 style={{ color: '#b91c1c', marginBottom: '16px' }}>Đã có lỗi xảy ra.</h2>
          <p style={{ color: '#991b1b', lineHeight: '1.6' }}>Không thể hiển thị phần xác nhận. Yêu cầu của bạn có thể đã được ghi nhận.<br/>Vui lòng tải lại trang.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
