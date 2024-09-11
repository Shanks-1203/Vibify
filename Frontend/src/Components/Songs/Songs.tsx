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
import { QueueState, SimpleSongType, homePageLoader, musicPlayerState } from '../../Types/types';
import { setSongId, togglePopup } from '../../Slices/saveToPlaylistSlice';
import fetchSongCover from '../../Functions/fetchSongCover';
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { like, unlike } from '../../Functions/manageLike';

const Songs = ({setLoading}:{setLoading:Function}) => {

  const [songsList, setSongsList] = useState([]);
  const [dropdown, setDropdown] = useState<number | null>(null);
  const [likeTrigger, setLikeTrigger] = useState(false);
  const { isLiked } = useSelector((state:musicPlayerState) => state.musicPlayer);

  const songFetch = async() => {
    const token = localStorage.getItem('token')
    setLoading((prev:homePageLoader) =>({
      ...prev,
      songsLoaded: false
    }))
    try{
      const resp = await httpClient.get('/home-songs',{
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setSongsList(resp.data);
    } catch(err){
      console.error(err);
    }
    setLoading((prev:homePageLoader) =>({
      ...prev,
      songsLoaded: true
    }))
  }

  useEffect(()=> {
    songFetch()
    //eslint-disable-next-line
  },[likeTrigger, isLiked])

  const toggleDropDown = (index:number, event:any) => {
    event.stopPropagation();
    setDropdown(dropdown === index ? null : index);
  }

  return (
    <div>
      <div className='text-white text-base flex justify-between items-center'>
        <p className='opacity-65'>Trending Hits</p>
        <span className='text-sm font-normal text-[#E76716] cursor-pointer hover:underline'>View more</span>
      </div>
      <div className='w-full flex flex-col gap-2 mt-[1.2rem]'>
        {
          songsList.slice(0,5).map((item, index)=>{
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
        artist: item.artistName,
        urls: {
          mp3:null,
          cover: null,
          lyrics: null,
        },
      },
      songLength: item.duration,
    }));

    dispatch(setSongInfo({
      song: {
        id: item.songId,
        name: item.songName,
        artist: item.artistName,
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
        <div className='flex items-center gap-[2rem] cursor-pointer py-[0.5rem] w-full text-center text-white hover:bg-gradient-to-r hover:from-[#80808015] hover:via-[#80808060] hover:to-[#80808015]' onClick={playSong}>
            <div className='w-[3rem] h-[3rem] rounded-lg text-xl grid text-black place-items-center bg-white overflow-hidden'>
                {coverUrl ? <img src={coverUrl} alt="cover" /> : <PiVinylRecord/>}
            </div>
            <p className='font-medium text-left w-[25%]'>{item.songName}</p>
            <p className='opacity-65 text-sm'>{item.artistName}</p>
            <p className='text-[1.4rem] ml-auto'>{item.isLiked ? <FaHeart className='text-[#E76716]' onClick={(e)=>handleUnlike(e, item.songId)}/> : <FaRegHeart className='opacity-65' onClick={(e)=>handleLike(e, item.songId)}/>}</p>
            <p className='ml-3 w-[5%]'>{durationCalculator(item.duration)}</p>
            <div className='p-[0.5rem] relative hover:bg-[#80808040] rounded-full' onClick={(e)=>toggleDropDown(index, e)}>
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
    );
};

export default Songs
