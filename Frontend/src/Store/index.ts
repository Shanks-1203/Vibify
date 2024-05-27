import { configureStore } from '@reduxjs/toolkit';
import musicPlayerReducer from '../Slices/musicPlayerSlice';
import musicQueueReducer from '../Slices/musicQueueSlice';
import saveToPlaylistSlice from '../Slices/saveToPlaylistSlice';

export const store = configureStore({
  reducer: {
    musicPlayer: musicPlayerReducer,
    musicQueue: musicQueueReducer,
    saveToPlaylist: saveToPlaylistSlice
  },
});