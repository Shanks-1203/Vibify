import CommonHeader from '../../Components/Header/CommonHeader'
import FollowingArtists from '../../Components/Following Artists/FollowingArtists'
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic'
import ArtistRanking from '../../Components/Artist Ranking/ArtistRanking'
import LatestReleases from '../../Components/Latest Releases/LatestReleases'

const ExploreArtistPage = () => {
  return (
    <>
        <FullScreenMusic/>
        <div className='w-full p-[2rem]'>
            <CommonHeader/>
            <div className='grid grid-cols-3 gap-4 grid-flow-row mt-[2rem] h-full text-white'>
                <div className='h-full col-span-2'>
                    <LatestReleases/>
                </div>
                <div className='h-full'>
                    <FollowingArtists/>
                    <ArtistRanking/>
                </div>
            </div>
        </div>
    </>
  )
}

export default ExploreArtistPage
