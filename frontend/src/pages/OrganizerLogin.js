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

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Check if the user is actually an Organizer
        if (data.role === 'organizer') {
          // Store user info and token for authorized requests later
          localStorage.setItem('userInfo', JSON.stringify(data));
          
          // 2. Redirect to Organizer Dashboard
          setView('organizer-home'); 
        } else {
          setError('Access Denied: You do not have Organizer privileges.');
        }
      } else {
        // 3. Handle "Incorrect" credentials from backend
        setError(data.message || 'Incorrect email or password.');
      }
    } catch (err) {
      setError('Connection failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.heroContainer}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={styles.formCard}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1e293b', margin: '0' }}>Organizer Login</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Secure Management Portal</p>
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
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Email Address</label>
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
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Password</label>
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
                backgroundColor: '#1e293b', // Darker theme for organizer portal
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

export default OrganizerLogin;