import React from 'react';

export function AdminChartCard({ title, children }) {
  return (
    <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontSize: '18px', color: 'var(--green-darkest)', marginBottom: '24px' }}>{title}</h3>
      <div style={{ height: '300px' }}>
        {children}
      </div>
    </div>
  );
}
