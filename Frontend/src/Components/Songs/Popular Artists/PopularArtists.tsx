import { useEffect, useState } from 'react'
import { FaUser } from "react-icons/fa";
import './popularArtists.css'
import httpClient from '../../../httpClient';
import { Link } from 'react-router-dom';
import { artistType, homePageLoader } from '../../../Types/types';

const PopularArtists = ({setLoading}:{setLoading:Function}) => {

    const [artists, setArtists] = useState([]);

    const artistFetch = async() => {
        setLoading((prev:homePageLoader) =>({
            ...prev,
            artistsLoaded: false
        }))
        try{
            const resp = await httpClient.get('/home-artists');
            setArtists(resp.data);
        } catch(err) {
            console.error(err);
        }
        setLoading((prev:homePageLoader) =>({
            ...prev,
            artistsLoaded: true
        }))
    }

    useEffect(()=>{
        artistFetch()
        //eslint-disable-next-line
    },[])

  return (
    <div className='w-full mt-[2rem]'>
        <div className='text-md text-white flex justify-between items-center'>
            <p className='opacity-65'>Popular Artists</p>
            <span className='text-sm font-normal text-[#E76716] cursor-pointer hover:underline'>View more</span>
        </div>
        <div className='w-[100%] overflow-x-scroll scroll'>
            <div className='w-fit flex gap-[3.5rem] mt-[1.2rem]'>
                {
                    artists.map((item:artistType,index)=>{
                        return <ArtistTemplate item={item} key={index}/>
                    })
                }
            </div>
        </div>
    </div>
  )
}

const ArtistTemplate: React.FC<{item:artistType}> = ({item}) => {
    const {profileURL} = item    

    return(
        <Link to={`/artists/${item.artistId}`}><div className='flex text-white flex-col text-center'>
            <div className='w-[12rem] h-[12rem] rounded-lg bg-white cursor-pointer text-black text-[3rem] grid place-items-center overflow-hidden'>{profileURL ? <img src={profileURL} alt="artist-profile" className='w-full h-full' /> : <FaUser />}</div>
            <p className='mt-3'>{item.artistName}</p>
            <p className='mt-1 text-sm opacity-65'>{item.followers} Followers</p>
        </div></Link>
    )
}

export default PopularArtists
