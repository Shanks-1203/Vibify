import { useEffect, useState } from 'react'
import httpClient from '../../httpClient';
import PlaylistOptions from '../../Components/Playlist Options/PlaylistOptions';
import RelatedPlaylists from '../../Components/Related Playlists/RelatedPlaylists';
import { useDispatch, useSelector } from 'react-redux';
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic';
import { setDuration, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
import { addMusic, addToShuffledQueue, clearQueue, setPlayIndex } from '../../Slices/musicQueueSlice';
import { QueueState, Song, musicPlayerState } from '../../Types/types';
import CommonHeader from '../../Components/Header/CommonHeader';
import { useLocation, useParams } from 'react-router-dom';
import fetchSongUrl from '../../Functions/fetchSongUrl';
import { setSongId, togglePopup } from '../../Slices/saveToPlaylistSlice';
import PlaylistSongs from '../../Components/Playlist Songs/PlaylistSongs';

const PlaylistPage = () => {

  const dispatch = useDispatch();

  const {playlistId} = useParams()

  const [songs, setSongs] = useState<Song[]>([])
  const [dropdown, setDropdown] = useState<number | null>(null);

  const { miniplayer, song } = useSelector((state:musicPlayerState) => state.musicPlayer);
  const { Queue } = useSelector((state:QueueState) => state.musicQueue);

  const getSongs = async() => {
    try{
      const resp = await httpClient.get(`/playlists/${playlistId}`)
      setSongs(resp.data)
    } catch(err) {
      console.log(err);
    }
  }

  const addToPlaylist = (index:number, event:any) => {
    event.stopPropagation();
    dispatch(togglePopup());
    dispatch(setSongId(songs[index].songId));
    setDropdown(null);
  }

  const removeFromPlaylist = async(songId:number, playlistId:number, event:any) => {
    event.stopPropagation();
    const resp = await httpClient.post('/removeFromPlaylist',{
      playlistId, songId
    })
    console.log(resp.data);
    setDropdown(null);
  }

  const location = useLocation();

  useEffect(()=>{
    getSongs();
  },[location, removeFromPlaylist])

  const playSong = async (item:Song) => {
  
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
    event.stopPropagation();
    setDropdown(dropdown === index ? null : index);
  }

  const addToQueue = (index:number, event:any) => {
    event.stopPropagation();
    dispatch(addMusic(songs[index]));
    if(Queue.length===0){
      playSong(songs[index]);
    }
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
                <PlaylistSongs playlistPlay={playlistPlay} removeFromPlaylist={removeFromPlaylist} addToPlaylist={addToPlaylist} addToQueue={addToQueue} item={item} index={index} dropdown={dropdown} toggleDropdown={toggleDropdown}/>
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
