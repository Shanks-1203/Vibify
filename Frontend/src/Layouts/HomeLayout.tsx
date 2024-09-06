import MiniPlayer from '../Components/Mini Player/MiniPlayer'
import SaveToPlaylistPage from '../Components/Save To Playlist Page/SaveToPlaylistPage';
import Sidebar from '../Components/Sidebar/Sidebar'
import { Outlet } from 'react-router-dom';
import CreatePlaylist from '../Components/Create Playlist/CreatePlaylist';
import QuickAccessPopup from '../Components/Quick Access Popup/QuickAccessPopup';
import { useEffect, useState } from 'react';
import FullScreenMusic from '../Components/Full Screen Music/FullScreenMusic';

const HomeLayout = () => {

  const [test, setTest] = useState(false)

  return (
    <div className='bg-black w-full flex'>
      <div className='w-[15%]'>
        <div className='fixed w-[15%] left-0'>
          <Sidebar/>
        </div>
      </div>
      <div className='w-[85%] pb-[3%]'>
        <Outlet />

        <div className={`fixed rounded-tl-md transition-all rounded-bl-md top-[2rem] w-[20rem] bg-black text-white border-b-2 border-[#E76716] ${test ? 'right-0' : 'right-[-30rem]'}`}>
          <div className='w-full h-full bg-[#80808050] p-[1rem] rounded-tl-md'>
            <p className='text-sm'>Playlist Created Successfully.</p>
            <p className='text-xs mt-2 opacity-65'>Step 2: Add some songs to it.</p>
          </div>
        </div>
      </div>
      <SaveToPlaylistPage/>
      <QuickAccessPopup/>
      <CreatePlaylist/>
      <FullScreenMusic/>
      <MiniPlayer/>
    </div>
  )
}

export default HomeLayout
