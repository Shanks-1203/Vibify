import React, { useEffect, useState } from 'react'
import { BiSolidPlaylist } from "react-icons/bi";
import httpClient from '../../../httpClient';
import { IoMdMore } from "react-icons/io";
import { Link } from 'react-router-dom';
import { playlistType, saveToPlaylist } from '../../../Types/types';
import { useSelector } from 'react-redux';

const FeaturedPlaylists = () => {

  const [playlistList, setPlaylistList] = useState<playlistType[]>([]);
  const {popup, createPopup} = useSelector((state:saveToPlaylist)=>state.saveToPlaylist)

  const playlistFetch = async() => {
    try{
      const token = localStorage.getItem('token');
      const resp = await httpClient.get('/library-playlists',{
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      setPlaylistList([
        ...resp.data.likedPlaylists,
        ...resp.data.ownPlaylists
      ]);
    } catch(err) {
      console.log(err);
    }
  }
  
  useEffect(()=>{
    playlistFetch();
    //eslint-disable-next-line
  },[createPopup, popup])
  
  return (
    <div>
      <p className='text-white text-md opacity-65'>Your Playlists</p>
      <div className='w-full flex flex-wrap justify-between mt-[1.2rem]'>
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
      <div className='relative w-full gap-[1.5rem] text-white rounded-lg bg-[#80808050] items-center flex cursor-pointer p-5'>
        <div className='w-[3.3rem] rounded-lg h-[3.3rem] bg-white text-black grid place-items-center text-2xl'>
          <BiSolidPlaylist/>
        </div>
        <div className='w-[60%] flex justify-center flex-col'>
          <p className='font-medium h-fit'>{details.playlistName}</p>
          <p className='opacity-65 mt-1 text-sm'>{details.trackCount} Tracks</p>
        </div>
        <div className='p-[0.4rem] rounded-full hover:bg-[#80808099] transition-all absolute right-2'><IoMdMore className='text-3xl'/></div>
      </div>
    </Link>
  )
}

export default FeaturedPlaylists