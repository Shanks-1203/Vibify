import React from 'react'
import { FaPlay } from 'react-icons/fa';
import { MdSkipPrevious } from "react-icons/md";
import { MdSkipNext } from "react-icons/md";
import { IoShuffle } from "react-icons/io5";
import { TbRepeatOff } from "react-icons/tb";
import { useDispatch, useSelector } from 'react-redux';
import { QueueState, musicPlayerState } from '../../../Types/types';
import { FaPause } from "react-icons/fa6";
import { togglePlay } from '../../../Slices/musicPlayerSlice';

const MiniControls = ({prevButton, nextButton} : {prevButton:Function, nextButton:Function}) => {

    const {Queue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)
    const { play } = useSelector((state:musicPlayerState) => state.musicPlayer);

    const dispatch = useDispatch();

    const toggle = () => {
      dispatch(togglePlay())
    }

  return (
    <div className='flex gap-[2rem] items-center justify-evenly'>
        <p className='text-[1.4rem] cursor-pointer opacity-50'><IoShuffle/></p>
        <p className='text-2xl cursor-pointer' onClick={()=>prevButton()}><MdSkipPrevious/></p>
        <p className='text-white border-[1px] rounded-full p-[0.7rem] text-sm cursor-pointer' onClick={()=>toggle()}>{play===false ? <FaPlay/> : <FaPause/>}</p>
        <p className={`text-2xl cursor-pointer ${playIndex === (Queue.length - 1) && 'opacity-50'}`} onClick={()=> {playIndex < (Queue.length - 1) && nextButton()}}><MdSkipNext/></p>
        <p className='text-xl cursor-pointer opacity-50'><TbRepeatOff/></p>
    </div>
  )
}

export default MiniControls
