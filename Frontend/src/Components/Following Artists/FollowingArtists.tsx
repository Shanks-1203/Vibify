import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LuFilter } from "react-icons/lu";

const FollowingArtists = () => {

    const [filter, setFilter] = useState(false);

    const array = [
        {
            id:1,
            name:'Anirudh Ravichander',
            followers: 0
        },
        {
            id:2,
            name:'The Weeknd',
            followers: 0
        },
        {
            id:14,
            name: 'Charlie Puth',
            followers: 0
        }
    ]

  return (
    <div className='h-[50%]'>
      <p className='text-sm flex justify-between items-center'><span className='opacity-65'>Following</span> <LuFilter className={`text-xl cursor-pointer ${filter ? 'text-[#E76716]' : 'opacity-65'}`} onClick={()=>setFilter((prev:Boolean)=>!prev)}/></p>
      <div className='flex flex-col gap-2 mt-4'>
        {
            array.map((item) => {
                return( !filter ?
                    <Link key={item.id} to={`/artists/${item.id}`}>
                        <div className='w-full rounded-lg text-xs flex gap-4 p-2 items-center hover:bg-[#80808040]'>
                            <div className='w-[2.5rem] h-[2.5rem] rounded-lg bg-white'></div>
                            <p>{item.name}</p>
                            <p className='ml-auto'>{item.followers} Followers</p>
                        </div>
                    </Link> :
                    <div className='w-full rounded-lg text-xs flex gap-4 p-2 items-center hover:bg-[#80808040] cursor-pointer'>
                        <div className='w-[2.5rem] h-[2.5rem] rounded-lg bg-white'></div>
                        <p>{item.name}</p>
                        <p className='ml-auto'>{item.followers} Followers</p>
                    </div>
                )
            })
        }
      </div>
    </div>
  )
}

export default FollowingArtists
