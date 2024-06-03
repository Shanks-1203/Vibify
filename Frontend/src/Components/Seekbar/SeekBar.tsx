import { useState } from 'react'
import { useSelector } from 'react-redux';
import { musicPlayerState } from '../../Types/types';
import durationCalculator from '../../Functions/durationCalculator';

const SeekBar = ({seeker}:{seeker:Function}) => {
  
  const { duration, songLength } = useSelector((state:musicPlayerState) => state.musicPlayer);
  let seek = (duration / songLength)*100
  const [hover, setHover] = useState(false);

  if(songLength===0){
    seek=0
  }
  
  return (
    <div className='flex text-sm gap-[1rem] justify-center items-center mt-[2rem] relative'>
            <p className='absolute left-[-15%]'>{durationCalculator(Math.floor(duration))}</p>
            <div className='w-[18rem] seek h-[0.2rem] bg-[#DADADA] cursor-pointer' onClick={(e)=>seeker(e)} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
                <div className='h-full bg-[#E76716] flex justify-end items-center' style={{width: seek+'%'}}>
                    <div className='w-[0.5rem] h-[0.5rem] transition-all rounded-full bg-red-500' style={{opacity: hover ? '100%' : '0%'}}></div>
                </div>
            </div>
            <p className='absolute right-[-15%]'>{durationCalculator(songLength)}</p>
    </div>
  )
}

export default SeekBar
