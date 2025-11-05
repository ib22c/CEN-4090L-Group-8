import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // collected but not required by backend
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // KEY: relative URL so Vite proxy -> Flask (127.0.0.1:5000)
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send/receive cookies
        body: JSON.stringify({
          username: username.trim(),
          password,
          // email, // include if your backend expects it
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || `Signup failed (${res.status})`);
        return;
        }

      const data = await res.json();
      setSuccessMessage(`Welcome, ${data.user.user_name}! Account created.`);
      // Optional: verify session cookie
      // const me = await fetch("/api/me", { credentials: "include" }).then(r => r.json());
      // console.log("me:", me);

      // Navigate after a short delay
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1 className="title-small">🎵 In Tune</h1>
      <div className="auth-container">
        <h2>Create Your Account</h2>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="auth-input"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (optional)</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="auth-input"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="auth-input"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="auth-input"
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="error-message">❌ {error}</p>}
          {successMessage && <p className="success-message">✅ {successMessage}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="auth-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="link">
              Log in
            </span>
          </p>
          <p className="auth-link">
            <span onClick={() => navigate("/")} className="link">
              ← Back to home
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
