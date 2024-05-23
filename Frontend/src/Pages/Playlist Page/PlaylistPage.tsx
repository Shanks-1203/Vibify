import React, { useEffect, useState } from 'react'
import httpClient from '../../httpClient';
import { PiVinylRecord } from 'react-icons/pi';
import PlaylistOptions from '../../Components/Playlist Options/PlaylistOptions';
import { IoMdMore } from "react-icons/io";
import durationCalculator from '../../Functions/durationCalculator';
import RelatedPlaylists from '../../Components/Related Playlists/RelatedPlaylists';
import { useDispatch, useSelector } from 'react-redux';
import MiniPlayer from '../../Components/Mini Player/MiniPlayer';
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic';
import { setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
import { addMusic, clearQueue, setPlayIndex } from '../../Slices/musicQueueSlice';
import { Song, musicPlayerState } from '../../Types/types';
import CommonHeader from '../../Components/Header/CommonHeader';
import { useLocation, useParams } from 'react-router-dom';
import HomeLayout from '../../Layouts/HomeLayout';

const PlaylistPage = () => {

  const dispatch = useDispatch();

  const {playlistId} = useParams()

  const [songs, setSongs] = useState<Song[]>([])
  const [seek, setSeek] = useState(0);
  const [songTime, setSongTime] = useState('0:00');
  const [currentSongTime, setCurrentSongTime] = useState('0:00');

  const [currentLength, setCurrentLength] = useState(() => {
    const durationString = typeof window !== 'undefined' ? window.sessionStorage?.getItem('duration') : null;
    return parseInt(durationString ?? '0', 10);
  });
  
  const { songLength, song, miniplayer, play, musicSeek, duration } = useSelector((state:musicPlayerState) => state.musicPlayer);

  const getSongs = async() => {
    try{
      const resp = await httpClient.get(`/playlists/${playlistId}`)
      setSongs(resp.data)
    } catch(err) {
      console.log(err);
    }
  }

  const location = useLocation();

  useEffect(()=>{
    dispatch(setMusicSeek({seek:duration}))
    getSongs();
  },[location])

  useEffect(()=>{
    const minutes = Math.floor(songLength / 60);
    const seconds = songLength - minutes * 60;

    setSongTime(`${minutes}:${seconds<10 ? '0'+seconds : seconds}`);
  },[songLength])

  useEffect(()=>{
    const minutes = Math.floor(currentLength / 60);
    const seconds = currentLength - minutes * 60;

    const secondString = parseInt(seconds.toString().split('.')[0]);

    setCurrentSongTime(`${minutes}:${secondString<10 ? '0'+secondString : secondString}`);

    setSeek(Math.floor((currentLength/songLength)*100))

    sessionStorage.setItem('duration', Math.floor(currentLength).toString());
  },[currentLength])

  useEffect(() => {
    if (!play) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentLength((prev) => {
        if (prev < songLength) {
          return prev + 1;
        } else {
          clearInterval(intervalId);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [play, songLength]);

  const fetchSongUrl = async (songName:String) => {
    try {
      const response = await httpClient.get(`/song/${songName}`);
      const url = response.data.url;
      console.log(url);
      return url;
    } catch (error) {
      console.error('Error fetching song URL:', error);
    }
  }

  const playSong = async (item:{ArtistName: String, PlaylistId: number, PlaylistName: String, UserName: String, artistId: number, duration: number, songId: number, songName: String}) => {
      setCurrentLength(0);
  
      dispatch(setSongInfo({
        song: {
          id: item.songId,
          name: item.songName,
          artist: item.ArtistName,
          mp3: null
        },
        songLength: item.duration,
      }));
  
      dispatch(setSongInfo({
        song: {
          id: item.songId,
          name: item.songName,
          artist: item.ArtistName,
          mp3: await fetchSongUrl(item.songName),
        },
        songLength: item.duration,
      }));
  
      dispatch(setPlay({play:true}));
  
      sessionStorage.setItem("songId", item?.songId?.toString());
  }

  const playlistPlay = ( songNumber:number = 0 ) => {
    dispatch(clearQueue());
    playSong(songs[songNumber]);
    dispatch(setPlayIndex(songNumber))
    songs.map((song:{ArtistName: String, PlaylistId: number, PlaylistName: String, UserName: String, artistId: number, duration: number, songId: number, songName: String}, index)=>{
      dispatch(addMusic(song));
    })
  }

  return (
    <>
    <FullScreenMusic/>

    <div className={`${miniplayer==='max' && 'overflow-hidden h-screen'}`}>

      {
        songs &&
        <div className='w-full p-[2rem] text-white'>

          <CommonHeader/>
          <p className='font-semibold text-xl mt-[2rem]'>{songs[0]?.PlaylistName}</p>
          <p className='mt-[0.5rem] opacity-65 text-xs'>Created by <span className='hover:underline cursor-pointer'>{songs[0]?.UserName}</span></p>

          <PlaylistOptions playlistPlay={playlistPlay}/>

          <div className='flex flex-col gap-[1rem] mt-[2rem] text-[0.8rem]'>
            {
              songs.map((song:Song,index)=>{
                return (
                <div key={song.songId} className='hover:bg-[#80808040] w-full px-[1.5rem] flex items-center h-[4rem] rounded-md text-white cursor-pointer hover:scale-[1.01] transition-all' onClick={()=>playlistPlay(index)}>
                  <div className='flex gap-[1.5rem] items-center w-[50%]'>
                    <p className='text-[2rem] grid place-items-center'><PiVinylRecord/></p>
                    <p className='w-[35%]'>{song.songName}</p>
                    <p className='opacity-65'>{song.ArtistName}</p>
                  </div>
                  <p className='ml-auto'>{durationCalculator(song.duration)}</p>
                  <p className='text-xl ml-[1.5rem]'><IoMdMore/></p>
                </div>
              )})
            }
          </div>
          <p className='mt-[3rem] text-center text-xs opacity-65'>You've Reached the end of the list.</p>

            <RelatedPlaylists/>

        </div>
      }
    </div>
    </>
  )
}

export default PlaylistPage
