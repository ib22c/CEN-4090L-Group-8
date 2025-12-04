import { useNavigate } from "react-router-dom"
import { useState } from "react"
import pfp from "./assets/pfp.jpg"
import { albums } from "./constantAlbums.ts"
import StarRating from "./StarRating.tsx"


function ProfilePage() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "User";
    const [profilePic, setProfilePic] = useState<string>(pfp);

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

    const handleLogout = () => {
        try {
            //drop token cookie
            await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (err) {
            console.error("Logout error:", err);
        }

        localStorage.removeItem("username");
        localStorage.removeItem("isLoggedIn");
        navigate("/");
    };

    return (
        <div className="profile">

            <h1 className="title-small">🎵 In Tune</h1>

            <div className="Header">
                <h2 className="title-subpage">Profile Page</h2>
            </div>

            <div className="image-container" style={{ flexDirection: "column", alignItems: "center" }}>
                <img className="pfp" src={profilePic} alt="Profile" />

                <label htmlFor="profilePicInput" className="change-pfp-btn">
                    Change Profile Picture
                </label>

                <input
                    id="profilePicInput"
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            const fileURL = URL.createObjectURL(e.target.files[0]);
                            setProfilePic(fileURL);
                        }
                    }}
                />
            </div>

            <h3 className="welcome">Welcome back {username}!</h3>

            <button className="login-buttons" onClick={handleLogout}>Logout</button>

            {/* FIXED className — no comma */}
            <button className="nav-button login-btn" onClick={() => navigate("/home")}>
                Browse more albums
            </button>

            <div className="profile-page">

                <div className="left-column">
                    <div className="box friend-section">
                        <h3>Your Friends:</h3>
                        <ul>
                            <li>Chris</li>
                            <li>Anna</li>
                            <li>Nick</li>
                        </ul>
                    </div>

                    <div className="box quick-add">
                        <h3>Quick Add</h3>
                        <ul>
                            <li>New possible friend</li>
                            <li>New possible friend2</li>
                            <li>New possible friend3</li>
                        </ul>
                    </div>
                </div>

                <div className="right-column">

                    <div className="music-box">
                        <h3>Your Rated Music</h3>
                        <div className="saved-songs">
                            {albums.map((album) => (
                                <div className="song-list" key={`rated-${album.deezer_id}`}>
                                    <img src={album.cover_url} className="song-picture" alt={album.title} />
                                    <div className="song-info">
                                        <h4>{album.title}</h4>
                                        <p>{album.artist_name}</p>
                                        <StarRating rating={album.rating} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="music-box">
                        <h3>Your saved music</h3>

                        <div className="saved-songs">
                            {albums.map((album) => (
                                <div className="song-list" key={album.deezer_id}>
                                    <img src={album.cover_url} className="song-picture" alt={album.title} />
                                    <div className="song-info">
                                        <h4>{album.title}</h4>
                                        <p>{album.artist_name}</p>
                                        <StarRating rating={album.rating} />
                                    </div>
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
