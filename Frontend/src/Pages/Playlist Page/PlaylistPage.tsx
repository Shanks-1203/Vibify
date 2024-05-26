import { useEffect, useState } from 'react'
import httpClient from '../../httpClient';
import { PiVinylRecord } from 'react-icons/pi';
import PlaylistOptions from '../../Components/Playlist Options/PlaylistOptions';
import { IoMdMore } from "react-icons/io";
import durationCalculator from '../../Functions/durationCalculator';
import RelatedPlaylists from '../../Components/Related Playlists/RelatedPlaylists';
import { useDispatch, useSelector } from 'react-redux';
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic';
import { setDuration, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
import { addMusic, addToShuffledQueue, clearQueue, setPlayIndex } from '../../Slices/musicQueueSlice';
import { Song, musicPlayerState } from '../../Types/types';
import CommonHeader from '../../Components/Header/CommonHeader';
import { useLocation, useParams } from 'react-router-dom';
import fetchSongUrl from '../../Functions/fetchSongUrl';
import { songsDropDown } from '../../Constants/SongsDropDown';

const PlaylistPage = () => {

  const dispatch = useDispatch();

  const {playlistId} = useParams()

  const [songs, setSongs] = useState<Song[]>([])
  const [dropdown, setDropdown] = useState<number | null>(null);

  const { miniplayer, song, shuffle } = useSelector((state:musicPlayerState) => state.musicPlayer);

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
    getSongs();
  },[location])

  const playSong = async (item:{ArtistName: String, PlaylistId: number, PlaylistName: String, UserName: String, artistId: number, duration: number, songId: number, songName: String}) => {
  
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
          mp3: await fetchSongUrl(item.songId),
        },
        songLength: item.duration,
      }));
  
      dispatch(setPlay({play:true}));
      dispatch(setMusicSeek({seek:0}));
      dispatch(setDuration({duration:0}));
  
      sessionStorage.setItem("songId", item?.songId?.toString());
  }

  const playlistPlay = ( songNumber:number = 0 ) => {
    dispatch(clearQueue());
    playSong(songs[songNumber]);
    dispatch(setPlayIndex(0))
    songs.map((song:{ArtistName: String, PlaylistId: number, PlaylistName: String, UserName: String, artistId: number, duration: number, songId: number, songName: String}, index)=>{
        dispatch(addMusic(song));
        return null;
    })
  }

  const toggleDropdown = (index:number, event:any) => {
    if(dropdown !== index) {
      setDropdown(index);
    } else {
      setDropdown(null)
    }
    event.stopPropagation();
  }

  const addToQueue = (index:number, event:any) => {
    event.stopPropagation();
    dispatch(addMusic(songs[index]));
    dispatch(addToShuffledQueue(songs[index]));
    setDropdown(null)
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
              songs.map((item:Song,index)=>{
                return (
                <div key={item.songId} className={`hover:bg-[#80808040] w-full px-[1.5rem] flex items-center h-[4rem] rounded-md text-white cursor-pointer ${song.id === item.songId && 'bg-[#80808040]'}`} onClick={()=>playlistPlay(index)}>
                  <div className='flex gap-[1.5rem] items-center w-[50%]'>
                    <p className='text-[2rem] grid place-items-center'><PiVinylRecord/></p>
                    <p className='w-[35%]'>{item.songName}</p>
                    <p className='opacity-65'>{item.ArtistName}</p>
                  </div>
                  <p className='ml-auto'>{durationCalculator(item.duration)}</p>
                  <div className='relative ml-[1.5rem]'>
                    <p className='p-[0.6rem] rounded-full hover:bg-[#80808040]' onClick={(event)=>toggleDropdown(index, event)}><IoMdMore className='text-xl'/></p>
                    { dropdown===index &&
                      <div className='w-[10rem] rounded-lg absolute left-[-10rem] top-0 bg-black overflow-hidden'>
                        {
                          songsDropDown.map((item)=>{
                            return (
                              <div className='flex w-full h-[3rem] gap-[1rem] items-center px-[1rem] hover:bg-[#80808040]' onClick={(event) => item.function === 'atq' && addToQueue(index, event)}>
                                <item.icon className='text-xl'/>
                                <p className='text-xs'>{item.name}</p>
                              </div>
                            )
                          })
                        }
                      </div>
                    }
                  </div>
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
