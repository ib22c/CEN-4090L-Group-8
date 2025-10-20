import { Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";
import AlbumDetailsPage from "./AlbumDetailsPage";
import './App.css';


function App() {
    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/home" element={<HomePage />}/>
            <Route path="/album/:albumId" element={<AlbumDetailsPage />}/>
            <Route path="/profile" element={<ProfilePage />} />
        </Routes>
    );
}

export default App;
