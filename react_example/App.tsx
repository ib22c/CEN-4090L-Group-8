import { useState } from 'react'
import './App.css'
import song1Cover from "./assets/abbeyroad.jpeg"
import song2Cover from "./assets/fleetwoodmac.png"
import song3Cover from "./assets/isthisit.png"


type Song = {
  cover: string;
  title: string;
  artist: string;
};

function SongCard({ cover, title, artist }: Song) {
  return (
    <div className="song-card">
      <img src={cover} alt={title} />
      <h3>{title}</h3>
      <p>{artist}</p>
    </div>
  );
}

function LoginBox() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in:", username, password);
  };

  return (
    <form className="login-box" onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Log In</button>
    </form>
  );
}

function App() {
  const songs: Song[] = [
    { cover: song1Cover, title: "Abbey Road", artist: "The Beatles" },
    { cover: song2Cover, title: "Fleetwood Mac", artist: "Fleetwood Mac" },
    { cover: song3Cover, title: "Is This It?", artist: "The Strokes" },
  ];
  return (
    <div className="container">
      <h1 className="header">🎵 In Tune</h1>
      <p className="slogan">Stay in tune with your friends favorite songs!</p>
      <div className="song-section">
        {songs.map((song, i) => (
          <SongCard key={i} {...song} />
        ))}
      </div>
      <LoginBox />
    </div>
  );
}

export default App;
