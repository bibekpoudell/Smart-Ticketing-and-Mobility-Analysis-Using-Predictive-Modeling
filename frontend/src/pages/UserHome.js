import React, { useEffect, useState, useRef } from 'react';

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

  // --- AI CHATBOT ---
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (storedUser?.name) setUserName(storedUser.name);
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-tickets' && storedUser) fetchMyTickets();
  }, [activeTab]);

  const fetchEvents = () => {
    fetch('http://localhost:5000/api/events/all')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  };

  const fetchMyTickets = () => {
    fetch(`http://localhost:5000/api/tickets/user/${storedUser._id}`, {
        headers: { 'Authorization': `Bearer ${storedUser.token}` }
    })
      .then(res => res.json())
      .then(data => setMyTickets(Array.isArray(data) ? data : []));
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: chatInput })
      });

      if (!response.ok) throw new Error("Server disconnected");
      const data = await response.json();
      const botReply = data.response || "I couldn't find information about that in the ticket.";
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: "The AI service is currently offline. Please ensure the Python server is running on port 8000." }]);
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
        body: JSON.stringify({ eventId: selectedEvent._id, quantity: ticketCount })
      });
      if (response.ok) {
        alert("🎉 Booking Confirmed! Check your wallet.");
        setSelectedEvent(null);
        setTicketCount(1);
        fetchEvents(); 
      }
    } finally { setIsBooking(false); }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo}>BEAT<span style={{color: '#3b82f6'}}>TIX</span></div>
        <div style={styles.tabContainer}>
          <button onClick={() => setActiveTab('events')} style={activeTab === 'events' ? styles.activeTab : styles.tab}>Browse Shows</button>
          <button onClick={() => setActiveTab('my-tickets')} style={activeTab === 'my-tickets' ? styles.activeTab : styles.tab}>My Wallet</button>
        </div>
        <div style={styles.profileBox}>
          <div style={styles.avatar}>{userName[0]}</div>
          <button onClick={() => { localStorage.clear(); setView('landing'); }} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </nav>

      <main style={styles.main}>
        {activeTab === 'events' ? (
          <div style={styles.dashboardLayout}>
            <div style={styles.sidebar}>
                <h1 style={styles.mainTitle}>Explore<br/>Events</h1>
                <p style={styles.subtitle}>Premium access to the best shows in Nepal.</p>
                <div style={styles.searchContainer}>
                    <input 
                      type="text" 
                      placeholder="Search artist or venue..." 
                      style={styles.inputField} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            <div style={styles.scrollGrid}>
              {/* FIXED FILTER LOGIC BELOW */}
              {events.filter(e => (e.title || "").toLowerCase().includes((searchTerm || "").toLowerCase())).map(event => (
                <div key={event._id} style={styles.eventCard}>
                  <div style={{...styles.cardThumb, backgroundImage: `url(${event.posterUrl})`}}>
                    <div style={styles.cardTag}>{event.genre}</div>
                  </div>
                  <div style={styles.cardInfo}>
                    <h4 style={styles.cardName}>{event.title}</h4>
                    <p style={styles.cardVenue}>📍 {event.venue}</p>
                    <div style={styles.cardBottom}>
                        <span style={styles.priceText}>Rs. {event.currentPrice}</span>
                        <div style={{display: 'flex', gap: '8px'}}>
                           <button onClick={() => setViewingEvent(event)} style={styles.detailsIconBtn}>ℹ️ Details</button>
                           <button onClick={() => setSelectedEvent(event)} style={styles.cardBookBtn}>Book</button>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.walletContainer}>
            <h2 style={{marginBottom: '30px', fontWeight: '800'}}>Digital Ticket Vault</h2>
            <div style={styles.ticketScroll}>
                {myTickets.map(t => (
                  <div key={t._id} style={styles.ticketRow}>
                    <div style={styles.qrBg}><img src={t.qrCode} style={styles.qrSmall} alt="qr" /></div>
                    <div style={{flex: 1, marginLeft: '25px'}}>
                        <h4 style={{margin: 0, fontSize: '1.2rem'}}>{t.event?.title}</h4>
                        <p style={{fontSize: '0.9rem', color: '#94a3b8', marginTop: '5px'}}>📍 {t.event?.venue}</p>
                    </div>
                    <button onClick={() => handleNavigation(t.event?.venue)} style={styles.navActionBtn}>Start Journey 🚗</button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* --- CINEMATIC MODAL --- */}
      {viewingEvent && (
        <div style={styles.modalOverlay} onClick={() => setViewingEvent(null)}>
          <div style={styles.cinematicModal} onClick={e => e.stopPropagation()}>
            <div style={{...styles.modalHero, backgroundImage: `url(${viewingEvent.posterUrl})`}}>
                <div style={styles.heroOverlay}></div>
            </div>
            
            <div style={styles.modalContentSide}>
                <div style={styles.modalHeader}>
                    <span style={styles.genreBadge}>{viewingEvent.genre}</span>
                    <button style={styles.closeBtn} onClick={() => setViewingEvent(null)}>✕</button>
                </div>
                
                <div style={styles.modalBody}>
                    <h2 style={styles.modalTitleText}>{viewingEvent.title}</h2>
                    <p style={styles.modalArtistText}>Featuring: {viewingEvent.artist}</p>
                    <div style={styles.locationTag}>📍 {viewingEvent.venue}</div>
                    
                    <div style={styles.descriptionWrapper}>
                        <p style={styles.descriptionContent}>{viewingEvent.description}</p>
                    </div>
                </div>

                <div style={styles.modalFooter}>
                    <div style={styles.priceContainer}>
                        <span style={styles.priceLabel}>Single Entry</span>
                        <span style={styles.priceVal}>Rs. {viewingEvent.currentPrice}</span>
                    </div>
                    <div style={styles.btnGroup}>
                        <button onClick={() => handleNavigation(viewingEvent.venue)} style={styles.navBtn}>Navigate</button>
                        <button onClick={() => { setSelectedEvent(viewingEvent); setViewingEvent(null); }} style={styles.bookBtn}>Book Tickets</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BOOKING CARD --- */}
      {selectedEvent && (
        <div style={styles.modalOverlay}>
          <div style={styles.bookingCard}>
            <h3 style={{marginBottom: '5px'}}>Secure Booking</h3>
            <p style={{color: '#64748b', fontSize: '0.95rem', marginBottom: '25px'}}>{selectedEvent.title}</p>
            
            <div style={styles.counterBox}>
                <button style={styles.countBtn} onClick={() => setTicketCount(Math.max(1, ticketCount-1))}>-</button>
                <span style={{fontSize: '2rem', fontWeight: '800'}}>{ticketCount}</span>
                <button style={styles.countBtn} onClick={() => setTicketCount(ticketCount+1)}>+</button>
            </div>

            <div style={styles.totalBox}>
                <span>Total Amount:</span>
                <span style={{color: '#10b981'}}>Rs. {selectedEvent.currentPrice * ticketCount}</span>
            </div>

            <button onClick={handleBooking} disabled={isBooking} style={styles.payBtn}>
                {isBooking ? 'Processing...' : 'Pay & Confirm'}
            </button>
            <button onClick={() => setSelectedEvent(null)} style={styles.cancelLink}>Go Back</button>
          </div>
        </div>
      )}

      {/* --- AI CHATBOT UI --- */}
      <div style={styles.botContainer}>
        {showChat && (
          <div style={styles.chatWindow}>
            <div style={styles.chatHead}><span>BeatBot</span><button onClick={() => setShowChat(false)}>✕</button></div>
            <div style={styles.chatList}>
              {messages.map((m, i) => (
                <div key={i} style={m.role === 'bot' ? styles.botMsg : styles.userMsg}>
                  {m.text}
                </div>
              ))}
              {isTyping && <div style={styles.botMsg}>Thinking...</div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChat} style={styles.chatInputRow}>
              <input 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
                placeholder="Ask about events or tickets..." 
                style={styles.chatInput} 
              />
            </form>
          </div>
        )}
        <button onClick={() => setShowChat(!showChat)} style={styles.botTrigger}>💬</button>
      </div>
    </div>
  );
};

// ... Styles remain the same below
const styles = {
  container: { height: '100vh', width: '100vw', backgroundColor: '#020617', color: '#f8fafc', fontFamily: "'Inter', sans-serif", overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  nav: { height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 100 },
  logo: { fontSize: '2rem', fontWeight: '900', letterSpacing: '-1.5px' },
  tabContainer: { display: 'flex', gap: '8px', backgroundColor: '#1e293b', padding: '6px', borderRadius: '16px' },
  tab: { padding: '10px 25px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: '700', borderRadius: '10px' },
  activeTab: { padding: '10px 25px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  profileBox: { display: 'flex', alignItems: 'center', gap: '20px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'grid', placeItems: 'center', fontWeight: 'bold' },
  logoutBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '800' },

  main: { flex: 1, padding: '40px 50px', overflow: 'hidden' },
  dashboardLayout: { height: '100%', display: 'flex', gap: '60px' },
  sidebar: { width: '320px' },
  mainTitle: { fontSize: '3.5rem', fontWeight: '900', lineHeight: 0.9, marginBottom: '20px' },
  subtitle: { color: '#94a3b8', marginBottom: '40px' },
  searchContainer: { width: '100%' },
  inputField: { width: '100%', padding: '18px 25px', borderRadius: '16px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' },

  scrollGrid: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', overflowY: 'auto', paddingRight: '15px' },
  eventCard: { backgroundColor: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' },
  cardThumb: { height: '320px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  cardTag: { position: 'absolute', top: '15px', left: '15px', backgroundColor: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900' },
  cardInfo: { padding: '20px' },
  cardName: { margin: '0 0 5px 0', fontSize: '1.3rem', fontWeight: '700' },
  cardVenue: { fontSize: '0.9rem', color: '#94a3b8', margin: 0 },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' },
  priceText: { color: '#fff', fontSize: '1.2rem', fontWeight: '800' },
  
  detailsIconBtn: { padding: '8px 14px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem' },
  cardBookBtn: { padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },

  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', display: 'grid', placeItems: 'center', zIndex: 1000 },
  cinematicModal: { width: '95%', maxWidth: '1200px', height: '85vh', backgroundColor: '#fff', borderRadius: '40px', display: 'flex', overflow: 'hidden', color: '#0f172a' },
  modalHero: { flex: 1.1, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' },
  modalContentSide: { flex: 1, padding: '60px', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  genreBadge: { color: '#3b82f6', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.9rem' },
  closeBtn: { border: 'none', background: '#f1f5f9', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer' },
  modalBody: { flex: 1 },
  modalTitleText: { fontSize: '4rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: 0.9 },
  modalArtistText: { fontSize: '1.5rem', color: '#64748b', marginBottom: '25px' },
  locationTag: { padding: '12px 20px', fontWeight: 'bold', color: '#3b82f6', backgroundColor: '#eff6ff', borderRadius: '12px', width: 'fit-content' },
  descriptionWrapper: { marginTop: '30px', height: '180px', overflowY: 'auto', paddingRight: '20px' },
  descriptionContent: { color: '#475569', lineHeight: 1.7, fontSize: '1.1rem' },
  modalFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '40px', borderTop: '1px solid #f1f5f9' },
  priceContainer: { display: 'flex', flexDirection: 'column' },
  priceLabel: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' },
  priceVal: { fontSize: '2.5rem', fontWeight: '900', color: '#10b981' },
  btnGroup: { display: 'flex', gap: '15px' },
  bookBtn: { padding: '20px 45px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer' },
  navBtn: { padding: '20px 35px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' },

  bookingCard: { backgroundColor: '#fff', padding: '50px', borderRadius: '32px', width: '420px', textAlign: 'center', color: '#0f172a' },
  counterBox: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', margin: '40px 0' },
  countBtn: { width: '55px', height: '55px', borderRadius: '50%', border: '2px solid #e2e8f0', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' },
  totalBox: { display: 'flex', justifyContent: 'space-between', fontWeight: '900', padding: '25px 0', borderTop: '1px solid #f1f5f9', fontSize: '1.2rem' },
  payBtn: { width: '100%', padding: '20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' },
  cancelLink: { display: 'block', marginTop: '20px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' },

  walletContainer: { maxWidth: '900px', margin: '0 auto', height: '100%' },
  ticketScroll: { height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  ticketRow: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '30px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)' },
  qrBg: { backgroundColor: '#fff', padding: '10px', borderRadius: '12px' },
  qrSmall: { width: '80px' },
  navActionBtn: { padding: '15px 30px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: '900', cursor: 'pointer' },

  botContainer: { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000 },
  botTrigger: { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#3b82f6', fontSize: '2rem', border: 'none', cursor: 'pointer' },
  chatWindow: { position: 'absolute', bottom: '90px', right: '0', width: '350px', height: '500px', backgroundColor: '#fff', borderRadius: '30px', overflow: 'hidden', display: 'flex', flexDirection: 'column', color: '#0f172a' },
  chatHead: { padding: '20px 25px', backgroundColor: '#3b82f6', color: '#fff', fontWeight: '900', display: 'flex', justifyContent: 'space-between' },
  chatList: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  botMsg: { backgroundColor: '#f1f5f9', padding: '12px 18px', borderRadius: '20px 20px 20px 0', fontSize: '0.9rem', alignSelf: 'flex-start' },
  userMsg: { backgroundColor: '#3b82f6', color: '#fff', padding: '12px 18px', borderRadius: '20px 20px 0 20px', fontSize: '0.9rem', alignSelf: 'flex-end' },
  chatInputRow: { padding: '20px', borderTop: '1px solid #f1f5f9' },
  chatInput: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }
};
export default UserHome;