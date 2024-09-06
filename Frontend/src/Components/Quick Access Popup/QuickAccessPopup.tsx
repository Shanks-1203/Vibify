import React, { useEffect, useState } from 'react'
import { addToQuickAccess, playlistType } from '../../Types/types'
import { useDispatch, useSelector } from 'react-redux'
import { togglePopup } from '../../Slices/addToQuickAccessSlice'
import httpClient from '../../httpClient'
import { BiSolidPlaylist } from 'react-icons/bi'

const QuickAccessPopup = () => {

  const [playlists, setPlaylists] = useState<playlistType[]>([]);
  const { popup, pins } = useSelector(
    (state: addToQuickAccess) => state.addToQuickAccess
  )
  const dispatch = useDispatch()
  const [selectedPlaylist, setSelectedPlaylist] = useState('');

  const handleCancel = () => {
    dispatch(togglePopup())
    setSelectedPlaylist('')
  }

  const saveFunction = async() => {
    const token = localStorage.getItem('token');
    try {
        const resp = await httpClient.post('/add/pins',
            {
                playlistId: selectedPlaylist
            },
            {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
        );
        console.log(resp.data);
        handleCancel()
    } catch(err) {
        console.error(err);
    }
  }

  const fetchPlaylists = async() => {
    try{
        const token = localStorage.getItem('token');
        const resp = await httpClient.get('/library-playlists',{
          headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        setPlaylists([
          ...resp.data.likedPlaylists,
          ...resp.data.ownPlaylists
        ]);
      } catch(err) {
        console.log(err);
      }
  }

  useEffect(()=>{
    fetchPlaylists();
  },[])

  return (
    <div
      className={`w-full transition-all h-screen grid place-items-center fixed ${
        popup ? 'scale-100' : 'scale-0'
      }`}
    >
      <div className='bg-black w-[30%] rounded-md'>
        <div className='bg-[#80808050] text-white h-full p-[1rem] rounded-md'>
          <p className='text-sm opacity-65'>Pin to Quick Access</p>
          <div className='w-full flex flex-wrap justify-between gap-2 mt-[1.3rem]'>
            {
                    playlists.map((item:playlistType, index:number)=>{
                        return(
                            <div key={index} className={`px-4 rounded-md w-full py-2 flex items-center gap-4 cursor-pointer hover:bg-[#80808030] ${pins.some((pin)=>pin.playlistId === item.playlistId) && 'opacity-40'}`} onClick={()=>setSelectedPlaylist(item.playlistId)}>
                                <div className={`w-[0.8rem] h-[0.8rem] rounded-full grid place-items-center ${selectedPlaylist === item.playlistId ? 'bg-[#E76716] border-2' : 'bg-white'}`}/>
                                <div className='w-[3rem] h-[3rem] text-xl rounded-lg text-black bg-white grid place-items-center'>
                                    <BiSolidPlaylist/>
                                </div>
                                <p className='text-xs font-semibold text-center'>{item.playlistName}</p>
                                <p className='text-xs text-center opacity-65 ml-auto'>{item.trackCount} Tracks</p>
                            </div>
                        )
                    })
                }
          </div>
          <div className='w-full gap-[1rem] mt-[1.3rem] flex justify-end'>
            <div
              className='py-3 text-center cursor-pointer rounded-md text-xs bg-[#80808030] w-[5rem]'
              onClick={handleCancel}
            >
              Cancel
            </div>
            <div
              className={`py-3 text-center cursor-pointer rounded-md text-xs w-[5rem] ${selectedPlaylist ? 'bg-[#E76716]' : 'bg-[#808080] opacity-65'}`}
              onClick={saveFunction}
            >
              Save
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickAccessPopup
