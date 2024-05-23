import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/Home Page/HomePage';
import LoginPage from './Pages/Login Page/LoginPage';
import PlaylistPage from './Pages/Playlist Page/PlaylistPage';
import ArtistPage from './Pages/Artist Page/ArtistPage';
import HomeLayout from './Layouts/HomeLayout';

function Routing() {
  return (
    <Router>
      <HomeLayout>
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/about" element={<LoginPage/>} />
          <Route path="/playlists/:playlistId" element={<PlaylistPage/>} />
          <Route path="/artists/:artistId" element={<ArtistPage/>} />
        </Routes>
      </HomeLayout>
    </Router>
  );
}

export default Routing;