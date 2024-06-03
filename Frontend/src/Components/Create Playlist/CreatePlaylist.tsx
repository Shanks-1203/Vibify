import { ChangeEvent, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { toggleCreatePopup } from "../../Slices/saveToPlaylistSlice";
import httpClient from "../../httpClient";
import { saveToPlaylist } from "../../Types/types";

const CreatePlaylist = () => {

  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const {createPopup} = useSelector((state:saveToPlaylist)=> state.saveToPlaylist)

  const handleChange = (e:any) => {
    setName(e.target.value);
  }


  const handleSubmit = async() => {
    const token = localStorage.getItem('token')
    try{
      const resp = await httpClient.post('/create/playlist',{playlistName : name}, 
      {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {},
      });
    } catch(err) {
      console.log(err);
    }
    dispatch(toggleCreatePopup())
  }

  return (
    <div className={`w-full transition-all h-screen grid place-items-center fixed ${createPopup ? 'scale-100' : 'scale-0'}`} >

      <div className='w-[25%] rounded-md bg-black text-white overflow-hidden'>
        <div className='w-full h-[14rem] p-[1rem] flex flex-col justify-between bg-[#80808050]'>
          <p className='text-sm opacity-65'>Create Playlist</p>
          
          <div>
            <p className='text-sm'>Playlist Name</p>
            <input value={name} type="text" className='mt-2 w-full bg-transparent border-2 rounded-md p-2 border-[#80808070] outline-none text-sm' placeholder='Vibify Playlist' onChange={(e)=>handleChange(e)}/>
          </div>

          <div className='flex justify-end gap-[1rem] items-center'>
            <p className='py-3 w-[5rem] text-center rounded-md cursor-pointer text-xs bg-[#80808030]' onClick={()=>dispatch(toggleCreatePopup())}>Cancel</p>
            <p className='py-3 w-[5rem] text-center rounded-md cursor-pointer text-xs bg-[#E76716]' onClick={handleSubmit}>Create</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePlaylist
