import { useEffect, useState } from 'react'
import httpClient from '../../httpClient';
import PlaylistOptions from '../../Components/Playlist Options/PlaylistOptions';
import RelatedPlaylists from '../../Components/Related Playlists/RelatedPlaylists';
import { useDispatch, useSelector } from 'react-redux';
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic';
import { setDuration, setLiked, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
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
  const { miniplayer, isLiked } = useSelector((state:musicPlayerState) => state.musicPlayer);
  const [likeTrigger, setLikeTrigger] = useState(false);
  const { Queue } = useSelector((state:QueueState) => state.musicQueue);

  const getSongs = async() => {
    const token = localStorage.getItem('token')
    try{
      const resp = await httpClient.get(`/playlists/${playlistId}`, {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      })
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
  },[location, removeFromPlaylist, likeTrigger, isLiked])

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
  
      dispatch(setLiked(item.isLiked))
      dispatch(setPlay({play:true}));
      dispatch(setMusicSeek({seek:0}));
      dispatch(setDuration({duration:0}));
  
      sessionStorage.setItem("songId", item?.songId?.toString());
  }

  const playlistPlay = ( songNumber:number = 0 ) => {
    dispatch(clearQueue());
    playSong(songs[songNumber]);
    dispatch(setPlayIndex(0))
    songs.map((song:Song, index)=>{
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
        <div className={`w-full p-[2rem] text-white ${songs.length < 2 && 'h-screen'}`}>

          <CommonHeader/>
          <p className='font-semibold text-xl mt-[2rem]'>{songs[0]?.PlaylistName}</p>
          <p className='mt-[0.5rem] opacity-65 text-xs'>Created by <span className='hover:underline cursor-pointer'>{songs[0]?.UserName}</span></p>

          <PlaylistOptions likes={songs[0]?.PlaylistLikes} playlistPlay={playlistPlay}/>

          { songs[0]?.songName && 
            <div className='flex flex-col gap-[1rem] mt-[2rem] text-[0.8rem]'>
            {
              songs.map((item:Song,index)=>{
                return (
                <PlaylistSongs setLikeTrigger={setLikeTrigger} key={index} playlistPlay={playlistPlay} removeFromPlaylist={removeFromPlaylist} addToPlaylist={addToPlaylist} addToQueue={addToQueue} item={item} index={index} dropdown={dropdown} toggleDropdown={toggleDropdown}/>
              )})
            }
          </div>}
          <p className='mt-[3rem] text-center text-xs opacity-65'>{songs[0]?.songName ? "You've Reached the end of the list." : 'The Playlist is empty'}</p>

            <RelatedPlaylists/>

        </div>
      }
    </div>
    </>
  )
}

export default PlaylistPage
