// src/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { api } from "./utils/api"; // <-- import your helper (adjust path if yours is src/lib/api)

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      // 1) Call Flask to create the session (sets HttpOnly "session" cookie)
      await api.login(username, password);

      // 2) Ask the server who we are (proves cookie is stored & sent)
      const me = await api.me(); // { authenticated: true, user: { id, user_name } }

      // (Optional) keep the greeting working until your UI reads from /api/me on mount
      if (me?.authenticated && me.user?.user_name) {
        localStorage.setItem("username", me.user.user_name);
        localStorage.setItem("isLoggedIn", "true");
      }

      // 3) Go to the app
      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your username and password.");
    }
  }

  return (
    <div className="auth-page">
      <h1 className="title-small">🎵 In Tune</h1>

      <div className="auth-container">
        <h2>Welcome Back!</h2>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="auth-input"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="auth-input"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-btn">Log In</button>

          <p className="auth-link">
            Don&apos;t have an account?{" "}
            <span onClick={() => navigate("/signup")} className="link">
              Sign up
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
