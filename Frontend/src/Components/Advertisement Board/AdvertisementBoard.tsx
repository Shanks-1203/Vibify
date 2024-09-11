// import weeknd from '../../Assets/Images/The Weeknd.png'
// import logo from '../../Assets/Images/Logo.png'
import anirudh from '../../Assets/Images/Anirudh.png'
import { BsDot } from "react-icons/bs";

const AdvertisementBoard = () => {
  return (
    <div className='h-[18rem] flex rounded-lg items-center p-[2rem] justify-between text-white bg-gradient-to-r cursor-pointer to-red-400 from-red-500'>
        <div className='flex text-md w-[65%] flex-col justify-center'>
            <p className='text-2xl font-semibold'>Anirudh Hits</p>
            <p className='flex items-center'>2 Tracks <BsDot/> Created by Shanks</p>
            <p className='opacity-65 w-[60%] mt-6'>Listen to the trending songs of Anirudh Ravichander now.</p>
        </div>
        <img src={anirudh} alt='the weeknd' className='h-full rounded-lg'/>
    </div>
  )
}

export default AdvertisementBoard
