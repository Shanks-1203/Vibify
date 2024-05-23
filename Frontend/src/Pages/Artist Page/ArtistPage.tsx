import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import httpClient from '../../httpClient';
import { ListenNowBtn, PopularSongs } from '../../Components/Artist Profile C2A/ArtistProfile';
import { useSelector } from 'react-redux';
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic';
import CommonHeader from '../../Components/Header/CommonHeader';
import { musicPlayerState } from '../../Types/types';
import { useParams } from 'react-router-dom';

const ArtistPage =() => {

  const {artistId} = useParams();

  const [artist, setArtist] = useState([])
  
  const { miniplayer } = useSelector((state:musicPlayerState) => state.musicPlayer);  

    const artistFetch = async() => {
        try{
            const resp = await httpClient.get(`/artist/${artistId}`);
            setArtist(resp.data);
        } catch(err) {
            console.error(err);
        }
    }

    useEffect(()=>{
      artistFetch();
    },[])

    return (
      <>
        <FullScreenMusic/>

        <div className='w-full h-screen p-[2rem] bg-gradient-to-br'>
            <div className={`${miniplayer==='max' && 'overflow-hidden h-screen'}`}>
              {artist ? (
                <div>
                  <CommonHeader/>
                  <ArtistTemplate artistDetails={artist[0]}/>
                  <PopularSongs songs={artist}/>
                </div>
              ) : (
                <p>Artist not found for id {artistId}</p>
              )}
            </div>
        </div>
      </>
    );
    
};

const ArtistTemplate = ({artistDetails}:{artistDetails:{ArtistId:number,ArtistName:String,FollowersCount:number}}) => {
  return(
    <div>
      <div className='flex mt-[2rem] items-center'>
        <div className='w-[8rem] h-[8rem] rounded-full bg-white text-black text-[3rem] grid place-items-center'><FaUser/></div>
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