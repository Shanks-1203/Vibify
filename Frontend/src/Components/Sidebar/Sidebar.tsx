import React, { useEffect, useState } from 'react'
import logo from '../../Assets/Images/Logo.png'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import routes from '../../Constants/RoutingOptions'
import { CiHeart } from "react-icons/ci";
import { GoPin } from "react-icons/go";
import { FiPlus } from "react-icons/fi";

const Sidebar = () => {

  const navigate = useNavigate();
  const [loc, setLoc] = useState<string>('');
  const [loc2, setLoc2] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    setLoc(pathParts[1] || '');
    setLoc2(pathParts[2] || '');
  }, [location]);  

  const array = [
    {
      id: 1,
      name: 'Anirudh hits',
    },
    {
      id: 2,
      name: 'Hollywood pop culture',
    },
    {
      id: 3,
      name: 'The Weeknd Terminal',
    }
  ]
  

  return (
    <div className='h-screen py-[2rem] flex flex-col text-[0.8rem] gap-[2.5rem] text-white'>
        
          <div className='flex items-center px-4'>
            <img src={logo} alt='logo' className='w-[0.9rem] invert'/>
            <p className='text-lg ml-3'>Vibify</p>
          </div>

          <div className='flex flex-col gap-1'>
            {
              routes.map((item, index)=>{
                return (
                  <div key={index} className={`flex gap-4 py-3 items-center px-4 hover:bg-[#ffffff30] cursor-pointer ${(loc === item.route && !loc2) && 'border-l-2 bg-gradient-to-r border-[#E76716] from-[#E7671660] to-black text-[#E76716]'}`} onClick={()=> navigate(`/${item.route}`)}>
                    <item.icon className='text-xl'/>
                    <p>{item.name}</p>
                  </div>
                )
              })
            }
          </div>

          <div>
            <p className='opacity-60 mb-4 px-4'>Quick Access</p>
            <div className='flex flex-col gap-1'>
              <Link to={'/favorites'}>
                <div className='flex items-center gap-4 px-4 cursor-pointer py-3 hover:bg-[#ffffff30]'>
                  <CiHeart className='text-2xl text-red-500'/>
                  <p>Favorites</p>
                </div>
              </Link>
              {
                array.map((item)=>{
                  return(
                    <Link to={`/playlists/${item.id}`} key={item.id}>
                      <div key={item.id} className={`flex items-center gap-4 px-4 cursor-pointer py-3 hover:bg-[#ffffff30] ${(loc==='playlists' && parseInt(loc2)===item.id) && 'border-l-2 bg-gradient-to-r border-[#E76716] from-[#E7671660] to-black text-[#E76716]'}`}>
                        <GoPin className={`text-xl rounded-full ${loc==='playlists' ? (item.id===1 && parseInt(loc2)!==1) ? 'text-blue-500' : (item.id===2 && parseInt(loc2)!==2) ? 'text-green-500' : (item.id===3 && parseInt(loc2)!==3) ? 'text-yellow-400' : ((item.id===parseInt(loc2)) && 'text-[#E76716]') : item.id===1 ? 'text-blue-500' : item.id===2 ? 'text-green-500' : item.id===3 && 'text-yellow-400'}`}/>
                        <p>{item.name}</p>
                      </div>
                    </Link>
                  )
                })
              }
              <Link to={'/create/playlist'}>
                <div className='flex items-center gap-4 px-4 cursor-pointer py-3 hover:bg-[#ffffff30]'>
                  <FiPlus className='text-2xl text-violet-500'/>
                  <p>Create Playlist</p>
                </div>
              </Link>
            </div>
          </div>
    </div>
  )
}

export default Sidebar
