import { useLocation, useNavigate } from 'react-router-dom';
import './AlbumDetailsPage.css';

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
  console.log('Album data received:', album);
  console.log('Release date value:', album?.release_date);
  console.log('Release date type:', typeof album?.release_date);


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
