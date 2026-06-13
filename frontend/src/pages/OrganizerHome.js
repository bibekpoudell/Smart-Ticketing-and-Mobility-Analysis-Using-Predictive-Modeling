import React from 'react';

const OrganizerHome = ({ setView, styles }) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));

  // fallback styles (prevents crash if undefined)
  const activeStyles = styles || { heroContainer: {} };

  const menuItems = [
    {
      id: 'create-event',
      title: '➕ Create Event',
      desc: 'Launch a new concert or show'
    },
    {
      id: 'manage-events',
      title: '🎸 Manage Events',
      desc: 'Edit or Delete existing listings'
    },
    {
      id: 'crowd-monitor',
      title: '🛰️ Crowd Monitor',
      desc: 'Live IR Sensor Data (A/B/C)'
    },
    {
      id: 'scanner',
      title: '📸 Entry Scanner',
      desc: 'Scan QR codes at the gate'
    }
  ];

  return (
    <div
      style={{
        ...activeStyles.heroContainer,
        padding: '40px',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}
      >
        <div>
          <h1 style={{ color: 'white', margin: 0 }}>
            Organizer Dashboard
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Logged in as: {user?.email}
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            setView('landing');
          }}
          style={{
            background: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#ef4444'
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}
      >
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setView(item.id)}
            style={{
              backgroundColor: 'white',
              color: '#333',
              padding: '30px',
              borderRadius: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s',
              borderLeft: '5px solid #3b82f6'
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = 'scale(1.02)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = 'scale(1)')
            }
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                color: '#3b82f6'
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.9rem',
                color: '#64748b'
              }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizerHome;