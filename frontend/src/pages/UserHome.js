import React, { useEffect, useState } from 'react';

const UserHome = ({ setView }) => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [userName, setUserName] = useState('Member');
  const [searchTerm, setSearchTerm] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('userInfo'));
  const API_URL = process.env.REACT_APP_API_URL;

  /* ================= LOAD USER + EVENTS ================= */
  useEffect(() => {
    if (storedUser?.name) setUserName(storedUser.name);

    fetch(`${API_URL}/api/events/all`)
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => console.error("Events fetch error:", err));
  }, []);

  /* ================= LOAD TICKETS ================= */
  useEffect(() => {
    if (activeTab !== 'my-tickets' || !storedUser?._id) return;

    fetch(`${API_URL}/api/tickets/user/${storedUser._id}`, {
      headers: {
        Authorization: `Bearer ${storedUser.token}`
      }
    })
      .then(res => res.json())
      .then(data => setMyTickets(Array.isArray(data) ? data : []))
      .catch(err => console.error("Tickets fetch error:", err));
  }, [activeTab]);

  /* ================= NAVIGATION ================= */
  const handleNavigation = (venue) => {
    if (!venue) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={styles.container}>

      {/* ================= NAVBAR ================= */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          BEAT<span style={{ color: '#3b82f6' }}>TIX</span>
        </div>

        <div style={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('events')}
            style={styles.tab}
          >
            Events
          </button>

          <button
            onClick={() => setActiveTab('my-tickets')}
            style={styles.tab}
          >
            My Tickets
          </button>
        </div>

        <div>
          <button
            onClick={() => {
              localStorage.clear();
              setView('landing');
            }}
            style={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ================= MAIN ================= */}
      <main style={styles.main}>

        {activeTab === 'events' ? (
          <div>

            {/* SEARCH */}
            <input
              placeholder="Search events..."
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.search}
            />

            {/* EVENTS LIST */}
            <div style={styles.grid}>
              {events
                .filter(e =>
                  (e.title || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(event => (
                  <div key={event._id} style={styles.card}>
                    <h3>{event.title}</h3>
                    <p>{event.venue}</p>

                    <button
                      style={styles.bookBtn}
                      onClick={() => alert("Booking flow here")}
                    >
                      Book Ticket
                    </button>
                  </div>
                ))}
            </div>

          </div>
        ) : (
          <div>

            {/* TICKETS */}
            <div style={styles.grid}>
              {myTickets.length === 0 ? (
                <p>No tickets found</p>
              ) : (
                myTickets.map(t => (
                  <div key={t._id} style={styles.card}>
                    <h4>{t.event?.title}</h4>
                    <p>{t.event?.venue}</p>

                    <button
                      style={styles.navBtn}
                      onClick={() => handleNavigation(t.event?.venue)}
                    >
                      Navigate
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  container: {
    background: '#020617',
    color: '#fff',
    minHeight: '100vh'
  },

  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    borderBottom: '1px solid #1e293b'
  },

  logo: {
    fontSize: 24,
    fontWeight: 'bold'
  },

  tabContainer: {
    display: 'flex',
    gap: 10
  },

  tab: {
    padding: '8px 14px',
    background: '#1e293b',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  },

  logoutBtn: {
    background: '#ef4444',
    color: '#fff',
    padding: '8px 12px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  },

  main: {
    padding: 20
  },

  search: {
    padding: 10,
    width: '100%',
    marginBottom: 20,
    borderRadius: 6,
    border: '1px solid #334155'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 15
  },

  card: {
    background: '#0f172a',
    padding: 15,
    borderRadius: 10,
    border: '1px solid #1e293b'
  },

  bookBtn: {
    marginTop: 10,
    background: '#3b82f6',
    color: '#fff',
    padding: 8,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  },

  navBtn: {
    marginTop: 10,
    background: '#10b981',
    color: '#fff',
    padding: 8,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  }
};

export default UserHome;