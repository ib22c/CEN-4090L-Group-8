import { useParams, useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import { albums, type Album } from "./constantAlbums";
import "./App.css";
import { useState } from "react";

function AlbumDetails() 
{
  const { id } = useParams(); 
  const navigate = useNavigate();

  const album: Album | undefined = albums.find(
    (a) => a.album_id.toString() === id );

  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState<number>(album?.rating || 0);

  if (!album) 
    {
    return <div>Album not found.</div>;
  }

  const handleAddComment = () => 
{
    if (newComment.trim() !== "") 
    {
      setComments([...comments, newComment.trim()]);
      setNewComment("");
    }
  };

  const handleStarClick = (rating: number) => 
  {
    setUserRating(rating);
  };

  return (
    <div className="album-details-page">
      <button className="nav-button login-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>{album.title}</h1>
      <h2>{album.artist_name}</h2>

      <div className="album-details-container">
        <div className="album-left">
          <img src={album.cover_url} alt={album.title} className="album-cover" />
          <div className="user-rating">
            <h3>Your Rating:</h3>
            <div className="clickable-stars">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={i < userRating ? "star filled" : "star"}
                  onClick={() => handleStarClick(i + 1)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="album-right">
          <h3>Comments:</h3>
          <ul className="comments-list">
            {comments.length === 0 ? (
              <li>No comments yet.</li>
            ) : (
              comments.map((c, i) => <li key={i}>{c}</li>)
            )}
          </ul>

          <div className="add-comment">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleAddComment}>Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlbumDetails;
