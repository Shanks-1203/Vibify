import { LuHeart } from "react-icons/lu";
import { FaPlay } from 'react-icons/fa';


const PlaylistOptions = ({likes, playlistPlay}:{likes:number, playlistPlay:Function}) => {
  return (
    <div className='flex w-full mt-[2rem] gap-[2rem] text-xs'>
      <p className='flex items-center cursor-pointer'><span className='text-[1.5rem] mr-2'><LuHeart/></span>{likes}</p>
      <p className='w-[2.5rem] h-[2.5rem] rounded-full bg-[#E76716] ml-auto cursor-pointer grid place-items-center text-black' onClick={()=>playlistPlay()}><FaPlay/></p>
    </div>
  )
}

export default PlaylistOptions
