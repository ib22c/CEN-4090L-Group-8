import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('http://127.0.0.1:5000/v1/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // });
      
      // For now, simulate successful login
      console.log('Logging in:', username);
      
      // Store user info (in a real app, store auth token)
      localStorage.setItem('username', username);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Navigate to home page
      navigate('/home');
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
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
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-btn">
            Log In
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
