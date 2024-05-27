import { useSelector } from 'react-redux';
import MiniPlayer from '../Components/Mini Player/MiniPlayer'
import SaveToPlaylistPage from '../Components/Save To Playlist Page/SaveToPlaylistPage';
import Sidebar from '../Components/Sidebar/Sidebar'
import { Outlet } from 'react-router-dom';
import { saveToPlaylist } from '../Types/types';

const HomeLayout = () => {

  const {popup} = useSelector((state:saveToPlaylist)=> state.saveToPlaylist)

  return (
    <div className='bg-black w-full flex'>
      <div className='w-[15%]'>
        <div className='fixed w-[15%] left-0'>
          <Sidebar/>
        </div>
      </div>
      <div className='w-[85%] pb-[3%]'>
        <Outlet />
      </div>
      {popup && <SaveToPlaylistPage/>}
      <MiniPlayer/>

    </div>
  )
}

export default HomeLayout
