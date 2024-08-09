import React from 'react'
import { FaUser } from 'react-icons/fa6'
import { FaArrowTrendDown } from "react-icons/fa6";
import { FaArrowTrendUp } from "react-icons/fa6";

const ArtistRanking = () => {
  const rank = [
    {
      rank: 1,
      name: 'Anirudh Ravichander',
      views: '19M',
      status: '+',
      places: 1,
    },
    {
      rank: 2,
      name: 'The Weeknd',
      views: '16M',
      status: '-',
      places: 1,
    },
    {
      rank: 3,
      name: '*NSYNC',
      views: '14M',
      status: '+',
      places: 22,
    },
    {
      rank: 4,
      name: 'Sabrina Carpenter',
      views: '10M',
      status: '-',
      places: 1,
    },
    {
      rank: 5,
      name: 'Taylor Swift',
      views: '9M',
      status: '-',
      places: 1,
    },
  ]

  return (
    <div className='pt-4'>
      <p className='text-sm opacity-65'>Top Artists</p>
      <div className='flex flex-col gap-2 mt-4'>
        {rank.map((item) => {
          return <ArtistRankCard ranking={item} />
        })}
      </div>
    </div>
  )
}

const ArtistRankCard = ({
  ranking,
}: {
  ranking: {
    rank: number
    name: string
    views: string
    status: string
    places: number
  }
}) => {
    return (
        <div className='w-full rounded-lg text-xs flex gap-4 p-2 items-center hover:bg-[#80808040] cursor-pointer'>
            <p className='text-lg font-bold'>{ranking.rank}</p>
            <div className='w-[2.5rem] h-[2.5rem] rounded-lg bg-white grid place-items-center text-black'><FaUser /></div>
            <p>{ranking.name}</p>
            <div className='ml-auto flex gap-2 items-center'>
                <p className='mr-4 opacity-65'>{ranking.views}+ views</p>
                <p className='text-lg'>{ranking.status === '+' ? <FaArrowTrendUp className='text-green-400'/> : <FaArrowTrendDown className='text-red-500'/>}</p>
                <p className='w-[1.5rem] text-right text-md'>{ranking.status}{ranking.places}</p>
            </div>
        </div>
    )
    
}

export default ArtistRanking
