import React from 'react'
import { FaUser } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

const ArtistTemplate = ({artists}:{artists:{artistId: string, artistName: string, followers: number, profileUrl: string}[]}) => {
  return (
        <div className='mt-8'>
            <p>Artists</p>
            { artists.length > 0 ?
                <div className='mt-4 flex gap-[3rem]'>
                { artists.map((artist)=>{
                    return (
                        <Link key={artist.artistId} to={`/artists/${artist.artistId}`}>
                            <div className='w-[12rem] flex flex-col cursor-pointer'>
                                <div className='w-full h-[12rem] bg-white text-black text-6xl grid place-items-center'>
                                    { 
                                    artist.profileUrl ? <img src={artist.profileUrl} alt="cover" className='w-full h-full'/> 
                                    :
                                    <FaUser/>
                                    }
                                </div>
                                <p className='font-medium mt-3 text-center'>{artist.artistName}</p>
                                <p className='opacity-65 text-center mt-1'>{artist.followers} followers</p>
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

export default ArtistTemplate
