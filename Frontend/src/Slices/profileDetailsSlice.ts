import { createSlice } from '@reduxjs/toolkit';

const initialState: { userProfileName:String | null, profilePic:string | null } = {
    userProfileName: null,
    profilePic: null,
}

const profileDetailsSlice = createSlice({
    name: 'profileDetails',
    initialState,
    reducers: {
        updateProfileDetails(state, action){
            state.userProfileName = action.payload.userProfileName;
            state.profilePic = action.payload.profilePic;
        }
    }
})

export const {updateProfileDetails} = profileDetailsSlice.actions;
export default profileDetailsSlice.reducer