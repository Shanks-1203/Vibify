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

const CommonHeader = () => {

  const [dropdown, setDropdown] = useState(false);
  const dispatch = useDispatch();
  const {userProfileName, profilePic, isLoggedIn} = useSelector((state:profileDetails)=>state.profileDetails)
  const token = localStorage.getItem('token');

  const toggleDropdown = () => {
    setDropdown((prev)=>!prev);
  }

  const getUserDetails = async() => {
    const resp = await httpClient.get('/profile',{
      headers: token ? { 'Authorization' : `Bearer ${token}` } : {}
    })
    const { userName, profileUrl, isLoggedIn } = resp.data;

    if(!profileUrl) {
      dispatch(updateProfileDetails(
        {
          userProfileName:userName,
          profilePic: null,
          isLoggedIn: isLoggedIn
        }
      ))
    }
    
    if(resp.data && profileUrl){

        dispatch(updateProfileDetails(
          {
            userProfileName:userName,
            profilePic: profileUrl,
            isLoggedIn: isLoggedIn
          }
        ))
    }
  }  

  useEffect(()=>{
    getUserDetails();
    //eslint-disable-next-line
  },[])

  return (
    <div className='w-full h-[3rem] flex items-center justify-between'>
        <SearchBar/>
        <div className='flex relative items-center gap-[0.7rem] cursor-pointer' onClick={toggleDropdown}>
          <p className='text-white text-md'>{userProfileName}</p>
          <div className='w-[3rem] p-[1px] profile bg-[#E76716] grid place-items-center h-[3rem] rounded-full overflow-hidden'>
            {profilePic ? <img src={profilePic} alt="Profile Picure" className='w-full h-full rounded-full'/> : <SlEarphones className='text-white'/>}
          </div>
            <div className={`absolute w-[10rem] text-black overflow-hidden flex flex-col bg-white right-0 top-[3rem] transition-all rounded-lg ${!dropdown ? 'h-0' : isLoggedIn ? 'h-[8rem]' : 'h-[4rem]'}`}>
              {
                isLoggedIn ?

                profileCredentials.map((item, index)=>{
                  return (
                    <Link to={`/${item.route}`} key={index} onClick={()=>{item.route==='login' && localStorage.clear()}}>
                      <div className='w-full h-[4rem] hover:bg-[#80808040] flex items-center px-[1rem] gap-[0.6rem]'>
                        <item.icon className='text-[1.2rem]'/>
                        <p className='text-sm'>{item.name}</p>
                      </div>
                    </Link>
                  )
                }) :

                <Link to='/login'>
                  <div className='w-full h-[4rem] hover:bg-[#80808040] flex items-center px-[1rem] gap-[0.6rem]'>
                    <MdLogin className='text-lg'/>
                    <p className='text-sm'>Log in</p>
                  </div>
                </Link>
              }
            </div>
        </div>
    </div>
  )
}

export default CommonHeader
