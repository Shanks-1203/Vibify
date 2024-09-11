import { LuHeart } from "react-icons/lu";
import { FaPlay } from 'react-icons/fa';
import { FaHeart } from "react-icons/fa6";

const PlaylistOptions = ({likes, isLiked, playlistPlay, likePlaylist}:{likes?:number, isLiked?:Boolean, playlistPlay:Function, likePlaylist:Function}) => {
  return (
    <div className='flex w-full mt-[2rem] gap-[2rem] text-base'>
      <p className='flex items-center cursor-pointer'>{!isLiked ? <span className='text-2xl mr-3' onClick={()=>likePlaylist()}><LuHeart/></span> : <span className='text-2xl mr-3 text-[#E76716]'><FaHeart/></span>}{likes}</p>
      <p className='w-[3rem] h-[3rem] rounded-full bg-[#E76716] ml-auto cursor-pointer grid place-items-center text-black' onClick={()=>playlistPlay()}><FaPlay/></p>
    </div>
  )
}

export default PlaylistOptions
