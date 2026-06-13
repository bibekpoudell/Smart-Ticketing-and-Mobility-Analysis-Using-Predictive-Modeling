import React, { useEffect, useState, useRef, useCallback } from 'react';

const UserHome = ({ setView }) => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [userName, setUserName] = useState('Member');

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // AI CHATBOT
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hey Bibek! Ready to book some tickets? 🎸' }
  ]);

  const chatEndRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem('userInfo'));

  const handleNavigation = (venue) => {
    if (!venue) return;
    const destination = encodeURIComponent(venue);
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(mapUrl, '_blank');
  };

  // scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // load user + events
  useEffect(() => {
    if (storedUser?.name) setUserName(storedUser.name);
    fetchEvents();
  }, []); // safe: only run once

  // fetch tickets when tab changes
  useEffect(() => {
    if (activeTab === 'my-tickets' && storedUser?._id) {
      fetchMyTickets();
    }
  }, [activeTab, storedUser?._id]);

  const fetchEvents = () => {
    fetch('http://localhost:5000/api/events/all')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  };

  const fetchMyTickets = useCallback(() => {
    fetch(`http://localhost:5000/api/tickets/user/${storedUser._id}`, {
      headers: {
        'Authorization': `Bearer ${storedUser.token}`
      }
    })
      .then(res => res.json())
      .then(data => setMyTickets(Array.isArray(data) ? data : []));
  }, [storedUser]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput };
    const currentInput = chatInput;

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput })
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: 'bot', text: data.response || "No response from AI." }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: "AI server is offline." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBooking = async () => {
    setIsBooking(true);

    try {
      const response = await fetch('http://localhost:5000/api/tickets/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedUser.token}`
        },
        body: JSON.stringify({
          eventId: selectedEvent._id,
          quantity: ticketCount
        })
      });

      if (response.ok) {
        alert("🎉 Booking Confirmed!");
        setSelectedEvent(null);
        setTicketCount(1);
        fetchEvents();
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo}>BEAT<span style={{ color: '#3b82f6' }}>TIX</span></div>

        <div style={styles.tabContainer}>
          <button onClick={() => setActiveTab('events')} style={activeTab === 'events' ? styles.activeTab : styles.tab}>
            Browse Shows
          </button>
          <button onClick={() => setActiveTab('my-tickets')} style={activeTab === 'my-tickets' ? styles.activeTab : styles.tab}>
            My Wallet
          </button>
        </div>

        <div style={styles.profileBox}>
          <div style={styles.avatar}>{userName?.[0]}</div>
          <button onClick={() => { localStorage.clear(); setView('landing'); }} style={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </nav>

      <main style={styles.main}>
        {activeTab === 'events' ? (
          <div style={styles.dashboardLayout}>
            <div style={styles.sidebar}>
              <h1 style={styles.mainTitle}>Explore Events</h1>
              <p style={styles.subtitle}>Premium access to shows in Nepal</p>

              <input
                placeholder="Search..."
                style={styles.inputField}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={styles.scrollGrid}>
              {events
                .filter(e =>
                  (e.title || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(event => (
                  <div key={event._id} style={styles.eventCard}>
                    <div
                      style={{
                        ...styles.cardThumb,
                        backgroundImage: `url(${event.posterUrl})`
                      }}
                    />
                    <div style={styles.cardInfo}>
                      <h4>{event.title}</h4>
                      <p>{event.venue}</p>

                      <button onClick={() => setSelectedEvent(event)}>
                        Book
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div style={styles.walletContainer}>
            {myTickets.map(t => (
              <div key={t._id} style={styles.ticketRow}>
                <img src={t.qrCode} alt="qr" style={{ width: 80 }} />
                <div>
                  <h4>{t.event?.title}</h4>
                  <p>{t.event?.venue}</p>
                </div>
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

// keep your existing styles unchanged
const styles = {
  container: { height: '100vh', width: '100vw', backgroundColor: '#020617' },
  nav: { height: '85px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '2rem', fontWeight: '900' },
  tabContainer: { display: 'flex', gap: '10px' },
  tab: { padding: '10px', background: '#1e293b', color: '#fff' },
  activeTab: { padding: '10px', background: '#3b82f6', color: '#fff' },
  profileBox: { display: 'flex', gap: '10px' },
  avatar: { width: 35, height: 35, borderRadius: '50%', background: '#3b82f6' },
  logoutBtn: { color: 'red' },

  main: { padding: 20 },
  dashboardLayout: { display: 'flex' },
  sidebar: { width: 300 },
  mainTitle: { fontSize: 40 },
  subtitle: { color: '#94a3b8' },
  inputField: { width: '100%', padding: 10 },

  scrollGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 250px)', gap: 20 },
  eventCard: { background: '#1e293b', padding: 10 },
  cardThumb: { height: 200, backgroundSize: 'cover' },
  cardInfo: { padding: 10 },

  walletContainer: { padding: 20 },
  ticketRow: { display: 'flex', gap: 20, marginBottom: 20 }
};

export default UserHome;