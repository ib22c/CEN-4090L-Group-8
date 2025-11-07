import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // loading phase: checking if user exists in db
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true); // start of loading phase

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || `Login failed (${res.status})`);
        return;
      }

      const data = await res.json();
      console.log('Logging in:', data);
      
      // Store user info (in a real app, store auth token)
      localStorage.setItem('username', data.user?.user_name || username);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Redirect to home page
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || 'Network error...');
      console.error('Login error:', err);
    } finally{
      setLoading(false);
      //end loading phase
    }
  };

  return (
    <div className="auth-page">
      <h1 className="title-small">
        🎵 In Tune
      </h1>

      <div className="auth-container">
        <h2>Welcome Back!</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="auth-input"
              autoComplete= "username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="auth-input"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="auth-link">
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')} className="link">
              Sign up
            </span>
          </p>

          <p className="auth-link">
            <span onClick={() => navigate('/')} className="link">
              ← Back to home
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
