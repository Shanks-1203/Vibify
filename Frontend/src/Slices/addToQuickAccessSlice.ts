import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    pins: [],
    popup: false
}

const addToQuickAccessSlice = createSlice({
    name: 'addToQuickAccess',
    initialState,
    reducers: {
        togglePopup(state){
            state.popup = !state.popup
        },
        setPins(state, action){
            state.pins = action.payload
        }
    }
})

export const { togglePopup, setPins } = addToQuickAccessSlice.actions
export default addToQuickAccessSlice.reducer
