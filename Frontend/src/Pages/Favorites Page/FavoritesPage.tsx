import CommonHeader from '../../Components/Header/CommonHeader'
import FullScreenMusic from '../../Components/Full Screen Music/FullScreenMusic'
import FavoriteSongsTemplate from '../../Components/Favorite Songs Template/FavoriteSongsTemplate'
import { FaPlay } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import httpClient from '../../httpClient'
import { SimpleSongType } from '../../Types/types'

const FavoritesPage = () => {

    const [favorites, setFavorites] = useState<SimpleSongType[]>([]);

    const fetchFavorites = async () =>{
        const token = localStorage.getItem('token')
        try{
            const response = await httpClient.get('/favorites',{
                headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            setFavorites(response.data);
        } catch(err){
            console.log(err)
        }
    }

    useEffect(()=>{
        fetchFavorites();
    },[])

  return (
    <>
        <FullScreenMusic/>
        <div className='w-full h-screen p-[2rem] bg-black text-white'>
            <CommonHeader/>
            <p className='font-semibold flex justify-between items-center text-xl mt-[2rem]'>
                Favorites
                <p className='w-[2.5rem] h-[2.5rem] rounded-full bg-[#E76716] text-xs ml-auto cursor-pointer grid place-items-center text-black'><FaPlay/></p>
            </p>
            <div className='w-full flex flex-col gap-4 mt-[2rem] text-[0.8rem]'>
                {
                    favorites.map((item, index) => {
                        return(
                            <FavoriteSongsTemplate item={item} key={index}/>
                        )
                    })
                }
            </div>
        </div>
    </>
  )
}

export default FavoritesPage
