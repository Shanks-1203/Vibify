import { useEffect, useState } from 'react'
import { PiVinylRecord } from 'react-icons/pi'
import { IoReorderTwoOutline } from "react-icons/io5";
import { QueueState, Song, musicPlayerState } from '../../Types/types';
import { useSelector } from 'react-redux';
import durationCalculator from '../../Functions/durationCalculator';
import fetchSongCover from '../../Functions/fetchSongCover';

const QueueList = ({playFromQueue}:{playFromQueue:Function}) => {

  const {Queue, shuffledQueue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)
  const { shuffle } = useSelector((state:musicPlayerState) => state.musicPlayer);
  const [highestPlayIndex, setHighestPlayIndex] = useState(0)

  useEffect(()=>{
    if(playIndex>=highestPlayIndex){
      setHighestPlayIndex(playIndex);
    }
  },[playIndex])

  return (
    <div className='flex flex-col gap-[0.5rem] w-full text-white pt-[1rem]'>
      {
        (shuffle ? shuffledQueue : Queue).map((song,index)=>{
            return(
              <QueueSongsTemplate playFromQueue={playFromQueue} highestPlayIndex={highestPlayIndex} song={song} index={index}/>
            )
        })
      }
    </div>
  )
}

const QueueSongsTemplate = ({playFromQueue, highestPlayIndex, song, index}:{playFromQueue:Function, highestPlayIndex:number, song:Song, index:number}) => {
  
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const {Queue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)

  useEffect(()=>{
    const songFetch = async() => {
      setCoverUrl(null);
      const url = await fetchSongCover(song.songId);
      if(url) setCoverUrl(url);
    }
    songFetch()
  },[song.songId])

  return (
      <>
        <div key={index} className={`w-full h-[3.7rem] rounded-sm hover:bg-[#80808040] cursor-pointer flex gap-[1.2rem] items-center px-[1.5rem] ${index===playIndex && 'bg-[#80808040]'}`} onClick={()=>playFromQueue(index)}>
                  
            <div className='w-[2.5rem] h-[2.5rem] rounded-lg text-3xl grid place-items-center'>
              {coverUrl ? <img src={coverUrl} alt="Cover Image" /> :<PiVinylRecord/>}
            </div>
                    
            <div>
                <p className='text-xs font-semibold'>{song.songName}</p>
                <p className='text-xs opacity-65'>{song.ArtistName}</p>
            </div>
            <p className='text-xs ml-auto'>{durationCalculator(song.duration)}</p>
            <p className='text-xl'><IoReorderTwoOutline/></p>
        </div>

        {(index===highestPlayIndex && index<Queue.length-1) &&
          <div className='mt-[1rem]'>
            <hr className='w-full bg-white mb-[1rem]'/>
            <p className='text-sm opacity-65 mb-[0.5rem]'>Playing Next</p>
          </div>
        }
      </>
    )
}

export default QueueList
