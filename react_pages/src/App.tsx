import { Routes, Route } from "react-router-dom";
import BrowsePage from "./BrowsePage";
import ProfilePage from "./ProfilePage";
import AlbumDetails from "./AlbumDetails";


function App() {
    return (
        <Routes>
            <Route path="/" element={<BrowsePage />}/>
            <Route path="/second" element={<ProfilePage />} />
            <Route path="/album/:id" element={<AlbumDetails />} />
        </Routes>
    );
}

export default App;