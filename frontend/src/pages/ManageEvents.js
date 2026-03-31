import React, { useState, useEffect } from 'react';

const ManageEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); 

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    venue: '',
    description: '',
    currentPrice: '',
    genre: '',
    image: null
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events/all');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const openEditModal = (event) => {
    setEditId(event._id);
    setFormData({
      title: event.title || '',
      artist: event.artist || '',
      venue: event.venue || '',
      description: event.description || '',
      currentPrice: event.currentPrice || '',
      genre: event.genre || '',
      image: null // Reset image field so we don't accidentally re-upload old binary
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ title: '', artist: '', venue: '', description: '', currentPrice: '', genre: '', image: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('artist', formData.artist);
    data.append('venue', formData.venue);
    data.append('description', formData.description);
    data.append('currentPrice', formData.currentPrice);
    data.append('genre', formData.genre);
    
    // IMPORTANT: 'image' here must match upload.single('image') in backend
    if (formData.image) {
      data.append('image', formData.image);
    }

    const url = editId 
      ? `http://localhost:5000/api/events/update/${editId}` 
      : 'http://localhost:5000/api/events/create';
    
    const method = editId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { 
        method: method, 
        body: data 
      });

      const result = await response.json();

      if (response.ok) {
        alert(editId ? "🎉 Event Updated Successfully!" : "🚀 Event Created Successfully!");
        closeModal();
        fetchEvents(); 
      } else {
        alert(`Error: ${result.message || "Failed to save"}`);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${id}`, { 
            method: 'DELETE' 
        });
        if (response.ok) {
            alert("Event deleted successfully");
            fetchEvents();
        } else {
            alert("Failed to delete event");
        }
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Organizer Dashboard</h1>
        <button onClick={() => setShowModal(true)} style={styles.addBtn}>+ Create Event</button>
      </header>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHead}>
              <th style={{padding: '15px'}}>Poster</th>
              <th>Event Details</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id} style={styles.tableRow}>
                <td>
                  <img 
                    src={event.posterUrl || 'https://via.placeholder.com/50'} 
                    alt="poster" 
                    style={styles.thumbnail} 
                    onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                  />
                </td>
                <td>
                  <div style={{fontWeight: 'bold'}}>{event.title}</div>
                  <div style={{fontSize: '0.8rem', color: '#64748b'}}>{event.artist} • {event.venue}</div>
                </td>
                <td>Rs. {event.currentPrice}</td>
                <td style={styles.actionCell}>
                  <button onClick={() => openEditModal(event)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(event._id)} style={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>{editId ? "✏️ Edit Event" : "📅 Create Event"}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <input type="text" name="title" value={formData.title} placeholder="Title" required onChange={handleInputChange} style={styles.input} />
                <input type="text" name="artist" value={formData.artist} placeholder="Artist" required onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.row}>
                <input type="text" name="venue" value={formData.venue} placeholder="Venue" required onChange={handleInputChange} style={styles.input} />
                <input type="text" name="genre" value={formData.genre} placeholder="Genre" onChange={handleInputChange} style={styles.input} />
              </div>
              <input type="number" name="currentPrice" value={formData.currentPrice} placeholder="Ticket Price (Rs.)" required onChange={handleInputChange} style={styles.input} />
              
              <div style={{backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '8px'}}>
                <label style={{fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '5px'}}>
                   {editId ? "Change Poster (Leave blank to keep current):" : "Upload Poster:"}
                </label>
                <input type="file" onChange={handleFileChange} style={{fontSize: '0.8rem'}} />
              </div>
              
              <textarea name="description" value={formData.description} placeholder="Description" onChange={handleInputChange} style={{...styles.input, height: '80px', resize: 'none'}} />
              
              <div style={styles.modalActions}>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? "Processing..." : (editId ? "Update Event" : "Publish Event")}
                </button>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ... (Styles remain the same as your provided code)
const styles = {
    container: { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' },
    addBtn: { backgroundColor: '#3b82f6', color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    tableCard: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { backgroundColor: '#f1f5f9', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' },
    tableRow: { borderBottom: '1px solid #f1f5f9' },
    thumbnail: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', margin: '10px' },
    actionCell: { display: 'flex', gap: '10px', padding: '15px' },
    editBtn: { backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
    deleteBtn: { backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'grid', placeItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '500px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    row: { display: 'flex', gap: '10px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' },
    modalActions: { display: 'flex', gap: '10px', marginTop: '10px' },
    submitBtn: { flex: 2, padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }
  };

export default ManageEvent;