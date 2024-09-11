import { useSelector } from 'react-redux';
import Songs from '../../Components/Songs/Songs'
import FeaturedPlaylists from '../../Components/Songs/Featured Playlists/FeaturedPlaylists'
import PopularArtists from '../../Components/Songs/Popular Artists/PopularArtists'
import CommonHeader from '../../Components/Header/CommonHeader';
import TrendingPlaylists from '../../Components/Top Charts/TrendingPlaylists';
import AdvertisementBoard from '../../Components/Advertisement Board/AdvertisementBoard';
import { homePageLoader, musicPlayerState, profileDetails } from '../../Types/types';
import { useState } from 'react';
import Loader from '../../Loaders/Loader';

const HomePage = () => {

  const { miniplayer } = useSelector((state:musicPlayerState) => state.musicPlayer);
  const {isLoggedIn} = useSelector((state:profileDetails)=>state.profileDetails)
  const [loading, setLoading] = useState<homePageLoader>({
    songsLoaded: false,
    artistsLoaded: false,
  });

  return (
    <>
      {
        !(loading.songsLoaded && loading.artistsLoaded) && 
        <Loader text='Customizing your home...'/>
      }
      <div className={`${miniplayer==='max' && 'overflow-hidden h-screen'} ${!(loading.songsLoaded && loading.artistsLoaded) && 'hidden'} min-h-[92vh] p-[2rem]`}>
        <CommonHeader/>
        <div className='grid gap-[2rem] grid-cols-3 mt-[2rem]'>
          <div className='col-span-2'>
            <AdvertisementBoard/>
          </div>
          
          <div className='row-span-2'>
            <TrendingPlaylists/>
            <PopularArtists setLoading={setLoading}/>
          </div>

          <div className='col-span-2'>
            <Songs setLoading={setLoading}/>
          </div>

          <div className='col-span-2'>
            { isLoggedIn ?
              <FeaturedPlaylists/> :
              <p className='text-white text-sm opacity-65'>Hello guest</p>
            }
          </div>

        </div>
      </div>
    </>
  )
}

export default HomePage