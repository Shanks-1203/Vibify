import { useState } from 'react';
import durationCalculator from '../../../Functions/durationCalculator'
import { musicPlayerState } from '../../../Types/types';
import { useSelector } from 'react-redux';

const MiniSeekbar = ({seeker}:{seeker:Function}) => {
  
  const { duration, songLength } = useSelector((state:musicPlayerState) => state.musicPlayer);
  let seek = (duration / songLength)*100
  const [hover, setHover] = useState(false);

  if(songLength===0){
    seek=0
  }

  return (
    <div className='flex px-[1.5rem] text-xs gap-[1rem] justify-center items-center relative'>
        <p className='absolute left-[-5%]'>{durationCalculator(Math.floor(duration))}</p>
        <div className='w-[25rem] miniseek h-[0.2rem] bg-white cursor-pointer' onClick={(e)=>seeker(e)} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
            <div className='h-full bg-[#E76716] flex justify-end items-center' style={{width: seek+'%'}}>
                <div className='w-[0.5rem] h-[0.5rem] rounded-full bg-[#E76716]' style={{opacity: hover ? '100%' : '0%'}}></div>
            </div>
        </div>
        <p className='absolute right-[-5%]'>{durationCalculator(songLength)}</p>
    </div>
  )
}

export default MiniSeekbar
