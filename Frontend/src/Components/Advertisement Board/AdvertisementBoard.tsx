import weeknd from '../../Assets/Images/The Weeknd.png';
import { BsDot } from "react-icons/bs";

const AdvertisementBoard = () => {
  return (
    <div className='h-[18rem] flex rounded-lg items-center pl-[2rem] justify-between text-white bg-gradient-to-r cursor-pointer to-purple-400 from-purple-500'>
        <div className='flex text-md w-[65%] flex-col justify-center'>
            <p className='text-2xl font-semibold'>Weeknd Hits</p>
            <p className='flex items-center'>2 Tracks <BsDot/> Created by Shanks</p>
            <p className='opacity-65 w-[60%] mt-6'>Listen to the trending songs of The Weeknd now.</p>
        </div>
        <img src={weeknd} alt='the weeknd' className='h-full rounded-lg'/>
    </div>
  )
}

export default AdvertisementBoard
