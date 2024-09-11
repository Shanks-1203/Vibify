import React from 'react'
import { BiSolidPlaylist } from "react-icons/bi";


const RelatedPlaylists = () => {

    const array = [
        {
            name:"Let's Party",
            tracks: 30
        },
        {
            name:"Evergreen Songs",
            tracks: 29
        },
        {
            name:"Walker Paradise",
            tracks: 40
        },
        {
            name:"Love Story",
            tracks: 65
        }
    ]

  return (
    <div>
      <p className='font-semibold text-xl mt-[1rem]'>Related Playlists</p>
      <div className='w-full mt-[1.2rem] flex flex-wrap gap-[4rem]'>
        {
            array.map((playlist, index)=>{
                return(
                    <div className='flex items-center flex-col w-[10rem] py-1 cursor-pointer' key={index}>
                        <div className='w-full h-[10rem] text-4xl text-black bg-[#DADADA] grid place-items-center rounded-md'>
                            <BiSolidPlaylist/>
                        </div>
                        <p className='font-semibold mt-[1rem]'>{playlist.name}</p>
                        <p className='text-sm text-center opacity-65 mt-[0.3rem]'>{playlist.tracks} Tracks</p>
                    </div>
                )
            })
        }
      </div>
    </div>
  )
}

export default RelatedPlaylists
