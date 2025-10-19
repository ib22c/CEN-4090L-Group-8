import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('http://127.0.0.1:5000/v1/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, email, password })
      // });
      
      // For now, simulate successful signup
      console.log('Creating account:', username, email);
      
      // Store user info
      localStorage.setItem('username', username);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Navigate to home page
      navigate('/home');
    } catch (err) {
      setError('Signup failed. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="title-small">
        🎵 In Tune
      </h1>

      <div className="auth-container">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              placeholder="Create a password"
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="auth-input"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-btn">
            Create Account
          </button>

          <p className="auth-link">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="link">
              Log in
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

export default SignupPage;
