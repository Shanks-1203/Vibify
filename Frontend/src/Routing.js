import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/Home Page/HomePage';
import LoginPage from './Pages/Login Page/LoginPage';
import PlaylistPage from './Pages/Playlist Page/PlaylistPage';
import ArtistPage from './Pages/Artist Page/ArtistPage';
import HomeLayout from './Layouts/HomeLayout';
import LibraryPage from './Pages/Library Page/LibraryPage';
import FavoritesPage from './Pages/Favorites Page/FavoritesPage';
import ExplorePlaylistPage from './Pages/Explore Playlist/ExplorePlaylistPage';
import ExploreArtistPage from './Pages/Explore Artist/ExploreArtistPage';

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
          <Route path='/favorites' element={<FavoritesPage/>}/>
          <Route path='/playlists' element={<ExplorePlaylistPage/>}/>
          <Route path='/artists' element={<ExploreArtistPage/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default Routing;