import React from 'react'
import { PiVinylRecord } from 'react-icons/pi'
import { IoReorderTwoOutline } from "react-icons/io5";
import { QueueState } from '../../Types/types';
import { useSelector } from 'react-redux';
import durationCalculator from '../../Functions/durationCalculator';

const QueueList = ({playFromQueue}:{playFromQueue:Function}) => {

  const {Queue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)

  return (
    <div className='flex flex-col gap-[0.5rem] w-full text-white pt-[1rem]'>
      {
        Queue.map((song,index)=>{
            return(
                <div key={index} className={`w-full h-[3.7rem] rounded-sm hover:bg-[#80808040] cursor-pointer flex gap-[1.2rem] items-center px-[1.5rem] ${index===playIndex && 'bg-[#80808040]'}`} onClick={()=>playFromQueue(index)}>
                  
                    <PiVinylRecord className='p-[0.1rem] bg-white text-black text-3xl'/>
                    
                    <div>
                        <p className='text-xs font-semibold'>{song.songName}</p>
                        <p className='text-xs opacity-65'>{song.ArtistName}</p>
                    </div>
                    <p className='text-xs ml-auto'>{durationCalculator(song.duration)}</p>
                    <p className='text-xl'><IoReorderTwoOutline/></p>
                </div>
            )
        })
      }
    </div>
  )
}

export default QueueList
