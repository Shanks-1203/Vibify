import { songsDropDown } from '../../Constants/SongsDropDown';
import durationCalculator from '../../Functions/durationCalculator';
import { PiVinylRecord } from 'react-icons/pi';
import { SimpleSongType, musicPlayerState, playlistDetails } from '../../Types/types';
import { IoMdMore } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import fetchSongCover from '../../Functions/fetchSongCover';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { like, unlike } from '../../Functions/manageLike';
import { setLiked } from '../../Slices/musicPlayerSlice';

const PlaylistSongs = ({playlistDetails, setLikeTrigger, playlistPlay, removeFromPlaylist, addToPlaylist, addToQueue, item, index, dropdown, toggleDropdown}:{playlistDetails?:playlistDetails, setLikeTrigger:Function, playlistPlay:Function, removeFromPlaylist:Function, addToPlaylist:Function, addToQueue:Function, item:SimpleSongType, index:number, dropdown: number | null, toggleDropdown: Function}) => {

  const {song, isLiked} = useSelector((state:musicPlayerState) => state.musicPlayer);
  const [songCover, setSongCover] = useState<string | null>(null)
  const dispatch = useDispatch();

  useEffect(()=>{
    const songFetch = async() => {
        setSongCover(null)
        const url = await fetchSongCover(item.songId);
        if(url) setSongCover(url);
    }
    songFetch()
  },[item.songId])

  const handleLike = (e:any, songId:string) => {
    like(e, songId, setLikeTrigger);
    if(song.id===songId){
        dispatch(setLiked(!isLiked));
    }
  }

  const handleUnlike = (e:any, songId:string) => {
    unlike(e, songId, setLikeTrigger);
    if(song.id===songId){
        dispatch(setLiked(!isLiked));
    }
  }
  
  return (
    <div key={item.songId} className={`hover:bg-[#80808040] w-full px-[1.5rem] flex items-center justify-between py-3 rounded-md text-white cursor-pointer ${song.id === item.songId && 'bg-[#80808040]'}`} onClick={()=>playlistPlay(index)}>
        <div className='flex gap-[1.5rem] items-center w-[50%]'>
            <p className='w-[3.5rem] h-[3.5rem] text-[2rem] grid place-items-center rounded-lg overflow-hidden'>
                {songCover ? <img src={songCover} alt="cover" /> :<PiVinylRecord/>}
            </p>
            <p className='w-[40%] text-base font-medium'>{item.songName}</p>
            <p className='opacity-65 text-sm'>{item.artistName}</p>
        </div>
        <div className='flex items-center ml-auto w-[15%] justify-between'>
            <p className='text-[1.4rem]'>{item.isLiked ? <FaHeart className='text-[#E76716]' onClick={(e)=>handleUnlike(e, item.songId)}/> : <FaRegHeart className='opacity-65' onClick={(e:any)=>handleLike(e, item.songId)}/>}</p>
            <p>{durationCalculator(item.duration)}</p>
            <div className='relative'>
            <p className='p-[0.6rem] rounded-full hover:bg-[#80808040]' onClick={(event)=>toggleDropdown(index, event)}><IoMdMore className='text-[1.7rem]'/></p>
            { dropdown===index &&
                <div className='w-[13rem] z-10 rounded-lg absolute left-[-13rem] top-0 bg-black overflow-hidden border-2 border-[#80808080]'>
                {
                    songsDropDown.map((dropdownItem, keyIndex)=>{
                    return (
                        <div key={keyIndex} className='flex w-full h-[4rem] gap-[1rem] items-center px-[1rem] hover:bg-[#80808040]' 
                        onClick={(event) =>
                        {
                        if(dropdownItem.function === 'atq'){
                            addToQueue(index, event);
                        } else if(dropdownItem.function==='stp') {
                            addToPlaylist(index, event);
                        } else if(dropdownItem.function==='rfp'){
                            removeFromPlaylist(item.songId, playlistDetails?.playlistId, event);
                        }
                        }}>
                        <dropdownItem.icon className='text-2xl'/>
                        <p className='text-sm'>{dropdownItem.name}</p>
                        </div>
                    )
                })
            }
            </div>
            }
        </div>

        </div>
    </div>
  )
}

export default PlaylistSongs
