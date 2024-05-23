import { configureStore } from '@reduxjs/toolkit';
import musicPlayerReducer from '../Slices/musicPlayerSlice';
import musicQueueReducer from '../Slices/musicQueueSlice';

export const store = configureStore({
  reducer: {
    musicPlayer: musicPlayerReducer,
    musicQueue: musicQueueReducer,
  },
});