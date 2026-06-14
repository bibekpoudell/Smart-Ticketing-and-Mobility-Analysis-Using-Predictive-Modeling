const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  const API_URL = process.env.REACT_APP_API_URL;

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('userInfo', JSON.stringify(data));
      setView('user-home');
    } else {
      alert(data.message || "Invalid credentials");
    }

  } catch (err) {
    alert("Check your backend server.");
  } finally {
    setLoading(false);
  }
};