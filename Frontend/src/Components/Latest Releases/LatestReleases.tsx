import React from 'react'
import { PiVinylRecord } from 'react-icons/pi'

const LatestReleases = () => {

    const songs = [
        {
            id: 1,
            title: 'Espresso',
            artist: 'Sabrina Carpenter',
            duration: '3:20',
            views: '19M'
        },
        {
            id: 2,
            title: 'Aasa Kooda',
            artist: 'Sai Abhyankkar',
            duration: '2:43',
            views: '24M'
        },
        {
            id: 3,
            title: 'Fear Song',
            artist: 'Anirudh Ravichander',
            duration: '2:57',
            views: '18M'
        },
        {
            id: 4,
            title: 'Bye Bye Bye',
            artist: '*NSYNC',
            duration: '3:13',
            views: '32M'
        },
        {
            id: 5,
            title: 'Cruel Summer',
            artist: 'Taylor Swift',
            duration: '4:12',
            views: '46M'
        },
    ]

  return (
    <div>
        <p className='text-sm opacity-65'>New releases of your favorite artists</p>
        <div className='flex mt-4 flex-col gap-2'>
            {songs.map((song)=>{
                return <LatestSongTemplate song={song} key={song.id}/>
            })}
        </div>
    </div>
  )
}

const LatestSongTemplate = ({song}:{song:{id: number, title: string, artist: string, duration: string, views: string}}) => {
    return (
        <div className='w-full rounded-lg text-xs flex gap-4 p-2 items-center text-white hover:bg-[#80808040] cursor-pointer'>
            <div className='w-[2.5rem] h-[2.5rem] rounded-lg bg-white grid place-items-center text-lg text-black'><PiVinylRecord/></div>
            <p className='w-[9rem]'>{song.title}</p>
            <p className='opacity-65'>{song.artist}</p>
            <div className='ml-auto flex gap-[4rem] items-center'>
                <p className='opacity-65'>{song.views}+ views</p>
                <p>{song.duration}</p>
            </div>
        </div>
    )
}

export default LatestReleases
