import { useState } from 'react';
import abbeyRoad from "./assets/abbeyroad.jpeg";
import theStrokes from "./assets/isthisit.png";
import fleetwoodMac from "./assets/fleetwoodmac.png";
import the1975 from "./assets/the1975.jpeg";
import sundays from "./assets/sundays.jpg";
import thesmiths from "./assets/theSmiths.jpg";
import currentsAlbum from "./assets/currentsalbum.jpg";
import './App.css';

type Album = {
  deezer_id: string;
  title: string;
  artist_name: string;
  cover_url: string;
};

//example albums, change later when connected
const albums: Album[] = [
  {
    deezer_id:"1", 
    title: "Abbey Road",
    artist_name: "The Beatles",
    cover_url: abbeyRoad
  },
  {
    deezer_id:"2", 
    title: "The Strokes",
    artist_name: "The Strokes",
    cover_url: theStrokes
  },
  {
    deezer_id:"3", 
    title: "Fleetwood Mac",
    artist_name: "Fleetwood Mac",
    cover_url: fleetwoodMac
  },
  {
    deezer_id:"4", 
    title: "The Queen is Dead",
    artist_name: "The Smiths",
    cover_url: thesmiths
  },
  {
    deezer_id:"5", 
    title: "Being Funny in a Foreign Language",
    artist_name: "The 1975",
    cover_url: the1975
  },
  {
    deezer_id:"6", 
    title: "Static & Silence",
    artist_name: "The Sundays",
    cover_url: sundays
  }
];

function SongCard({ cover_url, title, artist_name }: Album) {
  return (
    <div className="song-card">
      <img src={cover_url} alt={title} />
      <h3>{title}</h3>
      <p>{artist_name}</p>
    </div>
  );
}

function AlbumBrowse() {
  
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"album" | "artist" | "song">("album");

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

export default AlbumBrowse;
