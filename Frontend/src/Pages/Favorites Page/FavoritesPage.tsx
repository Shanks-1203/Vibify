import CommonHeader from '../../Components/Header/CommonHeader'
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic'
import FavoriteSongsTemplate from '../../Components/Favorite Songs Template/FavoriteSongsTemplate'
import { FaPlay } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import httpClient from '../../httpClient'
import { SimpleSongType } from '../../Types/types'
import { setDuration, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice'
import fetchSongUrl from '../../Functions/fetchSongUrl'
import { addMusic, clearQueue, setPlayIndex } from '../../Slices/musicQueueSlice'
import { useDispatch } from 'react-redux'

const FavoritesPage = () => {

    const [favorites, setFavorites] = useState<SimpleSongType[]>([]);
    const dispatch = useDispatch();

    const fetchFavorites = async () =>{
        const token = localStorage.getItem('token')
        try{
            const response = await httpClient.get('/favorites',{
                headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            setFavorites(response.data);
        } catch(err){
            console.log(err)
        }
    }

    useEffect(()=>{
        fetchFavorites();
    },[])

    const playSong = async (item:SimpleSongType) => {
  
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
      playSong(favorites[songNumber]);
      dispatch(setPlayIndex(0))
      favorites.map((song:SimpleSongType)=>{
          dispatch(addMusic(song));
          return null;
      })
    }

  return (
    <>
        <FullScreenMusic/>
        <div className='w-full h-screen p-[2rem] bg-black text-white'>
            <CommonHeader/>
            <p className='font-semibold flex justify-between items-center text-xl mt-[2rem]'>
                Favorites
                <p className='w-[2.5rem] h-[2.5rem] rounded-full bg-[#E76716] text-xs ml-auto cursor-pointer grid place-items-center text-black' onClick={()=>playlistPlay()}><FaPlay/></p>
            </p>
            <div className='w-full flex flex-col gap-4 mt-[2rem] text-[0.8rem]'>
                {
                    favorites.map((item, index) => {
                        return(
                            <FavoriteSongsTemplate playlistPlay={playlistPlay} item={item} key={index} index={index}/>
                        )
                    })
                }
            </div>
            <p className='mt-[3rem] text-center text-xs opacity-65'>Songs that you've liked will appear here</p>
        </div>
    </>
  )
}

export default FavoritesPage
