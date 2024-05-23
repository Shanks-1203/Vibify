import { togglePlay } from '../../../Slices/musicPlayerSlice'
import { QueueState, musicPlayerState } from '../../../Types/types'
import React from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'
import { IoShuffle } from 'react-icons/io5'
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md'
import { TbRepeatOff } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'

const FullScreenControls = ({prevButton, nextButton} : {prevButton:Function, nextButton:Function}) => {

    const {Queue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)
    const { play } = useSelector((state:musicPlayerState) => state.musicPlayer);


    const dispatch = useDispatch();

    const toggle = () => {
      dispatch(togglePlay())
    }

  return (
    <div className='w-[55%] mt-[2rem] flex items-center justify-evenly'>
        <p className='text-[1.4rem] cursor-pointer opacity-50'><IoShuffle/></p>
        <p className='text-2xl cursor-pointer' onClick={()=>prevButton()}><MdSkipPrevious/></p>
        <p className='bg-white text-black p-[0.9rem] text-sm rounded-full cursor-pointer ' onClick={()=>toggle()}>{play===false ? <FaPlay/> : <FaPause/>}</p>
        <p className={`text-2xl cursor-pointer ${playIndex === (Queue.length - 1) && 'opacity-50'}`} onClick={()=> {playIndex < (Queue.length - 1) && nextButton()}}><MdSkipNext/></p>
        <p className='text-xl cursor-pointer opacity-50'><TbRepeatOff/></p>
    </div>
  )
}

export default FullScreenControls
