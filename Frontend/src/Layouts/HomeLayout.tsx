import MiniPlayer from '../Components/Mini Player/MiniPlayer'
import Sidebar from '../Components/Sidebar/Sidebar'
import { Outlet } from 'react-router-dom';

const HomeLayout = () => {

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

      <MiniPlayer/>

    </div>
  )
}

export default HomeLayout
