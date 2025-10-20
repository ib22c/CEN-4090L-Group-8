import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './utils/api';
import type { Album } from './utils/api';
import abbeyRoad from "./assets/abbeyroad.jpeg";
import theStrokes from "./assets/isthisit.png";
import fleetwoodMac from "./assets/fleetwoodmac.png";
import the1975 from "./assets/the1975.jpeg";
import sundays from "./assets/sundays.jpg";
import thesmiths from "./assets/theSmiths.jpg";
import './App.css';

// Fallback albums if API fails
const fallbackAlbums: Album[] = [
  {
    deezer_id: "1",
    title: "Abbey Road",
    artist_name: "The Beatles",
    cover_url: abbeyRoad
  },
  {
    deezer_id: "2",
    title: "Is This It",
    artist_name: "The Strokes",
    cover_url: theStrokes
  },
  {
    deezer_id: "3",
    title: "Fleetwood Mac",
    artist_name: "Fleetwood Mac",
    cover_url: fleetwoodMac
  },
  {
    deezer_id: "4",
    title: "The Queen is Dead",
    artist_name: "The Smiths",
    cover_url: thesmiths
  },
  {
    deezer_id: "5",
    title: "Being Funny in a Foreign Language",
    artist_name: "The 1975",
    cover_url: the1975
  },
  {
    deezer_id: "6",
    title: "Static & Silence",
    artist_name: "The Sundays",
    cover_url: sundays
  }
];

function SongCard({ cover_url, title, artist_name, deezer_id, onAlbumClick }: Album & {onAlbumClick: (id: string) => void}) {
  return (
    <div className="song-card" onClick={() => onAlbumClick(deezer_id)} style={{cursor: 'pointer' }}>
      <img src={cover_url} alt={title} />
      <h3>{title}</h3>
      <p>{artist_name}</p>
    </div>
  );
}

function HomePage() {
  const [albums, setAlbums] = useState<Album[]>(fallbackAlbums);
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"album" | "artist" | "song">("album");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const handleAlbumClick = async (albumId: string) => {
    setIsLoading(true);
    try {
      const albumData = await api.getAlbumDetails(albumId);
      navigate(`/album/${albumId}`, { state: { album: albumData } });
    } catch (error) {
      console.error('Error fetching album details:', error);
      alert('Failed to load album details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setAlbums(fallbackAlbums);
      return;
    }

    const fetchAlbums = async () => {
      try {
        console.log('Searching for:', query);
        const response = await api.searchAlbums(query);
        console.log('API Response:', response);
        
        if (response.results && response.results.length > 0) {
          setAlbums(response.results);
          console.log('Updated albums:', response.results);
        } else {
          console.log('No results found, showing fallback albums');
          setAlbums(fallbackAlbums);
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
        setAlbums(fallbackAlbums);
      }
    };

    const timeoutId = setTimeout(fetchAlbums, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const filteredAlbums = albums.filter((album) => {
    const lowerQuery = query.toLowerCase();
  
    if (searchBy === "album") {
      return album.title.toLowerCase().includes(lowerQuery);
    }
    if (searchBy === "artist") {
      return album.artist_name.toLowerCase().includes(lowerQuery);
    }
    if (searchBy === "song") {
      return album.title.toLowerCase().includes(lowerQuery);
    }
    return true;
  });

  return (
    <div className="album-browse">
      <div className="top-nav">
        <h1 className="title-small">
          🎵 In Tune
        </h1>
        <div className="nav-right">
          <span className="username-display">Hello, {username}!</span>
          <button className="login-btn" onClick={() => navigate("/profile")}>Profile</button>
          <button className="login-btn logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="welcome-section">
        <h2 className="welcome-title">Welcome back, {username}!</h2>
        <p className="welcome-subtitle">What are you listening to today?</p>
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

      <div className="album-grid">
        {filteredAlbums.map((album) => (
          <SongCard key={album.deezer_id} {...album} onAlbumClick={handleAlbumClick} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
