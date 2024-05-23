import { useSelector } from 'react-redux';
import Songs from '../../Components/Songs/Songs'
import FeaturedPlaylists from '../../Components/Songs/Featured Playlists/FeaturedPlaylists'
import PopularArtists from '../../Components/Songs/Popular Artists/PopularArtists'
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic'
import CommonHeader from '../../Components/Header/CommonHeader';
import TrendingPlaylists from '../../Components/Top Charts/TrendingPlaylists';
import AdvertisementBoard from '../../Components/Advertisement Board/AdvertisementBoard';
import { musicPlayerState } from '../../Types/types';

const HomePage = () => {

  const { miniplayer } = useSelector((state:musicPlayerState) => state.musicPlayer);


  return (
    <>
        <FullScreenMusic/>        
        <div className={`${miniplayer==='max' && 'overflow-hidden h-screen'} p-[2rem]`}>
          <CommonHeader/>
          <div className='grid gap-[2rem] grid-cols-3 mt-[2rem]'>
            <div className='col-span-2'>
              <AdvertisementBoard/>
            </div>
            
            <div className='row-span-2'>
              <TrendingPlaylists/>
              <PopularArtists/>
            </div>

            <div className='col-span-2'>
              <Songs/>
            </div>

            <div className='col-span-2'>
              <FeaturedPlaylists/>
            </div>

          </div>
        </div>
    </>
  )
}

export default HomePage