import React, { useEffect, useState } from 'react'
import { PiVinylRecord } from "react-icons/pi";
import httpClient from '../../httpClient';
import { useDispatch, useSelector } from 'react-redux';
import { setDuration, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
import durationCalculator from '../../Functions/durationCalculator';
import { CiHeart } from "react-icons/ci";
import fetchSongUrl from '../../Functions/fetchSongUrl';
import { IoMdMore } from "react-icons/io";
import { songsDropDown } from '../../Constants/SongsDropDown';
import { addMusic, addToShuffledQueue } from '../../Slices/musicQueueSlice';
import { QueueState } from '../../Types/types';
import { setSongId, togglePopup } from '../../Slices/saveToPlaylistSlice';


type songType = {
    songId:number
    artistId:number
    songName:String
    ArtistName:String
    duration:number
}

const Songs = () => {

  const [songsList, setSongsList] = useState([]);
  const [dropdown, setDropdown] = useState<number | null>(null);

  const songFetch = async() => {
    const token = localStorage.getItem('token')
    try{
      const resp = await httpClient.get('/home-songs',{
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setSongsList(resp.data);
    } catch(err){
      console.error(err);
    }
  }

  useEffect(()=> {
    songFetch()
  },[])

  const toggleDropDown = (index:number, event:any) => {
    event.stopPropagation();
    setDropdown(dropdown === index ? null : index);
  }

  return (
    <div>
      <div className='text-white text-sm flex justify-between items-center'>
        <p className='opacity-65'>Recently Played</p>
        <span className='text-xs font-normal text-[#E76716] cursor-pointer hover:underline'>View more</span>
      </div>
      <div className='w-full h-[18rem] flex flex-col gap-2 mt-[1rem]'>
        {
          songsList.slice(0,5).map((item, index)=>{
              return(
                <SongTemplate dropdown={dropdown} setDropdown={setDropdown} toggleDropDown={toggleDropDown} key={index} index={index} song={item}/>
              )
          })
        }
      </div>
    </div>
  )
}

const SongTemplate: React.FC<{dropdown:number|null, setDropdown:Function, toggleDropDown:Function, song: songType, index:number}> = ({ dropdown, setDropdown, toggleDropDown, song, index }) => {

  const dispatch = useDispatch();
  const {Queue} = useSelector((state:QueueState)=> state.musicQueue)

  const playSong = async () => {
    
    dispatch(setSongInfo({
      song: {
        id: song.songId,
        name: song.songName,
        artist: song.ArtistName,
        mp3: null
      },
      songLength: song.duration,
    }));

    dispatch(setSongInfo({
      song: {
        id: song.songId,
        name: song.songName,
        artist: song.ArtistName,
        mp3: await fetchSongUrl(song.songId),
      },
      songLength: song.duration,
    }));

    dispatch(setPlay({play:true}));
    dispatch(setMusicSeek({seek:0}));
    dispatch(setDuration({duration:0}));

    sessionStorage.setItem("songId", song?.songId?.toString());
  }

  const addToQueue = (event:any) => {
    event.stopPropagation();
    dispatch(addMusic(song));
    if(Queue.length===0){
      playSong();
    }
    dispatch(addToShuffledQueue(song));
    setDropdown(null)
  }

  const addToPlaylist = () => {
    dispatch(togglePopup());
    dispatch(setSongId(song.songId));
  }

    return (
        <div className='flex items-center gap-[2rem] cursor-pointer py-[0.5rem] w-full text-center text-white hover:bg-gradient-to-r hover:from-[#80808015] hover:via-[#80808060] hover:to-[#80808015]' onClick={playSong}>
            <div className='w-[2.2rem] h-[2.2rem] rounded-lg text-xl grid text-black place-items-center bg-white'>
                <PiVinylRecord />
            </div>
            <p className='font-medium text-left w-[20%] text-xs'>{song.songName}</p>
            <p className='opacity-65 text-xs'>{song.ArtistName}</p>
            <CiHeart className='text-xl ml-auto'/>
            <p className='ml-3 text-xs w-[5%]'>{durationCalculator(song.duration)}</p>
            <div className='p-[0.5rem] relative hover:bg-[#80808040] rounded-full' onClick={(e)=>toggleDropDown(index, e)}>
              <IoMdMore className='text-xl'/>
              { dropdown===index &&
                <div className='absolute w-[10rem] left-[-10rem] top-0 rounded-lg overflow-hidden bg-black'>
                {
                  songsDropDown.map((item, index)=>{
                    return (
                      <p key={index} className='w-full text-xs gap-4 px-[1rem] h-[3rem] flex items-center hover:bg-[#80808040]' onClick={(event) => item.function === 'atq' ? addToQueue(event) : item.function==='stp' && addToPlaylist()}>
                        <item.icon className='text-xl'/>
                        {item.name}
                      </p>
                    )
                  })
                }
              </div>
              }
            </div>
        </div>
    );
};

export default Songs
