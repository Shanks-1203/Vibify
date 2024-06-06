import { useEffect, useState } from 'react'
import { FaUser } from "react-icons/fa";
import './popularArtists.css'
import httpClient from '../../../httpClient';
import { Link } from 'react-router-dom';
import { artistType } from '../../../Types/types';
import b64toBlob from '../../../Functions/base64ToBlob';

const PopularArtists = () => {

    const [artists, setArtists] = useState([]);

    useEffect(()=>{
        const artistFetch = async() => {
            try{
                const resp = await httpClient.get('/home-artists');
                setArtists(resp.data);
                              
            } catch(err) {
                console.error(err);
            }
        }

        artistFetch()
    },[])

  return (
    <div className='w-full mt-[2rem]'>
        <div className='text-sm text-white flex justify-between items-center'>
            <p className='opacity-65'>Popular Artists</p>
            <span className='text-xs font-normal text-[#E76716] cursor-pointer hover:underline'>View more</span>
        </div>
        <div className='w-[100%] overflow-x-scroll scroll'>
            <div className='w-fit flex gap-[3.5rem] mt-[1rem]'>
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
    
    const [profile, setProfile] = useState('');
    const {ProfilePicture} = item

    useEffect(()=>{
        if(ProfilePicture) {
            try{
                const profilePicBlob = b64toBlob(ProfilePicture, 'image/jpeg');
                const imageUrl = URL.createObjectURL(profilePicBlob);
                setProfile(imageUrl);
            } catch(err){
                console.error('Error creating blob:', err);
            }
        }
    },[ProfilePicture])


    return(
        <Link to={`/artists/${item.ArtistId}`}><div className='flex text-white flex-col text-center'>
            <div className='w-[8.5rem] h-[8.5rem] rounded-lg bg-white cursor-pointer text-black text-[3rem] grid place-items-center overflow-hidden'>{profile ? <img src={profile} alt="Artist Image" className='w-full h-full' /> : <FaUser />}</div>
            <p className='mt-3 text-[0.8rem]'>{item.ArtistName}</p>
            <p className='mt-1 text-xs opacity-65'>{item.FollowersCount} Followers</p>
        </div></Link>
    )
}

export default PopularArtists
