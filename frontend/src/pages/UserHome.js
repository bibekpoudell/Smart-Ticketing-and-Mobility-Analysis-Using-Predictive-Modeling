import React, { useEffect, useState, useRef } from 'react';

const UserHome = ({ setView }) => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [userName, setUserName] = useState('Member');

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const chatEndRef = useRef(null);
  const storedUser = JSON.parse(localStorage.getItem('userInfo'));

  const handleNavigation = (venue) => {
    if (!venue) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue)}`;
    window.open(url, '_blank');
  };

  // load user + events
  useEffect(() => {
    if (storedUser?.name) setUserName(storedUser.name);

    fetch('http://localhost:5000/api/events/all')
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []); // safe for CI

  // fetch tickets
  useEffect(() => {
    if (activeTab !== 'my-tickets' || !storedUser?._id) return;

    fetch(`http://localhost:5000/api/tickets/user/${storedUser._id}`, {
      headers: {
        Authorization: `Bearer ${storedUser.token}`
      }
    })
      .then(res => res.json())
      .then(data => setMyTickets(Array.isArray(data) ? data : []));
  }, [activeTab]);

  return (
    <div style={styles.container}>

      <nav style={styles.nav}>
        <div style={styles.logo}>
          BEAT<span style={{ color: '#3b82f6' }}>TIX</span>
        </div>

        <div style={styles.tabContainer}>
          <button onClick={() => setActiveTab('events')} style={styles.tab}>
            Events
          </button>

          <button onClick={() => setActiveTab('my-tickets')} style={styles.tab}>
            My Tickets
          </button>
        </div>

        <div>
          <button onClick={() => { localStorage.clear(); setView('landing'); }}>
            Logout
          </button>
        </div>
      </nav>

      <main style={styles.main}>

        {activeTab === 'events' ? (
          <div>
            <input
              placeholder="Search events..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div>
              {events
                .filter(e =>
                  (e.title || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(event => (
                  <div key={event._id}>
                    <h3>{event.title}</h3>
                    <p>{event.venue}</p>

                    <button onClick={() => setSelectedEvent(event)}>
                      Book
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div>
            {myTickets.map(t => (
              <div key={t._id}>
                <h4>{t.event?.title}</h4>
                <p>{t.event?.venue}</p>

                <button onClick={() => handleNavigation(t.event?.venue)}>
                  Navigate
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

const styles = {
  container: { background: '#020617', color: '#fff', minHeight: '100vh' },
  nav: { display: 'flex', justifyContent: 'space-between', padding: 20 },
  logo: { fontSize: 24, fontWeight: 'bold' },
  tabContainer: { display: 'flex', gap: 10 },
  tab: { padding: 10, background: '#1e293b', color: '#fff' },
  main: { padding: 20 }
};

export default UserHome;