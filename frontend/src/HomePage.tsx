import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './utils/api';
import type { Album } from './utils/api';
import './App.css';

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
  const [albums, setAlbums] = useState<Album[]>([]);
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"album" | "artist" | "song">("album");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has searched
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [navigate]);

  // Fetch random albums on component mount
  useEffect(() => {
    const fetchRandomAlbums = async () => {
      setIsLoading(true);
      try {
        const response = await api.getRandomAlbums(6);
        if (response && response.length > 0) {
          setAlbums(response);
        }
      } catch (error) {
        console.error('Error fetching random albums:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomAlbums();
  }, []); // Empty dependency array - only runs once on mount

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

  // Search functionality - only runs when user actually types something
  useEffect(() => {
    // Don't run on initial mount or when query is empty
    if (!query.trim()) {
      return;
    }

    // Mark that user has searched
    setHasSearched(true);

    const fetchAlbums = async () => {
      try {
        console.log('Searching for:', query);
        const response = await api.searchAlbums(query);
        console.log('API Response:', response);
        
        if (response.results && response.results.length > 0) {
          setAlbums(response.results);
          console.log('Updated albums:', response.results);
        } else {
          console.log('No results found');
          setAlbums([]);
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
        setAlbums([]);
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
          onChange={(e) => {
            const newQuery = e.target.value;
            setQuery(newQuery);
            
            // If user clears the search after having searched, fetch random albums again
            if (!newQuery.trim() && hasSearched) {
              setHasSearched(false);
              const fetchRandomAlbums = async () => {
                try {
                  const response = await api.getRandomAlbums(6);
                  if (response && response.length > 0) {
                    setAlbums(response);
                  }
                } catch (error) {
                  console.error('Error fetching random albums:', error);
                }
              };
              fetchRandomAlbums();
            }
          }}
        />
      </div>

      {isLoading && <div className="loading">Loading...</div>}

      <div className="album-grid">
        {filteredAlbums.map((album) => (
          <SongCard key={album.deezer_id} {...album} onAlbumClick={handleAlbumClick} />
        ))}
      </div>

      {!isLoading && filteredAlbums.length === 0 && (
        <div className="no-results">No albums found</div>
      )}
    </div>
  );
}

export default HomePage
