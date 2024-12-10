import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LuFilter } from "react-icons/lu";
import { FaUser } from 'react-icons/fa6';

const FollowingArtists = ({following}:{following:{profilePic: string, artistId:string, artistName:string, followersCount:number}[]}) => {

  const [filter, setFilter] = useState(false);

  return (
    <div className='h-fit max-h-[50vh]'>
      <p className='flex justify-between items-center'><span className='opacity-65'>Following</span> <LuFilter className={`text-2xl cursor-pointer ${filter ? 'text-[#E76716]' : 'opacity-65'}`} onClick={()=>setFilter((prev:boolean)=>!prev)}/></p>
      <div className='flex flex-col gap-4 mt-4 overflow-y-scroll h-[88%]'>
        {
            following.map((item, index) => {
                return( !filter ?
                    <Link key={index} to={`/artists/${item.artistId}`}>
                        <div className='w-full rounded-lg flex gap-6 px-2 py-3 cursor-pointer items-center hover:bg-[#80808040]'>
                            <div className='w-[3rem] h-[3rem] rounded-lg bg-white grid place-items-center text-black'>{item.profilePic ? <img src={item.profilePic} alt="artist profile" className='w-full h-full rounded-lg'/> :<FaUser />}</div>
                            <p className='font-medium'>{item.artistName}</p>
                            <p className='ml-auto text-sm opacity-65'>{item.followersCount} Followers</p>
                        </div>
                    </Link> :
                    <div className='w-full rounded-lg flex gap-6 px-2 py-3 cursor-pointer items-center hover:bg-[#80808040]'>
                      <div className='w-[3rem] h-[3rem] rounded-lg bg-white grid place-items-center text-black'>{item.profilePic ? <img src={item.profilePic} alt="artist profile" className='w-full h-full rounded-lg'/> :<FaUser />}</div>
                      <p className='font-medium'>{item.artistName}</p>
                      <p className='ml-auto text-sm opacity-65'>{item.followersCount} Followers</p>
                    </div>
                )
            })
        }
      </div>
    </div>
  )
}

export default FollowingArtists
