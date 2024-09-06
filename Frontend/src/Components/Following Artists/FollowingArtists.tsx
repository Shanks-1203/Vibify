import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LuFilter } from "react-icons/lu";
import { FaUser } from 'react-icons/fa6';

const FollowingArtists = ({following}:{following:{profilePic: string, artistId:string, artistName:string, followersCount:number}[]}) => {

    const [filter, setFilter] = useState(false);

    // const array = [
    //     {
    //         id:1,
    //         name:'Anirudh Ravichander',
    //         followers: '19L'
    //     },
    //     {
    //         id:2,
    //         name:'The Weeknd',
    //         followers: '29L'
    //     },
    //     {
    //         id:3,
    //         name: 'Charlie Puth',
    //         followers: '19L'
    //     },
    //     {
    //         id:4,
    //         name: 'Taylor Swift',
    //         followers: '30L'
    //     },
    //     {
    //         id:5,
    //         name: 'Alan Walker',
    //         followers: '45L'
    //     }
    // ]

  return (
    <div className='h-fit max-h-[50vh]'>
      <p className='text-sm flex justify-between items-center'><span className='opacity-65'>Following</span> <LuFilter className={`text-xl cursor-pointer ${filter ? 'text-[#E76716]' : 'opacity-65'}`} onClick={()=>setFilter((prev:Boolean)=>!prev)}/></p>
      <div className='flex flex-col gap-2 mt-4 overflow-y-scroll h-[88%]'>
        {
            following.map((item, index) => {
                return( !filter ?
                    <Link key={index} to={`/artists/${item.artistId}`}>
                        <div className='w-full rounded-lg text-xs flex gap-4 p-2 items-center hover:bg-[#80808040]'>
                            <div className='w-[2.5rem] h-[2.5rem] rounded-lg bg-white grid place-items-center text-black'>{item.profilePic ? <img src={item.profilePic} alt="artist profile" className='w-full h-full rounded-lg'/> :<FaUser />}</div>
                            <p>{item.artistName}</p>
                            <p className='ml-auto'>{item.followersCount} Followers</p>
                        </div>
                    </Link> :
                    <div className='w-full rounded-lg text-xs flex gap-4 p-2 items-center hover:bg-[#80808040] cursor-pointer'>
                        <div className='w-[2.5rem] h-[2.5rem] rounded-lg bg-white grid place-items-center text-black'>{item.profilePic ? <img src={item.profilePic} alt="artist profile" className='w-full h-full rounded-lg'/> :<FaUser />}</div>
                        <p>{item.artistName}</p>
                        <p className='ml-auto'>{item.followersCount} Followers</p>
                    </div>
                )
            })
        }
      </div>
    </div>
  )
}

export default FollowingArtists
