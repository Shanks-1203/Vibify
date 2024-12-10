import CommonHeader from '../../Components/Header/CommonHeader'
import FavoriteSongsTemplate from '../../Components/Favorite Songs Template/FavoriteSongsTemplate'
import { FaPlay } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import httpClient from '../../httpClient'
import { SimpleSongType } from '../../Types/types'
import { setDuration, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice'
import fetchSongUrl from '../../Functions/fetchSongUrl'
import { addMusic, clearQueue, setPlayIndex } from '../../Slices/musicQueueSlice'
import { useDispatch } from 'react-redux'
import Loader from '../../Loaders/Loader'

const FavoritesPage = () => {

    const [favorites, setFavorites] = useState<SimpleSongType[]>([]);
    const [loading, setLoading] = useState(true);
    const [dropdown, setDropdown] = useState<number | null>(null);
    const dispatch = useDispatch();

    const fetchFavorites = async () =>{
      setLoading(true)
      const token = localStorage.getItem('token')
      try{
          const response = await httpClient.get('/favorites',{
              headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
          })
          setFavorites(response.data);
      } catch(err){
          console.log(err)
      }
      setLoading(false)
    }

    useEffect(()=>{
        fetchFavorites();
    },[])

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
    
        dispatch(setPlay({play:true}));
        dispatch(setMusicSeek({seek:0}));
        dispatch(setDuration({duration:0}));
    }

    const toggleDropDown = (index:number, event:any) => {
      event.stopPropagation();
      setDropdown(dropdown === index ? null : index);
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
        {
          loading ?
          <Loader text='Loading your great taste of music...'/> :
          <div className='w-full h-screen p-[2rem] bg-black text-white'>
              <CommonHeader/>
              <p className='font-semibold flex justify-between items-center text-2xl mt-[2rem]'>
                  Favorites
                  <p className='w-[3rem] h-[3rem] rounded-full bg-[#E76716] text-sm ml-auto cursor-pointer grid place-items-center text-black' onClick={()=>playlistPlay()}><FaPlay/></p>
              </p>
              <div className='w-full flex flex-col gap-4 mt-[2rem]'>
                  {
                      favorites.map((item, index) => {
                          return(
                            <FavoriteSongsTemplate toggleDropDown={toggleDropDown} playSong={playSong} dropdown={dropdown} setDropdown={setDropdown} playlistPlay={playlistPlay} item={item} key={index} index={index}/>
                          )
                      })
                  }
              </div>
              <p className='mt-[3rem] text-center text-sm opacity-65'>{favorites.length === 0 ? "It's never too late to like a song." :"Looks like you've hit the bottom."}</p>
          </div>
        }
    </>
  )
}

export default FavoritesPage
