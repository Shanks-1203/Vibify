import { BsDot } from "react-icons/bs";
import { FaPlay } from 'react-icons/fa';
import { MdSkipPrevious } from "react-icons/md";
import { MdSkipNext } from "react-icons/md";
import { IoShuffle } from "react-icons/io5";
import { TbRepeatOff, TbRepeatOnce, TbRepeat } from "react-icons/tb";
import { useDispatch, useSelector } from 'react-redux';
import { QueueState, musicPlayerState } from '../../../Types/types';
import { FaPause } from "react-icons/fa6";
import { setRepeat, togglePlay, toggleShuffle } from '../../../Slices/musicPlayerSlice';

const MiniControls = ({prevButton, nextButton} : {prevButton:Function, nextButton:Function}) => {

    const {Queue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)
    const { play, shuffle, repeat } = useSelector((state:musicPlayerState) => state.musicPlayer);

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
    <div className='flex gap-[2rem] items-center justify-evenly'>
        <p className={`text-[1.4rem] cursor-pointer relative ${!shuffle ? 'opacity-50' : 'text-[#E76716]'}`} onClick={toggleShuffleFunction}><IoShuffle/>{shuffle && <BsDot className="absolute bottom-[-1rem]"/>}</p>
        <p className={`text-2xl cursor-pointer ${(playIndex === 0 && repeat==='off') && 'opacity-50'}`} onClick={()=>prevButton()}><MdSkipPrevious/></p>
        <p className='text-white border-[1px] rounded-full p-[0.7rem] text-sm cursor-pointer' onClick={()=>toggle()}>{play===false ? <FaPlay/> : <FaPause/>}</p>
        <p className={`text-2xl cursor-pointer ${(playIndex === (Queue.length - 1) && repeat==='off') && 'opacity-50'}`} onClick={()=> {nextButton()}}><MdSkipNext/></p>
        <p className={`text-xl cursor-pointer relative ${repeat==='off' ? 'opacity-50' : 'text-[#E76716]'} `} onClick={setRepeatFunction}>{repeat==='off' ? <TbRepeatOff/> : repeat==='on' ? <TbRepeat/> : <TbRepeatOnce/> }{(repeat==='on' || repeat==='once') && <BsDot className="absolute bottom-[-1rem]"/>}</p>
    </div>
  )
}

export default MiniControls
