import React, { useState } from 'react';

const OrganizerLogin = ({ setView, styles }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Check role
        if (data.role === 'organizer') {
          localStorage.setItem('userInfo', JSON.stringify(data));
          setView('organizer-home');
        } else {
          setError('Access Denied: You do not have Organizer privileges.');
        }
      } else {
        setError(data.message || 'Incorrect email or password.');
      }

    } catch (err) {
      setError('Connection failed. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.heroContainer}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={styles.formCard}>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1e293b', margin: 0 }}>Organizer Login</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Secure Management Portal
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '0.85rem',
              textAlign: 'center',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="organizer@beattix.com"
                style={styles.input}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                style={styles.input}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryBtn,
                width: '100%',
                backgroundColor: '#1e293b',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Verifying...' : 'Login to Dashboard'}
            </button>
          </form>

          <button
            onClick={() => setView('landing')}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#64748b',
              marginTop: '15px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            ← Return to Home
          </button>

        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#475569'
};

export default OrganizerLogin;