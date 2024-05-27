import { createSlice } from '@reduxjs/toolkit';
import { Song } from '../Types/types';

const initialState:{Queue:Song[], shuffledQueue:Song[], playIndex:number} = {
    Queue: [],
    shuffledQueue: [],
    playIndex: 0
};

const musicQueueSlice = createSlice({
    name: 'musicQueue',
    initialState,
    reducers: {
        addMusic(state, action) {
            state.Queue.push(action.payload);
        },
        clearQueue(state) {
            state.Queue.length = 0;
        },
        setPlayIndex(state, action) {
            state.playIndex = action.payload;
        },
        addToShuffledQueue(state, action) {
            state.shuffledQueue.push(action.payload);
        },
        clearShuffledQueue(state) {
            state.shuffledQueue.length = 0;
        },
    }
})

export const { addMusic, clearQueue, setPlayIndex, clearShuffledQueue, addToShuffledQueue } = musicQueueSlice.actions;
export default musicQueueSlice.reducer