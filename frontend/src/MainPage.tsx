import { useNavigate } from 'react-router-dom';
import currentsAlbum from "./assets/currentsalbum.jpg";
import './App.css';

function MainPage() {
    const navigate = useNavigate();

    return (
        <div className="main-page">
            <h1 className="title">
                <span className="music-note">🎵</span>
                In Tune
            </h1>

            <div 
                className="color-separation"
                style={{ backgroundImage: `url(${currentsAlbum})` }}
            >
                <h2 className="caption">Discover, Rate, and Share Your Music</h2>
             </div>

            <div className="main-content">
                <p className="tagline">
                    Browse albums, rate your favorites, and see what your friends are listening to.
                </p>

                <div className="cta-buttons">
                    <button className="cta-btn primary" onClick={() => navigate('/login')}>
                        Log In
                    </button>
                    <button className="cta-btn secondary" onClick={() => navigate('/signup')}>
                        Create Account
                    </button>
                </div>

                <div className="features">
                    <div className = "feature-card">
                        <h3>Discover</h3>
                        <p>Search and browse great albums</p>
                    </div>
                    <div className="feature-card">
                        <h3>Rate</h3>
                        <p>Rate and save your favorite music</p>
                    </div>
                    <div className="feature-card">
                        <h3>Connect</h3>
                        <p>See what your friends are listening to</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MainPage;
