import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, getToken } from '../utils/apiFetch';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import LeadAdminCard from '../admin/components/LeadAdminCard';



export default function AdminLeads() {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState([]);

  // Leads filters
  const [leadStatusFilter, setLeadStatusFilter] = useState('');
  const [leadSearchFilter, setLeadSearchFilter] = useState('');

  const fetchLeads = () => {
    const params = new URLSearchParams();
    if (leadStatusFilter) params.append('status', leadStatusFilter);
    if (leadSearchFilter) params.append('q', leadSearchFilter);

    apiFetch(`/api/leads?${params.toString()}`)
      .then(r => {
        if (r.ok) return r.json();
        return [];
      })
      .then(setLeads)
      .catch(console.error);
  };

  useEffect(() => {
    fetchLeads();
  }, [leadStatusFilter, leadSearchFilter]);

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (leadStatusFilter) params.append('status', leadStatusFilter);
    if (leadSearchFilter) params.append('q', leadSearchFilter);

    const token = getToken();
    fetch(`/api/leads/export?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error('Export failed', err);
        alert('Failed to export CSV');
      });
  };

  if (!isAdmin) return null;

  return (
    <PageTransition>
      <SEO title="Manage Leads | Admin" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Customer Inquiries</h1>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Manage your leads, sales, and bookings.</p>
          </div>
        </div>
        
        <div>
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={leadSearchFilter}
                  onChange={(e) => setLeadSearchFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', minWidth: '250px' }}
                />
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)' }}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <button className="admin-btn admin-btn-secondary" onClick={handleExportCSV}>Export CSV</button>
            </div>
          </div>

          {leads.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {leads.map(lead => (
                <LeadAdminCard key={lead.id} lead={lead} onUpdate={fetchLeads} />
              ))}
            </div>
          ) : (
            <div className="admin-card" style={{ padding: '80px 40px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '8px' }}>No leads found</h3>
              <p style={{ color: 'var(--muted)' }}>Try adjusting your filters or wait for new customers to contact you.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
