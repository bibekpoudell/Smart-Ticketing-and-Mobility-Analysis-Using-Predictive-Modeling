import React from 'react';

const Landing = ({ setView, styles }) => {
  // Adding a secondary button style specifically for the Organizer Portal
  const secondaryBtn = {
    ...styles.primaryBtn,
    backgroundColor: 'transparent',
    border: '2px solid #3b82f6',
    color: '#3b82f6'
  };

  return (
    <div style={styles.heroContainer}>
      <nav style={{ padding: '30px 80px' }}>
        <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#3b82f6', letterSpacing: '-1px' }}>
          BEAT-TIX.
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: '5.5rem', fontWeight: '900', margin: 0, lineHeight: 1.1 }}>
          BEAT THE<br />DEMAND.
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '550px', margin: '25px 0 45px' }}>
          Nepal's premier smart-pricing platform. Secure your spot at the hottest concerts before the prices rise.
        </p>

        {/* Main Entry Buttons */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <button 
            onClick={() => setView('user-login')} 
            style={styles.primaryBtn}
          >
            Enter as User
          </button>
          
          {/* UPDATED: String matches organizer-login in App.js */}
          <button 
            onClick={() => setView('organizer-login')} 
            style={secondaryBtn}
          >
            Organizer Portal
          </button>
        </div>

        {/* Separated Registration Option */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', width: '300px' }}>
          <p style={{ color: '#94a3b8', marginBottom: '10px' }}>New to Beat-Tix?</p>
          <button 
            onClick={() => setView('user-signup')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#3b82f6', 
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              cursor: 'pointer', 
              textDecoration: 'underline' 
            }}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;