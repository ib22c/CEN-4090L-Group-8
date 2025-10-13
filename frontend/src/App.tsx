import { useState, useEffect } from 'react';
import { api, type Album } from './utils/api';
import abbeyRoad from "./assets/abbeyroad.jpeg";
import theStrokes from "./assets/isthisit.png";
import fleetwoodMac from "./assets/fleetwoodmac.png";
import the1975 from "./assets/the1975.jpeg";
import sundays from "./assets/sundays.jpg";
import thesmiths from "./assets/theSmiths.jpg";
import './App.css';


// Keep these as fallback if API fails
const fallbackAlbums: Album[] = [
  {
    deezer_id:"1", 
    title: "Abbey Road",
    artist_name: "The Beatles",
    cover_url: abbeyRoad
  },
  {
    deezer_id:"2", 
    title: "Is This It",
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
  const [albums, setAlbums] = useState<Album[]>(fallbackAlbums);
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"album" | "artist" | "song">("album");

  // Fetch albums from API when query changes
  useEffect(() => {
    if (!query.trim()) {
      setAlbums(fallbackAlbums);
      return;
    }

    const fetchAlbums = async () => {
      try {
        const response = await api.searchAlbums(query);
        setAlbums(response.results);
      } catch (error) {
        console.error('Error fetching albums:', error);
        // Keep showing current albums on error
      }
    };

    // Debounce API calls
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
      // if later you add track titles, filter those
      return album.title.toLowerCase().includes(lowerQuery);
    }
    return true;
  });

  return (
    <div className="album-browse">
      <h2 className="welcome">Welcome back, [$user]!</h2>
      <div className="color-separation">
        <h2 className="caption">What are you listening to today?</h2>
      </div>
      <h2 className="browse-title">Browse Albums</h2>

      <div className="search-options">
        <label>
          <input type="radio" value="album" checked={searchBy === "album"} 
          onChange={(e) => setSearchBy(e.target.value as "album")}
          />
          Album
        </label>

        <label>
          <input type="radio" value="artist" checked={searchBy === "artist"} 
          onChange={(e) => setSearchBy(e.target.value as "artist")}
          />
          Artist
        </label>

        <label>
          <input type="radio" value="song" checked={searchBy === "song"} 
          onChange={(e) => setSearchBy(e.target.value as "song")}
          />
          Song
        </label>
      </div>

      <input
        type="text"
        className="search-bar"
        placeholder="Search by album or artist..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="album-grid">
        {filteredAlbums.map((album) => (
          <SongCard key={album.deezer_id} {...album} />
        ))}
      </div>
    </div>
  );
}

export default AlbumBrowse;
