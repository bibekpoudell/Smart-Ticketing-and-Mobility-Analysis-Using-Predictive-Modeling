import React, { useState, useEffect } from 'react';

const Register = ({ setView, styles }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Ensures state is empty on load
  useEffect(() => {
    setFormData({ name: '', email: '', password: '' });
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Account Created successfully!");
        setView('user-login');
      } else {
        const data = await res.json();
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Backend connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.heroContainer, display: 'grid', placeItems: 'center' }}>
      <div style={styles.formCard}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 10px 0', color: '#1e293b' }}>Join the Beat</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Create an account to unlock live concert pricing.</p>
        </div>

        <form onSubmit={handleRegister} autoComplete="off">
          {/* Invisible inputs to catch browser autofill */}
          <input style={{ display: 'none' }} type="text" name="fake-user" />
          <input style={{ display: 'none' }} type="password" name="fake-pass" />

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Full Name</label>
            <input 
              type="text" 
              name={`reg_name_${Math.random()}`}
              placeholder=""  /* REMOVED JOHN DOE */
              style={styles.input} 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              autoComplete="off"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              name={`reg_email_${Math.random()}`}
              placeholder="" /* REMOVED EMAIL HINT */
              style={styles.input} 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              autoComplete="off"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              name={`reg_pass_${Math.random()}`}
              placeholder="" /* REMOVED DOTS HINT */
              style={styles.input} 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              autoComplete="new-password"
            />
          </div>
          
          <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, width: '100%', padding: '14px' }}>
            {loading ? "Creating Account..." : "Create Free Account"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: '#475569' }}>
          Already a member? <span onClick={() => setView('user-login')} style={linkStyle}>Sign In</span>
        </div>
        
        <p onClick={() => setView('landing')} style={backLinkStyle}>← Back to Home</p>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' };
const linkStyle = { color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' };
const backLinkStyle = { textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem' };

export default Register;