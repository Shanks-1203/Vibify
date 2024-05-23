import React from 'react'
import { IoSearchOutline } from "react-icons/io5";

const SearchBar = () => {
  return (
    <div className='w-[40%] h-[2.3rem] text-white bg-[#80808070] flex items-center rounded-md px-2 opacity-80'>
      <p className='text-[1.2rem]'><IoSearchOutline/></p>
      <input type="text" className='w-full h-full outline-none bg-transparent ml-[0.7rem] text-xs placeholder-white' placeholder='Search by songs, artists or albums'/>
    </div>
  )
}

export default SearchBar
