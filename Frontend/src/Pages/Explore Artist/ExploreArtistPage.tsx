import CommonHeader from '../../Components/Header/CommonHeader'
import FollowingArtists from '../../Components/Following Artists/FollowingArtists'
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic'

const ExploreArtistPage = () => {
  return (
    <>
        <FullScreenMusic/>
        <div className='w-full h-screen p-[2rem]'>
            <CommonHeader/>
            <div className='grid grid-cols-3 gap-4 grid-flow-row mt-[2rem] h-full text-white'>
                <div className='h-full col-span-2'>
                    <p className='text-sm opacity-65'>New releases of your favorite artists</p>
                </div>
                <div className='h-full'>
                    <FollowingArtists/>
                    <p>Top Artists</p>
                </div>
            </div>
        </div>
    </>
  )
}

export default ExploreArtistPage
