import { PiVinylRecord } from 'react-icons/pi'
import { QueueState, SimpleSongType, musicPlayerState } from '../../Types/types'
import durationCalculator from '../../Functions/durationCalculator'
import { FaHeart } from "react-icons/fa6";
import { IoMdMore } from 'react-icons/io';
import { useEffect, useState } from 'react';
import fetchSongCover from '../../Functions/fetchSongCover';
import { useDispatch, useSelector } from 'react-redux';
import { songsDropDown } from '../../Constants/SongsDropDown';
import { setSongId, togglePopup } from '../../Slices/saveToPlaylistSlice';
import { addMusic, addToShuffledQueue } from '../../Slices/musicQueueSlice';

const FavoriteSongsTemplate = ({item, playlistPlay, index, dropdown, setDropdown, playSong, toggleDropDown}:{item:SimpleSongType, playlistPlay:Function, index:number, dropdown:number | null, setDropdown:Function, playSong:Function, toggleDropDown:Function}) => {

  const [songCover, setSongCover] = useState<string | null>(null)
  const {song} = useSelector((state:musicPlayerState) => state.musicPlayer);
  const {Queue} = useSelector((state:QueueState)=> state.musicQueue)
  const dispatch = useDispatch();


  useEffect(()=>{
    const songFetch = async() => {
        setSongCover(null)
        const url = await fetchSongCover(item.songId);
        if(url) setSongCover(url);
    }
    songFetch()
  },[item.songId])

  const addToQueue = (event:any) => {
    event.stopPropagation();
    dispatch(addMusic(item));
    if(Queue.length===0){
      playSong(item);
    }
    dispatch(addToShuffledQueue(item));
    setDropdown(null)
  }

  const addToPlaylist = () => {
    dispatch(togglePopup());
    dispatch(setSongId(item.songId));
  }

  return (
    <div className={`w-full py-3 gap-[1.5rem] px-[1.5rem] hover:bg-[#80808040] rounded-md cursor-pointer flex justify-between items-center ${song.id === item.songId && 'bg-[#80808040]'}`} onClick={()=>playlistPlay(index)}>
        <div className='w-[50%] flex items-center gap-[1.5rem]'>
            <p className='w-[3.5rem] h-[3.5rem] text-3xl grid place-items-center rounded-lg text-white overflow-hidden'>{songCover ? <img src={songCover} alt="Song cover" /> :<PiVinylRecord/>}</p>
            <p className='w-[35%] font-medium'>{item.songName}</p>
            <p className='opacity-65'>{item.artistName}</p>
        </div>
        <div className='flex items-center'>
            <FaHeart className='text-[1.3rem] text-[#E76716]'/>
            <p className='mx-[3rem]'>{durationCalculator(item.duration)}</p>
            <div className='p-[0.6rem] relative rounded-full hover:bg-[#80808040]' onClick={(e)=>toggleDropDown(index, e)}>
                <IoMdMore className='text-2xl'/>
                { dropdown===index &&
                  <div className='absolute w-[12rem] left-[-12rem] border-2 border-[#80808080] top-0 rounded-lg overflow-hidden z-10 bg-black'>
                    {
                      songsDropDown.map((item, index)=>{
                        if(index<3){
                          return (
                            <p key={index} className='w-full gap-4 px-[1rem] h-[4rem] flex items-center hover:bg-[#80808040]' onClick={(event) => item.function === 'atq' ? addToQueue(event) : item.function==='stp' && addToPlaylist()}>
                              <item.icon className='text-xl'/>
                              {item.name}
                            </p>
                          )
                        }
                        return null
                      })
                    }
                  </div>
              }
            </div>
        </div>
    </div>
  )
}

export default FavoriteSongsTemplate
