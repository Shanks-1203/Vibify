import React from 'react'
import { FaHeart } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";

const Playlists = () => {

    const array = ['Anirudh Hits', 'Love Songs', 'Pop Songs','The Weeknd Hits', 'English Favorites']

  return (
    <div className='h-[50%] w-[90%] mx-auto'>

      <p className='text-xl flex text-white justify-between items-center cursor-pointer'>
        Your Library
        <MdKeyboardArrowRight />
      </p>

      <div className='flex flex-col gap-[1rem] mt-[1.5rem]'>

        <div className='w-full h-[3rem] bg-[#DADADA] cursor-pointer hover:scale-[1.03] transition-all flex items-center rounded-md'>
            <div className='w-[22%] h-full grid place-items-center'>
                <p className='text-xl text-red-500'><FaHeart/></p>
            </div>
            <p className='text-sm'>Favorites</p>
        </div>

        {array.map((item,index)=>{
            if(index < 4){
                return(
                    <PlaylistTemplate name={item} key={index}/>
                )
            }
        })}
        
      </div>
    </div>
  )
}

const PlaylistTemplate = ({name}:{name:String}) => {
    return(
        <div className='w-full h-[3rem] bg-[#DADADA] cursor-pointer hover:scale-[1.03] transition-all flex items-center rounded-md'>
            <div className='w-[22%] h-full grid place-items-center'>
                {name==='Favorites' && <p className='text-2xl text-red-500'><FaHeart/></p>}
            </div>
            <p className='text-sm'>{name}</p>
        </div>
    )
}

export default Playlists
