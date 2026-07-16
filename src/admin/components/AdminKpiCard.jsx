import React from 'react';
import { Users, CheckCircle, DollarSign, Target } from 'lucide-react';

export function AdminKpiCard({ title, icon, value, subtitle, colorClass }) {
  const icons = {
    users: <Users size={20} />,
    check: <CheckCircle size={20} />,
    dollar: <DollarSign size={20} />,
    target: <Target size={20} />
  };

  return (
    <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--soft-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: `var(--${colorClass})` }}>
          {icons[icon]}
        </div>
        <h3 style={{ fontSize: '16px', color: 'var(--muted)' }}>{title}</h3>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--green-darkest)' }}>{value}</div>
      <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px' }}>{subtitle}</div>
    </div>
  );
}
