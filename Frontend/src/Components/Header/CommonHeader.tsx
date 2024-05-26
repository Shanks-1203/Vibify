import SearchBar from '../../Components/Search Bar/SearchBar'
import { SlEarphones } from "react-icons/sl";
import { profileCredentials } from '../../Constants/ProfileCredentials';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdLogin } from 'react-icons/md';

const CommonHeader = () => {

  const [dropdown, setDropdown] = useState(false);

  const toggleDropdown = () => {
    setDropdown((prev)=>!prev);
  }

  return (
    <div className='w-full flex items-center justify-between'>
        <SearchBar/>
        <div className='w-[2.3rem] relative grid place-items-center h-[2.3rem] rounded-full cursor-pointer bg-white' onClick={toggleDropdown}>
            <SlEarphones className='text-black'/>
            <div className={`absolute w-[9rem] text-black overflow-hidden flex flex-col bg-white left-[-9rem] top-0 rounded-lg ${!dropdown && 'hidden'}`}>
              {
                localStorage.getItem('token') ?

                profileCredentials.map((item, index)=>{
                  return (
                    <Link to={item.route} onClick={()=>{item.route==='login' && localStorage.clear()}}>
                      <div key={index} className='w-full h-[3rem] hover:bg-[#80808040] flex items-center px-[1rem] gap-[0.6rem]'>
                        <item.icon className='text-lg'/>
                        <p className='text-xs'>{item.name}</p>
                      </div>
                    </Link>
                  )
                }) :

                <Link to='login'>
                  <div className='w-full h-[3rem] hover:bg-[#80808040] flex items-center px-[1rem] gap-[0.6rem]'>
                    <MdLogin className='text-lg'/>
                    <p className='text-xs'>Log in</p>
                  </div>
                </Link>

              }
            </div>
        </div>
    </div>
  )
}

export default CommonHeader
