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

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ================= FETCH EVENTS ================= */
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events/all`);
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

  /* ================= OPEN EDIT ================= */
  const openEditModal = (event) => {
    setEditId(event._id);
    setFormData({
      title: event.title || '',
      artist: event.artist || '',
      venue: event.venue || '',
      description: event.description || '',
      currentPrice: event.currentPrice || '',
      genre: event.genre || '',
      image: null
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({
      title: '',
      artist: '',
      venue: '',
      description: '',
      currentPrice: '',
      genre: '',
      image: null
    });
  };

  /* ================= CREATE / UPDATE ================= */
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

    if (formData.image) {
      data.append('image', formData.image);
    }

    const url = editId
      ? `${API_URL}/api/events/update/${editId}`
      : `${API_URL}/api/events/create`;

    const method = editId ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        alert(editId ? "🎉 Event Updated Successfully!" : "🚀 Event Created Successfully!");
        closeModal();
        fetchEvents();
      } else {
        alert(result.message || "Failed to save event");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("❌ Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
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
  };

  /* ================= UI ================= */
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Organizer Dashboard</h1>
        <button onClick={() => setShowModal(true)} style={styles.addBtn}>
          + Create Event
        </button>
      </header>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHead}>
              <th>Poster</th>
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
                  />
                </td>

                <td>
                  <div style={{ fontWeight: 'bold' }}>{event.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {event.artist} • {event.venue}
                  </div>
                </td>

                <td>Rs. {event.currentPrice}</td>

                <td style={styles.actionCell}>
                  <button onClick={() => openEditModal(event)} style={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(event._id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>{editId ? "✏️ Edit Event" : "📅 Create Event"}</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" style={styles.input} required />
                <input name="artist" value={formData.artist} onChange={handleInputChange} placeholder="Artist" style={styles.input} required />
              </div>

              <div style={styles.row}>
                <input name="venue" value={formData.venue} onChange={handleInputChange} placeholder="Venue" style={styles.input} required />
                <input name="genre" value={formData.genre} onChange={handleInputChange} placeholder="Genre" style={styles.input} />
              </div>

              <input name="currentPrice" type="number" value={formData.currentPrice} onChange={handleInputChange} placeholder="Price" style={styles.input} required />

              <input type="file" onChange={handleFileChange} />

              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" style={{ ...styles.input, height: '80px' }} />

              <div style={styles.modalActions}>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? "Processing..." : editId ? "Update" : "Create"}
                </button>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  container: { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  addBtn: { background: '#3b82f6', color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none' },

  tableCard: { background: 'white', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#f1f5f9' },
  tableRow: { borderBottom: '1px solid #eee' },

  thumbnail: { width: '50px', height: '50px', objectFit: 'cover' },

  actionCell: { display: 'flex', gap: '10px' },
  editBtn: { background: '#dbeafe', padding: '6px 12px' },
  deleteBtn: { background: '#fee2e2', padding: '6px 12px' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center' },
  modal: { background: 'white', padding: '30px', borderRadius: '12px', width: '500px' },

  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: { display: 'flex', gap: '10px' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px' },

  modalActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  submitBtn: { background: '#10b981', color: 'white', flex: 2, padding: '12px' },
  cancelBtn: { background: '#94a3b8', color: 'white', flex: 1 }
};

export default ManageEvent;