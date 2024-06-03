import { songsDropDown } from '../../Constants/SongsDropDown';
import durationCalculator from '../../Functions/durationCalculator';
import { PiVinylRecord } from 'react-icons/pi';
import { Song, musicPlayerState } from '../../Types/types';
import { IoMdMore } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import fetchSongCover from '../../Functions/fetchSongCover';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { CiHeart } from 'react-icons/ci';
import { like, unlike } from '../../Functions/manageLike';

const PlaylistSongs = ({setLikeTrigger, playlistPlay, removeFromPlaylist, addToPlaylist, addToQueue, item, index, dropdown, toggleDropdown}:{setLikeTrigger:Function, playlistPlay:Function, removeFromPlaylist:Function, addToPlaylist:Function, addToQueue:Function, item:Song, index:number, dropdown: number | null, toggleDropdown: Function}) => {

  const {song} = useSelector((state:musicPlayerState) => state.musicPlayer);
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
    <div key={item.songId} className={`hover:bg-[#80808040] w-full px-[1.5rem] flex items-center justify-between h-[4rem] rounded-md text-white cursor-pointer ${song.id === item.songId && 'bg-[#80808040]'}`} onClick={()=>playlistPlay(index)}>
        <div className='flex gap-[1.5rem] items-center w-[50%]'>
            <p className='w-[3rem] h-[3rem] text-[2rem] grid place-items-center rounded-lg overflow-hidden'>
                {songCover ? <img src={songCover} alt="Cover Image" /> :<PiVinylRecord/>}
            </p>
            <p className='w-[35%]'>{item.songName}</p>
            <p className='opacity-65'>{item.ArtistName}</p>
        </div>
        <div className='flex items-center'>
            <p className='text-[1.04rem] ml-auto'>{item.isLiked ? <FaHeart className='text-[#E76716]' onClick={(e)=>unlike(e, item.songId, setLikeTrigger)}/> : <FaRegHeart className='opacity-65' onClick={(e:any)=>like(e, item.songId, setLikeTrigger)}/>}</p>
            <p className='mx-[3rem]'>{durationCalculator(item.duration)}</p>
            <div className='relative'>
            <p className='p-[0.6rem] rounded-full hover:bg-[#80808040]' onClick={(event)=>toggleDropdown(index, event)}><IoMdMore className='text-xl'/></p>
            { dropdown===index &&
                <div className='w-[11rem] rounded-lg absolute left-[-11rem] top-0 bg-black overflow-hidden'>
                {
                    songsDropDown.map((dropdownItem, keyIndex)=>{
                    return (
                        <div key={keyIndex} className='flex w-full h-[3rem] gap-[1rem] items-center px-[1rem] hover:bg-[#80808040]' 
                        onClick={(event) =>
                        {
                        if(dropdownItem.function === 'atq'){
                            addToQueue(index, event);
                        } else if(dropdownItem.function==='stp') {
                            addToPlaylist(index, event);
                        } else if(dropdownItem.function='rfp'){
                            removeFromPlaylist(item.songId, item.PlaylistId, event);
                        }
                        }}>
                        <dropdownItem.icon className='text-xl'/>
                        <p className='text-xs'>{dropdownItem.name}</p>
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
