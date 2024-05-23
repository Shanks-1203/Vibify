import React, { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import httpClient from '../../httpClient';
import { ListenNowBtn, PopularSongs } from '../../Components/Artist Profile C2A/ArtistProfile';
import { useSelector } from 'react-redux';
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic';
import MiniPlayer from '../../Components/Mini Player/MiniPlayer';
import CommonHeader from '../../Components/Header/CommonHeader';
import { musicPlayerState } from '../../Types/types';
import { useParams } from 'react-router-dom';
import HomeLayout from '../../Layouts/HomeLayout';

const ArtistPage =() => {

  const {artistId} = useParams();

  const [artist, setArtist] = useState([])
  const [seek, setSeek] = useState(0);
  const [songTime, setSongTime] = useState('0:00');
  const [currentSongTime, setCurrentSongTime] = useState('0:00');

  const [currentLength, setCurrentLength] = useState(() => {
    const durationString = typeof window !== 'undefined' ? window.sessionStorage?.getItem('duration') : null;
    return parseInt(durationString ?? '0', 10);
  });
  
  const { songLength, song, miniplayer, musicSeek, play, duration } = useSelector((state:musicPlayerState) => state.musicPlayer);  

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

    useEffect(()=>{
      const minutes = Math.floor(songLength / 60);
      const seconds = songLength - minutes * 60;
  
      setSongTime(`${minutes}:${seconds<10 ? '0'+seconds : seconds}`);
    },[songLength])
  
    useEffect(()=>{
      const minutes = Math.floor(currentLength / 60);
      const seconds = currentLength - minutes * 60;
  
      const secondString = parseInt(seconds.toString().split('.')[0]);
  
      setCurrentSongTime(`${minutes}:${secondString<10 ? '0'+secondString : secondString}`);
  
      setSeek(Math.floor((currentLength/songLength)*100))
  
      sessionStorage.setItem('duration', Math.floor(currentLength).toString());
    },[currentLength])
  
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (currentLength < songLength) {
              setCurrentLength((prev:number) => prev + 1);
            }
        }, 1000);
  
        return () => clearInterval(intervalId);
    }, [currentLength, songLength]);

    return (
      <>
        <div className='w-full h-screen p-[2rem] bg-gradient-to-br'>
            <FullScreenMusic/>

            <div className={`${miniplayer==='max' && 'overflow-hidden h-screen'}`}>
              {artist ? (
                <div>
                  <CommonHeader/>
                  <ArtistTemplate artistDetails={artist[0]}/>
                  <PopularSongs setCurrentLength={setCurrentLength} songs={artist}/>
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