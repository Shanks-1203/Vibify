import React from 'react'
import { BiSolidPlaylist } from 'react-icons/bi'
import { Link } from 'react-router-dom'

const PlaylistsTemplate = ({playlists}:{playlists:{playlistId: string, playlistName: string, trackCount: number}[]}) => {
  return (
    <div className='mt-8'>
      <p>Playlists</p>
      { 
      playlists.length > 0 ? 
        <div className='mt-4 flex gap-[3rem]'>
        { playlists.map((playlist)=>{
          return (
            <Link key={playlist.playlistId} to={`/playlists/${playlist.playlistId}`}>
              <div className='w-[12rem] flex flex-col'>
                  <div className='w-full h-[12rem] bg-white text-black text-6xl grid place-items-center'>
                    <BiSolidPlaylist/>
                  </div>
                  <p className='font-medium mt-3 text-center'>{playlist.playlistName}</p>
                  <p className='opacity-65 text-center mt-1'>{playlist.trackCount} tracks</p>
              </div>
            </Link>
          )
        })
        }
        </div> :
        <p className='my-[1.5rem] opacity-65 text-sm'>No Results Found</p>
      }
    </div>
  )
}

export default PlaylistsTemplate
