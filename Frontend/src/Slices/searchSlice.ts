import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    keyword: '',
    search: false
}

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearch(state, action){
            state.keyword = action.payload
        },
        searchAction(state){
            state.search = !state.search
        }
    }
})

export const {setSearch, searchAction} = searchSlice.actions
export default searchSlice.reducer