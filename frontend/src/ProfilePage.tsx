import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import pfp from "./assets/pfp.jpg"
import { albums } from "./constantAlbums.ts"
import StarRating from "./StarRating.tsx"

//const users for initial quick add
const TEST_USERS = [
    {username: "Chris"},
    {username: "Anna"},
    {username: "Nick"},
    {username: "Sarah"},
    {username: "Michael"},
];

const friendMusic: Record<string, string[]> = {
    Chris: ["Life Goes On", "Landslide", "See You Again"],
    Anna: ["Slide", "Selfless", "Spellbound"],
    Nick: ["California Dreamin'", "Sympathy"],
    Sarah: ["Black Balloon", "Let Down"],
    Michael: ["Purple", "Sienna"],
};

function ProfilePage() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "User";
    const [profilePic, setProfilePic] = useState<string>(pfp);

    //quick add + friend system ---------
    const [searchTerm, setSearchTerm] = useState("");
    const [allUsers, setAllUsers] = useState<string[]>([]);
    const [friends, setFriends] = useState<string[]>([]);

    //load list of users and friends
    useEffect(() => {
        let users = JSON.parse(localStorage.getItem("allUsers") || "[]");
        
        // If no users exist in localStorage use test ones:
        if (users.length === 0) {
            users = TEST_USERS;
            localStorage.setItem("allUsers", JSON.stringify(TEST_USERS));
        }

        setAllUsers(users.map((u: any) => u.username));

        const currentFriends = JSON.parse(localStorage.getItem(`friends_${username}`) || "[]");
        setFriends(currentFriends);
    }, [username]);

    //filter results (not you or already friends)
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
    //add friend
    const addFriend = (friend: string) => {
        const updated = [...friends, friend];
        setFriends(updated);
        localStorage.setItem(`friends_${username}`, JSON.stringify(updated));
    };

    // remove friend
    const removeFriend = (friend: string) => {
        const updated = friends.filter((f) => f !== friend);
        setFriends(updated);
        localStorage.setItem(`friends_${username}`, JSON.stringify(updated));
    };


    //logout
    const handleLogout = async () => {
    try {
        const res = await fetch("/api/logout", {
            method: "POST",
            credentials: "include",
        });

        if (!res.ok) {
            console.error("Logout failed, status:", res.status);
            // optional: show a toast / alert here
        }
    } catch (err) {
        console.error("Logout error:", err);
    }

    // Clear client-side auth state no matter what
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

            <button className="nav-button login-btn" onClick={() => navigate("/home")}>
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
                            {!searchTerm && <li className="search-prompt">Start typing to search users…</li>}

                            {searchTerm && filteredUsers.length === 0 && (
                            <li className="empty-result">No matches found</li>
                            )}

                            {searchTerm && filteredUsers.map((u) => (
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
