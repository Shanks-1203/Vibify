import React, { useEffect, useState } from 'react'
import { PiVinylRecord } from 'react-icons/pi'
import { musicPlayerState, SimpleSongType } from '../../Types/types'
import durationCalculator from '../../Functions/durationCalculator'
import fetchSongCover from '../../Functions/fetchSongCover'
import { FaHeart, FaRegHeart } from 'react-icons/fa6'
import { like, unlike } from '../../Functions/manageLike'
import { useDispatch, useSelector } from 'react-redux'
import { setLiked } from '../../Slices/musicPlayerSlice'
import { IoMdMore } from 'react-icons/io'

const LatestReleases = ({songs, setLikeTrigger}:{songs:SimpleSongType[], setLikeTrigger:Function}) => {


  return (
    <div>
        <p className='opacity-65'>New releases of your favorite artists</p>
        <div className='flex mt-6 flex-col gap-2'>
            {songs.map((song)=>{
                return <LatestSongTemplate item={song} key={song.songId} setLikeTrigger={setLikeTrigger} />
            })}
        </div>
    </div>
  )
}

const LatestSongTemplate = ({item, setLikeTrigger}:{item:SimpleSongType, setLikeTrigger:Function}) => {

    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const dispatch = useDispatch();
    const {song, isLiked} = useSelector((state:musicPlayerState) => state.musicPlayer);


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
              <p className='p-[0.6rem] rounded-full hover:bg-[#80808040]'><IoMdMore className='text-2xl'/></p>
            </div>
        </div>
    )
}

export default LatestReleases
