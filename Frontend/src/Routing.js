import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/Home Page/HomePage';
import LoginPage from './Pages/Login Page/LoginPage';
import PlaylistPage from './Pages/Playlist Page/PlaylistPage';
import ArtistPage from './Pages/Artist Page/ArtistPage';
import HomeLayout from './Layouts/HomeLayout';
import LibraryPage from './Pages/Library Page/LibraryPage';

function Routing() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/playlists/:playlistId" element={<PlaylistPage />} />
          <Route path="/artists/:artistId" element={<ArtistPage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default Routing;