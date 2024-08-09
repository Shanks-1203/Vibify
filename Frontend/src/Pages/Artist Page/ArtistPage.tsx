import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import httpClient from '../../httpClient';
import { ListenNowBtn, PopularSongs } from '../../Components/Artist Profile C2A/ArtistProfile';
import { useSelector } from 'react-redux';
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic';
import CommonHeader from '../../Components/Header/CommonHeader';
import { artistDetails, musicPlayerState } from '../../Types/types';
import { useParams } from 'react-router-dom';

const ArtistPage =() => {

  const {artistId} = useParams();
  const [dropdown, setDropdown] = useState<number | null>(null);
  const [artistDetails, setArtistDetails] = useState()
  const [songs, setSongs] = useState([])
  const [likeTrigger, setLikeTrigger] = useState(false);
  
  const { miniplayer, isLiked } = useSelector((state:musicPlayerState) => state.musicPlayer);  

    const artistFetch = async() => {
      const token = localStorage.getItem('token')
        try{
            const resp = await httpClient.get(`/artist/${artistId}`, {
              headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            setArtistDetails(resp?.data.artistDetails);
            setSongs(resp?.data.songs)
        } catch(err) {
            console.error(err);
        }
    }

    useEffect(()=>{
      artistFetch();
      //eslint-disable-next-line
    },[likeTrigger, isLiked])

    const toggleDropDown = (index:number, event:any) => {
      event.stopPropagation();
      setDropdown(dropdown === index ? null : index);
    }

    return (
      <>
        <FullScreenMusic/>

        <div className='w-full h-screen p-[2rem]'>
            <div className={`${miniplayer==='max' && 'overflow-hidden h-screen'}`}>
              {artistDetails && (
                <div>
                  <CommonHeader/>
                  <ArtistTemplate artistDetails={artistDetails}/>
                  <PopularSongs setLikeTrigger={setLikeTrigger} toggleDropDown={toggleDropDown} dropdown={dropdown} setDropdown={setDropdown} songs={songs} artistDetails={artistDetails}/>
                </div>
              )}
            </div>
        </div>
      </>
    );
    
};

const ArtistTemplate = ({artistDetails}:{artistDetails:artistDetails}) => {
  
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
        <p className='text-[#E76716] text-sm cursor-pointer'>Follow</p>
      </div>
    </div>
  )
}

export default ArtistPage;