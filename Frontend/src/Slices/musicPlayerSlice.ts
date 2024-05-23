import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  song: {
    id: null,
    name: 'Vibify',
    artist: 'Nothing is playing',
    mp3: null,
  },
  miniplayer: 'off',
  songLength: 0,
  play:false,
  musicSeek:0,
  duration:0
};

const musicPlayerSlice = createSlice({
  name: 'musicPlayer',
  initialState,
  reducers: {
    setSongInfo(state, action) {
      state.song = action.payload.song;
      state.songLength = action.payload.songLength;
    },
    setMiniplayer(state,action){
        state.miniplayer = action.payload.miniplayer
    },
    togglePlay(state) {
      state.play = !state.play;
    },
    setPlay(state, action) {
      state.play = action.payload.play;
    },
    setMusicSeek(state, action) {
      state.musicSeek = action.payload.seek;
    },
    setDuration(state, action) {
      state.duration = action.payload.duration;
    }
  },
});

export const { setSongInfo, togglePlay, setMiniplayer, setPlay, setMusicSeek, setDuration } = musicPlayerSlice.actions;
export default musicPlayerSlice.reducer;