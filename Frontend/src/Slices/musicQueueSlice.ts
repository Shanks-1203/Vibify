import { createSlice } from '@reduxjs/toolkit';

const initialState:{Queue:{ArtistName: String, PlaylistId: number, PlaylistName: String, UserName: String, artistId: number, duration: number, songId: number, songName: String}[], playIndex:number} = {
    Queue: [],
    playIndex: 0
};

const musicQueueSlice = createSlice({
    name: 'musicQueue',
    initialState,
    reducers: {
        addMusic: (state, action) => {
            state.Queue.push(action.payload);
        },
        clearQueue: (state) => {
            state.Queue.length = 0;
        },
        setPlayIndex: (state, action) => {
            state.playIndex = action.payload;
        }
    }
})

export const { addMusic, clearQueue, setPlayIndex } = musicQueueSlice.actions;
export default musicQueueSlice.reducer