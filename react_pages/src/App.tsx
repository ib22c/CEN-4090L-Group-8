import { Routes, Route } from "react-router-dom";
import BrowsePage from "./BrowsePage";
import ProfilePage from "./ProfilePage";


function App() {
    return (
        <Routes>
            <Route path="/" element={<BrowsePage />}/>
            <Route path="/second" element={<ProfilePage />} />
        </Routes>
    );
}

export default App;