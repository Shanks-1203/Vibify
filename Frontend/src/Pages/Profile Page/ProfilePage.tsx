import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { profileDetails } from '../../Types/types';
import httpClient from '../../httpClient';
import { updateProfileDetails } from '../../Slices/profileDetailsSlice';
import b64toBlob from '../../Functions/base64ToBlob';
import { SlEarphones } from 'react-icons/sl';
import { RxCross2 } from "react-icons/rx";
import { MdOutlineEdit } from "react-icons/md";

const ProfilePage = () => {

    const {userProfileName, profilePic} = useSelector((state:profileDetails)=>state.profileDetails)
    const dispatch = useDispatch();  
    const [edit, setEdit] = useState(false);
    
    const getUserDetails = async() => {
        const token = localStorage.getItem('token');
        const resp = await httpClient.get('/profile',{
          headers: token ? { 'Authorization' : `Bearer ${token}` } : {}
        })
        const { userName, profilePic } = resp.data;
    
        if(!profilePic) {
          dispatch(updateProfileDetails(
            {
              userProfileName:userName,
              profilePic: null
            }
          ))
        }
        
        if(resp.data && profilePic){
          
          const profilePicBlob = b64toBlob(profilePic, 'image/jpeg');
          const imageUrl = URL.createObjectURL(profilePicBlob);
    
            dispatch(updateProfileDetails(
              {
                userProfileName:userName,
                profilePic: imageUrl
              }
            ))
        }
      }  
    
      useEffect(()=>{
        getUserDetails();
      },[userProfileName, getUserDetails])

  return (
    <div className='h-screen w-full p-[2rem]'>
        <div className='flex items-center gap-[2rem]'>
            <div className='w-[10rem] bg-[#E76716] grid place-items-center h-[10rem] rounded-full overflow-hidden cursor-pointer' onClick={()=>setEdit((prev:Boolean)=>!prev)}>
                {profilePic ? <img src={profilePic} alt="Profile Picture" className='w-full h-full rounded-full'/> : <SlEarphones className='text-white text-3xl'/>}
            </div>
            <p className='font-semibold text-xl grid place-items-center text-white'>{userProfileName}</p>
        </div>
        
        { edit &&
            <div className='w-full h-screen fixed top-0 left-0 grid place-items-center bg-opacity-80 backdrop-blur'>
                <div className='flex relative'>
                    <div className='w-[20rem] h-[20rem] bg-white'>
                        {profilePic ? <img src={profilePic} alt="Profile Picture" className='w-full h-full'/> : <SlEarphones className='text-white text-3xl'/>}
                    </div>
                    <div className='w-[2rem] absolute -right-10 h-[20rem] text-white flex flex-col items-center justify-between py-[0.5rem]'>
                        <RxCross2 className='text-xl cursor-pointer' onClick={()=>setEdit((prev:Boolean)=>!prev)}/>
                        <MdOutlineEdit className='text-xl cursor-pointer'/>
                    </div>
                </div>
            </div>
        }
    </div>
  )
}

export default ProfilePage
