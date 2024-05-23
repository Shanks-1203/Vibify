import SearchBar from '../../Components/Search Bar/SearchBar'
import React from 'react'
import { SlEarphones } from "react-icons/sl";

const CommonHeader = () => {
  return (
    <div className='w-full flex items-center justify-between'>
        <SearchBar/>
        <div className='w-[2.3rem] grid place-items-center h-[2.3rem] rounded-full cursor-pointer bg-white' title='Profile'>
            <SlEarphones className='text-black'/>
        </div>
    </div>
  )
}

export default CommonHeader
