import weeknd from '../../Assets/Images/The Weeknd.png'
import { BsDot } from "react-icons/bs";

const AdvertisementBoard = () => {
  return (
    <div className='h-[15rem] flex rounded-lg text-white bg-gradient-to-r cursor-pointer to-purple-400 from-purple-500'>
        <div className='flex text-sm p-[2rem] w-[65%] flex-col justify-center'>
            <p className='text-2xl font-semibold'>The Weeknd Terminal</p>
            <p className='flex items-center'>29 Tracks <BsDot/> Created by Shanks</p>
            <p className='opacity-65 w-[60%] mt-6'>Listen to the trending songs of the Weeknd now.</p>
        </div>
        <img src={weeknd} alt='the weeknd' className='w-[35%]'/>
    </div>
  )
}

export default AdvertisementBoard
