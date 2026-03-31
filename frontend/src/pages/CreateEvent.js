import React, { useState } from 'react';

const CreateEvent = ({ setView, styles }) => {
  const [formData, setFormData] = useState({
    eventName: '', // Changed from 'title' to 'eventName'
    description: '', artist: '', genre: 'Other',
    date: '', venue: '', totalTickets: '', basePrice: ''
  });
  const [posterFile, setPosterFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPosterFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Create FormData object
    const data = new FormData();
    
    // CRITICAL: Changed 'poster' to 'image' to match backend upload.single('image')
    data.append('image', posterFile); 
    
    // CRITICAL: Changed 'title' to 'eventName' to match backend controller
    data.append('eventName', formData.eventName);
    data.append('description', formData.description);
    data.append('artist', formData.artist);
    data.append('genre', formData.genre);
    data.append('date', formData.date);
    data.append('venue', formData.venue);
    data.append('totalTickets', formData.totalTickets);
    data.append('basePrice', formData.basePrice);
    data.append('currentPrice', formData.basePrice);

    try {
      // 2. Add Authorization Token if your route is protected
      const token = localStorage.getItem('token'); 

      const response = await fetch('http://localhost:5000/api/events/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Pass JWT if 'protect' is used
        },
        body: data, // Browser sets 'multipart/form-data' automatically
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Event Published Successfully!");
        setView('organizer-home');
      } else {
        setError(result.error || result.message || "Failed to create event");
      }
    } catch (err) {
      setError("❌ Server connection failed. Check if Backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.heroContainer, overflowY: 'auto', padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ ...styles.formCard, width: '500px' }}>
          <button onClick={() => setView('organizer-home')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>
            ← Back to Dashboard
          </button>
          
          <h2>Host New Event</h2>

          {error && <p style={{ color: 'red', textAlign: 'center', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '5px', fontSize: '0.9rem' }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Event Poster (Upload Photo)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={styles.input} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Event Name</label>
                <input name="eventName" style={styles.input} onChange={handleChange} placeholder="e.g. Musical Night" required />
              </div>
              <div>
                <label style={labelStyle}>Artist</label>
                <input name="artist" style={styles.input} onChange={handleChange} required />
              </div>
            </div>

            <label style={labelStyle}>Description</label>
            <textarea name="description" style={{ ...styles.input, height: '60px' }} onChange={handleChange} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Genre</label>
                <select name="genre" style={styles.input} onChange={handleChange}>
                  {['Rock', 'Pop', 'EDM', 'Jazz', 'Classical', 'Hip-Hop', 'Other'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input name="date" type="datetime-local" style={styles.input} onChange={handleChange} required />
              </div>
            </div>

            <label style={labelStyle}>Venue</label>
            <input name="venue" placeholder="Venue Name" style={styles.input} onChange={handleChange} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Capacity</label>
                <input name="totalTickets" type="number" placeholder="Total Capacity" style={styles.input} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Base Price (Rs.)</label>
                <input name="basePrice" type="number" placeholder="Price (Rs.)" style={styles.input} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, width: '100%', marginTop: '20px' }}>
              {loading ? 'Processing...' : 'Launch Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const labelStyle = { fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginTop: '10px' };

export default CreateEvent;