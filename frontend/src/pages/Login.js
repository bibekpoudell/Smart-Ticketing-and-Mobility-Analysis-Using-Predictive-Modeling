import React, { useState, useEffect } from 'react';

const Login = ({ setView, styles }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // This ensures the fields are wiped clean as soon as the page loads
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setView('user-home');
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      alert("Check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.heroContainer, display: 'grid', placeItems: 'center' }}>
      <div style={styles.formCard}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 10px 0', color: '#1e293b' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sign in to continue your musical journey.</p>
        </div>

        <form onSubmit={handleLogin} autoComplete="off">
          {/* Dummy inputs to trick browser autofill */}
          <input style={{ display: 'none' }} type="text" name="fake-user" />
          <input style={{ display: 'none' }} type="password" name="fake-pass" />

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              name={`email_${Math.random()}`} // Randomized name prevents browser memory
              placeholder="Enter your email" 
              style={styles.input} 
              required
              value={email} // Controlled value
              onChange={(e) => setEmail(e.target.value)} 
              autoComplete="off"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              name={`pass_${Math.random()}`} // Randomized name prevents browser memory
              placeholder="Enter your password" 
              style={styles.input} 
              required
              value={password} // Controlled value
              onChange={(e) => setPassword(e.target.value)} 
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, width: '100%', padding: '14px' }}>
            {loading ? "Authenticating..." : "Sign In to Beat-Tix"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: '#475569' }}>
          New to the platform? <span onClick={() => setView('user-signup')} style={linkStyle}>Register here</span>
        </div>
        <p onClick={() => setView('landing')} style={backLinkStyle}>← Back to Home</p>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' };
const linkStyle = { color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' };
const backLinkStyle = { textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem' };

export default Login;