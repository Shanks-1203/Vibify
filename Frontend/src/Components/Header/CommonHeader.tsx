import SearchBar from '../../Components/Search Bar/SearchBar'
import { SlEarphones } from "react-icons/sl";
import { profileCredentials } from '../../Constants/ProfileCredentials';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdLogin } from 'react-icons/md';
import httpClient from '../../httpClient';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileDetails } from '../../Slices/profileDetailsSlice';
import { profileDetails } from '../../Types/types';
import './commonHeader.css'
import b64toBlob from '../../Functions/base64ToBlob';

const CommonHeader = () => {

  const [dropdown, setDropdown] = useState(false);
  const dispatch = useDispatch();  
  const {userProfileName, profilePic} = useSelector((state:profileDetails)=>state.profileDetails)

  const toggleDropdown = () => {
    setDropdown((prev)=>!prev);
  }

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
  },[userProfileName])

  return (
    <div className='w-full flex items-center justify-between'>
        <SearchBar/>
        <div className='flex relative items-center gap-[0.7rem] cursor-pointer' onClick={toggleDropdown}>
          <p className='text-white text-sm'>{userProfileName}</p>
          <div className='w-[2.3rem] p-[1px] profile bg-[#E76716] grid place-items-center h-[2.3rem] rounded-full overflow-hidden'>
            {profilePic ? <img src={profilePic} alt="Profile Picure" className='w-full h-full rounded-full'/> : <SlEarphones className='text-white'/>}
          </div>
            <div className={`absolute w-[9rem] text-black overflow-hidden flex flex-col bg-white right-0 top-[2.5rem] transition-all rounded-lg ${!dropdown ? 'h-0' : 'h-[6rem]'}`}>
                {
                localStorage.getItem('token') ?

                profileCredentials.map((item, index)=>{
                  return (
                    <a href={`/${item.route}`} key={index} onClick={()=>{item.route==='login' && localStorage.clear()}}>
                      <div className='w-full h-[3rem] hover:bg-[#80808040] flex items-center px-[1rem] gap-[0.6rem]'>
                        <item.icon className='text-lg'/>
                        <p className='text-xs'>{item.name}</p>
                      </div>
                    </a>
                  )
                }) :

                <Link to='/login'>
                  <div className='w-full h-[3rem] hover:bg-[#80808040] flex items-center px-[1rem] gap-[0.6rem]'>
                    <MdLogin className='text-lg'/>
                    <p className='text-xs'>Log in</p>
                  </div>
                </Link>

              }
            </div>
        </div>
    </div>
  )
}

export default CommonHeader
