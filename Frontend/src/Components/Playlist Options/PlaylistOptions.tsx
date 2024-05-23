import React from 'react'
import { LuHeart } from "react-icons/lu";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { FaPlay } from 'react-icons/fa';


const PlaylistOptions = ({playlistPlay}:{playlistPlay:Function}) => {
  return (
    <div className='flex w-full mt-[2rem] gap-[2rem] text-xs'>
      <p className='flex items-center cursor-pointer'><span className='text-[1.5rem] mr-2'><LuHeart/></span>24.5K</p>
      <p className='flex items-center cursor-pointer'><span className='text-[1.5rem] mr-2'><MdOutlineLibraryAdd/></span>Save to Library</p>
      <p className='w-[2.5rem] h-[2.5rem] rounded-full bg-[#E76716] ml-auto cursor-pointer grid place-items-center text-black' onClick={()=>playlistPlay()}><FaPlay/></p>
    </div>
  )
}

export default PlaylistOptions
