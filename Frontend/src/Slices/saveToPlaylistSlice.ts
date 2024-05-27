import { createSlice } from '@reduxjs/toolkit';

const initialState:{
    popup: Boolean,
    songId: number | null
} = {
    popup: false,
    songId: null
}

const saveToPlaylistSlice = createSlice ({
    name: 'saveToPlaylist',
    initialState,
    reducers: {
        togglePopup(state){
            state.popup = !state.popup
        },
        setSongId(state, action){
            state.songId = action.payload
        }
    }
})

export const { togglePopup, setSongId } = saveToPlaylistSlice.actions
export default saveToPlaylistSlice.reducer