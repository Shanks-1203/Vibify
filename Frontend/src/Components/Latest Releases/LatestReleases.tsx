import React, { useEffect, useState } from 'react'
import { PiVinylRecord } from 'react-icons/pi'
import { musicPlayerState, QueueState, SimpleSongType } from '../../Types/types'
import durationCalculator from '../../Functions/durationCalculator'
import fetchSongCover from '../../Functions/fetchSongCover'
import { FaHeart, FaRegHeart } from 'react-icons/fa6'
import { like, unlike } from '../../Functions/manageLike'
import { useDispatch, useSelector } from 'react-redux'
import { setDuration, setLiked, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice'
import { IoMdMore } from 'react-icons/io'
import { songsDropDown } from '../../Constants/SongsDropDown'
import { addMusic, addToShuffledQueue } from '../../Slices/musicQueueSlice'
import fetchSongUrl from '../../Functions/fetchSongUrl'
import { setSongId, togglePopup } from '../../Slices/saveToPlaylistSlice'

const LatestReleases = ({songs, setLikeTrigger}:{songs:SimpleSongType[], setLikeTrigger:Function}) => {

  const [dropdown, setDropdown] = useState<number | null>(null);
  console.log(dropdown);
  

  return (
    <div>
        <p className='opacity-65'>New releases of your favorite artists</p>
        <div className='flex mt-6 flex-col gap-2'>
            {songs.map((song, index)=>{
                return <LatestSongTemplate dropdown={dropdown} setDropdown={setDropdown} item={song} index={index} key={song.songId} setLikeTrigger={setLikeTrigger} />
            })}
        </div>
    </div>
  )
}

const LatestSongTemplate = ({item, dropdown, setDropdown, index, setLikeTrigger}:{item:SimpleSongType, dropdown:number | null, setDropdown:Function, index:number, setLikeTrigger:Function}) => {

    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const dispatch = useDispatch();
    const {song, isLiked} = useSelector((state:musicPlayerState) => state.musicPlayer);
    const {Queue} = useSelector((state:QueueState)=> state.musicQueue)


    const songFetch = async() => {
      setCoverUrl(null)
      const url = await fetchSongCover(item.songId);
      if(url) setCoverUrl(url);
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

      const toggleDropDown = (event:any) => {
        event.stopPropagation();
        setDropdown(dropdown === index ? null : index);
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

    useEffect(()=>{
        songFetch()
        //eslint-disable-next-line
      },[item.songId])

    return (
        <div className='w-full rounded-lg flex gap-4 px-4 py-3 items-center text-white hover:bg-[#80808040] cursor-pointer'>
            <div className='w-[3rem] h-[3rem] rounded-lg bg-white grid place-items-center text-xl text-black'>{coverUrl ? <img src={coverUrl} alt="song cover" className='w-full h-full rounded-lg'/> : <PiVinylRecord/>}</div>
            <p className='w-[15rem] font-medium'>{item.songName}</p>
            <p className='opacity-65 text-sm'>{item.artistName}</p>
            <div className='ml-auto flex gap-[3.5rem] items-center'>
              <p className='text-[1.3rem]'>{item.isLiked ? <FaHeart className='text-[#E76716]' onClick={(e)=>handleUnlike(e, item.songId)}/> : <FaRegHeart className='opacity-65' onClick={(e)=>handleLike(e, item.songId)}/>}</p>
              <p>{durationCalculator(item.duration)}</p>
              <div className='p-[0.6rem] relative rounded-full hover:bg-[#80808040]' onClick={(e)=>toggleDropDown(e)}>
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
        </div>
    )
}

export default LatestReleases
