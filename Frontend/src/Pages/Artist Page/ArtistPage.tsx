import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import httpClient from '../../httpClient';
import { ListenNowBtn, PopularSongs } from '../../Components/Artist Profile C2A/ArtistProfile';
import { useSelector } from 'react-redux';
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic';
import CommonHeader from '../../Components/Header/CommonHeader';
import { artistSongs, musicPlayerState } from '../../Types/types';
import { useParams } from 'react-router-dom';
import b64toBlob from '../../Functions/base64ToBlob';

const ArtistPage =() => {

  const {artistId} = useParams();
  const [dropdown, setDropdown] = useState<number | null>(null);
  const [artist, setArtist] = useState([])
  const [likeTrigger, setLikeTrigger] = useState(false);
  
  const { miniplayer, isLiked } = useSelector((state:musicPlayerState) => state.musicPlayer);  

    const artistFetch = async() => {
      const token = localStorage.getItem('token')
        try{
            const resp = await httpClient.get(`/artist/${artistId}`, {
              headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            console.log(resp?.data);
            setArtist(resp?.data);
        } catch(err) {
            console.error(err);
        }
    }

    useEffect(()=>{
      artistFetch();
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
              {artist && (
                <div>
                  <CommonHeader/>
                  <ArtistTemplate artistDetails={artist[0]}/>
                  <PopularSongs setLikeTrigger={setLikeTrigger} toggleDropDown={toggleDropDown} dropdown={dropdown} setDropdown={setDropdown} songs={artist}/>
                </div>
              )}
            </div>
        </div>
      </>
    );
    
};

const ArtistTemplate = ({artistDetails}:{artistDetails:artistSongs}) => {
  
  const [profile, setProfile] = useState('');
  
  useEffect(() => {
    if (artistDetails?.ProfilePicture) {
      try {
        const profilePicBlob = b64toBlob(artistDetails.ProfilePicture, 'image/jpeg');
        const imageUrl = URL.createObjectURL(profilePicBlob);
        setProfile(imageUrl);
      } catch (err) {
        console.error('Error creating blob:', err);
      }
    }
  }, [artistDetails]);
  
  return(
    <div>
      <div className='flex mt-[2rem] items-center'>
        <div className='w-[10rem] h-[10rem] rounded-full bg-white text-black text-[3rem] grid place-items-center overflow-hidden'>{profile ? <img src={profile} alt="Artist Image" className='w-full h-full' /> : <FaUser />}</div>
        <div className='text-white ml-[2rem]'>
          <h1 className='font-semibold text-xl grid place-items-center text-white'>{artistDetails?.ArtistName}</h1>
          <p className='mt-3 opacity-75 text-sm'>{artistDetails?.FollowersCount} Followers</p>
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