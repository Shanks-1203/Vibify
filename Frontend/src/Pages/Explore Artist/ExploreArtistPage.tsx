import CommonHeader from '../../Components/Header/CommonHeader'
import FollowingArtists from '../../Components/Following Artists/FollowingArtists'
import ArtistRanking from '../../Components/Artist Ranking/ArtistRanking'
import LatestReleases from '../../Components/Latest Releases/LatestReleases'
import { useEffect, useState } from 'react'
import httpClient from '../../httpClient'
import Loader from '../../Loaders/Loader'

const ExploreArtistPage = () => {

    const [songs, setSongs] = useState([]);
    const [following, setFollowing] = useState([])
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const [likeTrigger, setLikeTrigger] = useState(false);


    const fetchData = async() => {
        setLoading(true)
        const resp = await httpClient.get('/artists/following',{
            headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
        })

        setFollowing(resp.data);

        await songsFetch()
        setLoading(false)
    }

    const songsFetch = async() => {
        const songResp = await httpClient.get('/home-songs',{
            headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        
        setSongs(songResp.data)
    }

    useEffect(()=>{
        fetchData()
        //eslint-disable-next-line
    },[])

    useEffect(()=>{
        songsFetch()
        //eslint-disable-next-line
    },[likeTrigger])

  return (
    <>
        {
            loading ? <Loader text='Dive into the world of music...' /> :
            <div className='w-full min-h-[94vh] p-[2rem]'>
                <CommonHeader/>
                <div className='grid grid-cols-3 gap-4 grid-flow-row mt-[2rem] text-white'>
                    <div className='h-full col-span-2'>
                        <LatestReleases songs={songs} likeTrigger={likeTrigger} setLikeTrigger={setLikeTrigger}/>
                    </div>
                    <div className='h-full'>
                        {following.length > 0 && <FollowingArtists following={following}/>}
                        <ArtistRanking/>
                    </div>
                </div>
            </div>
        }
    </>
  )
}

export default ExploreArtistPage
