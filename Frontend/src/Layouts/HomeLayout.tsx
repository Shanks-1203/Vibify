import MiniPlayer from '../Components/Mini Player/MiniPlayer'
import Sidebar from '../Components/Sidebar/Sidebar'
import React, { useEffect, useState } from 'react'
import { setMusicSeek } from '../Slices/musicPlayerSlice';
import { useDispatch, useSelector } from 'react-redux';
import { musicPlayerState } from '../Types/types';

const HomeLayout = ({children}:{ children: React.ReactNode }) => {

  return (
    <div className='bg-black w-full flex'>
      <div className='w-[15%]'>
        <div className='fixed w-[15%] left-0'>
          <Sidebar/>
        </div>
      </div>
      <div className='w-[85%] pb-[3%]'>
        {children}
      </div>

      <MiniPlayer/>

    </div>
  )
}

export default HomeLayout
