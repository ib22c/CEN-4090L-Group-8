import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import currentsAlbum from "./assets/currentsalbum.jpg";
import { albums, type Album } from "./constantAlbums"
import './App.css';


function SongCard({ cover_url, title, artist_name }: Album) {
  return (
    <div className="song-card">
      <img src={cover_url} alt={title} />
      <h3>{title}</h3>
      <p>{artist_name}</p>
    </div>
  );
}

function BrowsePage() {
  
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"album" | "artist" | "song">("album");
  const navigate = useNavigate();

  const filteredAlbums = albums.filter((album) => {
    const lowerQuery = query.toLowerCase();
  
    if (searchBy === "album") {
      return album.title.toLowerCase().includes(lowerQuery);
    }
    if (searchBy === "artist") {
      return album.artist_name.toLowerCase().includes(lowerQuery);
    }
    if (searchBy === "song") {
      // if later you add track titles, filter those
      return album.title.toLowerCase().includes(lowerQuery);
    }
    return true;
  });

  return (
    <div className="album-browse">
      <div className="login-buttons">
        <button className="login-btn">Log In</button>
        <button className="login-btn">Create Account</button>

        <button className="profile-btn" onClick={() => navigate("/second")}>Profile</button>
      </div>

      <h1 className="title">
        <span className="music-note">🎵</span>
        In Tune
      </h1>

      <div
        className="color-separation"
        style={{ backgroundImage: `url(${currentsAlbum})` }}
      >
        <h2 className="caption">What are you listening to today?</h2>
      </div>

      <div className="selection-bar">
        {["album", "artist", "song"].map((option) => (
          <button
            key={option}
            className={`selection-btn ${searchBy === option ? "active" : ""}`}
            onClick={() => setSearchBy(option as "album" | "artist" | "song")}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder={`Search by ${searchBy}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="browse-container">
        <button className="browse-btn">
          Browse ▼
        </button>
      </div>

      <div className="album-grid">
        {filteredAlbums.map((album) => (
          <SongCard key={album.deezer_id} {...album} />
        ))}
      </div>
    </div>
  );
}

export default BrowsePage;
