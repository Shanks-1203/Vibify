import { createSlice } from '@reduxjs/toolkit';

const initialState: { userProfileName:String | null, profilePic:string | null, isLoggedIn: boolean } = {
    userProfileName: null,
    profilePic: null,
    isLoggedIn: false
}

const profileDetailsSlice = createSlice({
    name: 'profileDetails',
    initialState,
    reducers: {
        updateProfileDetails(state, action){
            state.userProfileName = action.payload.userProfileName;
            state.profilePic = action.payload.profilePic;
            state.isLoggedIn = action.payload.isLoggedIn;
        }
    }
})

export const {updateProfileDetails} = profileDetailsSlice.actions;
export default profileDetailsSlice.reducer