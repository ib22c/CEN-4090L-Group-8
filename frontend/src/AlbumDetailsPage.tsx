import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './AlbumDetailsPage.css';
import { api } from './utils/api.ts';

interface Track {
  id: string;
  title: string;
  duration: number;
  track_position: number;
}

interface AlbumDetail {
  deezer_id: string;
  title: string;
  artist_name: string;
  artist_id: string;
  cover_url: string;
  release_date: string;
  tracks: Track[];
}

function AlbumDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const album = location.state?.album as AlbumDetail;
  
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlbumAdded, setIsAlbumAdded] = useState(false);

  useEffect(() => {
    if (album) {
      fetchUserRating();
      checkIfAlbumAdded();
    }
  }, [album]);

  const fetchUserRating = async () => {
    try {
      const response = await api.getUserRating(album.deezer_id);
      if (response.rating) {
        setUserRating(response.rating);
      }
    } catch (err) {
      console.error('Error fetching rating:', err);
    }
  };

  const checkIfAlbumAdded = async () => {
    try {
      const albums = await api.getMyAlbums();
      const isAdded = albums.some(a => a.deezer_id === album.deezer_id);
      setIsAlbumAdded(isAdded);
    } catch (err) {
      console.error('Error checking album status:', err);
    }
  };

  if (!album) {
    return (
      <div className="album-details">
        <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
        <p>Album not found</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const [year, month, day] = dateString.split('-');
      if (!year || !month || !day) return dateString;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString || 'Unknown';
    }
  };

  const handleAdd = async () => {
    try {
      await api.getAlbumDetails(album.deezer_id);
      await api.addAlbum(album.deezer_id);
      setIsAlbumAdded(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRatingClick = async (rating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await api.getAlbumDetails(album.deezer_id);
      await api.rateAlbum(album.deezer_id, rating);
      setUserRating(rating);
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="star-rating">
        <p className="rating-label">Rate this album:</p>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`star ${star <= (hoverRating || userRating) ? 'filled' : ''}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingClick(star)}
              disabled={isSubmitting}
            >
              ★
            </button>
          ))}
        </div>
        {userRating > 0 && (
          <p className="rating-text">Your rating: {userRating} stars</p>
        )}
      </div>
    );
  };

  return (
    <div className="album-details">
      <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
      
      <div className="album-header">
        <img src={album.cover_url} alt={album.title} className="album-cover" />
        <div className="album-info">
          <h1>{album.title}</h1>
          <p className="artist-name">{album.artist_name}</p>
          <p className="release-date">Released: {formatReleaseDate(album.release_date)}</p>
          <p className="track-count">{album.tracks.length} tracks</p>
          
          {renderStars()}
          
          <button 
            onClick={handleAdd} 
            disabled={isAlbumAdded}
            className={isAlbumAdded ? 'added' : ''}
          >
            {isAlbumAdded ? '✓ Added' : 'Add Album'}
          </button>
        </div>
      </div>

      <div className="tracklist">
        <h2>Tracks</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {album.tracks.map((track) => (
              <tr key={track.id}>
                <td>{track.track_position}</td>
                <td>{track.title}</td>
                <td>{formatDuration(track.duration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AlbumDetailsPage;
