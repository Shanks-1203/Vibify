import { PiVinylRecord } from 'react-icons/pi'
import { SimpleSongType } from '../../Types/types'
import durationCalculator from '../../Functions/durationCalculator'
import { FaHeart } from "react-icons/fa6";
import { IoMdMore } from 'react-icons/io';
import { useEffect, useState } from 'react';
import fetchSongCover from '../../Functions/fetchSongCover';

const FavoriteSongsTemplate = ({item}:{item:SimpleSongType}) => {

  const [songCover, setSongCover] = useState<string | null>(null)

  useEffect(()=>{
    const songFetch = async() => {
        setSongCover(null)
        const url = await fetchSongCover(item.songId);
        if(url) setSongCover(url);
    }
    songFetch()
  },[item.songId])

  return (
    <div className='w-full h-[4rem] gap-[1.5rem] px-[1.5rem] hover:bg-[#80808040] rounded-md cursor-pointer flex justify-between items-center'>
        <div className='w-[50%] flex items-center gap-[1.5rem]'>
            <p className='w-[3rem] h-[3rem] text-3xl grid place-items-center rounded-lg text-white overflow-hidden'>{songCover ? <img src={songCover} alt="Cover Image" /> :<PiVinylRecord/>}</p>
            <p className='w-[35%]'>{item.songName}</p>
            <p className='opacity-65'>{item.ArtistName}</p>
        </div>
        <div className='flex items-center'>
            <FaHeart className='text-[1.05rem] text-[#E76716]'/>
            <p className='mx-[3rem]'>{durationCalculator(item.duration)}</p>
            <p className='p-[0.6rem] rounded-full hover:bg-[#80808040]'>
                <IoMdMore className='text-xl'/>
            </p>
        </div>
    </div>
  )
}

export default FavoriteSongsTemplate
