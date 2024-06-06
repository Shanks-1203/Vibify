import React, { useEffect, useState } from 'react'
import { PiVinylRecord } from "react-icons/pi";
import httpClient from '../../httpClient';
import { useDispatch, useSelector } from 'react-redux';
import { setDuration, setLiked, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
import durationCalculator from '../../Functions/durationCalculator';
import fetchSongUrl from '../../Functions/fetchSongUrl';
import { IoMdMore } from "react-icons/io";
import { songsDropDown } from '../../Constants/SongsDropDown';
import { addMusic, addToShuffledQueue } from '../../Slices/musicQueueSlice';
import { QueueState, SimpleSongType, musicPlayerState } from '../../Types/types';
import { setSongId, togglePopup } from '../../Slices/saveToPlaylistSlice';
import fetchSongCover from '../../Functions/fetchSongCover';
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { like, unlike } from '../../Functions/manageLike';

const Songs = () => {

  const [songsList, setSongsList] = useState([]);
  const [dropdown, setDropdown] = useState<number | null>(null);
  const [likeTrigger, setLikeTrigger] = useState(false);
  const { isLiked } = useSelector((state:musicPlayerState) => state.musicPlayer);

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
  },[likeTrigger, isLiked])

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
          songsList.slice(3,8).map((item, index)=>{
              return(
                <SongTemplate setLikeTrigger={setLikeTrigger} dropdown={dropdown} setDropdown={setDropdown} toggleDropDown={toggleDropDown} key={index} index={index} item={item}/>
              )
          })
        }
      </div>
    </div>
  )
}

const SongTemplate: React.FC<{dropdown:number|null, setDropdown:Function, toggleDropDown:Function, item: SimpleSongType, index:number, setLikeTrigger:Function}> = ({ setLikeTrigger, dropdown, setDropdown, toggleDropDown, item, index }) => {

  const dispatch = useDispatch();
  const {Queue} = useSelector((state:QueueState)=> state.musicQueue)
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const {song, isLiked} = useSelector((state:musicPlayerState) => state.musicPlayer);

  useEffect(()=>{
    const songFetch = async() => {
      setCoverUrl(null)
      const url = await fetchSongCover(item.songId);
      if(url) setCoverUrl(url);
    }
    songFetch()
  },[item.songId])

  const playSong = async () => {
    
    dispatch(setSongInfo({
      song: {
        id: item.songId,
        name: item.songName,
        artist: item.ArtistName,
        lyrics: item.lyrics,
        urls: {
          mp3:null,
          cover: null
        },
      },
      songLength: item.duration,
    }));

    dispatch(setSongInfo({
      song: {
        id: item.songId,
        name: item.songName,
        artist: item.ArtistName,
        lyrics: item.lyrics,
        urls: await fetchSongUrl(item.songId),
      },
      songLength: item.duration,
    }));

    dispatch(setLiked(item.isLiked))
    dispatch(setPlay({play:true}));
    dispatch(setMusicSeek({seek:0}));
    dispatch(setDuration({duration:0}));

    sessionStorage.setItem("songId", item?.songId?.toString());
  }

  const addToQueue = (event:any) => {
    event.stopPropagation();
    dispatch(addMusic(item));
    if(Queue.length===0){
      playSong();
    }
    dispatch(addToShuffledQueue(item));
    setDropdown(null)
  }

  const addToPlaylist = () => {
    dispatch(togglePopup());
    dispatch(setSongId(item.songId));
  }

  const handleLike = (e:any, songId:number) => {
    like(e, songId, setLikeTrigger);
    if(song.id===songId){
        dispatch(setLiked(!isLiked));
    }
  }

  const handleUnlike = (e:any, songId:number) => {
    unlike(e, songId, setLikeTrigger);
    if(song.id===songId){
        dispatch(setLiked(!isLiked));
    }
  }

    return (
        <div className='flex items-center gap-[2rem] cursor-pointer py-[0.5rem] w-full text-center text-white hover:bg-gradient-to-r hover:from-[#80808015] hover:via-[#80808060] hover:to-[#80808015]' onClick={playSong}>
            <div className='w-[2.2rem] h-[2.2rem] rounded-lg text-xl grid text-black place-items-center bg-white overflow-hidden'>
                {coverUrl ? <img src={coverUrl} alt="Cover Image" /> : <PiVinylRecord/>}
            </div>
            <p className='font-medium text-left w-[20%] text-xs'>{item.songName}</p>
            <p className='opacity-65 text-xs'>{item.ArtistName}</p>
            <p className='text-[1.04rem] ml-auto'>{item.isLiked ? <FaHeart className='text-[#E76716]' onClick={(e)=>handleUnlike(e, item.songId)}/> : <FaRegHeart className='opacity-65' onClick={(e)=>handleLike(e, item.songId)}/>}</p>
            <p className='ml-3 text-xs w-[5%]'>{durationCalculator(item.duration)}</p>
            <div className='p-[0.5rem] relative hover:bg-[#80808040] rounded-full' onClick={(e)=>toggleDropDown(index, e)}>
              <IoMdMore className='text-xl'/>
              { dropdown===index &&
              <div className='absolute w-[10rem] left-[-10rem] top-0 rounded-lg overflow-hidden z-10 bg-black'>
                {
                  songsDropDown.map((item, index)=>{
                    if(index<3){
                      return (
                        <p key={index} className='w-full text-xs gap-4 px-[1rem] h-[3rem] flex items-center hover:bg-[#80808040]' onClick={(event) => item.function === 'atq' ? addToQueue(event) : item.function==='stp' && addToPlaylist()}>
                          <item.icon className='text-xl'/>
                          {item.name}
                        </p>
                      )
                    }
                  })
                }
              </div>
              }
            </div>
        </div>
    );
};

export default Songs
