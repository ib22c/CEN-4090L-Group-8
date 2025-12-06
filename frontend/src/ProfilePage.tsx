import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import pfp from "./assets/pfp.jpg";
import { api } from "./utils/api";
import type { Album } from "./utils/api";

const TEST_USERS = [
  { username: "Chris" },
  { username: "Anna" },
  { username: "Nick" },
  { username: "Sarah" },
  { username: "Michael" },
];

function ProfilePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const [profilePic, setProfilePic] = useState<string>(pfp);

  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [userAlbums, setUserAlbums] = useState<Album[]>([]);
  const [ratedAlbums, setRatedAlbums] = useState<Album[]>([]);

  useEffect(() => {
    let users = JSON.parse(localStorage.getItem("allUsers") || "[]");

    if (users.length === 0) {
      users = TEST_USERS;
      localStorage.setItem("allUsers", JSON.stringify(TEST_USERS));
    }

    setAllUsers(users.map((u: any) => u.username));

    const currentFriends = JSON.parse(
      localStorage.getItem(`friends_${username}`) || "[]"
    );
    setFriends(currentFriends);

    api
      .getMyAlbums()
      .then((albums) => setUserAlbums(albums))
      .catch((err) => {
        console.error("Failed to load user albums", err);
      });

    api
      .getRatedAlbums()
      .then((albums) => setRatedAlbums(albums))
      .catch((err) => {
        console.error("Failed to load rated albums", err);
      });
  }, [username]);

  const filteredUsers = allUsers.filter(
    (u) =>
      u.toLowerCase().includes(searchTerm.toLowerCase()) &&
      u !== username &&
      !friends.includes(u)
  );

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFriend = (friend: string) => {
    const updated = [...friends, friend];
    setFriends(updated);
    localStorage.setItem(`friends_${username}`, JSON.stringify(updated));
  };

  const removeFriend = (friend: string) => {
    const updated = friends.filter((f) => f !== friend);
    setFriends(updated);
    localStorage.setItem(`friends_${username}`, JSON.stringify(updated));
  };

  const handleRemoveAlbum = async (albumId: string) => {
    try {
      await api.removeAlbum(albumId);
      setUserAlbums((prev) => prev.filter((a) => a.deezer_id !== albumId));
    } catch (err) {
      console.error("Failed to remove album", err);
    }
  };

  const handleRemoveRating = async (albumId: string) => {
    try {
      await api.removeRating(albumId);
      setRatedAlbums((prev) => prev.filter((a) => a.deezer_id !== albumId));
    } catch (err) {
      console.error("Failed to remove rating", err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Logout failed, status:", res.status);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("username");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "star-filled" : "star-empty"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="profile">
      <h1 className="title-small">🎵 In Tune</h1>

      <div className="Header">
        <h2 className="title-subpage">Profile Page</h2>
      </div>

      <div
        className="image-container"
        style={{ flexDirection: "column", alignItems: "center" }}
      >
        <img className="pfp" src={profilePic} alt="Profile" />

        <label htmlFor="profilePicInput" className="change-pfp-btn">
          Change Profile Picture
        </label>

        <input
          id="profilePicInput"
          type="file"
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleProfilePicChange}
        />
      </div>

      <h3 className="welcome">Welcome back {username}!</h3>

      <button className="login-buttons" onClick={handleLogout}>
        Logout
      </button>

      <button
        className="nav-button login-btn"
        onClick={() => navigate("/home")}
      >
        Browse more albums
      </button>

      <div className="profile-page">
        <div className="left-column">
          <div className="box friend-section">
            <h3>Your Friends:</h3>
            <ul>
              {friends.map((friend) => (
                <li key={friend} className="friend-row">
                  <span>{friend}</span>
                  <button
                    className="friend-remove-btn"
                    onClick={() => removeFriend(friend)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="box quick-add">
            <h3>Search Profiles</h3>
            <input
              type="text"
              className="search-friends"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="quick-add-list">
              {!searchTerm && (
                <li className="search-prompt">Start typing to search users…</li>
              )}

              {searchTerm && filteredUsers.length === 0 && (
                <li className="empty-result">No matches found</li>
              )}

              {searchTerm &&
                filteredUsers.map((u) => (
                  <li key={u} className="quick-add-item">
                    <span>{u}</span>
                    <button
                      className="add-btn"
                      disabled={friends.includes(u)}
                      onClick={() => addFriend(u)}
                    >
                      {friends.includes(u) ? "Friend Added!" : "Add Friend"}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="right-column">
          <div className="music-box">
            <h3>Your Rated Albums</h3>
            <div className="saved-songs">
              {ratedAlbums.length === 0 && (
                <p>
                  You haven&apos;t rated any albums yet. Browse and rate some albums!
                </p>
              )}

              {ratedAlbums.map((album) => (
                <div className="song-list" key={`rated-${album.deezer_id}`}>
                  <img
                    src={album.cover_url}
                    className="song-picture"
                    alt={album.title}
                  />
                  <div className="song-info">
                    <h4>{album.title}</h4>
                    <p>{album.artist_name}</p>
                    {renderStars(album.rating || 0)}
                  </div>
                  <button
                    className="album-remove-btn"
                    onClick={() => handleRemoveRating(album.deezer_id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="music-box">
            <h3>Your Saved Albums</h3>
            <div className="saved-songs">
              {userAlbums.length === 0 && (
                <p>
                  You haven&apos;t saved any albums yet. Browse and click
                  &quot;Add Album&quot;!
                </p>
              )}

              {userAlbums.map((album) => (
                <div className="song-list" key={album.deezer_id}>
                  <img
                    src={album.cover_url}
                    className="song-picture"
                    alt={album.title}
                  />
                  <div className="song-info">
                    <h4>{album.title}</h4>
                    <p>{album.artist_name}</p>
                  </div>
                  <button
                    className="album-remove-btn"
                    onClick={() => handleRemoveAlbum(album.deezer_id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
