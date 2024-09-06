import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import httpClient from '../../httpClient';
import { ListenNowBtn, PopularSongs } from '../../Components/Artist Profile C2A/ArtistProfile';
import { useSelector } from 'react-redux';
import CommonHeader from '../../Components/Header/CommonHeader';
import { artistDetails, musicPlayerState } from '../../Types/types';
import { useParams } from 'react-router-dom';
import Loader from '../../Loaders/Loader';
import SpinLoader from '../../Loaders/Spin Loader/SpinLoader';

const ArtistPage =() => {

  const {artistId} = useParams();
  const [dropdown, setDropdown] = useState<number | null>(null);
  const [artistDetails, setArtistDetails] = useState()
  const [songs, setSongs] = useState([])
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spinLoad, setSpinLoad] = useState(false);
  
  const { miniplayer, isLiked } = useSelector((state:musicPlayerState) => state.musicPlayer);  
  const token = localStorage.getItem('token')

    const artistFetch = async() => {
      if(!artistDetails){
        setLoading(true)
      }
      setSpinLoad(true)
      
      try{
        const resp = await httpClient.get(`/artist/${artistId}`, {
          headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        setArtistDetails(resp?.data.artistDetails);
        setSongs(resp?.data.songs)
      } catch(err) {
        console.error(err);
      }

      setSpinLoad(false)
      if(!artistDetails){
        setLoading(false)
      }
    }

    useEffect(()=>{
      artistFetch();
      //eslint-disable-next-line
    },[reloadTrigger, isLiked])

    const toggleDropDown = (index:number, event:any) => {
      event.stopPropagation();
      setDropdown(dropdown === index ? null : index);
    }

    return (
      <>
        {
          loading ?
          <Loader text='Artist is on the way...'/> :
          <div className='w-full min-h-[94vh] p-[2rem]'>
              <div className={`${miniplayer==='max' && 'overflow-hidden h-screen'}`}>
                {artistDetails && (
                  <div>
                    <CommonHeader/>
                    <ArtistTemplate setReloadTrigger={setReloadTrigger} token={token} artistDetails={artistDetails} spinLoad={spinLoad} />
                    <PopularSongs setReloadTrigger={setReloadTrigger} toggleDropDown={toggleDropDown} dropdown={dropdown} setDropdown={setDropdown} songs={songs} artistDetails={artistDetails}/>
                  </div>
                )}
              </div>
          </div>
        }
      </>
    );
    
};

const ArtistTemplate = ({artistDetails, token, setReloadTrigger, spinLoad}:{artistDetails:artistDetails, token:any, setReloadTrigger:Function, spinLoad:Boolean}) => {

  const followArtist = async() => {
    try {
      await httpClient.post(`/follow/${artistDetails.artistId}`, {}, {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      setReloadTrigger((prev:Boolean)=>!prev)
    } catch(err){
      console.log(err)
    }
  }

  const unfollowArtist = async() => {
    try {
      await httpClient.delete(`/follow/${artistDetails.artistId}`, {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      setReloadTrigger((prev:Boolean)=>!prev)
    } catch(err){
      console.log(err)
    }
  }
  
  return(
    <div>
      <div className='flex mt-[2rem] items-center'>
        <div className='w-[10rem] h-[10rem] rounded-full bg-white text-black text-[3rem] grid place-items-center overflow-hidden'>{artistDetails?.artistProfile ? <img src={artistDetails.artistProfile} alt="artist-profile" className='w-full h-full' /> : <FaUser />}</div>
        <div className='text-white ml-[2rem]'>
          <h1 className='font-semibold text-xl grid place-items-center text-white'>{artistDetails?.artistName}</h1>
          <p className='mt-3 opacity-75 text-sm'>{artistDetails?.followers} Followers</p>
        </div>
      </div>
      <div className='mt-[2rem] w-full flex items-center gap-[3rem]'>
        <ListenNowBtn/>
        {
          spinLoad ? <SpinLoader/> :
            artistDetails.isFollowing ?
            <p className='text-red-500 text-sm cursor-pointer' onClick={unfollowArtist}>Unfollow</p>:
            <p className='text-[#E76716] text-sm cursor-pointer' onClick={followArtist}>Follow</p>
        }
      </div>
    </div>
  )
}

export default ArtistPage;