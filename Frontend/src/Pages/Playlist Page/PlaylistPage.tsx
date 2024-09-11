import { useEffect, useState } from 'react'
import httpClient from '../../httpClient';
import PlaylistOptions from '../../Components/Playlist Options/PlaylistOptions';
import RelatedPlaylists from '../../Components/Related Playlists/RelatedPlaylists';
import { useDispatch, useSelector } from 'react-redux';
import { setDuration, setLiked, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
import { addMusic, addToShuffledQueue, clearQueue, setPlayIndex } from '../../Slices/musicQueueSlice';
import { QueueState, SimpleSongType, musicPlayerState, playlistDetails } from '../../Types/types';
import CommonHeader from '../../Components/Header/CommonHeader';
import { useLocation, useParams } from 'react-router-dom';
import fetchSongUrl from '../../Functions/fetchSongUrl';
import { setSongId, togglePopup } from '../../Slices/saveToPlaylistSlice';
import PlaylistSongs from '../../Components/Playlist Songs/PlaylistSongs';
import Loader from '../../Loaders/Loader';

const PlaylistPage = () => {

  const dispatch = useDispatch();

  const {playlistId} = useParams()

  const [playlistDetails, setPlaylistDetails] = useState<playlistDetails>();
  const [songs, setSongs] = useState<SimpleSongType[]>([])
  const [dropdown, setDropdown] = useState<number | null>(null);
  const { miniplayer, isLiked } = useSelector((state:musicPlayerState) => state.musicPlayer);
  const [likeTrigger, setLikeTrigger] = useState(false);
  const { Queue } = useSelector((state:QueueState) => state.musicQueue);
  const [removed, setRemoved] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token')

  const getSongs = async() => {
    if(!playlistDetails){
      setLoading(true);
    }
    try{
      const resp = await httpClient.get(`/playlists/${playlistId}`, {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      setPlaylistDetails(resp.data.playlistDetails)
      setSongs(resp.data.songs)
    } catch(err) {
      console.log(err);
    }
    if(!playlistDetails){
      setLoading(false);
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
    await httpClient.post('/removeFromPlaylist',
      {
        playlistId, songId
      },
      {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      }
    )
    setDropdown(null);
    setRemoved((prev)=> !prev);
  }

  const location = useLocation();

  useEffect(()=>{
    getSongs();
    //eslint-disable-next-line
  },[location, removed, likeTrigger, isLiked])

  const playSong = async (item:SimpleSongType) => {
  
      dispatch(setSongInfo({
        song: {
          id: item.songId,
          name: item.songName,
          artist: item.artistName,
          urls: {
            mp3:null,
            cover: null,
            lyrics:null
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

  const playlistPlay = ( songNumber:number = 0 ) => {
    dispatch(clearQueue());
    playSong(songs[songNumber]);
    dispatch(setPlayIndex(0))
    songs.map((song:SimpleSongType, index)=>{
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

  const likePlaylist = async() => {

    const token = localStorage.getItem('token')
    const resp = await httpClient.post('/like/playlist',
      {
        playlistId: playlistDetails?.playlistId
      },
      {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      }
    )

    console.log(resp.data);
    
  }

  return (
    <>
    {
      loading ?
      <Loader text='Loading the playlist...'/> :
      <div className={`${miniplayer==='max' && 'overflow-hidden h-screen'}`}>

        {
          songs &&
          <div className='w-full p-[2rem] text-white min-h-[92vh]'>

            <CommonHeader/>
            <p className='font-semibold text-2xl mt-[2rem]'>{playlistDetails?.playlistName}</p>
            <p className='mt-[0.5rem] opacity-65 text-sm'>Created by <span className='hover:underline cursor-pointer'>{playlistDetails?.creatorName}</span></p>

            <PlaylistOptions likes={playlistDetails?.likes} isLiked={playlistDetails?.isLiked} playlistPlay={playlistPlay} likePlaylist={likePlaylist}/>

            { songs[0]?.songName && 
              <div className='flex flex-col gap-[1.2rem] mt-[2rem]'>
              {
                songs.map((item:SimpleSongType,index)=>{
                  return (
                  <PlaylistSongs playlistDetails={playlistDetails} setLikeTrigger={setLikeTrigger} key={index} playlistPlay={playlistPlay} removeFromPlaylist={removeFromPlaylist} addToPlaylist={addToPlaylist} addToQueue={addToQueue} item={item} index={index} dropdown={dropdown} toggleDropdown={toggleDropdown}/>
                )})
              }
            </div>}
            <p className='mt-[3rem] text-center text-sm opacity-65'>{songs[0]?.songName ? "You've Reached the end of the list." : 'The Playlist is empty'}</p>

              <RelatedPlaylists/>

          </div>
        }
      </div>
    }

    </>
  )
}

export default PlaylistPage
