import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import OrganizerHome from './pages/OrganizerHome';
import OrganizerLogin from './pages/OrganizerLogin';

// Import the new Organizer sub-pages
import CreateEvent from './pages/CreateEvent';
import CrowdMonitor from './pages/CrowdMonitor';
import TicketScanner from './pages/TicketScanner';
import ManageEvents from './pages/ManageEvents'; // Assuming you'll create this next

function App() {
  const [view, setView] = useState('landing');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user) {
      if (user.role === 'organizer') setView('organizer-home');
      else if (user.role === 'user') setView('user-home');
    }
  }, []);

  const styles = {
    heroContainer: {
      height: '100vh',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.9)), url("https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex', 
      flexDirection: 'column', 
      color: 'white', 
      fontFamily: "'Inter', sans-serif",
      overflowY: 'auto'
    },
    formCard: { 
      background: 'white', 
      padding: '40px', 
      borderRadius: '15px', 
      width: '380px', 
      color: '#333',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)' 
    },
    input: { 
      width: '100%', 
      padding: '12px', 
      margin: '10px 0', 
      borderRadius: '6px', 
      border: '1px solid #ddd', 
      boxSizing: 'border-box' 
    },
    primaryBtn: { 
      padding: '16px 45px', 
      backgroundColor: '#3b82f6', 
      border: 'none', 
      color: 'white', 
      borderRadius: '8px', 
      fontWeight: 'bold', 
      cursor: 'pointer' 
    }
  };

  return (
    <div className="App">
      {/* 1. INITIAL LANDING */}
      {view === 'landing' && <Landing setView={setView} styles={styles} />}

      {/* 2. USER AUTH & DASHBOARD */}
      {view === 'user-login' && <Login setView={setView} styles={styles} />}
      {view === 'user-signup' && <Register setView={setView} styles={styles} />}
      {view === 'user-home' && <UserHome setView={setView} />}

      {/* 3. ORGANIZER AUTH & MAIN DASHBOARD */}
      {view === 'organizer-login' && <OrganizerLogin setView={setView} styles={styles} />}
      {view === 'organizer-home' && <OrganizerHome setView={setView} styles={styles} />}

      {/* 4. ORGANIZER SUB-PAGES (TRIGGERED FROM DASHBOARD) */}
      {view === 'create-event' && (
        <CreateEvent setView={setView} styles={styles} />
      )}
      
      {view === 'manage-events' && (
        <ManageEvents setView={setView} styles={styles} />
      )}

      {view === 'crowd-monitor' && (
        <CrowdMonitor setView={setView} styles={styles} />
      )}

      {view === 'scanner' && (
        <TicketScanner setView={setView} styles={styles} />
      )}
    </div>
  );
}

export default App;