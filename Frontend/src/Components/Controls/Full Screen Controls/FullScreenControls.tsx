import { BsDot } from 'react-icons/bs'
import { setRepeat, togglePlay, toggleShuffle } from '../../../Slices/musicPlayerSlice'
import { QueueState, musicPlayerState } from '../../../Types/types'
import React from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'
import { IoShuffle } from 'react-icons/io5'
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md'
import { TbRepeat, TbRepeatOff, TbRepeatOnce } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'

const FullScreenControls = ({prevButton, nextButton} : {prevButton:Function, nextButton:Function}) => {

    const {Queue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)
    const { play, repeat, shuffle } = useSelector((state:musicPlayerState) => state.musicPlayer);


    const dispatch = useDispatch();

    const toggle = () => {
      dispatch(togglePlay())
    }

    const toggleShuffleFunction = () => {
      dispatch(toggleShuffle());
    }

    const setRepeatFunction = () => {
      if(repeat==='off'){
        dispatch(setRepeat({repeat:'on'}));
      } else if (repeat === 'on'){
        dispatch(setRepeat({repeat:'once'}));
      } else {
        dispatch(setRepeat({repeat:'off'}));
      }
    }

  return (
    <div className='w-[55%] mt-[2rem] flex items-center justify-evenly'>
        <p className={`text-[1.4rem] cursor-pointer relative ${!shuffle ? 'opacity-50' : 'text-[#E76716]'}`} onClick={toggleShuffleFunction}><IoShuffle/>{shuffle && <BsDot className="absolute bottom-[-1rem]"/>}</p>
        <p className={`text-2xl cursor-pointer ${(playIndex === 0 && repeat==='off') && 'opacity-50'}`} onClick={()=>prevButton()}><MdSkipPrevious/></p>
        <p className='bg-white text-black p-[0.9rem] text-sm rounded-full cursor-pointer ' onClick={()=>toggle()}>{play===false ? <FaPlay/> : <FaPause/>}</p>
        <p className={`text-2xl cursor-pointer ${(playIndex === (Queue.length - 1) && repeat==='off') && 'opacity-50'}`} onClick={()=> {nextButton()}}><MdSkipNext/></p>
        <p className={`text-xl cursor-pointer relative ${repeat==='off' ? 'opacity-50' : 'text-[#E76716]'} `} onClick={setRepeatFunction}>{repeat==='off' ? <TbRepeatOff/> : repeat==='on' ? <TbRepeat/> : <TbRepeatOnce/> }{(repeat==='on' || repeat==='once') && <BsDot className="absolute bottom-[-1rem]"/>}</p>
    </div>
  )
}

export default FullScreenControls
