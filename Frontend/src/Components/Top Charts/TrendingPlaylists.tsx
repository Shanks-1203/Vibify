import React, { useEffect, useState } from 'react'
import { BiSolidPlaylist } from 'react-icons/bi'
import httpClient from '../../httpClient';
import { Link } from 'react-router-dom';

const TrendingPlaylists = () => {

  const [playlists, setPlaylists] = useState<{playlistId: string, playlistName: string, trackCount: number, likes: number}[]>([]);

  const fetchPlaylists = async() => {
    try {
      const resp = await httpClient.get('/trending-playlists')
      setPlaylists(resp.data)
    } catch(err) {
      console.log(err)
    }
  }

  useEffect(()=>{
    fetchPlaylists()
  },[])

  return (
        <div className='w-full text-white rounded-lg p-[1.2rem] bg-gradient-to-tr from-[#570A5790]  to-[#22297D90]'>
          <div className='text-md flex justify-between items-center'>
            <p className='opacity-65'>Trending Playlists</p>
            <span className='text-sm font-normal text-[#E76716] cursor-pointer hover:underline'>View More</span>
          </div>

          <div className='w-full flex flex-col gap-[1rem] mt-[1.3rem]'>
            {
              playlists.map((item, index) => {
                return(
                  <Link to={`/playlists/${item.playlistId}`} key={item.playlistId}>
                    <div className='w-full flex gap-[1.4rem] items-center hover:bg-gradient-to-r hover:from-[#80808000] hover:via-[#80808040] hover:to-[#80808000] rounded-md cursor-pointer py-[0.8rem]'>
                      <p className='text-2xl italic font-bold'>{index+1}</p>

                      <div className='flex items-center gap-4'>
                        <BiSolidPlaylist className='text-[3.2rem] rounded-md bg-white p-[0.7rem] text-black'/>
                        <div className='text-md'>
                          <p>{item.playlistName}</p>
                          <p className='opacity-65 mt-1 text-sm'>{item.trackCount} Tracks</p>
                        </div>
                      </div>
                      <p className='text-sm ml-auto'>{item.likes} likes</p>
                    </div>
                  </Link>
                )
              }
            )}
          </div>

      </div>
  )
}

export default TrendingPlaylists
