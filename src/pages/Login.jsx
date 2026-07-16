import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
        toast.success('Logged in successfully');
        navigate('/admin/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <SEO title="Admin Login | Conical Hat-Workshop" />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--soft-bg)' }}>
        <form onSubmit={handleLogin} style={{ background: 'var(--white)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ color: 'var(--green-darkest)', textAlign: 'center', fontSize: '24px', margin: 0 }}>Admin Login</h2>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
            Username
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter admin username"
              style={{ padding: '12px 16px', border: '1px solid var(--line)', borderRadius: '8px', outline: 'none', fontSize: '16px' }}
              required 
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
            Password
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter admin password"
              style={{ padding: '12px 16px', border: '1px solid var(--line)', borderRadius: '8px', outline: 'none', fontSize: '16px' }}
              required 
            />
          </label>
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Verifying...' : 'Log In'}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
