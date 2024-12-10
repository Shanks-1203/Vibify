import React from 'react'
import { GoSearch } from "react-icons/go";

const SearchLoader = () => {
  return (
    <div className='h-[92vh] w-full bg-black text-white grid place-items-center'>
        <div className='flex flex-col gap-4 items-center'>
            <GoSearch className='text-6xl animate-bounce'/>
            <p>Searching...</p>
        </div>
    </div>
  )
}

export default SearchLoader
