import { useEffect, useState } from 'react'
import { PiPlaylist } from 'react-icons/pi'
import { Link } from 'react-router-dom'
import httpClient from '../../httpClient';
import CommonHeader from '../../Components/Header/CommonHeader';
import { FaHeart } from "react-icons/fa";
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic';

const LibraryPage = () => {

    const [playlists, setPlaylists] = useState();
    const [favoritesCount, setFavoritesCount] = useState();

    const dummyPlaylist=[
        {
            playlistId:0,
            playlistName: 'Playlist',
            trackcount: 12
        },
        {
            playlistId:0,
            playlistName: 'Playlist',
            trackcount: 12
        },
        {
            playlistId:0,
            playlistName: 'Playlist',
            trackcount: 12
        }
    ]

    const playlistPageCall = async() => {
        const token = localStorage.getItem('token');
        try {
            const resp = await httpClient.get('/home-playlists',{
                headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            setPlaylists(resp.data);
            const response = await httpClient.get('/favorites',{
                headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            setFavoritesCount(response.data.length);
        } catch(err) {
            console.error(err);
        }
    }

    useEffect(()=>{
        playlistPageCall();
    },[])

  return (
    <>
    <FullScreenMusic/>
    <div className='w-full h-screen relative text-white p-[2rem]'>

        <CommonHeader/>
        <p className='text-sm opacity-65 mt-[2rem]'>Your Playlists</p>

        <div className='flex gap-[3rem]'>

            <Link to={playlists ? `/favorites` : '/library'}>
                <div className='mt-[1rem] w-[8rem] text-xs flex flex-col items-center cursor-pointer'>
                    <div className='w-full grid place-items-center h-[8rem] bg-white text-black rounded-lg'>
                        <FaHeart className='text-3xl text-red-500'/>
                    </div>
                    <p className='mt-[0.8rem]'>Favorites</p>
                    <p className='mt-1 opacity-65'>{favoritesCount} Tracks</p>
                </div>
            </Link>

            {(playlists ? playlists : dummyPlaylist).map((item,index)=>{
                return (
                    <Link key={index} to={playlists ? `/playlists/${item.playlistId}` : '/library'}>
                        <div className='mt-[1rem] w-[8rem] text-xs flex flex-col items-center cursor-pointer'>
                            <div className='w-full grid place-items-center h-[8rem] bg-white text-black rounded-lg'>
                                <PiPlaylist className='text-3xl'/>
                            </div>
                            <p className='mt-[0.8rem]'>{item.playlistName}</p>
                            <p className='mt-1 opacity-65'>{item.trackcount} Tracks</p>
                        </div>
                    </Link>
                )
            })}
        </div>


        <p className='text-sm opacity-65 mt-[2rem]'>Liked Playlists</p>
        
        <div className='flex gap-[3rem]'>
            {(playlists ? playlists : dummyPlaylist).map((item,index)=>{
                return (
                    <Link to={playlists ? `/playlists/${item.playlistId}` : '/library'}>                
                        <div key={index} className='mt-[1rem] w-[8rem] text-xs flex flex-col items-center cursor-pointer'>
                            <div className='w-full grid place-items-center h-[8rem] bg-white text-black rounded-lg'>
                                <PiPlaylist className='text-3xl'/>
                            </div>
                            <p className='mt-[0.8rem]'>{item.playlistName}</p>
                            <p className='mt-1 opacity-65'>{item.trackcount} Tracks</p>
                        </div>
                    </Link>

                )
            })}
        </div>

        { !playlists &&
            <div className='w-full grid place-items-center h-screen absolute top-0 left-0 bg-black bg-opacity-80 backdrop-blur'>
                <div className='flex flex-col gap-[1rem] items-center'>
                    <p className='font-md text-lg'>Log in to access your Library</p>
                    <Link to='/login'>
                        <p className='text-xs text-[#E76716] hover:underline'>Log in</p>
                    </Link>
                </div>
            </div>
        }

    </div>
    </>
  )
}

export default LibraryPage
