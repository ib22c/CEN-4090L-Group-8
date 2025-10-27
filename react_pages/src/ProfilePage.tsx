import { useNavigate } from "react-router-dom"
import pfp from "./assets/pfp.jpg"
import { albums } from "./constantAlbums.ts"
import StarRating from "./StarRating.tsx"


function ProfilePage() {
    const navigate = useNavigate();

    return (
        <div className="profile">
            <h1 className="title-small">
                🎵 In Tune
            </h1>
            <div className="Header">
                <h2 className="title-subpage">Profile Page</h2>
            </div>
            <div className="image-container"> 
                <img className="pfp" src={pfp}></img>
            </div>  
            <div>
                <h3 className="welcome">Welcome back username!</h3>
            </div>

            <button className="login-buttons">Logout</button>

            <button className="nav-button, login-btn" onClick={() =>navigate("/")}>
                Browse more albums
            </button>

            <div className="profile-page">
                <div className="left-saved">
                    <div className="box">
                        <h2>Top hits today:</h2>
                        <ul>
                            <li>Top hit 1</li>
                            <li>hit 2</li>
                            <li>hit 3</li>
                        </ul>
                    </div>
                    <div className="box"> 
                        <h2>What your friends are listening to:</h2>
                            <li>Music</li>
                            <li>More music</li>
                            <li>more music</li>
                    </div>
                </div>

                <div className="saved">
                    <h3>Your saved music</h3>
                    
                    <div className="saved-songs">
                        {albums.map((album) => (
                            <div className="song-list" key={album.album_id}>
                            <img src={album.cover_url} className="song-picture"></img>
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
    );
}

export default ProfilePage;