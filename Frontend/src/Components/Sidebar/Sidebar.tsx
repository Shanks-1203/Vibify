import { useEffect, useState } from 'react'
import logo from '../../Assets/Images/Logo.png'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import routes from '../../Constants/RoutingOptions'
import { CiHeart } from "react-icons/ci";
import { GoPin } from "react-icons/go";
import { FiPlus } from "react-icons/fi";
import { useDispatch } from 'react-redux';
import { toggleCreatePopup } from '../../Slices/saveToPlaylistSlice';
import httpClient from '../../httpClient';
import { MdOutlineLibraryAdd } from "react-icons/md";

const Sidebar = () => {

  const navigate = useNavigate();
  const [loc, setLoc] = useState<string>('');
  const [loc2, setLoc2] = useState<string>('');
  const location = useLocation();
  const dispatch = useDispatch();
  const [pins, setPins] = useState([]);

  const getPins = async() => {
    const token = localStorage.getItem('token');

    const resp = await httpClient.get('/pins',{
      headers: token ? {Authorization: `Bearer ${token}`} : {}
    })

    console.log(resp.data);
    setPins(resp.data);
  }

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    setLoc(pathParts[1] || '');
    setLoc2(pathParts[2] || '');
    getPins();
  }, [location]);

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
                <div className={`flex items-center gap-3 px-4 cursor-pointer py-3 hover:bg-[#ffffff30] ${loc === 'favorites' && 'border-l-2 bg-gradient-to-r border-[#E76716] from-[#E7671660] to-black text-[#E76716]'}`}>
                  <div className='w-[15%]'><CiHeart className={`text-2xl ${loc!=='favorites' && 'text-red-500'}`}/></div>
                  <p>Favorites</p>
                </div>
              </Link>
              
              {
                pins.map((item:{id:number, name:String},index)=>{

                  const getColorClass = () => {
                    if (loc === 'playlists' && item.id === parseInt(loc2)) {
                      return 'text-[#E76716]';
                    } else if (index === 0) {
                      return 'text-blue-500';
                    } else if (index === 1) {
                      return 'text-green-500';
                    } else if (index === 2) {
                      return 'text-yellow-400';
                    }
                    return '';
                  };

                  return(
                    <Link to={`/playlists/${item.id}`} key={item.id}>
                      <div key={item.id} className={`flex items-center gap-3 px-4 cursor-pointer py-3 hover:bg-[#ffffff30] ${(loc==='playlists' && parseInt(loc2)===item.id) && 'border-l-2 bg-gradient-to-r border-[#E76716] from-[#E7671660] to-black text-[#E76716]'}`}>
                        <div className='w-[15%]'><GoPin className={`text-xl rounded-full ${getColorClass()}`} /></div>
                        <p>{item.name}</p>
                      </div>
                    </Link>
                  )
                })
              }
                { pins.length < 3 &&
                  <div className='flex items-center gap-3 px-4 cursor-pointer py-3 hover:bg-[#ffffff30]'>
                    <div className='w-[15%]'><FiPlus className='text-2xl rounded-full text-pink-500' /></div>
                    <p>Add to Quick Access</p>
                  </div>
                }
                <div className='flex items-center gap-3 px-4 cursor-pointer py-3 hover:bg-[#ffffff30]' onClick={()=>dispatch(toggleCreatePopup())}>
                  <div className='w-[15%]'><MdOutlineLibraryAdd className='text-xl text-violet-500'/></div>
                  <p>Create Playlist</p>
                </div>
            </div>
          </div>
    </div>
  )
}

export default Sidebar
