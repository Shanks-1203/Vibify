import React from 'react'
import { BiSolidPlaylist } from 'react-icons/bi'

const TrendingPlaylists = () => {

  const array = [
    {
      id: 1,
      name: 'Love Is In The Air',
      tracks: 68,
      views: '264k'
    },
    {
      id: 2,
      name: 'Alan Walker World',
      tracks: 46,
      views: '112k'
    },
    {
      id: 3,
      name: 'Ariadna Grande Hits',
      tracks: 23,
      views: '107k'
    },
  ]

  return (
        <div className='w-full text-white rounded-lg p-[1rem] bg-gradient-to-tr from-[#570A5790]  to-[#22297D90]'>
          <div className='text-sm flex justify-between items-center'>
            <p className='opacity-65'>Trending Playlists</p>
            <span className='text-xs font-normal text-[#E76716] cursor-pointer hover:underline'>View More</span>
          </div>

          <div className='w-full flex flex-col gap-[1rem] mt-[1rem]'>
            {
              array.map((item) => {
                return(
                  <div key={item.id} className='w-full flex gap-[1.4rem] items-center hover:bg-gradient-to-r hover:from-[#80808000] hover:via-[#80808040] hover:to-[#80808000] rounded-md cursor-pointer py-[0.5rem]'>
                    <p className='text-2xl italic font-bold'>{item.id}</p>

                    <div className='flex items-center gap-4'>
                      <BiSolidPlaylist className='text-5xl rounded-md bg-white p-[0.7rem] text-black'/>
                      <div className='text-xs'>
                        <p>{item.name}</p>
                        <p className='opacity-65 mt-1'>{item.tracks} Tracks</p>
                      </div>
                    </div>
                    <p className='text-xs ml-auto'>{item.views} Views</p>
                  </div>
                )
              }
            )}
          </div>

      </div>
  )
}

export default TrendingPlaylists
