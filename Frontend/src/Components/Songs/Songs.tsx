import React, { useEffect, useState } from 'react'
import { PiVinylRecord } from "react-icons/pi";
import httpClient from '../../httpClient';
import { useDispatch } from 'react-redux';
import { setDuration, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
import durationCalculator from '../../Functions/durationCalculator';
import { CiHeart } from "react-icons/ci";


type songType = {
    songId:number
    artistId:number
    songName:String
    ArtistName:String
    duration:number
}

const Songs = () => {

  const [songsList, setSongsList] = useState([]);

  const songFetch = async() => {
    try{
      const resp = await httpClient.get('/home-songs');
      setSongsList(resp.data);
    } catch(err){
      console.error(err);
    }
  }

  useEffect(()=> {
    songFetch()
  },[])

  return (
    <div>
      <div className='text-white text-sm flex justify-between items-center'>
        <p className='opacity-65'>Recently Played</p>
        <span className='text-xs font-normal text-[#E76716] cursor-pointer hover:underline'>View more</span>
      </div>
      <div className='w-full h-[18rem] flex flex-col gap-2 mt-[1rem]'>
        {
          songsList.map((item, index)=>{
            if(index){
              return(
                <SongTemplate key={index} song={item}/>
              )
            }
          })
        }
      </div>
    </div>
  )
}

const SongTemplate: React.FC<{ song: songType}> = ({ song }) => {

  const dispatch = useDispatch();
  
  const fetchSongUrl = async (songName:String) => {
    try {
      const response = await httpClient.get(`/song/${songName}`);
      const url = response.data.url;
      console.log(url);
      return url;
    } catch (error) {
      console.error('Error fetching song URL:', error);
    }
  }
  
  const playSong = async () => {
    
    dispatch(setSongInfo({
      song: {
        id: song.songId,
        name: song.songName,
        artist: song.ArtistName,
        mp3: null
      },
      songLength: song.duration,
    }));

    dispatch(setSongInfo({
      song: {
        id: song.songId,
        name: song.songName,
        artist: song.ArtistName,
        mp3: await fetchSongUrl(song.songName),
      },
      songLength: song.duration,
    }));

    dispatch(setPlay({play:true}));
    dispatch(setMusicSeek({seek:0}));
    dispatch(setDuration({duration:0}));

    sessionStorage.setItem("songId", song?.songId?.toString());
  }

    return (
        <div className='flex items-center gap-[2rem] cursor-pointer py-[0.5rem] w-full text-center text-white hover:bg-gradient-to-r hover:from-[#80808015] hover:via-[#80808060] hover:to-[#80808015]' onClick={playSong}>
            <div className='w-[2.2rem] h-[2.2rem] rounded-lg text-xl grid text-black place-items-center bg-white'>
                <PiVinylRecord />
            </div>
            <p className='font-medium text-left w-[20%] text-xs'>{song.songName}</p>
            <p className='opacity-65 text-xs'>{song.ArtistName}</p>
            <CiHeart className='text-xl ml-auto'/>
            <p className='ml-3 text-xs w-[5%]'>{durationCalculator(song.duration)}</p>
        </div>
    );
};

export default Songs
