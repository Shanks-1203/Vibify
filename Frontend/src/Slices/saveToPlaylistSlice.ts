import { createSlice } from '@reduxjs/toolkit';

const initialState:{
    popup: Boolean,
    songId: number | null
    createPopup: Boolean
} = {
    popup: false,
    songId: null,
    createPopup: false,
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
        },
        toggleCreatePopup(state){
            state.createPopup = !state.createPopup
        }
    }
})

export const { togglePopup, setSongId, toggleCreatePopup } = saveToPlaylistSlice.actions
export default saveToPlaylistSlice.reducer