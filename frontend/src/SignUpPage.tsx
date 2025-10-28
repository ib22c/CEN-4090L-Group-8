import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');      // email is collected but not sent to backend (optional field)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');  // Added state for success message
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // --- Frontend Validation ---
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
      // --- API Call to Flask Backend for Registration ---
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),  // backend expects username and password
        credentials: 'include'  // include cookies in the request/response
      });

      if (!response.ok) {
        // If the server returns an error (e.g., 409 for "username taken")
        const errorData = await response.json();
        // Use error message from server or a generic message
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // --- Handle Successful Signup ---
      const data = await response.json();
      console.log('Signup successful:', data);
      // Show a success message to the user
      setSuccessMessage(`Welcome, ${data.user.user_name}! Account created.`);
      
      // After a short delay, redirect to the login page (so they can log in with new account)
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <h1 className="title-small">🎵 In Tune</h1>
      <div className="auth-container">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSignup} className="auth-form">
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" id="username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username" className="auth-input" 
            />
          </div>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" id="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" className="auth-input" 
            />
          </div>
          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" id="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password" className="auth-input" 
            />
          </div>
          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" id="confirmPassword" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password" className="auth-input" 
            />
          </div>

          {/* Display error or success messages */}
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <button type="submit" className="auth-btn">Create Account</button>

          <p className="auth-link">
            Already have an account?{" "}
            <span onClick={() => navigate('/login')} className="link">Log in</span>
          </p>
          <p className="auth-link">
            <span onClick={() => navigate('/')} className="link">← Back to home</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
