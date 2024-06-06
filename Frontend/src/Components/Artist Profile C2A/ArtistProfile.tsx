import durationCalculator from '../../Functions/durationCalculator'
import { useDispatch, useSelector } from 'react-redux'
import { setDuration, setLiked, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice'
import { PiVinylRecord } from 'react-icons/pi'
import fetchSongUrl from '../../Functions/fetchSongUrl'
import { QueueState, artistSongs, musicPlayerState } from '../../Types/types'
import { useEffect, useState } from 'react'
import fetchSongCover from '../../Functions/fetchSongCover'
import { FaHeart, FaRegHeart } from 'react-icons/fa6'
import { IoMdMore } from 'react-icons/io'
import { songsDropDown } from '../../Constants/SongsDropDown'
import { addMusic, addToShuffledQueue } from '../../Slices/musicQueueSlice'
import { setSongId, togglePopup } from '../../Slices/saveToPlaylistSlice'
import { like, unlike } from '../../Functions/manageLike'

export const ListenNowBtn = () => {
  return (
    <div className='px-4 cursor-pointer py-[0.7rem] flex justify-center gap-[0.5rem] items-center text-[0.75rem] font-medium rounded-full text-black bg-[#E76716]'>
        Listen Now
    </div>
  )
}

export const PopularSongs = ({setLikeTrigger, toggleDropDown, songs, dropdown, setDropdown}:{setLikeTrigger:Function, toggleDropDown:Function, songs: artistSongs[], dropdown:number|null, setDropdown:Function}) => {
    
    const dispatch = useDispatch()    

    const playSong = async(item:artistSongs) => {  
        
      dispatch(setSongInfo({
        song: {
          id: item.songId,
          name: item.songName,
          artist: item.ArtistName,
          lyrics: item.lyrics,
          urls: {
            mp3:null,
            cover: null,
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

    return (
        <div className='mt-[2rem]'>
            <p className='font-semibold text-lg text-white'>Popular Songs</p>
            <div className='mt-[2rem] w-full flex flex-col gap-1'>
                {
                    songs.map((item, index)=>{
                        return(
                            <ArtistSongTemplate setLikeTrigger={setLikeTrigger} key={index} toggleDropDown={toggleDropDown} dropdown={dropdown} setDropdown={setDropdown} item={item} index={index} playSong={playSong}/>
                        )
                    })
                }
            </div>
        </div>
    )
}

const ArtistSongTemplate = ({setLikeTrigger, item, index, playSong, dropdown, setDropdown, toggleDropDown}:{setLikeTrigger:Function, item:artistSongs, index:number, playSong:Function, dropdown:number|null, setDropdown:Function, toggleDropDown:Function}) => {
  
  const [songCover, setSongCover] = useState<string | null>(null)
  const {Queue} = useSelector((state:QueueState)=> state.musicQueue)
  const {song, isLiked} = useSelector((state:musicPlayerState) => state.musicPlayer);
  const dispatch = useDispatch();

  useEffect(()=>{
    const songFetch = async() => {
        setSongCover(null)
        const url = await fetchSongCover(item.songId);
        if(url) setSongCover(url);
    }
    songFetch()
  },[item.songId])

  const addToQueue = (event:any) => {
    event.stopPropagation();
    dispatch(addMusic(item));
    if(Queue.length===0){
      playSong(item);
    }
    dispatch(addToShuffledQueue(item));
    setDropdown(null)
  }

  const addToPlaylist = () => {
    dispatch(togglePopup());
    dispatch(setSongId(item?.songId));
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
    <div className={`w-full cursor-pointer py-[0.8rem] rounded-md flex justify-between text-sm hover:bg-[#80808040] items-center text-white px-[2rem] ${song.id === item.songId && 'bg-[#80808040]'}`} onClick={()=>playSong(item)}>
        <div className='flex items-center gap-[2rem]'>
            <p>{index+1}</p>
            <p className='w-[2.5rem] h-[2.5rem] text-[2rem] grid place-items-center rounded-lg overflow-hidden'>
            {songCover ? <img src={songCover} alt="Cover Image" /> :<PiVinylRecord/>}
            </p>
            <p>{item.songName}</p>
        </div>
        <div className='flex items-center'>
        <p className='text-[1.04rem] ml-auto'>{item.isLiked ? <FaHeart className='text-[#E76716]' onClick={(e)=>handleUnlike(e, item.songId)}/> : <FaRegHeart className='opacity-65' onClick={(e)=>handleLike(e, item.songId)}/>}</p>
          <p className='text-sm mx-[3rem]'>{durationCalculator(item.duration)}</p>
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
    </div>
  )
}