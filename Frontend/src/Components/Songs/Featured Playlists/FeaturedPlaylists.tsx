import React, { useEffect, useState } from 'react'
import { BiSolidPlaylist } from "react-icons/bi";
import httpClient from '../../../httpClient';
import { IoMdMore } from "react-icons/io";
import { Link } from 'react-router-dom';
import { playlistType } from '../../../Types/types';

const FeaturedPlaylists = () => {

  const [playlistList, setPlaylistList] = useState([]);

  const playlistFetch = async() => {
    try{
      const token = localStorage.getItem('token');
      const resp = await httpClient.get('/home-playlists',{
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setPlaylistList(resp.data);
    } catch(err) {
      console.log(err);
    }
  }
  
  useEffect(()=>{
    playlistFetch();
  },[])
  
  return (
    <div>
      <p className='text-white text-sm opacity-65'>Your Playlists</p>
      <div className='w-full flex flex-wrap justify-between mt-[1rem]'>
        {
          playlistList.map((item, index)=>{
            return(
              <PlaylistTemplate key={index} details={item}/>
            )
          })
        }
      </div>
    </div>
  )
}

const PlaylistTemplate : React.FC<{details: playlistType}> = ({details}) => {

  return(
    <Link to={`/playlists/${details.playlistId}`} key={details.playlistId} className='w-[48%] mb-4'>
      <div className='relative w-full gap-[1.5rem] text-white rounded-lg bg-[#80808050] items-center flex cursor-pointer p-4'>
        <div className='w-[3rem] rounded-lg h-[3rem] bg-white text-black grid place-items-center text-2xl'>
          <BiSolidPlaylist/>
        </div>
        <div className='w-[60%] flex justify-center flex-col'>
          <p className='font-medium text-sm h-fit'>{details.playlistName}</p>
          <p className='opacity-65 mt-2 text-xs'>{details.trackcount} Tracks</p>
        </div>
        <div className='p-[0.4rem] rounded-full hover:bg-[#80808099] transition-all absolute right-2'><IoMdMore className='text-2xl'/></div>
      </div>
    </Link>
  )
}

export default FeaturedPlaylists