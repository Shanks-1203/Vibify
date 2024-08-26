import { useSelector } from 'react-redux';
import Songs from '../../Components/Songs/Songs'
import FeaturedPlaylists from '../../Components/Songs/Featured Playlists/FeaturedPlaylists'
import PopularArtists from '../../Components/Songs/Popular Artists/PopularArtists'
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic'
import CommonHeader from '../../Components/Header/CommonHeader';
import TrendingPlaylists from '../../Components/Top Charts/TrendingPlaylists';
import AdvertisementBoard from '../../Components/Advertisement Board/AdvertisementBoard';
import { homePageLoader, musicPlayerState } from '../../Types/types';
import { useState } from 'react';
import Loader from '../../Loaders/Loader';

const HomePage = () => {

  const { miniplayer } = useSelector((state:musicPlayerState) => state.musicPlayer);
  const [loading, setLoading] = useState<homePageLoader>({
    songsLoaded: false,
    artistsLoaded: false,
    playlistsLoaded: false
  });

  return (
    <>
        <FullScreenMusic/>
          {
            !(loading.songsLoaded || loading.artistsLoaded || loading.playlistsLoaded) && 
            <Loader text='Customizing your home...'/>
          }
          <div className={`${miniplayer==='max' && 'overflow-hidden h-screen'} p-[2rem]`}>
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
                <FeaturedPlaylists setLoading={setLoading}/>
              </div>

            </div>
          </div>
    </>
  )
}

export default HomePage