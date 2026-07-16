import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiFetch';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import { AdminKpiCard } from '../admin/components/AdminKpiCard';
import { AdminChartCard } from '../admin/components/AdminChartCard';

const COLORS = ['#144d3e', '#e8b868', '#2c7a65', '#f4d499', '#09261e', '#5e6b66'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [calendar, setCalendar] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/admin/dashboard').then(res => res.json()),
      apiFetch('/api/admin/calendar').then(res => res.json())
    ])
      .then(([dashboardData, calendarData]) => {
        setData(dashboardData);
        setCalendar(calendarData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <section className="section soft-bg" style={{ padding: '40px 0', minHeight: '100vh' }}>
          <div className="container">
            <div style={{ marginBottom: '32px' }}>
              <div style={{ width: '250px', height: '32px', background: '#e0e0e0', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s infinite' }}></div>
              <div style={{ width: '300px', height: '20px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '24px', height: '120px', animation: 'pulse 1.5s infinite' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0e0e0', marginBottom: '16px' }}></div>
                  <div style={{ width: '100px', height: '16px', background: '#e0e0e0', borderRadius: '4px', marginBottom: '8px' }}></div>
                  <div style={{ width: '60px', height: '24px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                </div>
              ))}
            </div>

            <div className="dashboard-grid-large">
              <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', height: '400px', animation: 'pulse 1.5s infinite' }}></div>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', height: '400px', animation: 'pulse 1.5s infinite' }}></div>
            </div>
          </div>
        </section>
      </PageTransition>
    );
  }

  if (!data || !data.summary) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        Failed to load dashboard data.
      </div>
    );
  }

  const { summary, monthlyRevenue, monthlyLeads, leadsByStatus, leadsByService } = data;
  const hasData = summary.totalLeads > 0;

  return (
    <PageTransition>
      <SEO title="Admin Dashboard | Experience Platform" />
      <section className="section soft-bg" style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', color: 'var(--green-darkest)' }}>Business Dashboard</h1>
            <p style={{ color: 'var(--muted)' }}>Overview of your leads, bookings, and estimated revenue.</p>
          </div>

          {!hasData && (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--white)', borderRadius: '12px', border: '1px dashed var(--line)', marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '8px' }}>No data yet</h3>
              <p style={{ color: 'var(--muted)' }}>Charts and stats will appear after leads are created.</p>
            </div>
          )}

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <AdminKpiCard
              title="Total Leads" icon="users" colorClass="green"
              value={summary.totalLeads} subtitle={`${summary.newLeads} new leads waiting`}
            />
            <AdminKpiCard
              title="Confirmed Bookings" icon="check" colorClass="gold"
              value={summary.confirmedBookings + summary.completedBookings} subtitle="Includes completed"
            />
            <AdminKpiCard
              title="Est. Revenue (This Month)" icon="dollar" colorClass="green"
              value={`$${summary.estimatedRevenueThisMonth.toLocaleString()}`} subtitle="From confirmed/completed only"
            />
            <AdminKpiCard
              title="Conversion Rate" icon="target" colorClass="gold"
              value={`${summary.conversionRate}%`} subtitle="Lead to booking ratio"
            />
          </div>

          {/* Upcoming Bookings Table */}
          <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--green-darkest)', marginBottom: '24px' }}>Upcoming Bookings</h3>
            {calendar.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 8px', color: 'var(--muted)' }}>Date & Time</th>
                      <th style={{ padding: '12px 8px', color: 'var(--muted)' }}>Client Name</th>
                      <th style={{ padding: '12px 8px', color: 'var(--muted)' }}>Service</th>
                      <th style={{ padding: '12px 8px', color: 'var(--muted)' }}>Type</th>
                      <th style={{ padding: '12px 8px', color: 'var(--muted)' }}>Attendees</th>
                      <th style={{ padding: '12px 8px', color: 'var(--muted)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendar.map(booking => (
                      <tr key={booking.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                          {new Date(booking.bookingDate).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 8px' }}>{booking.name}</td>
                        <td style={{ padding: '12px 8px' }}>{booking.serviceNameSnapshot || 'Need consultation'}</td>
                        <td style={{ padding: '12px 8px' }}>{booking.bookingType || 'N/A'}</td>
                        <td style={{ padding: '12px 8px' }}>{booking.attendees || booking.guests || '0'}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: booking.status === 'completed' ? 'rgba(0,0,0,0.1)' : 'rgba(44, 122, 101, 0.1)',
                            color: booking.status === 'completed' ? 'var(--muted)' : 'var(--green-darkest)'
                          }}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)', background: 'var(--soft-bg)', borderRadius: '8px' }}>
                No upcoming bookings scheduled yet.
              </div>
            )}
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <AdminChartCard title="Monthly Revenue Trend">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip cursor={{ fill: 'var(--soft-bg)' }} formatter={(val) => `$${val}`} />
                  <Bar dataKey="revenue" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminChartCard title="Monthly Leads Trend">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyLeads}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--soft-bg)' }} />
                  <Bar dataKey="leads" fill="var(--green)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </AdminChartCard>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <AdminChartCard title="Leads by Status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    label
                  >
                    {leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminChartCard title="Leads by Service">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByService}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="serviceName"
                    label
                  >
                    {leadsByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </AdminChartCard>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
