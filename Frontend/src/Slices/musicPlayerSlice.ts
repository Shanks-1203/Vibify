import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  song: {
    id: null,
    name: 'Vibify',
    artist: 'Nothing is playing',
    lyrics: 'Lyrics Not Available',
    urls: {
      mp3:null,
      cover: null
    },
  },
  isLiked: false,
  miniplayer: 'off',
  songLength: 0,
  play:false,
  musicSeek:0,
  duration:0,
  shuffle: false,
  repeat: 'off',
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
    },
    toggleShuffle(state) {
      state.shuffle = !state.shuffle;
    },
    setRepeat(state, action) {
      state.repeat = action.payload.repeat;
    },
    setLiked(state, action){
      state.isLiked = action.payload;
    }
  },
});

export const { setSongInfo, togglePlay, setMiniplayer, setPlay, setMusicSeek, setDuration,setRepeat, toggleShuffle, setLiked } = musicPlayerSlice.actions;
export default musicPlayerSlice.reducer;