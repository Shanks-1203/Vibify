import { useEffect, useState } from 'react'
import { PiPlaylist } from 'react-icons/pi'
import { Link } from 'react-router-dom'
import httpClient from '../../httpClient';
import CommonHeader from '../../Components/Header/CommonHeader';
import { FaHeart } from "react-icons/fa";
import Loader from '../../Loaders/Loader';
import { libraryPlaylists } from '../../Types/types';

const LibraryPage = () => {

    const [favoritesCount, setFavoritesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [likedPlaylists, setLikedPlaylists] = useState<libraryPlaylists[]>();
    const [ownPlaylists, setOwnPlaylists] = useState<libraryPlaylists[]>();


    const dummyPlaylist=[
        {
            playlistId:'0',
            playlistName: 'Playlist',
            trackCount: 12
        },
        {
            playlistId:'0',
            playlistName: 'Playlist',
            trackCount: 12
        },
        {
            playlistId:'0',
            playlistName: 'Playlist',
            trackCount: 12
        }
    ]

    const playlistPageCall = async() => {
        setLoading(true)
        const token = localStorage.getItem('token');
        try {
            const response = await httpClient.get('/favorites',{
                headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            
            setIsLoggedIn(true);
            setFavoritesCount(response.data.length);

            const resp = await httpClient.get('/library-playlists',{
                headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            setLikedPlaylists(resp.data.likedPlaylists);
            setOwnPlaylists(resp.data.ownPlaylists);

        } catch(err) {
            setIsLoggedIn(false);
            console.error(err);
        }
        setLoading(false)
    }

    useEffect(()=>{
        playlistPageCall();
    },[])

  return (
    <>
    {
        loading ?
        <Loader text="Your legendary collection is on it's way.."/> :
        <div className='w-full min-h-[92vh] relative text-white p-[2rem]'>
            <CommonHeader/>
            <p className='opacity-65 mt-[2rem]'>Your Playlists</p>

            <div className='flex gap-[3rem] mt-4'>

                <Link to={isLoggedIn ? `/favorites` : '/library'}>
                    <div className='mt-[1rem] w-[10rem] flex text-center flex-col items-center cursor-pointer'>
                        <div className='w-full grid place-items-center h-[10rem] bg-white text-black rounded-lg'>
                            <FaHeart className='text-4xl text-red-500'/>
                        </div>
                        <p className='mt-4'>Favorites</p>
                        <p className='mt-1 opacity-65 text-sm'>{favoritesCount} Tracks</p>
                    </div>
                </Link>

                {(ownPlaylists ? ownPlaylists : dummyPlaylist).map((item,index)=>{
                    return (
                        <Link key={index} to={ownPlaylists ? `/playlists/${item.playlistId}` : '/library'}>
                            <div className='mt-[1rem] w-[10rem] text-center flex flex-col items-center cursor-pointer'>
                                <div className='w-full grid place-items-center h-[10rem] bg-white text-black rounded-lg'>
                                    <PiPlaylist className='text-4xl'/>
                                </div>
                                <p className='mt-4'>{item.playlistName}</p>
                                <p className='mt-1 opacity-65 text-sm'>{item.trackCount} Tracks</p>
                            </div>
                        </Link>
                    )
                })}
            </div>

            
            {!(likedPlaylists?.length === 0) && <p className='opacity-65 mt-[2rem]'>Liked Playlists</p>}
            <div className='flex gap-[3rem] mt-4'>
                {(likedPlaylists ? likedPlaylists : dummyPlaylist).map((item,index)=>{
                    return (
                        <>
                            <Link key={index} to={likedPlaylists ? `/playlists/${item.playlistId}` : '/library'}>                
                                <div key={index} className='mt-[1rem] w-[10rem] text-center flex flex-col items-center cursor-pointer'>
                                    <div className='w-full grid place-items-center h-[10rem] bg-white text-black rounded-lg'>
                                        <PiPlaylist className='text-3xl'/>
                                    </div>
                                    <p className='mt-[0.8rem]'>{item.playlistName}</p>
                                    <p className='mt-1 opacity-65 text-sm'>{item.trackCount} Tracks</p>
                                </div>
                            </Link>
                        </>
                    )
                })}
            </div>

            { !isLoggedIn &&
                <div className='w-full grid place-items-center h-[92vh] absolute top-0 left-0 bg-black bg-opacity-80 backdrop-blur'>
                    <div className='flex flex-col gap-[1rem] items-center'>
                        <p className='font-md text-lg'>Log in to access your Library</p>
                        <Link to='/login'>
                            <p className='text-xs text-[#E76716] hover:underline'>Log in</p>
                        </Link>
                    </div>
                </div>
            }

        </div>
    }
    </>
  )
}

export default LibraryPage
