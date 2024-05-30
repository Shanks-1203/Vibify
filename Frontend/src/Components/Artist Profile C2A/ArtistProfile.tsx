import durationCalculator from '../../Functions/durationCalculator'
import { useDispatch, useSelector } from 'react-redux'
import { setDuration, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice'
import { PiVinylRecord } from 'react-icons/pi'
import fetchSongUrl from '../../Functions/fetchSongUrl'
import { artistSongs } from '../../Types/types'
import { useEffect, useState } from 'react'
import fetchSongCover from '../../Functions/fetchSongCover'

export const ListenNowBtn = () => {
  return (
    <div className='px-4 cursor-pointer py-[0.7rem] flex justify-center gap-[0.5rem] items-center text-[0.75rem] font-medium rounded-full text-black bg-[#E76716]'>
        Listen Now
    </div>
  )
}

export const PopularSongs = ({songs}:{songs: artistSongs[]}) => {
    
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
                            <ArtistSongTemplate item={item} index={index} playSong={playSong}/>
                        )
                    })
                }
            </div>
        </div>
    )
}

const ArtistSongTemplate = ({item, index, playSong}:{item:artistSongs, index:number, playSong:Function}) => {
  
  const [songCover, setSongCover] = useState<string | null>(null)

  useEffect(()=>{
    const songFetch = async() => {
        setSongCover(null)
        const url = await fetchSongCover(item.songId);
        if(url) setSongCover(url);
    }
    songFetch()
  },[item.songId])
  
  return (
    <div key={item.songId} className='w-full cursor-pointer py-[0.8rem] rounded-md flex justify-between text-sm hover:bg-[#80808040] items-center text-white px-[2rem]' onClick={()=>playSong(item)}>
        <div className='flex items-center gap-[2rem]'>
            <p>{index+1}</p>
            <p className='w-[2.5rem] h-[2.5rem] text-[2rem] grid place-items-center rounded-lg overflow-hidden'>
            {songCover ? <img src={songCover} alt="Cover Image" /> :<PiVinylRecord/>}
            </p>
            <p>{item.songName}</p>
        </div>
        <p className='text-sm'>{durationCalculator(item.duration)}</p>
    </div>
  )
}